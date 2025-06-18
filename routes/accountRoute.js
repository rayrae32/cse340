const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const { updateValidation, passwordValidation } = require('../middleware/validation');
const wishlistController = require('../controllers/wishlistController');

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get('/register', utilities.handleErrors(accountController.buildRegister));
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
router.post(
  '/login',
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
);
router.get('/management', utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));
router.get('/update/:id', utilities.handleErrors(accountController.buildUpdate));
router.post('/update', updateValidation, utilities.handleErrors(accountController.updateAccount));
router.post('/update-password', passwordValidation, utilities.handleErrors(accountController.updatePassword));
router.get('/logout', (req, res) => {
  req.flash('notice', 'You have been logged out.');
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    else console.log('Session destroyed');
  });
  res.clearCookie('jwt', { path: '/account', httpOnly: true });
  res.redirect('/account/login');
});

router.get('/wishlist', utilities.checkLogin, utilities.handleErrors(wishlistController.buildWishlist));
router.post('/wishlist/add', utilities.checkLogin, utilities.handleErrors(wishlistController.addToWishlist));
router.post('/wishlist/remove/:inv_id', utilities.checkLogin, utilities.handleErrors(wishlistController.removeFromWishlist));
router.post('/wishlist/clear', utilities.checkLogin, utilities.handleErrors(wishlistController.clearWishlist));

module.exports = router;