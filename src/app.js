const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
dotenv.config();
const axios = require("axios");
const router = require("./routers/index");
const config = require("./config");
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;
const API_VERSION = process.env.API_VERSION;

const corsOptions = {
  origin: "*",
};

axios.defaults.baseURL = config.RAPID_BASE_API_URL;
axios.defaults.headers.common["X-RapidAPI-Key"] = config.RAPID_API_KEY;
axios.defaults.headers.common["X-RapidAPI-Host"] = config.RAPID_API_HOST;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(`/api/${API_VERSION}`, router);

app.use(function (req, res, next) {
  res.status(404);
  if (res.status(404).statusCode == 404) {
    return res.json({
      status: 404,
      message: "Not Found",
    });
  }
});

const start = async () => {
  try {
    await mongoose.connect(DB_URI);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

start();
