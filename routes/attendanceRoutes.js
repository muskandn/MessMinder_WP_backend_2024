const express= require("express");
const { viewAttendance, takeAttendance } = require("../controllers/attendance");

const router=express.router();

router.route("/viewAttendance").get(viewAttendance);
router.route("/takeAttendance").post(takeAttendance);


module.exports=router;