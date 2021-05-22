"use strict";

const assert = require("chai").assert;
const PoiService = require("./poi-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("POI API tests", function () {
  let pois = fixtures.pois;
  let newPoi = fixtures.newPoi;
  let newUser = fixtures.newUser;
  const poiService = new PoiService(fixtures.poiService);

  suiteSetup(async function () {
    await poiService.deleteAllUsers();
    const returnedUser = await poiService.createUser(newUser);
    const response = await poiService.authenticate(newUser);
  });

  suiteTeardown(async function () {
    await poiService.deleteAllUsers();
    poiService.clearAuth();
  })

  setup(async function () {
    await poiService.deleteAllPois();
  });

  teardown(async function () {
    await poiService.deleteAllPois();
  });

  test("Submit a POI", async function () {
    const returnedPoi = await poiService.createPoi(newPoi);
    assert(_.some([returnedPoi], newPoi), "returnedPoi must be a superset of newPoi");
    assert.isDefined(returnedPoi._id);
  });

  test("Get POI", async function () {
    const p1 = await poiService.createPoi(newPoi);
    const p2 = await poiService.getPoi(p1._id);
    assert.deepEqual(p1, p2);
  });

  test("Get Invalid POI", async function () {
    const p1 = await poiService.getPoi("1234");
    assert.isNull(p1);
    const p2 = await poiService.getPoi("012345678901234567890123");
    assert.isNull(p2);
  });

  test("Delete a POI", async function () {
    let p = await poiService.createPoi(newPoi);
    assert(p._id != null);
    await poiService.deleteOnePoi(p._id);
    p = await poiService.getPoi(p._id);
    assert(p == null);
  });

  test("Delete All POIs", async function () {
    for (let p of pois) {
      await poiService.createPoi(p);
    }
    const allPois = await poiService.getPois();
    assert.equal(allPois.length, pois.length);
    await poiService.deleteAllPois();
  });

  test("Get All POIs", async function () {
    for (let p of pois) {
      await poiService.createPoi(p);
    }
    const allPois = await poiService.getPois();
    assert.equal(allPois.length, pois.length);
  });

  test("Get POIs Detail", async function () {
    for (let p of pois) {
      await poiService.createPoi(p);
    }
    const allPois = await poiService.getPois();
    for (var i = 0; i < pois.length; i++) {
      assert(_.some([allPois[i]], pois[i]), "returnedPoi must be a superset of newPoi");
    }
  });

  test("Get All POIs Empty", async function () {
    const allPois = await poiService.getPois();
    assert.equal(allPois.length, 0);
  });

  test("Create a POI and Check Submitter", async function () {
    //const returnedCategory = await poiService.createCategory(newCategory);
    //await poiService.createPoi(returnedCategory._id, pois[0]);
    await poiService.createPoi(pois[0]);
    const returnedPois = await poiService.getPois();
    assert.isDefined(returnedPois[0].submitter);
    const users = await poiService.getUsers();
    //assert(_.some([users[0]], newUser), "returnedUser must be a superset of newUser");
  });

});