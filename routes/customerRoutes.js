const express = require("express");

// Importing controller module of customers

const customerController = require("./../controllers/customerController");

const router = express.Router();

router.route("/").get(customerController.getAllCustomers);

module.exports = router;
