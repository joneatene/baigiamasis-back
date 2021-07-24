const { Router } = require("express");
const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const { mysqlConfig } = require("../config");

router.post("/register", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ error: "Bad data provided" });
  }

  const schema = Joi.object({
    email: Joi.string().email().min(3).max(255),
    password: Joi.string().min(8).max(255),
  });

  try {
    const value = await schema.validateAsync({
      email: req.body.email,
      password: req.body.password,
    });
  } catch (err) {
    return res.status(400).send({ error: "Bad data provided" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const con = await mysql.createConnection(mysqlConfig);

    const [emailCheck] = await con.execute(
      `SELECT * FROM users WHERE email='${req.body.email}'`
    );

    if (emailCheck.affectedRows !== 0) {
      return res
        .status(400)
        .send({ error: "An account with this email already exists" });
    }

    const [data] = await con.execute(
      `INSERT INTO users (email, password) VALUES (${mysql.escape(
        req.body.email
      )}, '${hashedPassword}')`
    );
    con.end();

    if (data.affectedRows !== 1) {
      return res
        .status(500)
        .send({ error: "An unexpected error occurred. Please try again" });
    }

    return res.send({ status: "User registered" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

router.get("/login", (req, res) => {
  res.send("This is login");
});

module.exports = router;
