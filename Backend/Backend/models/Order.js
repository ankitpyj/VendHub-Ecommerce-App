const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.1
    },
    unit: {
        type: String,
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    estimatedDelivery: {
        type: Date
    },
    actualDelivery: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'card', 'bank_transfer'],
        default: 'cash'
    },
    // Communication between vendor and farmer
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add indexes for efficient querying
orderSchema.index({ vendor: 1, status: 1 });
orderSchema.index({ farmer: 1, status: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
