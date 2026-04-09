const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'bundle', 'other'],
        trim: true
    },
    maxPrice: {
        type: Number,
        min: 0
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    deadline: {
        type: Date
    },
    // Reference to the Vendor who posted this requirement
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'cancelled', 'expired'],
        default: 'active'
    },
    responses: [{
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        priceOffered: Number,
        contactInfo: String,
        respondedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add indexes for efficient querying
requirementSchema.index({ postedBy: 1 });
requirementSchema.index({ status: 1 });
requirementSchema.index({ category: 1 });
requirementSchema.index({ productName: 'text', description: 'text' });

module.exports = mongoose.model('Requirement', requirementSchema);