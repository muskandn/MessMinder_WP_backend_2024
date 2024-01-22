import users from "../models/userModel.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import Joi from "joi";
import otpGenerator from "otp-generator";
import { fileURLToPath } from "url";
import { redisClient } from "../server.js";
import {
  removeExpiredUserSessions,
  revokeUserSessions,
  sendMail,
} from "../helpers/helpers.js";
import * as dotenv from "dotenv";
dotenv.config();

// Login User
export const loginUser = async (req, res) => {
  try {
    if (req.session.userId) {
      return res.status(400).send("Already logged in!");
    }
    //Form Validation
    const loginSchema = Joi.object({
      id: Joi.string().required(),
      password: Joi.string().min(3).required(),
      remember_me: Joi.bool(),
    });

    await loginSchema.validateAsync(req.body);

    //Search in DB
    const { id, password, remember_me } = req.body;
    const user = await users.findOne(
      {
        $or: [{ email: id }, { userId: id }],
      },
      { password: 1, userId: 1, role: 1, name: 1 }
    );

    if (!user) {
      return res.status(404).send("Not registered!");
    }

    //Verify Password
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (passwordCorrect) {
      req.session.userId = user.userId;
      req.session.role = user.role;
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 1 month
      }

      // Update active-sessions of user
      redisClient.SADD(
        `user-sess:${user.userId}`,
        req.sessionID,
        (err, result) => {
          if (err) {
            console.error("Error adding session to active sessions:", err);
          }
        }
      );

      removeExpiredUserSessions(user.userId);

      return res.status(200).json({
        userId: user.userId,
        role: user.role,
        message: `Login Successful`,
      });
    } else {
      return res.status(400).send("Wrong Password");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

export const isRegistered = async (req, res) => {
  try {
    const email = req.body.email;

    // isRegistered
    const user = await users.findOne({ email }, { _id: 0, userId: 1 });
    if (user) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};

// OTP Generation
export const sendOTP = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json("No email provided!");
    }

    if (req.session.userId) {
      return res.status(403).json("Already logged in");
    }

    if (
      req.session.otpExpiry &&
      Date.now() < req.session.otpExpiry &&
      req.body.email === req.session.email
    ) {
      return res.status(400).send("OTP not expired");
    }
    //Email Validation
    const emailSchema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .custom((value, helpers) => {
          if (value.endsWith("@iiitm.ac.in")) {
            return value;
          } else {
            return helpers.error("any.invalid");
          }
        }, "Custom Domain Validation"),
    });
    await emailSchema.validateAsync({ email: req.body.email });

    //Generate & Store OTP in redis
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    //load OTP Email template
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const otpTemplate = fs
      .readFileSync(path.join(__dirname, "../others/otpTemplate.html"), "utf-8")
      .replace("{{otp}}", otp);

    //NodeMailer
    const mailOptions = {
      from: process.env.GMAIL_ID,
      to: req.body.email,
      subject: `messMinder - Your OTP for verification is ${otp}`,
      html: otpTemplate,
    };

    const result = await sendMail(mailOptions);
    if (result.accepted) {
      // Store temporary information
      req.session.otp = otp;
      req.session.email = req.body.email;
      req.session.otpExpiry = Date.now() + 180000; //5 Minutes from now

      return res.json(result);
    }

    res.status(500).send("Error sending OTP");
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};

// OTP Verification
export const verifyOTP = async (req, res) => {
  try {
    if (req.session.userId) {
      return res.status(403).send("Already logged in");
    }

    const userEnteredOTP = req.body.otp;
    const storedOTP = req.session.otp;
    const storedOTPExpiry = req.session.otpExpiry;

    if (!req.session.otp || !req.session.otpExpiry || !req.session.email) {
      return res.status(400).send("Not generated");
    }

    if (Date.now() > storedOTPExpiry) {
      delete req.session.otp;
      delete req.session.email;
      delete req.session.otpExpiry;
      return res.status(401).send("OTP expired");
    }

    if (userEnteredOTP === storedOTP) {
      delete req.session.otp;
      delete req.session.otpExpiry;
      req.session.tempSessionExp = Date.now() + 300000; //5 Minutes from now
      return res.send("OTP Verified");
    } else {
      return res.status(403).send("Wrong OTP");
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//Register user
export const registerStudent = async (req, res) => {
  try {
    console.log(req.session);

    const email = req.session.email;
    const { password } = req.body;

    if (req.session.userId) {
      return res.status(400).json("Already logged in!");
    }

    if (
      !req.session.tempSessionExp ||
      Date.now() > req.session.tempSessionExp
    ) {
      return res.status(401).send("Session Expired!");
    }

    //Form Validation
    const registerSchema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .custom((value, helpers) => {
          if (value.endsWith("@iiitm.ac.in")) {
            return value;
          } else {
            return helpers.error("any.invalid");
          }
        }, "Custom Domain Validation"),
      password: Joi.string().pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*[0-9])[a-zA-Z0-9@$!%*#?&]{8,}$")
      ),
    });

    await registerSchema.validateAsync({ email, password });

    // Destructuring Values
    const userId = email.split("@")[0];
    const role = "student";
    const profilePic =
      "https://res.cloudinary.com/dqjkucbjn/image/upload/v1688890088/Avatars/thumbs-1688889944751_w9xb0e.svg";

    // Hash password & save to mongoDB
    const hash = await bcrypt.hash(password, 12);
    const newUser = new users({
      email,
      password: hash,
      role,
      userId,
      profilePic,
    });
    await newUser.save();

    // Clear Temp Session
    delete req.session.isRegistered;
    delete req.session.tempSessionExp;
    delete req.session.email;

    return res.json({ message: "Student registered" });
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }
    return res.status(500).json(error.message);
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    let id = null;
    if (req.session.userId) {
      id = req.session.userId;
    } else {
      id = req.session.email;
    }

    if (
      (!id && !req.session.tempSessionExp) ||
      Date.now() > req.session.tempSessionExp
    ) {
      return res.status(401).send("Session Expired!");
    }

    const { currentPassword, newPassword } = req.body;

    const user = await users.findOne(
      { $or: [{ userId: id }, { email: id }] },
      { password: 1, userId: 1 }
    );

    // Same Password Check
    if (newPassword === user.password) {
      return res.status(400).send("Old & new password cannot be same");
    }

    if (!user) {
      return res.status(404).send("Not registered!");
    }

    // Match Current Password
    if (currentPassword) {
      const passwordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordCorrect) {
        return res.status(400).send("Current Password doesn't match");
      }
    }

    //newPassword Validation
    const passwordSchema = Joi.object({
      password: Joi.string().pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*[0-9])[a-zA-Z0-9@$!%*#?&]{8,}$")
      ),
    });

    await passwordSchema.validateAsync({ password: newPassword });

    // Save new password to mongoDB
    const newHash = await bcrypt.hash(newPassword, 12);
    user.password = newHash;
    await user.save();

    // Revoke all active user sessions
    revokeUserSessions(user.userId);
    if (req.session.email) delete req.session.email;
    delete req.session.req.session.tempSessionExp;

    return res.json("Password Reset Successful!");
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};
