const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/canvas_game");

app.use("/api/auth", require("./routes/auth"));
app.use("/api/score", require("./routes/score"));
app.use("/api/game", require("./routes/game"));


app.listen(5000, "0.0.0.0", () => {
  console.log("Backend running on port 5000");
});

