const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.use());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, server works.");
});

app.all("*", (req, res) => {
  res.send("Error 404 Page Not Found");
});

const port = 8080;
app.listen(port, () => console.log(`Listening on ${port} port`));
