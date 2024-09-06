const express = require("express");

// Importing the controller for rooms.

const roomController = require("../controllers/roomsController");

// Generating a router instance of express Router class
const router = express.Router();

// Assigning HTTP methods for root route.

router
  .route("/")
  .get(roomController.getAllRooms)
  .post(roomController.createRoom);

// Assigning HTTP methods for /bookings route.

router.route("/bookings").get(roomController.getAllBookings);

// Assigning HTTP for dynamic route with room id as endpoint.

router.route("/:roomId").post(roomController.bookRoom);

// Exporting the router instance.

module.exports = router;
