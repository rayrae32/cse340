const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Temporary POST route to test flash messages
router.post('/login', (req, res) => {
  req.flash('error', 'Login failed: Invalid credentials');
  res.redirect('/account/login');
});

module.exports = router;