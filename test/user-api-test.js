"use strict";

const assert = require("chai").assert;
const axios = require("axios");

suite("User API tests", function () {
  test("Get Users", async function () {
    const response = await axios.get("http://laptop-s80vbeoh:3000/api/users");
    const users = response.data;
    assert.equal(2, users.length);
    assert.equal(users[0].firstName, "Homer");
    assert.equal(users[0].lastName, "Simpson");
    assert.equal(users[0].email, "homer@simpson.com");
    assert.equal(users[0].password, "$2a$10$YLzgnyE9fBdlOf.SD.9c5eC7NhXr4SMLoshlRTAZ7SXi2CAYVC2B.");
  });

  test("Get one User", async function () {
    let response = await axios.get("http://laptop-s80vbeoh:3000/api/users");
    const users = response.data;
    assert.equal(2, users.length);
    const oneUserUrl = "http://laptop-s80vbeoh:3000/api/users/" + users[0]._id;
    response = await axios.get(oneUserUrl);
    const oneUser = response.data;
    assert.equal(oneUser.firstName, "Homer");
    assert.equal(oneUser.lastName, "Simpson");
    assert.equal(oneUser.email, "homer@simpson.com");
    assert.equal(oneUser.password, "$2a$10$YLzgnyE9fBdlOf.SD.9c5eC7NhXr4SMLoshlRTAZ7SXi2CAYVC2B.");
  });

  test("Create a User", async function () {
    const usersUrl = "http://laptop-s80vbeoh:3000/api/users";
    const newUser = {
      firstName: "Dan",
      lastName: "Shanahan",
      email: "DantheMan@gmail.com",
      password: "q",
    };

    const response = await axios.post(usersUrl, newUser);
    const returnedUser = response.data;
    assert.equal(201, response.status);

    assert.equal(returnedUser.firstName, "Dan");
    assert.equal(returnedUser.lastName, "Shanahan");
    assert.equal(returnedUser.email, "DantheMan@gmail.com");
    assert.equal(returnedUser.password, "q");
  });

});