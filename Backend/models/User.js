const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Added for cleaner data
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Added for cleaner data
        lowercase: true // Store emails in lowercase for consistency
    },
    password: {
        type: String, // This will store the hashed password
        required: true,
    },
    role: {
        type: String,
        enum: ['farmer', 'vendor', 'admin'], // Enforce specific roles
        required: true
    },
    // --- Role-Specific Fields (Optional or Conditionally Required) ---

    // Fields specific to 'farmer' role
    farmName: {
        type: String,
        // This field is required ONLY if the role is 'farmer'
        required: function() { return this.role === 'farmer'; },
        trim: true
    },
    farmLocation: {
        type: String,
        // This field is required ONLY if the role is 'farmer'
        required: function() { return this.role === 'farmer'; },
        trim: true
    },
    // You can add more farmer-specific fields here, e.g.,
    // farmSize: Number,
    // cropsGrown: [String],
    // farmAddress (if you implement it for farmer as well, similar to vendor's companyAddress)
    farmAddress: { // Added for farmer, assuming you'll use it later
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    bankDetails: { // Added for farmer, assuming you'll use it later
        accountNumber: { type: String, trim: true },
        ifscCode: { type: String, trim: true },
        bankName: { type: String, trim: true },
        accountHolderName: { type: String, trim: true }
    },

    // Fields specific to 'vendor' role
    companyName: {
        type: String,
        // This field is required ONLY if the role is 'vendor'
        required: function() { return this.role === 'vendor'; },
        trim: true
    },
    // ✅ CORRECTED: Define companyAddress as an object with nested fields
    companyAddress: {
        street: {
            type: String,
            required: function() { return this.role === 'vendor'; }, // Make street required for vendor
            trim: true
        },
        city: {
            type: String,
            required: function() { return this.role === 'vendor'; }, // Make city required for vendor
            trim: true
        },
        state: {
            type: String,
            required: function() { return this.role === 'vendor'; }, // Make state required for vendor
            trim: true
        },
        pincode: {
            type: String, // Pincode can be a string if it contains non-numeric characters or leading zeros
            required: function() { return this.role === 'vendor'; }, // Make pincode required for vendor
            trim: true
        },
        coordinates: { // Nested object for coordinates
            latitude: { type: Number }, // Optional, as per frontend
            longitude: { type: Number } // Optional, as per frontend
        }
    },
    businessType: {
        type: String,
        required: function() { return this.role === 'vendor'; },
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    fssaiLicense: {
        type: String,
        trim: true
    },
    businessHours: {
        opening: { type: String, trim: true }, // Store as string (e.g., "HH:MM AM/PM")
        closing: { type: String, trim: true },
        daysOpen: [{ type: String, trim: true }] // Array of strings (e.g., ["monday", "tuesday"])
    },

    // Fields specific to 'admin' role
    adminLevel: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        required: function() { return this.role === 'admin'; },
        trim: true
    },
    permissions: [{ // Array of strings for permissions
        type: String,
        trim: true
    }],

}, { timestamps: true }); // Keep timestamps for createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);
