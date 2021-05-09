"use strict";

const assert = require("chai").assert;
const axios = require("axios");

suite("Poi API tests", function () {
  test("Get POIs", async function () {
    const response = await axios.get("http://laptop-s80vbeoh:3000/api/pois");
    const pois = response.data;
    assert.equal(2, pois.length);
    assert.equal(pois[0].name, "Sullies");
    assert.equal(pois[0].location, "Princes St");
    assert.equal(pois[0].latitude, 16.77379);
    assert.equal(pois[0].longitude, 96.16968);
    assert.equal(pois[0].image, "dan.png");
  });

  test("Get one POI", async function () {
    let response = await axios.get("http://laptop-s80vbeoh:3000/api/pois");
    const pois = response.data;
    assert.equal(2, pois.length);
    const onePoiUrl = "http://laptop-s80vbeoh:3000/api/pois/" + pois[0]._id;
    response = await axios.get(onePoiUrl);
    const onePoi = response.data;
    assert.equal(onePoi.name, "Sullies");
    assert.equal(onePoi.location, "Princes St");
    assert.equal(onePoi.latitude, 16.77379);
    assert.equal(onePoi.longitude, 96.16968);
    assert.equal(onePoi.image, "dan.png");
  });

  test("Create a POI", async function () {
    const poisUrl = "http://laptop-s80vbeoh:3000/api/pois";
    const newPoi = {
      name: "Abbey Tavern",
      location: "Quin",
      latitude: 52.81749,
      longitude: -8.86378,
      image: "tavern.jpg",
    };

    const response = await axios.post(poisUrl, newPoi);
    const returnedPoi = response.data;
    assert.equal(201, response.status);

    assert.equal(returnedPoi.name, "Abbey Tavern");
    assert.equal(returnedPoi.location, "Quin");
    assert.equal(returnedPoi.latitude, 52.81749);
    assert.equal(returnedPoi.longitude, -8.86378);
    assert.equal(returnedPoi.image, "tavern.jpg");
  });

});