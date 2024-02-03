// const mongoose = require("mongoose");
// const fs = require("fs");

// const menuItemSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   rating: {
//     type: Number,
//     default: 0,
//     validate: {
//       validator: Number.isInteger,
//       message: "{VALUE} is not an integer value for rating.",
//     },
//   },
//   // You may add more properties to describe the menu item, e.g., type, description, etc.
// });

// const menuRatingSchema = mongoose.Schema({
//   day: {
//     type: String,
//     enum: [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ],
//     required: true,
//   },
//   meal: {
//     type: String,
//     enum: ["breakfast", "lunch", "dinner"],
//     required: true,
//   },
//   items: [menuItemSchema],
// });

// const MenuRating = mongoose.model("MenuRating", menuRatingSchema);

// // Read the menu JSON file and create instances of MenuRating
// const menuData = JSON.parse(fs.readFileSync("menu.json", "utf-8"));

// for (const day in menuData) {
//   for (const meal in menuData[day]) {
//     const menuRating = new MenuRating({
//       day,
//       meal,
//       items: menuData[day][meal],
//     });
//     menuRating.save();
//   }
// }


const mongoose= require("mongoose");

const ratingSchema = mongoose.Schema({
  name: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 5;
      },
      message: "Value must be between 0 and 5",
    },
  },
  count: {
    type: Number,
    default: 0,
  },
});

module.exports=mongoose.model("Rating",ratingSchema)