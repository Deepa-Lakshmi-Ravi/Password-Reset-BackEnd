const express = require("express");
const UserController = require("../Controllers/User.controller");

const router = express.Router();

router.post("/signup",UserController.Signup);
router.post("/login", UserController.Signin);
router.post("/forget-password",UserController.forgetPassword);
router.post("/reset-password/:randomString/:expirationTimestamp", UserController.resetPassword);

module.exports = router;
