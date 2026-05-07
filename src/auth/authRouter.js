const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH,
} = require("./config");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!ADMIN_PASSWORD_HASH) {
      return res.status(500).json({ error: "Server not configured correctly" });
    }

    const passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
