const express = require("express");
const { viewMenu, createMenu } = require("../controllers/menu");

const router = express.router();

router.route("/viewMenu").get(viewMenu);
router.route("/createMenu").post(createMenu);

module.exports = router;
