const express = require("express");
const passport = require('passport');
const router = express.Router();

router.get("/home", (req, res, next) => {
  res.render("epoint/home");
});



module.exports = router;