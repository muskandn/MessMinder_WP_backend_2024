import { Router } from "express";
import {
//   verifyOutingChecks,
  requireAuth,
  checkEmail,
} from "../helpers/middlewares.js";
import {
  getCurrentUser,
  updateUser,
//   getOutings,
  logOut,
} from "../controllers/common.js";
// import { searchStudents, closeGateEntry } from "../controllers/security.js"; //no need
// import { isOutside, openGateEntry } from "../controllers/students.js"; // no need
import {
  loginUser,
  resetPassword,
  sendOTP,
  verifyOTP,
  isRegistered,
  registerStudent,
} from "../controllers/auth.js";
import { upload } from "../helpers/helpers.js";
import {complaintController} from "../controllers/complaintController.js";
const router = Router();

// AUTH
router.post("/login", loginUser);
router.post("/is-registered", checkEmail, isRegistered);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register-student", registerStudent);
router.post("/reset-password", resetPassword);

// COMMON
router.get("/profile", requireAuth, getCurrentUser);
// router.get("/outings", requireAuth, getOutings); // no need
router.patch(
  "/update-profile",
  requireAuth,
  upload.single("idCard"),
  updateUser
);
router.get("/logout", requireAuth, logOut);

//complaint
router.post("/complaint", complaintController);

// SECURITY
// router.get("/search", requireAuth, searchStudents); //no need
// router.get("/security/close-entry", requireAuth, closeGateEntry); //no need

// STUDENTS
// router.post(
//   "/student/exit-request",
//   requireAuth,
//   verifyOutingChecks,
//   openGateEntry
// );
// router.get("/student/outing-status", requireAuth, isOutside); // no need

export default router;
