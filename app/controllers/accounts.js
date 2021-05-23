"use strict";
const User = require("../models/user");
const Message = require("../models/message");
const Boom = require("@hapi/boom");
const Joi = require('@hapi/joi');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const sanitizeHtml = require("sanitize-html");

const Accounts = {

  index: {
    auth: false,
    handler: function(request, h) {
      return h.view("main", { title: "Welcome to Pubs of Interest" });
    }
  },

  showSignup: {
    auth: false,
    handler: function(request, h) {
      return h.view("signup", { title: "Sign up for Pubs of Interest" });
    }
  },

  signup: {
    auth: false,
    validate: {
      payload: {
        firstName: Joi.string().regex(/^[A-Z][A-Z,a-z]{1,}$/), //Allows for a first name with only two characters, both of which could be uppercase (e.g. 'PJ')
        lastName: Joi.string().regex(/^[A-Z]/).min(3),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: function (request, h, error)
      {
        return h
          .view('signup', {
            title: 'Sign up Error',
            errors: error.details
          })
          .takeover()
          .code(400);
      }
    },
    handler: async function(request, h) {
      try {
        const payload = request.payload;
        let user = await User.findByEmail(payload.email);
        if (user) {
          const message = "Email address is already registered";
          throw Boom.badData(message);
        }

        const hash = await bcrypt.hash(payload.password, saltRounds);

        const newUser = new User({
          firstName: sanitizeHtml(payload.firstName),
          lastName: sanitizeHtml(payload.lastName),
          email: sanitizeHtml(payload.email),
          password: sanitizeHtml(hash)
        });
        user = await newUser.save();
        request.cookieAuth.set({ id: user.id });
        return h.redirect("/home");
      } catch (err) {
        return h.view("signup", { errors: [{ message: err.message }] });
      }
    }
  },

  showLogin: {
    auth: false,
    handler: function(request, h) {
      return h.view("login", { title: "Login to Pubs of Interest" });
    }
  },

  login: {
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: function (request, h, error)
      {
        return h
          .view('login', {
            title: 'Login Error',
            errors: error.details
          })
          .takeover()
          .code(400);
      }
    },
    auth: false,
    handler: async function(request, h) {
      const { email, password } = request.payload;
      try {
        let user = await User.findByEmail(email);
        if (!user) {
          const message = "Email address is not registered";
          throw Boom.unauthorized(message);
        }
        await user.comparePassword(password);
        request.cookieAuth.set({ id: user.id });
        return h.redirect("/home");
      } catch (err) {
        return h.view("login", { errors: [{ message: err.message }] });
      }
    }
  },

  logout: {
    handler: async function(request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    }
  },

  showSettings: {
    handler: async function(request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id).lean();
        return h.view("settings", { title: "User Settings", user: user });
      } catch (err) {
        return h.view("login", { errors: [{ message: err.message }] });
      }
    }
  },

  updateSettings: {
    validate: {
      payload: {
        firstName: Joi.string().regex(/^[A-Z][A-Z,a-z]{1,}$/),
        lastName: Joi.string().regex(/^[A-Z]/).min(3),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const user = await User.findById(request.auth.credentials.id).lean();
        return h
          .view("settings", {
            title: 'Error updating User Settings',
            errors: error.details,
            user: user
          })
          .takeover()
          .code(400);
      }
    },
    handler: async function(request, h) {
      const userEdit = request.payload;
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      user.firstName = sanitizeHtml(userEdit.firstName);
      user.lastName = sanitizeHtml(userEdit.lastName);
      user.email = sanitizeHtml(userEdit.email);
      user.password = sanitizeHtml(userEdit.password);
      await user.save();
      return h.redirect("/settings");
    }
  },

  deleteUser: {
    handler: async function (request, h) {
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      console.log("Deleting User: " + user);
      await user.remove();
      return h.view("delete-user");
    }
  },

  showMessages: {
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id).lean();
        const messages = await Message.find().populate("sender").populate("message").lean();
        return h.view("message", { title: "Private Messaging", messages: messages, user: user, var: "hey" });
      } catch (err) {
        return h.view("login", { errors: [{ message: err.message }] });
      }
    }
  },
  
  sendMessage: {
    validate: {
      payload: {
        body: Joi.string().required(),
        recipient: Joi.string().email().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const user = await User.findById(request.auth.credentials.id).lean();
        const messages = await Message.find().lean();
        const users = await User.find().lean();
        return h
          .view('message', {
            title: 'Error Sending Message',
            errors: error.details,
            user: user,
            messages: messages,
            //I cannot get the user's email address to render in the inbox table when errors occur.
            //I attempted to get it to work here, by including 'users: users', but to no avail.
            //The best that I can do is display the not so user-friendly user id, by changing the table in 'inbox.hbs',
            //but this is at the expense of displaying the user's email when not in error mode.
          })
          .takeover()
          .code(400);
      }
    },
    handler: async function (request, h) {
      try{
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        const newMessage = new Message({
          body: sanitizeHtml(data.body),
          recipient: sanitizeHtml(data.recipient),
          sender: user._id
          //If I had more time, I would have attempted to enforce the user to only enter email addresses that were already
          //in the database (i.e. some sort of 'Message not deliverable - Recipient not found' error message.
          //Presumably, the strategy to do this would be carried out here.
        });
        await newMessage.save();
        const messages = await Message.find().lean();
        return h.redirect("/message", { title: "All Messages", messages: messages });
      } catch (err) {
        return h.view("main", { errors: [{ message: err.message }] });
      }
    },
  },

  deleteMessage: {
    handler: async function (request, h) {
      const message = Message.findById(request.params._id);
      console.log("Deleting Message: " + message);
      await message.remove();
      return h.redirect("/message");
    }
  }

};

module.exports = Accounts;