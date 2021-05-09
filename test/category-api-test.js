"use strict";

const assert = require("chai").assert;
const axios = require("axios");

suite("Category API tests", function () {
  test("get categories", async function () {
    const response = await axios.get("http://laptop-s80vbeoh:3000/api/categories");
    const categories = response.data;
    assert.equal(2, categories.length);
    assert.equal(categories[0].county, "Clare");
    assert.equal(categories[0].province, "Munster");
    assert.equal(categories[1].county, "Waterford");
    assert.equal(categories[1].province, "Munster");
  });

  test("get one category", async function () {
    let response = await axios.get("http://laptop-s80vbeoh:3000/api/categories");
    const categories = response.data;
    assert.equal(2, categories.length);
    const oneCategoryUrl = "http://laptop-s80vbeoh:3000/api/categories/" + categories[0]._id;
    response = await axios.get(oneCategoryUrl);
    const oneCategory = response.data;
    assert.equal(oneCategory.county, "Clare");
    assert.equal(oneCategory.province, "Munster");
  });

  test("create a category", async function () {
    const categoriesUrl = "http://laptop-s80vbeoh:3000/api/categories";
    const newCategory = {
      county: "Tyrone",
      province: "Ulster",
    };

    const response = await axios.post(categoriesUrl, newCategory);
    const returnedCategory = response.data;
    assert.equal(201, response.status);

    assert.equal(returnedCategory.county, "Tyrone");
    assert.equal(returnedCategory.province, "Ulster");
  });

});