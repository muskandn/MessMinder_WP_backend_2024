const mongoose = require("mongoose");
const fs = require("fs");

const menuItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value for rating.",
    },
  },
  // You may add more properties to describe the menu item, e.g., type, description, etc.
});

const menuRatingSchema = mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    required: true,
  },
  meal: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true,
  },
  items: [menuItemSchema],
});

const MenuRating = mongoose.model("MenuRating", menuRatingSchema);

// Read the menu JSON file and create instances of MenuRating
const menuData = JSON.parse(fs.readFileSync("menu.json", "utf-8"));

for (const day in menuData) {
  for (const meal in menuData[day]) {
    const menuRating = new MenuRating({
      day,
      meal,
      items: menuData[day][meal],
    });
    menuRating.save();
  }
}
