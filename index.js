"use strict";
const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Handlebars = require("handlebars");
const Cookie = require("@hapi/cookie");
require('./app/models/db');
const env = require('dotenv');
const ImageStore = require('./app/utils/image-store');
const dotenv = require('dotenv');
const Joi = require("@hapi/joi");
const fs = require('fs');

env.config();

/*const server = Hapi.server({
  port: 3443,
  tls: {
    key: fs.readFileSync('keys/private/webserver.key'),
    cert: fs.readFileSync('keys/webserver.crt')
  }
});*/

const server = Hapi.server({
  port: process.env.PORT || 4000,
  routes: { cors: true },
});

const credentials = {
  cloud_name: process.env.name,
  api_key: process.env.key,
  api_secret: process.env.secret
};
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

async function init() {
  await server.register(Inert);
  await server.register(Vision);
  await server.register(Cookie);
  await server.validator(require("@hapi/joi"));

  ImageStore.configure(credentials);

  server.views({
    engines: {
      hbs: require("handlebars"),
    },
    relativeTo: __dirname,
    path: "./app/views",
    layoutPath: "./app/views/layouts",
    partialsPath: "./app/views/partials",
    layout: true,
    isCached: false,
  });
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: false
    },
    redirectTo: "/",
  });
  server.auth.default("session");
  server.route(require("./routes"));
  server.route(require('./routes-api'));
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();