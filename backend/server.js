require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();


const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: String,
    password: String,
  })
);


app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  res.json({ message: "Registered successfully" });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid email or password" });

  res.json({ message: "Login successful" });
});

app.listen(5000, () => console.log("Server running on port 5000"));