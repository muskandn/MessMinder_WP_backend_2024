const express=require("express");
const {takeRating}=require("../controllers/rating");

const router=express.router();

router.route("/takeRating").post(takeRating);

module.exports=router;