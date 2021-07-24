const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth.js");

app.get("/", (req, res) => {
  res.send("Hello, server works.");
});

app.use("/auth", authRoutes);

app.all("*", (req, res) => {
  res.send("Error 404 Page Not Found");
});

const port = 8080;
app.listen(port, () => console.log(`Listening on ${port} port`));
