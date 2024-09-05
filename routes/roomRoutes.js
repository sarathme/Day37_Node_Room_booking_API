const express = require("express");

const roomController = require("../controllers/roomController");

const router = express.Router();

router
  .route("/")
  .get(roomController.getAllRooms)
  .post(roomController.createRoom);

module.exports = router;
