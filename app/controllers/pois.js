"use strict";
const Poi = require("../models/poi");
const User = require("../models/user");
const Category = require("../models/category");
const ImageStore = require('../utils/image-store');
const Joi = require('@hapi/joi');
const sanitizeHtml = require("sanitize-html");

const Pois = {

  home: {
    handler: async function (request, h) {
      const categories = await Category.find().lean();
      return h.view("home", { title: "Submit a Pub of Interest", categories: categories });
    },
  },

  evil: {
    handler: async function (request, h) {
      return h.view("evil", { title: "YOU'VE BEEN HACKED"});
    },
  },

  report: {
    handler: async function (request, h) {
      const pois = await Poi.find().populate("submitter").populate("category").lean();
      return h.view("report", {
        title: "POIs to Date",
        pois: pois,
      });
    },
  },

  createPoi: {
    validate: {
      payload: {
        name: Joi.string().required(),
        location: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        category: Joi.string().required(),
        imagefile: Joi.any().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const categories = await Category.find().lean();
        return h
          .view('home', {
            title: 'Error submitting POI',
            errors: error.details,
            categories: categories
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
        const result = await ImageStore.uploadImage(data.imagefile);
        const imageUrl = result.url;
        const rawCategory = request.payload.category.split(",");
        const category = await Category.findOne({
          county: rawCategory[0],
          province: rawCategory[1],
        });
        const newPoi = new Poi({
          name: sanitizeHtml(data.name),
          location: sanitizeHtml(data.location),
          latitude: sanitizeHtml(data.latitude),
          longitude: sanitizeHtml(data.longitude),
          submitter: user._id,
          category: category._id,
          image: imageUrl,
          rating: null
        });
        await newPoi.save();
        return h.redirect("/report");
      } catch (err) {
        return h.view("main", { errors: [{ message: err.message }] });
      }
    },
    payload: {
      multipart: true,
      output: 'data',
      maxBytes: 209715200,
      parse: true
    }

  },

  showPoi: {
    handler: async function(request, h) {
      try {
        const id = request.params._id
        const poi = await Poi.findById(id).populate('category').lean().sort('-category');
        console.log(poi);
        const category = await Category.find().lean();
        const categories = await Category.find().lean().sort('county');
        return h.view("update-poi", { title: "Update POI", poi: poi, categories: categories, category: category });
      } catch (err) {
        return h.view("home", { errors: [{ message: err.message }] });
      }
    }
  },

  updatePoi: {
    validate: {
      payload: {
        name: Joi.string().required(),
        location: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        category: Joi.string().required(),
        imagefile: Joi.any().required()
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const id = request.params._id;
        const poi = await Poi.findById(id).populate('category').lean().sort('-category');
        const category = await Category.find().lean();
        const categories = await Category.find().lean().sort('county');
        return h
          .view('update-poi', {
            title: 'Failed to update POI',
            errors: error.details,
            poi: poi,
            categories: categories,
            category: category
          })
          .takeover()
          .code(400);
      }
    },

    handler: async function (request, h)
    {
      try{
        const poiEdit = request.payload;
        const poi = await Poi.findById(request.params._id);
        console.log(poi);
        const rawCategory = poiEdit.category.split(",");
        const category = await Category.findOne({ county: rawCategory[0], province: rawCategory[1] }).lean();
        const result = await ImageStore.uploadImage(poiEdit.imagefile);
        const imageUrl = result.url;

        poi.name = sanitizeHtml(poiEdit.name);
        poi.location = sanitizeHtml(poiEdit.location);
        poi.latitude = sanitizeHtml(poiEdit.latitude);
        poi.longitude = sanitizeHtml(poiEdit.longitude);
        poi.category = category._id;
        poi.image = imageUrl
        await poi.save();
        return h.redirect('/report');
      } catch (err) {
        return h.view('home', {errors: [{message: err.message}]});
      }
    },
    payload: {
      multipart: true,
      output: 'data',
      maxBytes: 209715200,
      parse: true
    }
  },

  deletePoi: {
    handler: async function (request, h) {
      const poi = Poi.findById(request.params._id);
      console.log("Removing POI: " + poi);
      await poi.remove();
      return h.redirect("/report");
    }
  },

  createCategory: {
    validate: {
      payload: {
        county: Joi.string().alphanum().required(),
        province: Joi.string().alphanum().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const user = await User.findById(request.auth.credentials.id).lean();
        return h
          .view('settings', {
            title: 'Error creating a new Category',
            errors: error.details,
            user: user
          })
          .takeover()
          .code(400);
      }
    },
    handler: async function (request, h) {
      try{
        const data = request.payload;
        const newCategory = new Category({
          county: sanitizeHtml(data.county),
          province: sanitizeHtml(data.province),
        });
        await newCategory.save();
        const categories = await Category.find().lean();
        return h.redirect("/showcategories", { title: "All Categories", categories: categories });
      } catch (err) {
        return h.view("main", { errors: [{ message: err.message }] });
      }
    },
  },

  showCategories: {
    handler: async function (request, h) {
      const categories = await Category.find().lean();
      return h.view("category", { title: "All Categories", categories: categories });
    },
  },

  deleteCategory: {
    handler: async function (request, h) {
      const category = Category.findById(request.params._id);
      console.log("Removing Category: " + category);
      await category.remove();
      return h.redirect("/showcategories");
    }
  },

  ratePoi: {
    handler: async function(request, h) {
      try {
        const id = request.params._id
        const poi = await Poi.findById(id).populate("submitter").populate('category').lean().sort('-category');
        console.log(poi);
        const category = await Category.find().lean();
        const categories = await Category.find().lean().sort('county');
        const users = await User.find().lean().sort('firstName');
        return h.view("ratepoi", { title: "Rate POI", poi: poi, categories: categories, category: category, users: users });
      } catch (err) {
        return h.view("home", { errors: [{ message: err.message }] });
      }
    }
  },

  submitRating: {
    validate: {
      payload: {
        rating: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: async function (request, h, error)
      {
        const id = request.params._id;
        const poi = await Poi.findById(id).populate('category').lean().sort('-category');
        const category = await Category.find().lean();
        const categories = await Category.find().lean().sort('county');
        return h
          .view('ratepoi', {
            title: 'Failed to rate POI',
            errors: error.details,
            poi: poi,
            categories: categories,
            category: category
          })
          .takeover()
          .code(400);
      }
    },

    handler: async function (request, h)
    {
      try{
        const poiRate = request.payload;
        const poi = await Poi.findById(request.params._id);
        console.log(poi);
        poi.rating = parseInt(poiRate.rating);
        await poi.save();
        return h.redirect('/report');
      } catch (err) {
        return h.view('home', {errors: [{message: err.message}]});
      }
    }
  }

};

module.exports = Pois;