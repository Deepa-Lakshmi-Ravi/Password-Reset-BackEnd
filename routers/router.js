const express = require("express");
const userRouter = require("./User.router");

const router = express.Router();

router.use("/user", userRouter);

module.exports = router;
