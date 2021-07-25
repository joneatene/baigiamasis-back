const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const { isLoggedIn } = require("../middleware");

router.get("/userinfo", isLoggedIn, (req, res) => {
  res.send("hello", req.userData);
});

module.exports = router;
