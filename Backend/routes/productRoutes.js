const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// Protect all routes below this line
router.use(protect);

// Get all products (for vendors to browse) - accessible by vendors and farmers
router.get('/browse', authorizeRoles('vendor', 'farmer'), productController.getAllProducts);

// Add product route - only farmers can add products
router.post('/add', authorizeRoles('farmer'), productController.addProduct);

// Get farmer's products - only farmers can view their products
router.get('/my-products', authorizeRoles('farmer'), productController.getMyProducts);

// Future routes:
// router.put('/update/:id', authorizeRoles('farmer'), productController.updateProduct);
// router.delete('/delete/:id', authorizeRoles('farmer'), productController.deleteProduct);

module.exports = router;
