const utilities = require('../utilities');
const invModel = require('../models/inventory-model');

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();
    const className = data.rows[0]?.classification_id
      ? (await invModel.getClassifications()).rows.find(
          row => row.classification_id == classification_id
        )?.classification_name || 'Unknown'
      : 'No vehicles';
    res.render('inventory/classification', {
      title: `${className} Vehicles`,
      nav,
      vehicles: data.rows,
      classification_id
    });
  } catch (error) {
    next({ status: 500, message: 'Error rendering classification view: ' + error.message });
  }
};

invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav();
    if (data.rows.length === 0) {
      return next({ status: 404, message: 'Vehicle not found.' });
    }
    const vehicle = data.rows[0];
    const vehicleHTML = await utilities.buildVehicleHTML(vehicle);
    res.render('inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
      vehicle
    });
  } catch (error) {
    next({ status: 500, message: 'Error rendering vehicle detail: ' + error.message });
  }
};

// Add the management and classification/inventory functions
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    messages: req.flash()
  });
}

async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: null,
    messages: req.flash()
  });
}

async function addClassification(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash('success', 'Classification added successfully!');
      res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash()
      });
    }
  } catch (error) {
    req.flash('error', 'Error adding classification. Try again.');
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: null,
      messages: req.flash()
    });
  }
}

async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: null,
    messages: req.flash()
  });
}

async function addInventory(req, res, next) {
  let nav = await utilities.getNav();
  let {
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
  } = req.body;
  try {
    const result = await invModel.addInventory(
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
    );
    if (result) {
      req.flash('success', 'Inventory added successfully!');
      res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash()
      });
    }
  } catch (error) {
    req.flash('error', 'Error adding inventory. Try again.');
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList: await utilities.buildClassificationList(),
      errors: null,
      messages: req.flash(),
      ...req.body // Sticky fields
    });
  }
}

module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory
};