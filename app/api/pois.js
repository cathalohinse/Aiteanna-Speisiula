"use strict";

const Poi = require("../models/poi");
const Category = require("../models/category");
const Boom = require("@hapi/boom");

const Pois = {
  find: {
    auth: false,
    handler: async function (request, h) {
      const pois = await Poi.find();
      return pois;
    },
  },

  findOne: {
    auth: false,
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
    auth: false,
    handler: async function (request, h) {
      const pois = await Poi.find({ category: request.params.id });
      return pois;
    },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      const newPoi = new Poi(request.payload);
      const poi = await newPoi.save();
      if (poi) {
        return h.response(poi).code(201);
      }
      return Boom.badImplementation("error creating poi");
    },
  },

  deleteAll: {
    auth: false,
    handler: async function (request, h) {
      await Poi.deleteMany({});
      return { success: true };
    },
  },

  deleteOne: {
    auth: false,
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