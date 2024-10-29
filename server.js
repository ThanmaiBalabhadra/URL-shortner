const express = require('express');
const os = require('os');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// Use the environment variable PUBLIC_URL if set, otherwise default to localhost
const appaddress = process.env.PUBLIC_URL || `http://localhost:${port}/`;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Express settings
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });
  res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  await shortUrl.save();

  res.redirect(shortUrl.full);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at ${appaddress}`);
});
