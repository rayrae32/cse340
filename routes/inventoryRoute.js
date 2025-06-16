const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const inventoryController = require('../controllers/inventoryController');
const { adminAuth } = require('../middleware/auth');
const accCont = require('../controllers/accountController');

// Inventory routes
router.get('/', utilities.handleErrors(inventoryController.buildManagement));
router.get('/add-classification', adminAuth, inventoryController.buildAddClassification);
router.post('/add-classification', adminAuth, inventoryController.addClassification);
router.get('/add-inventory', adminAuth, inventoryController.buildAddInventory);
router.post('/add-inventory', adminAuth, inventoryController.addInventory);
router.get('/delete/:inv_id', adminAuth, inventoryController.buildDeleteConfirm);
router.post('/delete', adminAuth, inventoryController.executeDelete);
router.get('/getInventory/:classification_id', utilities.handleErrors(inventoryController.getInventoryJSON));
router.get('/type/:classification_id', utilities.handleErrors(inventoryController.buildByClassificationId));
router.get('/edit/:inv_id', adminAuth, utilities.handleErrors(inventoryController.editInventoryView));

// Account routes
router.get('/account/', utilities.handleErrors(accCont.buildManagement));
router.get('/management', utilities.handleErrors(accCont.buildManagement));

module.exports = router;