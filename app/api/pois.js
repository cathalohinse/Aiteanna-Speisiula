"use strict";

const Poi = require("../models/poi");
const Category = require("../models/category");
const Boom = require("@hapi/boom");
const utils = require("./utils.js");

const Pois = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const pois = await Poi.find();
      return pois;
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const poi = await Poi.findOne({ _id: request.params.id });
        if (!poi) {
          return Boom.notFound("No POI with this id");
        }
        return poi;
      } catch (err) {
        return Boom.notFound("No POI with this id");
      }
    }
  },

  findByCategory: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const pois = await Poi.find({ category: request.params.id });
      return pois;
    },
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = utils.getUserIdFromRequest(request);
      let poi = new Poi(request.payload);

      /*const category = await Category.findOne({ _id: request.params.id });
      if (!category) {
        return Boom.notFound("No Category with this id");
      }
      poi.category = category._id;*/

      poi.submitter = userId;
      poi = await poi.save();
      return poi;
    },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      await Poi.deleteMany({});
      return { success: true };
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const poi = await Poi.remove({ _id: request.params.id });
      if (poi) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },

};

module.exports = Pois;