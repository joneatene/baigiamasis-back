const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const { mysqlConfig, jwtSecret } = require("../config");

router.post("/register", async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.fullname) {
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
      `SELECT email FROM users WHERE email='${req.body.email}'`
    );

    if (emailCheck.length !== 0) {
      return res.status(400).send({
        error: "An account with this email already exists",
      });
    }

    const [data] = await con.execute(
      `INSERT INTO users (fullname, email, password) VALUES (${mysql.escape(
        req.body.fullname
      )}, ${mysql.escape(req.body.email)}, '${hashedPassword}')`
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

router.post("/login", async (req, res) => {
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
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `SELECT id, fullname, email, password FROM users WHERE email=${mysql.escape(
        req.body.email
      )}`
    );
    con.end();

    if (data.length !== 1) {
      return res.status(400).send({ error: "Email or password is incorrect" });
    }

    const passwordValidity = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!passwordValidity) {
      return res.status(400).send({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      {
        id: data[0].id,
        email: data[0].email,
      },
      jwtSecret,
      { expiresIn: 60 * 60 }
    );

    return res.send({ status: "User logged in", token });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

module.exports = router;
