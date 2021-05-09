"use strict";

const assert = require("chai").assert;
const PoiService = require("./poi-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("POI API tests", function () {
  let pois = fixtures.pois;
  let newPoi = fixtures.newPoi;

  const poiService = new PoiService(fixtures.poiService);

  setup(async function () {
    poiService.deleteAllCategories();
    poiService.deleteAllPois();
  });

  teardown(async function () {});

  test("Submit a POI", async function () {
    const returnedPoi = await poiService.createPoi(newPoi);
    assert(_.some([returnedPoi], newPoi), "returnedPoi must be a superset of newPoi");
    assert.isDefined(returnedPoi._id);
  });

  test("Delete a POI", async function () {
    let p = await poiService.createPoi(newPoi);
    assert(p._id != null);
    await poiService.deleteOnePoi(p._id);
    p = await poiService.getPoi(p._id);
    assert(p == null);
  });

});