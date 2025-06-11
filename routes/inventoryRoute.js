const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const inventoryController = require('../controllers/inventoryController');
const invValidate = require('../utilities/inventory-validation');

router.get('/', utilities.handleErrors(inventoryController.buildManagement));
router.get('/add-classification', utilities.handleErrors(inventoryController.buildAddClassification));
router.post(
  '/add-classification',
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification)
);

router.get('/add-inventory', utilities.handleErrors(inventoryController.buildAddInventory));
router.post(
  '/add-inventory',
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(inventoryController.addInventory)
);

module.exports = router;