const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const appRouter = require("./routers/router");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Connection DB

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@passwordresetmaster.8rxqjjd.mongodb.net/${process.env.DB_NAME}`
  )
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Error connecting to Database", err);
  });

app.use("/", appRouter);

app.use("/", (req, res) => {
  res.send("Welcome to the Backend Password Reset!!");
});

//Start the Server
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
