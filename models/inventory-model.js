const db = require('../database');

async function getClassifications() {
  try {
    return await db.query('SELECT * FROM public.classification ORDER BY classification_name');
  } catch (error) {
    console.error('getClassifications error:', error);
    throw error;
  }
}

module.exports = { getClassifications };