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
      const pois = await Poi.find().populate("category").populate("submitter");
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

  /*update: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const poiEdit = request.payload;
      const poi = await Poi.findById(poiEdit._id);
      poi.name = poiEdit.name;
      poi.location = poiEdit.location;
      poi.latitude = poiEdit.latitude;
      poi.longitude = poiEdit.longitude;
      poi.image = poiEdit.image;
      poi.category = poiEdit.category;
      poi.submitter = poiEdit.submitter;
      await poi.save();
      if (poi) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },*/

  update: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const poiId = request.params.id;
      const data = request.payload;
      const poi = await Poi.updateOne(
        { _id: poiId },
        {
          name: data.name,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          image: data.image,
          category: data.category,
          //submitter: data.submitter,
        }
      );
      if (poi) {
        return h.response(poi).code(201);
      }
      return Boom.badImplementation("Error editing POI");
    },
  },

};

module.exports = Pois;