const express = require("express");

const roomRouter = require("./routes/roomRoutes");

const app = express();

// Middleware to attach body to the request object and parse the JSON.
app.use(express.json());

// ROUTES
app.use("/api/v1/rooms", roomRouter);

module.exports = app;
