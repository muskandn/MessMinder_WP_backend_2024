const Menu = require("../models/menuModel");

//create menu item--mess members
exports.createMenu = async (req, res) => {
  const menuItem = await Menu.create(req.body);

  res.status(201).json({
    success: true,
    menuItem,
  });
};


// view menu-->all
exports.viewMenu = async (req, res) => {
  const menu = await Menu.find();

  res.status(200).json({
    success: true,
    menu,
  });
};
