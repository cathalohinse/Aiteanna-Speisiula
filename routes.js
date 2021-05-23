"use strict";
const Accounts = require("./app/controllers/accounts");
const Pois = require("./app/controllers/pois");

module.exports = [
  { method: "GET", path: "/", config: Accounts.index },
  { method: "GET", path: "/signup", config: Accounts.showSignup },
  { method: "POST", path: "/signup", config: Accounts.signup },
  { method: "GET", path: "/login", config: Accounts.showLogin },
  { method: "POST", path: "/login", config: Accounts.login },
  { method: "GET", path: "/logout", config: Accounts.logout },
  { method: 'GET', path: "/settings", config: Accounts.showSettings },
  { method: 'POST', path: "/settings", config: Accounts.updateSettings },
  { method: "GET", path: "/deleteuser", config: Accounts.deleteUser },

  { method: "GET", path: "/home", config: Pois.home },
  { method: "POST", path: "/createpoi", config: Pois.createPoi },
  { method: "GET", path: "/report", config: Pois.report },
  { method: "GET", path: "/showpoi/{_id}", config: Pois.showPoi },
  { method: "POST", path: "/updatepoi/{_id}", config: Pois.updatePoi },
  { method: "GET", path: "/deletepoi/{_id}", config: Pois.deletePoi },
  { method: 'POST', path: "/createcategory", config: Pois.createCategory },
  { method: 'GET', path: "/showcategories", config: Pois.showCategories },
  { method: "GET", path: "/deletecategory/{_id}", config: Pois.deleteCategory },
  { method: "GET", path: "/evil", config: Pois.evil },
  { method: "GET", path: "/message", config: Accounts.showMessages },
  { method: "POST", path: "/sendmessage", config: Accounts.sendMessage },
  { method: "GET", path: "/deletemessage/{_id}", config: Accounts.deleteMessage },


  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "./public",
      },
    },
    options: { auth: false },
  },
];