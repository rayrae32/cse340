const express = require('express');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const app = express();
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const utilities = require('./utilities');

console.log('ENV:', process.env.NODE_ENV, process.env.DATABASE_URL);

/* View Engine */
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');

/* Routes */
app.use(static);
app.get('/', utilities.handleErrors(baseController.buildHome));

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// Error Handler
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error('Error in getNav:', navError);
    nav = '<ul><li><a href="/">Home</a></li></ul>';
  }
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.status(err.status || 500).render('errors/error', {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* Server */
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});