const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const accCont = {};

/* ****************************************
 * Deliver login view
 * *************************************** */
accCont.buildLogin = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render('account/login', {
    title: 'Login',
    nav,
  });
};

/* ****************************************
 * Deliver registration view
 * *************************************** */
accCont.buildRegister = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null,
  });
};

/* ****************************************
 * Process Registration
 * *************************************** */
accCont.registerAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash('notice', 'Sorry, there was an error processing the registration.');
    res.status(500).render('account/register', {
      title: 'Registration',
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult && regResult.rows && regResult.rows.length > 0) {
    req.flash(
      'success',
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render('account/login', {
      title: 'Login',
      nav,
    });
  } else {
    req.flash('error', 'Sorry, the registration failed.');
    res.status(501).render('account/register', {
      title: 'Register',
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 * Process login request
 * ************************************ */
accCont.loginAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash('error', 'Please check your credentials and try again.');
    res.status(400).render('account/login', {
      title: 'Login',
      nav,
      messages: req.flash(),
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password; // Remove password from payload
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === 'development') {
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      res.clearCookie('account_email');
      return res.redirect('/account/management');
    } else {
      req.flash('error', 'Please check your credentials and try again.');
      res.status(400).render('account/login', {
        title: 'Login',
        nav,
        messages: req.flash(),
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
};

/* ****************************************
 * Build account management view
 * ************************************ */
accCont.buildManagement = async (req, res, next) => {
  try {
    if (!res.locals.loggedin) {
      throw new Error('Please log in to view your account.');
    }
    const nav = await utilities.getNav();
    res.render('account/management', { 
      title: "Account Management",
      nav,
      user: res.locals.accountData 
    });
  } catch (err) {
    console.error('buildManagement error:', err.stack);
    req.flash('error', err.message);
    res.redirect('/account/login');
  }
};

accCont.buildUpdate = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    res.render('account/update', {
      title: 'Update Account',
      nav,
      user: res.locals.accountData
    });
  } catch (err) {
    next(err);
  }
};

accCont.updateAccount = async (req, res) => {
  const { accountId, firstName, lastName, email } = req.body;
  try {
    const errors = [];
    if (!firstName || !lastName || !email) errors.push('All fields are required.');
    const existing = await accountModel.getAccountByEmail(email);
    if (existing.length && existing[0].account_id != accountId) errors.push('Email already exists.');
    if (errors.length) {
      res.render('account/update', { user: req.body, errors, message: null });
      return;
    }
    await accountModel.updateAccount(accountId, { firstName, lastName, email });
    const updated = await accountModel.getAccountById(accountId);
    req.flash('success', 'Account updated successfully.');
    res.render('account/management', { user: updated[0], message: req.flash('success') });
  } catch (err) {
    req.flash('error', 'Error updating account.');
    res.render('account/management', { user: null, message: req.flash('error') });
  }
};

accCont.updatePassword = async (req, res) => {
  const { accountId, password } = req.body;
  try {
    const errors = [];
    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
      errors.push('Password must be at least 8 chars with uppercase, lowercase, and a number.');
    }
    if (errors.length) {
      res.render('account/update', { user: req.body, errors, message: null });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await accountModel.updatePassword(accountId, hash);
    const updated = await accountModel.getAccountById(accountId);
    req.flash('success', 'Password updated successfully.');
    res.render('account/management', { user: updated[0], message: req.flash('success') });
  } catch (err) {
    req.flash('error', 'Error updating password.');
    res.render('account/management', { user: null, message: req.flash('error') });
  }
};

module.exports = accCont; 