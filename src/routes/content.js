const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const { isLoggedIn } = require("../middleware");
const { mysqlConfig } = require("../config");

router.get("/userinfo", isLoggedIn, (req, res) => {
  res.send("hello", req.userData);
});

router.post("/postcontent", isLoggedIn, async (req, res) => {
  if (!req.body.content) {
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
module.exports = router;
