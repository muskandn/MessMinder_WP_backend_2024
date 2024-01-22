import nodemailer from "nodemailer";
import { redisClient } from "../server.js";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import * as dotenv from "dotenv";
dotenv.config();

//Multer Cloudinary Storage
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    // folder: "Guardian",
    folder: "messMinder",
    public_id: (req, file) => file.fieldname + "-" + req.session.userId,
  },
});

export const upload = multer({ storage: storage });

// Send Email
export const sendMail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_APP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // console.log(process.env.GMAIL_APP_PASS);
    const info = await transporter.sendMail(mailOptions);
    //error here
    return info;
  } catch (error) {
    return error.message;
  }
};

//Revoke User Sessions
export const revokeUserSessions = async (userId) => {
  try {
    const sessionIds = await redisClient.sMembers(`user-sess:${userId}`);

    for (const sessionId of sessionIds) {
      await redisClient.DEL(`sess:${sessionId}`);
    }

    await redisClient.DEL(`user:${userId}`);
    return `Active sessions cleared for ${userId}`;
  } catch (err) {
    return new Error("Could not revoke sessions");
  }
};

export const removeExpiredUserSessions = async (userId) => {
  try {
    const sessionIds = await redisClient.sMembers(`user-sess:${userId}`);

    for (const sessionId of sessionIds) {
      const sessionExists = await redisClient.exists(`sess:${sessionId}`);
      if (!sessionExists) {
        await redisClient.sRem(`user-sess:${userId}`, sessionId);
      }
    }

    console.log(`Expired members removed for ${userId}`);
  } catch (err) {
    console.error(err);
  }
};

export const generatePastYears = (n) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < n; i++) {
    years.push((currentYear - i).toString());
  }
  return years;
};
