const pool = require('../database'); // Match server.js import

async function getInventoryByClassificationId(classification_id) {
  try {
    return await pool.query(
      'SELECT * FROM public.inventory WHERE classification_id = $1',
      [classification_id]
    );
  } catch (error) {
    console.error('getInventoryByClassificationId error:', error);
    throw error;
  }
}

async function getVehicleById(inv_id) {
  try {
    return await pool.query(
      'SELECT * FROM public.inventory WHERE inv_id = $1',
      [inv_id]
    );
  } catch (error) {
    console.error('getVehicleById error:', error);
    throw error;
  }
}

async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *';
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error('addClassification error:', error);
    throw error;
  }
}

async function getClassifications() {
  try {
    const sql = 'SELECT * FROM public.classification ORDER BY classification_name';
    const result = await pool.query(sql);
    return result;
  } catch (error) {
    console.error('getClassifications error:', error);
    throw error;
  }
}

async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        classification_id, inv_make, inv_model, inv_description, inv_image,
        inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;
    const result = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('addInventory error:', error);
    throw error;
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory };