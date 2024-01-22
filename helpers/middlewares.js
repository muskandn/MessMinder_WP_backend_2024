// import geolib from "geolib"; // location calculation
import moment from "moment"; // time
import * as dotenv from "dotenv";
// import outings from "../models/outingModel.js";
import { generatePastYears } from "./helpers.js";
import Joi from "joi"; // data description
dotenv.config();

// Check Session
export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json("Not Logged In");
  }
  next();
};

// //Verify Outing Checks
// export const verifyOutingChecks = async (req, res, next) => {
//   return next(); //Bypassed Checks for demo

//   //isStudent
//   if (req.session.role !== "student") {
//     return res.status(403).json("Only for students");
//   }

//   // isOutside
//   const result = await outings.findOne(
//     { userId: req.session.userId, isOpen: true },
//     { userId: 1 }
//   );
//   if (result) {
//     return res.status(400).json("Already outside");
//   }

//   // Check Timing
//   const currentTime = moment().format("HH:mm");
//   if (currentTime > "22:00" || currentTime < "05:00") {
//     return res.status(403).json("Intime deadline exceeded");
//   }

//   // Check Location
//   const { latitude, longitude } = req.body;

//   const centralLocation = { latitude: 26.250106, longitude: 78.17652 };
//   const verificationRadius = 200;

//   if (!latitude || !longitude) {
//     return res.status(404).json("Location undetermined");
//   }

//   const distance = geolib.getDistance({ latitude, longitude }, centralLocation);

//   if (distance <= verificationRadius) {
//     next();
//   } else {
//     return res.status(403).send("Location verification failed");
//   }
// };

export const checkEmail = async (req, res, next) => {
  try {
    const pastYears = generatePastYears(5);

    const email = req.body.email;
    const emailSchema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .custom((value, helpers) => {
          if (
            value.endsWith("@iiitm.ac.in") &&
            pastYears.some((year) => value.includes(year))
          ) {
            return value;
          } else {
            return helpers.error("any.invalid");
          }
        }, "Custom Domain Validation"),
    });

    await emailSchema.validateAsync({ email });
    next();
  } catch (error) {
    if (error.details) {
      return res.status(422).json("Invalid email.");
    }

    return res.status(500).json(error.message);
  }
};
