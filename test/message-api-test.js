"use strict";

const assert = require("chai").assert;
const PoiService = require("./poi-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("Message API tests", function () {
  let messages = fixtures.messages;
  let newMessage = fixtures.newMessage;
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
    await poiService.deleteAllMessages();
  });

  teardown(async function () {
    await poiService.deleteAllMessages();
  });

  test("Create a Message", async function () {
    const returnedMessage = await poiService.createMessage(newMessage);
    assert(_.some([returnedMessage], newMessage), "returnedMessage must be a superset of newMessage");
    assert.isDefined(returnedMessage._id);
  });

  test("Get Message", async function () {
    const m1 = await poiService.createMessage(newMessage);
    const m2 = await poiService.getMessage(m1._id);
    assert.deepEqual(m1, m2);
  });

  test("Get Invalid Message", async function () {
    const m1 = await poiService.getMessage("1234");
    assert.isNull(m1);
    const m2 = await poiService.getMessage("012345678901234567890123");
    assert.isNull(m2);
  });

  test("Delete a Message", async function () {
    let m = await poiService.createMessage(newMessage);
    assert(m._id != null);
    await poiService.deleteOneMessage(m._id);
    m = await poiService.getMessage(m._id);
    assert(m == null);
  });

  test("Get All Messages", async function () {
    for (let m of messages) {
      await poiService.createMessage(m);
    }

    const allMessages = await poiService.getMessages();
    assert.equal(allMessages.length, messages.length);
  });

  test("Get Messages Detail", async function () {
    for (let m of messages) {
      await poiService.createMessage(m);
    }

    const allMessages = await poiService.getMessages();
    for (var i = 0; i < messages.length; i++) {
      assert(_.some([allMessages[i]], messages[i]), "returnedMessage must be a superset of newMessage");
    }
  });

  test("Get All Messages Empty", async function () {
    const allMessages = await poiService.getMessages();
    assert.equal(allMessages.length, 0);
  });

});