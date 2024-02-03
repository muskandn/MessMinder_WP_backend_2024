const Attendance=require("../models/attendanceModel")

//Take Attendance--students
exports.takeAttendance=async (req,res)=>{
    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      attendance
    });
}

// view Attendance -- all
exports.viewAttendance=async(req,res)=>{

    const attendances=await Attendance.find();

    res.status(200).json({
      success: true,
      attendances,
    });
}
