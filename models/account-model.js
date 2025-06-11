const pool = require('../database/');

/* ***************************
 *  Register a new account
 * ************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO public.account (
        account_firstname, account_lastname, account_email, account_password
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result;
  } catch (error) {
    console.error('registerAccount error:', error);
    throw error;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Verify login credentials
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rows[0]; 
  } catch (error) {
    console.error('getAccountByEmail error:', error);
    throw error;
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail };