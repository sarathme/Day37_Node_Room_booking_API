const fs = require("fs");

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
  res.status(200).json({
    status: "success",
    totalRooms: 1,
    data: [],
  });
};
