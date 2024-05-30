const express = require("express");
const { app } = require("./socket/Socket");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const errorMiddleWare = require("./middleware/error");

const path = require("path");
const cors = require("cors");

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

app.use(cookieParser());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Public Folder
app.use(express.static("./public"));

//Route Imports
const items = require("./routes/itemsRoute");
const user = require("./routes/userRoute");
const bids = require("./routes/bidRoutes");
const notification = require("./routes/notificationRoute");

app.use(cors());
app.use("/api/v1", items);
app.use("/api/v1", user);
app.use("/api/v1", bids);
app.use("/api/v1", notification);

//=============================for live api check===============================

//
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

// ================================================================

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

//MidleWare For Error
app.use(errorMiddleWare);

module.exports = { app };
