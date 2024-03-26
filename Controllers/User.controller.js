const userModel = require("../models/user.model");
const auth = require("../Public/auth");
const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
const randomstring = require("randomstring");

dotenv.config();

const Signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ExistingUser = await userModel.findOne({ email });
    if (ExistingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await auth.hashPassword(password);
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await auth.hashCompare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = await auth.createToken({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    let userData = await userModel.findOne(
      { email: req.body.email },
      { _id: 0, password: 0, createdAt: 0, email: 0 }
    );
    res.status(200).json({ message: "Signin successful", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (user) {
      let randomString = randomstring.generate({
        length: 10,
        charset: "alphanumeric",
      });

      const expitationTimeStamp = Date.now() + 2 * 60 * 1000;

      console.log(expitationTimeStamp);

      const resetLink = "";

      const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: user.email,
        subject: "Password Reset Link",
        html: `
               <p>Dear ${user.firstName} , </p>
               <p>Sorry to hear you’re having trouble logging into your account. We got a message that you forgot your password. If this was you, you can get right back into your account or reset your password now. </p>
                      <p> Click the following Link to reset your password \n ${resetLink} </p>
      
                      <p>If you didn’t request a login link or a password reset, you can ignore this message. </P>
      
                      <p> Only people who know your account password or click the login link in this email can log into your account. </P>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Failed to send the password reset mail" });
        } else {
          console.log("password reset mail sent" + info.response);
          res.status(200).json({
            success: true,
            message: "password reset mail sent successfully",
          });
        }

        user.randomString = randomString;
        user
          .save()
          .then(() => {
            res.status(201).json({
              message:
                "Reset password mail sent successfully and random string updated in Database",
            });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
          });
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { randomString } = req.params;

    const user = await userModel.findOne({ randomString: randomString });
    if (
      !user ||
      user.randomString !== randomString ||
      user.expitationTimeStamp < Date.now()
    ) {
      res.status(400).json({
        message: "Invalid Random String",
      });
    } else {
      if (req.body.newPassword) {
        const newPassword = await auth.hashPassword(req.body.newPassword);
        user.password = newPassword;
        user.randomString = null;
        await user.save();

        res.status(201).json({
          message: "Your new password is updated",
        });
      } else {
        res.status(400).json({
          message: "Invalid password provider",
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  Signup,
  Signin,
  forgetPassword,
  resetPassword,
};
