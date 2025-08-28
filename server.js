require('dotenv').config(); // Load .env variables
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');

const app = express();

// ===== MIDDLEWARE =====
// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// Serve static frontend files from /public
app.use(express.static('public'));

// ===== ROUTES =====
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ===== DATABASE CONNECTION =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===== START SERVER =====
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 3000}`);
});
