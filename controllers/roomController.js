const fs = require("fs");
const path = require("path");

exports.getAllRooms = (req, res) => {
  // READ THE ROOM DATA FILE AND SEND AS A RESPONSE.

  fs.readFile(`${__dirname}/dev-data-room.json`, "utf8", (err, data) => {
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

exports.createRoom = (req, res) => {
  // Read the available halls
  fs.readFile(`${__dirname}/dev-data-room.json`, "utf8", (err, data) => {
    // RESPONSE FOR ERROR WHILE READING FILE
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Something went wrong",
      });
    }

    const halls = JSON.parse(data);

    const isAllFieldsAvailable =
      req.body.name &&
      req.body.maxCapacity &&
      req.body.pricePerHour &&
      req.body.amenities.length > 0;

    if (!isAllFieldsAvailable) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please send all the required fields (name,maxCapacity,pricePerHour,amenities(as an Array with atleast one amenities))",
      });
    }

    let isHallPresent = false;

    halls.forEach((hall) => {
      if (
        hall.name.split(" ").join("").toLowerCase() ===
        req.body.name.split(" ").join("").toLowerCase()
      ) {
        isHallPresent = true;
        return;
      }
    });

    if (isHallPresent) {
      return res.status(400).json({
        status: "fail",
        message: `${req.body.name} already exists. Please add a new hall`,
      });
    }

    const hall = { ...req.body, id: halls[halls.length - 1].id + 1 };

    const newHalls = [...halls, hall];

    fs.writeFile(
      path.join(__dirname, "dev-data-room.json"),
      JSON.stringify(newHalls),
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Error while writing file",
          });
        }

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
