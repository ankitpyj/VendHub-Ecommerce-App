const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        text: true // For text search capabilities
    },
    stock: {
        type: Number,
        required: true,
        min: 0 // Stock cannot be negative
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'bundle', 'other'], // Common units
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Price cannot be negative
    },
    // Reference to the User (Farmer) who owns this product
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: 'Uncategorized'
    },
    imageUrl: {
        type: String,
        default: null // URL to product image
    },
    isActive: {
        type: Boolean,
        default: true // Whether the product is currently listed for sale
    },
    // Auto-calculated fields (can be updated by triggers or backend logic)
    totalSold: {
        type: Number,
        default: 0
    },
    lastUpdatedStock: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Add index for owner and name for efficient querying
productSchema.index({ owner: 1, name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // For full-text search

module.exports = mongoose.model('Product', productSchema);
