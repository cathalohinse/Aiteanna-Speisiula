"use strict";
const Poi = require("../models/poi");
const User = require("../models/user");
const Category = require("../models/category");
const ImageStore = require('../models/image-store');
const Joi = require('@hapi/joi');

const Pois = {

  home: {
    handler: async function (request, h) {
      const categories = await Category.find().lean();
      return h.view("home", { title: "Submit a Pub of Interest", categories: categories });
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
        image: Joi.string().required(),
        category: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: function (request, h, error)
      {
        return h
          .view('main', {
            title: 'Error submitting POI',
            errors: error.details
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
        const rawCategory = request.payload.category.split(",");
        const category = await Category.findOne({
          county: rawCategory[0],
          province: rawCategory[1],
        });
        const newPoi = new Poi({
          name: data.name,
          location: data.location,
          image: data.image,
          submitter: user._id,
          category: category._id,
        });
        await newPoi.save();
        return h.redirect("/report");
      } catch (err) {
        return h.view("main", { errors: [{ message: err.message }] });
      }
    },
  },

  showPoi: {
    handler: async function(request, h) {
      try {
        const id = request.params._id
        const poi = await Poi.findById(id).populate('category').lean().sort('-category');
        console.log(poi);
        const category = await Category.find().lean();
        const categories = await Category.find().lean().sort('county');
        return h.view("update-poi", { title: "Update POI", poi: poi, categories: categories });
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
        image: Joi.string().required(),
        category: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: function (request, h, error)
      {
        return h
          .view('main', {
            title: 'Failed to update POI',
            errors: error.details
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

        poi.name = poiEdit.name;
        poi.location = poiEdit.location;
        poi.image = poiEdit.image;
        poi.category = category._id;
        await poi.save();
        return h.redirect('/report');
      } catch (err) {
        return h.view('home', {errors: [{message: err.message}]});
      }
    },
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
        county: Joi.string().required(),
        province: Joi.string().required(),
      },
      options: {
        abortEarly: false
      },
      failAction: function (request, h, error)
      {
        return h
          .view('main', {
            title: 'Error creating a new Category',
            errors: error.details
          })
          .takeover()
          .code(400);
      }
    },
    handler: async function (request, h) {
      try{
        const data = request.payload;
        const newCategory = new Category({
          county: data.county,
          province: data.province,
        });
        await newCategory.save();
        const categories = await Category.find().lean();
        return h.view("category", { title: "All Categories", categories: categories });
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
  }

};

module.exports = Pois;
