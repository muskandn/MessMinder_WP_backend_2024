const mongoose = require("mongoose");
//const fs = require("fs");

const menuItemSchema = mongoose.Schema({
  days: [
    {
      day: {
        type: String,
        required: true,
      },
      meals: {
        breakfast: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
        lunch: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
        dinner: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
      },
    },
  ],
});

const Menu = mongoose.model("Menu", menuItemSchema);

model.exports= Menu
