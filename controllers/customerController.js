const fs = require("fs");

const path = require("path");

exports.getAllCustomers = (req, res) => {
  // Read the file using fs module
  fs.readFile(
    path.join(__dirname, "dev-data-rooms.json"),
    "utf8",
    (err, data) => {
      // Send server error response when unable to read the file.
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "Error while reading file",
        });
      }

      // Parse the read data to javascript object.

      const rooms = JSON.parse(data);

      // Prepare customers array.

      let customers = [];

      // Populate customers array.

      rooms.forEach((room) => {
        room.bookings.forEach((booking) => {
          customers.push({ ...booking, roomName: room.name });
        });
      });

      // Send the response with customer data.

      res.status(200).json({
        status: "success",
        data: {
          customers,
        },
      });
    }
  );
};
