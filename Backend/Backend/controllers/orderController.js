const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Place a new order (for vendors)
exports.placeOrder = async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') {
        return res.status(403).json({ msg: 'Access denied. Only vendors can place orders.' });
    }

    const { productId, quantity, notes, urgency, deliveryAddress } = req.body;
    const vendorId = req.user.id;

    // Basic validation
    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ msg: 'Please provide valid product ID and quantity.' });
    }

    try {
        // Find the product
        const product = await Product.findById(productId).populate('owner', 'name farmName email phone');
        
        if (!product) {
            return res.status(404).json({ msg: 'Product not found.' });
        }

        if (!product.isActive) {
            return res.status(400).json({ msg: 'Product is not available for sale.' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ msg: 'Requested quantity exceeds available stock.' });
        }

        // Calculate total amount
        const totalAmount = quantity * product.price;

        // Create new order
        const newOrder = new Order({
            product: productId,
            vendor: vendorId,
            farmer: product.owner._id,
            quantity: parseFloat(quantity),
            unit: product.unit,
            pricePerUnit: product.price,
            totalAmount,
            urgency: urgency || 'medium',
            notes: notes ? notes.trim() : '',
            deliveryAddress: deliveryAddress || null
        });

        await newOrder.save();

        // Populate the order with product and user details
        await newOrder.populate([
            { path: 'product', select: 'name imageUrl category' },
            { path: 'vendor', select: 'name companyName email phone' },
            { path: 'farmer', select: 'name farmName email phone' }
        ]);

        res.status(201).json({ 
            msg: 'Order placed successfully!', 
            order: newOrder 
        });

    } catch (err) {
        console.error('Error placing order:', err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ msg: `Validation Error: ${errors.join(', ')}` });
        }
        res.status(500).json({ msg: 'Server error while placing order.' });
    }
};

// Get vendor's orders
exports.getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = { vendor: vendorId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('product', 'name imageUrl category')
            .populate('farmer', 'name farmName farmLocation email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            msg: 'Vendor orders fetched successfully',
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalOrders: total
        });
    } catch (err) {
        console.error('Error fetching vendor orders:', err);
        res.status(500).json({ msg: 'Server error while fetching orders.' });
    }
};

// Get farmer's orders (orders for farmer's products)
exports.getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = { farmer: farmerId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('product', 'name imageUrl category')
            .populate('vendor', 'name companyName email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            msg: 'Farmer orders fetched successfully',
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalOrders: total
        });
    } catch (err) {
        console.error('Error fetching farmer orders:', err);
        res.status(500).json({ msg: 'Server error while fetching orders.' });
    }
};

// Update order status (farmers can update status of orders for their products)
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status.' });
    }

    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found.' });
        }

        // Check if user is authorized to update this order
        const isFarmer = req.user.role === 'farmer' && order.farmer.toString() === userId;
        const isVendor = req.user.role === 'vendor' && order.vendor.toString() === userId;
        
        if (!isFarmer && !isVendor) {
            return res.status(403).json({ msg: 'Unauthorized to update this order.' });
        }

        // Vendors can only cancel pending orders
        if (isVendor && status !== 'cancelled') {
            return res.status(403).json({ msg: 'Vendors can only cancel pending orders.' });
        }

        order.status = status;
        
        // Set delivery date if status is delivered
        if (status === 'delivered') {
            order.actualDelivery = new Date();
        }

        await order.save();

        await order.populate([
            { path: 'product', select: 'name imageUrl category' },
            { path: 'vendor', select: 'name companyName email phone' },
            { path: 'farmer', select: 'name farmName email phone' }
        ]);

        res.status(200).json({ 
            msg: 'Order status updated successfully!', 
            order 
        });

    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ msg: 'Server error while updating order.' });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        const order = await Order.findById(orderId)
            .populate('product')
            .populate('vendor', 'name companyName email phone companyAddress')
            .populate('farmer', 'name farmName farmLocation email phone farmAddress');
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found.' });
        }

        // Check if user is authorized to view this order
        const isFarmer = req.user.role === 'farmer' && order.farmer._id.toString() === userId;
        const isVendor = req.user.role === 'vendor' && order.vendor._id.toString() === userId;
        
        if (!isFarmer && !isVendor) {
            return res.status(403).json({ msg: 'Unauthorized to view this order.' });
        }

        res.status(200).json({
            msg: 'Order details fetched successfully',
            order
        });
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ msg: 'Server error while fetching order details.' });
    }
};
