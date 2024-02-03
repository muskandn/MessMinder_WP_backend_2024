const express=require("express")

const app=express();
app.use(express.json());

const attendance= require("./routes/attendanceRoutes");
const menu=require("./routes/menuRoutes");
const rating=require("./routes/ratingRoutes");
app.use("/api/v1", attendance);
app.use("/api/menu",menu);
app.use("/api/rating",rating);


module.exports=app

