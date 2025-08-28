const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).send('Username already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ username, password: hashedPassword });
    await user.save();

    // Store user session
    req.session.userId = user._id;
    res.status(201).send('Signup successful');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password');

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid username or password');

    // Store user session
    req.session.userId = user._id;
    res.send('Login successful');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Save score route
router.post("/save-score", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send("Not logged in");
    }

    const { wpm } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update highest WPM only if it's better
    if (wpm > user.highestWPM) {
      user.highestWPM = wpm;
      await user.save();
    }

    res.send("Score saved successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving score");
  }
});

// Leaderboard route
router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find({ highestWPM: { $gt: 0 } })
      .sort({ highestWPM: -1 })   // Sort descending
      .limit(10)                  // Top 10
      .select("username highestWPM -_id"); // Only return these fields

    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leaderboard");
  }
});

// Get current logged-in user
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }

  const user = await User.findById(req.session.userId).select("username highestWPM");
  res.json({
    loggedIn: true,
    username: user.username,
    highestWPM: user.highestWPM
  });
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("connect.sid"); // remove session cookie
    res.send("Logged out successfully");
  });
});


// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out');
  });
});

module.exports = router;
