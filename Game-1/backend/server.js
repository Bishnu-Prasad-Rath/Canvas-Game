const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 🔥 MOBILE PREFLIGHT FIX
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

mongoose.connect("mongodb://127.0.0.1:27017/canvas_game")
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/score", require("./routes/score"));

app.listen(5000, "0.0.0.0", () => {
  console.log("Backend running on port 5000");
});
