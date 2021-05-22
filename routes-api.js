const Categories = require('./app/api/categories');
const Users = require('./app/api/users');
const Pois = require('./app/api/pois');

module.exports = [
  { method: 'GET', path: '/api/categories', config: Categories.find },
  { method: 'GET', path: '/api/categories/{id}', config: Categories.findOne },
  { method: "POST", path: "/api/categories", config: Categories.create },
  { method: "DELETE", path: "/api/categories/{id}", config: Categories.deleteOne },
  { method: "DELETE", path: "/api/categories", config: Categories.deleteAll },

  { method: 'GET', path: '/api/users', config: Users.find },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },

  { method: 'GET', path: '/api/pois', config: Pois.find },
  { method: 'GET', path: '/api/pois/{id}', config: Pois.findOne },
  { method: "POST", path: "/api/pois", config: Pois.create },
  { method: "DELETE", path: "/api/pois/{id}", config: Pois.deleteOne },
  { method: "DELETE", path: "/api/pois", config: Pois.deleteAll },
  { method: "POST", path: "/api/users/authenticate", config: Users.authenticate },

  { method: "PUT", path: "/api/users/{id}", config: Users.update },

];