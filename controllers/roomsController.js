const fs = require("fs");
const path = require("path");

const uniqid = require("uniqid");

// Controller function for getting all rooms.

exports.getAllRooms = (req, res) => {
  // READ THE ROOM DATA FILE AND SEND AS A RESPONSE.

  fs.readFile(`${__dirname}/dev-data-rooms.json`, "utf8", (err, data) => {
    // RESPONSE FOR ERROR WHILE READING FILE
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Something went wrong",
      });
    }

    const rooms = JSON.parse(data);

    res.status(200).json({
      status: "success",
      totalRooms: rooms.length,
      data: {
        rooms,
      },
    });
  });
};

// Controller function for creating a new room.

exports.createRoom = (req, res) => {
  // Read the available halls
  fs.readFile(`${__dirname}/dev-data-rooms.json`, "utf8", (err, data) => {
    // RESPONSE FOR ERROR WHILE READING FILE
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Error reading rooms file",
      });
    }

    // Parsing the halls array

    const halls = JSON.parse(data);

    // Checking for required fields

    const isAllFieldsAvailable =
      req.body.name &&
      req.body.maxCapacity &&
      req.body.pricePerHour &&
      req.body.amenities.length > 0;

    // If fields missing give a error response.

    if (!isAllFieldsAvailable) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please send all the required fields (name,maxCapacity,pricePerHour,amenities(as an Array with atleast one amenities))",
      });
    }

    // Initializing variable for checking duplicate hall names.

    let isHallPresent = false;

    // Check if any duplicate halls present if so set the above variable to true.
    halls.forEach((hall) => {
      if (
        hall.name.split(" ").join("").toLowerCase() ===
        req.body.name.split(" ").join("").toLowerCase()
      ) {
        isHallPresent = true;
        return;
      }
    });

    // if the posted hall is present give a error response
    if (isHallPresent) {
      return res.status(400).json({
        status: "fail",
        message: `${req.body.name} already exists. Please add a new hall`,
      });
    }

    // Constructing a new hall object
    const hall = { ...req.body, id: uniqid(), bookings: [] };

    // Constructing a array of halls.
    const newHalls = [...halls, hall];

    // Writing the newly created hall to the file.

    fs.writeFile(
      path.join(__dirname, "dev-data-rooms.json"),
      JSON.stringify(newHalls),
      (err) => {
        // Responding with a server error when unable to write the file
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Error while writing file",
          });
        }

        // If the file written respond with a success status
        res.status(200).json({
          status: "success",
          data: {
            hall,
          },
        });
      }
    );
  });
};

// Controller functio to make a booking to a room.

exports.bookRoom = (req, res) => {
  // Reading the available rooms data.
  fs.readFile(
    path.join(__dirname, "dev-data-rooms.json"),
    "utf8",
    (err, data) => {
      // Responding with a server error when unable to read the file.
      if (err) {
        res.status(500).json({
          status: "fail",
          message: "Error while reading file",
        });
      }

      // Parsing the roomId from the url.
      const roomId = req.params.roomId;

      // Parsing the rooms data to a JS object.

      const rooms = JSON.parse(data);

      // Finding the room with the requested room id.

      const bookingRoom = rooms.filter((room) => room.id === roomId);

      // If no rooms found in the requested id give a response of Not Found

      if (!bookingRoom.length) {
        return res.status(404).json({
          status: "fail",
          message: `No rooms found in this id: ${req.params.roomId}`,
        });
      }

      // If there is no bookings in the room add the new booking object.

      if (!bookingRoom[0].bookings.length) {
        console.log("Found Room");
        // Filtering the rooms except the requested room.
        const newRooms = [...rooms.filter((room) => room.id !== roomId)];

        const booking = Object.assign(req.body, { bookingId: uniqid() });

        const bookings = [booking];

        newRooms.push({
          ...bookingRoom[0],
          bookings,
        });

        // Writing the room with the booking data to the file.

        fs.writeFile(
          path.join(__dirname, "dev-data-rooms.json"),
          JSON.stringify(newRooms),
          (err) => {
            // Responding with a server error when unable to write the file.

            if (err) {
              return res.status(500).json({
                status: "fail",
                message: "Error while writing bookings data",
              });
            }

            // If written then sending success reponse with the booking data.
            return res.status(200).json({
              status: "success",
              data: {
                booking: { ...req.body, roomId },
              },
            });
          }
        );
      } else {
        let isBookingOverlap = false;

        // If there are any bookings in the requsted rooms Check for overlapping bookings.

        bookingRoom[0].bookings.forEach((booking) => {
          if (booking.bookingDate === req.body.bookingDate) {
            const startTime = new Date(
              `1970-01-01T${booking.startTime.split(" ")[0]}Z`
            ).getTime();

            const endTime = new Date(
              `1970-01-01T${booking.endTime.split(" ")[0]}Z`
            ).getTime();

            const currentBookingStart = new Date(
              `1970-01-01T${req.body.startTime.split(" ")[0]}Z`
            ).getTime();

            isBookingOverlap =
              currentBookingStart >= startTime &&
              currentBookingStart <= endTime;
            return;
          }
        });

        if (isBookingOverlap) {
          return res.status(400).json({
            status: "fail",
            message: "There is already a booking in the requested time frame",
          });
        }

        const newRooms = [...rooms.filter((room) => room.id !== roomId)];

        const bookings = bookingRoom[0].bookings;

        const bookedAt = new Date(Date.now()).toISOString().split("T")[0];
        const newBooking = {
          ...req.body,
          bookingId: uniqid(),
          bookedAt,
        };
        bookings.push(newBooking);

        newRooms.push({
          ...bookingRoom[0],
          bookings,
        });

        fs.writeFile(
          path.join(__dirname, "dev-data-rooms.json"),
          JSON.stringify(newRooms),
          (err) => {
            if (err) {
              return res.status(500).json({
                status: "fail",
                message: "Error while writing bookings data to the file",
              });
            }

            return res.status(200).json({
              status: "success",
              data: {
                booking: { ...newBooking, roomId },
              },
            });
          }
        );
      }
    }
  );
};

// Controller function for getting all booking data for all rooms.

exports.getAllBookings = (req, res) => {
  // Get all rooms data from the file.

  fs.readFile(
    path.join(__dirname, "dev-data-rooms.json"),
    "utf8",
    (err, data) => {
      // Sending server error response when unable to read the file.
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "Error while reading the file",
        });
      }
      const rooms = JSON.parse(data);

      const bookings = rooms.map((room) => {
        const bookedStatus = room.bookings.length > 0 ? "booked" : "vacant";

        return {
          roomName: room.name,
          bookedStatus,
          bookings: room.bookings,
        };
      });

      res.status(200).json({
        status: "success",
        data: {
          bookings,
        },
      });
    }
  );
};
