const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Session = require("./models/Session");
const User = require("./models/User");



const app = express();


app.use(express.json());
app.use(cors({
  origin: "*"
}));
const PORT=process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.post("/session", auth, async (req, res) => {
  const session = new Session(req.body);
  await session.save();
  res.json({ message: "Saved" });
});


app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

   
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed
    });

    await user.save();

    res.json({ message: "User registered" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

   
    const token = jwt.sign(
      { id: user._id },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log("Backend running"));