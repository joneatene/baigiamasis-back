const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const { isLoggedIn } = require("../middleware");
const { mysqlConfig } = require("../config");

router.get("/userinfo", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `SELECT id, fullname FROM users WHERE id=${req.userData.id}`
    );
    con.end();

    res.send(data[0]);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

router.get("/content", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `SELECT posts.id AS post_id, user_id, content, timestamp, users.fullname FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY timestamp DESC`
    );
    con.end();

    if (data.length === 0) {
      return res.send({ status: "Sorry no posts. Post something!" });
    }

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

router.get("/content/:id", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `SELECT posts.id AS post_id, user_id, content, timestamp, users.fullname FROM posts INNER JOIN users ON users.id = posts.user_id WHERE user_id = ${req.params.id} ORDER BY timestamp DESC`
    );
    con.end();

    if (data.length === 0) {
      return res.send({ status: "Sorry no posts. Post something!" });
    }

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

router.post("/postcontent", isLoggedIn, async (req, res) => {
  if (!req.body.content || !req.body.user_id) {
    return res.status(400).send({ error: "Bad data provided" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `INSERT INTO posts (user_id, content) VALUES (${
        req.body.user_id
      }, ${mysql.escape(req.body.content)})`
    );
    con.end();

    if (data.affectedRows !== 1) {
      return res
        .status(500)
        .send({ error: "An unexpected error occurred. Please try again" });
    }

    res.send({ status: "Your post is posted" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

router.post("/delete", isLoggedIn, async (req, res) => {
  if (!req.body.post_id) {
    return res.status(400).send({ error: "Bad data provided" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [result] = await con.execute(
      `REMOVE FROM posts WHERE id = ${req.body.post_id}`
    );

    if (result.affectedRows !== 1) {
      return res
        .status(500)
        .send({ error: "An unexpected error occurred. Please try again" });
    }

    return res.send({ status: "Post deleted" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Database error. Please try again later" });
  }
});

module.exports = router;
