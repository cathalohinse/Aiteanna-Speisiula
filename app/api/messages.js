'use strict';

const Message = require('../models/message');
const Boom = require("@hapi/boom");

const Messages = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const messages = await Message.find();
      return messages;
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const message = await Message.findOne({ _id: request.params.id });
        if (!message) {
          return Boom.notFound("No Message with this id");
        }
        return message;
      } catch (err) {
        return Boom.notFound("No Message with this id");
      }
    }
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const newMessage = new Message(request.payload);
      const message = await newMessage.save();
      if (message) {
        return h.response(message).code(201);
      }
      return Boom.badImplementation("error creating message");
    },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      await Message.remove({});
      return { success: true };
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      const response = await Message.deleteOne({ _id: request.params.id });
      if (response.deletedCount == 1) {
        return { success: true };
      }
      return Boom.notFound('id not found');
    }
  }

};

module.exports = Messages;