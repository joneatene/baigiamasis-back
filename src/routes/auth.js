const { Router } = require("express");
const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();

const { mysqlConfig } = require("../config");

router.get("/register", (req, res) => {
  res.send("This is register");
});

router.get("/login", (req, res) => {
  res.send("This is login");
});

module.exports = router;
