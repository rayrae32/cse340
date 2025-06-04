const session = require("express-session")
const pool = require('./database/')
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const app = express();
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const invController = require('./controllers/inventoryController');
const errorController = require('./controllers/errorController');
const accountRoute = require('./routes/accountRoute');
const utilities = require('./utilities');



/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* View Engine */
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');

/* Routes */
app.use(static);
app.use('/account', accountRoute);
app.get('/', utilities.handleErrors(baseController.buildHome));
app.get('/inv/type/:classification_id', utilities.handleErrors(invController.buildByClassificationId));
app.get('/inv/detail/:inv_id', utilities.handleErrors(invController.buildVehicleDetail));
app.get('/error/test', utilities.handleErrors(errorController.triggerError));

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
  const message = err.status === 404 ? err.message : 'An error has occurred. Please try a different route.';
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
  console.log(`App listening on ${host}:${port}`);
});