const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// Protect all routes below this line
router.use(protect);

// Place order - only vendors can place orders
router.post('/place', authorizeRoles('vendor'), orderController.placeOrder);

// Get vendor's orders
router.get('/vendor-orders', authorizeRoles('vendor'), orderController.getVendorOrders);

// Get farmer's orders (orders for farmer's products)
router.get('/farmer-orders', authorizeRoles('farmer'), orderController.getFarmerOrders);

// Get order details - both vendors and farmers can view their orders
router.get('/:orderId', authorizeRoles('vendor', 'farmer'), orderController.getOrderDetails);

// Update order status - farmers can update status, vendors can cancel
router.put('/status/:orderId', authorizeRoles('vendor', 'farmer'), orderController.updateOrderStatus);

module.exports = router;
