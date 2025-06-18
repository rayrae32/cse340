const wishlistModel = require('../models/wishlist-model');
const utilities = require('../utilities');

async function buildWishlist(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const wishlistItems = await wishlistModel.getWishlistByAccount(account_id);
    let wishlistHTML = wishlistItems.map(item => `
      <div class="wishlist-item">
        <h3>${item.inv_year} ${item.inv_make} ${item.inv_model}</h3>
        <p>Price: $${item.inv_price.toLocaleString()}</p>
        <form action="/account/wishlist/remove/${item.inv_id}" method="post">
          <button type="submit">Remove</button>
        </form>
      </div>
    `).join('');
    if (!wishlistHTML) wishlistHTML = '<p>Your wishlist is empty.</p>';
    res.render('wishlist/index', {
      title: 'My Wishlist',
      wishlist: wishlistHTML,
      wishlistItems,
      nav: await utilities.getNav()
    });
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    console.log('addToWishlist called with req.body:', req.body);
    console.log('res.locals.accountData:', res.locals.accountData);
    const account_id = res.locals.accountData ? res.locals.accountData.account_id : null;
    console.log('Extracted account_id:', account_id);
    const inv_id = req.body.inv_id;
    console.log('Extracted inv_id:', inv_id);
    if (!inv_id || !account_id) {
      throw new Error('Invalid or missing inv_id or account_id');
    }
    const result = await wishlistModel.addToWishlist(account_id, inv_id);
    console.log('Wishlist add result:', result);
    req.flash('success', 'Vehicle added to wishlist!');
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (err) {
    console.error('addToWishlist error:', err.stack);
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = req.params.inv_id;
    await wishlistModel.removeFromWishlist(account_id, inv_id);
    req.flash('notice', 'Vehicle removed from wishlist!');
    res.redirect('/account/wishlist');
  } catch (err) {
    next(err);
  }
}

async function clearWishlist(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    await wishlistModel.clearWishlistByAccount(account_id);
    req.flash('notice', 'Wishlist cleared!');
    res.redirect('/account/wishlist');
  } catch (err) {
    next(err);
  }
}

module.exports = { buildWishlist, addToWishlist, removeFromWishlist, clearWishlist };