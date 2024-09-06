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

exports.getCustomerBookings = (req, res) => {
  fs.readFile(
    path.join(__dirname, "dev-data-rooms.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "Error reading file",
        });
      }

      const rooms = JSON.parse(data);
      const customer = [];
      rooms.forEach((room) => {
        room.bookings.forEach((booking) => {
          if (booking.customerName.toLowerCase() === req.params.customerName) {
            const dateArr = booking.bookingDate.split("/");

            const today = Date.now();
            const bookedTime = new Date(
              `${dateArr[2]}-${
                dateArr[1] * 1 < 10 ? `0${dateArr[1]}` : `${dateArr[1]}`
              }-${dateArr[0] * 1 < 10 ? `0${dateArr[0]}` : `${dateArr[0]}`}T${
                booking.startTime.split(" ")[0]
              }Z`
            ).getTime();

            const bookingStatus = today < bookedTime ? "upcoming" : "completed";

            customer.push({ ...booking, roomName: room.name, bookingStatus });
          }
        });
      });

      if (!customer.length) {
        res.status(404).json({
          status: "fail",
          message: `No customer found with the name ${req.params.customerName}`,
        });
      } else {
        res.status(200).json({
          status: "success",
          totalBookings: customer.length,
          data: {
            customer,
          },
        });
      }
    }
  );
};
