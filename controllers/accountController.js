const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/login', {
    title: 'Login',
    nav,
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
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
      account_email
    });
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash('error', 'Email or password invalid.');
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
      messages: req.flash()
    });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      req.session.account = accountData;
      req.flash('success', 'Login successful!');
      res.redirect('/'); 
    } else {
      req.flash('error', 'Email or password invalid.');
      res.render('account/login', {
        title: 'Login',
        nav,
        errors: null,
        account_email,
        messages: req.flash()
      });
    }
  } catch (error) {
    req.flash('error', 'Sorry, there was an error logging in.');
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
      messages: req.flash()
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount };