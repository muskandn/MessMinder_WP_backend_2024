const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
    attendance: {
        breakfast: {
            type: Boolean,
            default: false,
        },
        lunch: {
            type: Boolean,
            default: false,
        },
        dinner: {
            type: Boolean,
            default: false,
        }
    },
    // total: {
    //     type: Number,
    //     default: 0,
    // }
});

// Define a pre-save middleware to calculate the total before saving
// attendanceSchema.pre('save', function (next) {
//     this.total = (this.attendance.breakfast ? 1 : 0) +
//                  (this.attendance.lunch ? 1 : 0) +
//                  (this.attendance.dinner ? 1 : 0);

//     next();
// });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
