// D:\Hackathon\TutedudeHackathon\Backend\Backend\index.js

const express = require('express');
const mongoose = require('mongoose'); // Changed from connectDB
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
// IMPORTANT: Adjust the path if your .env file is not in the project root
// For example, if index.js is in Backend/Backend/ and .env is in Backend/, use:
dotenv.config();

const authRoutes = require('./routes/authroutes'); // Corrected path
const productRoutes = require('./routes/productRoutes'); // Corrected path
const requirementRoutes = require('./routes/requirementRoutes'); // Add requirement routes
const orderRoutes = require('./routes/orderRoutes'); // Add order routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Replaced connectDB() with direct mongoose.connect()
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Mount product routes under /api/products
app.use('/api/requirements', requirementRoutes); // Mount requirement routes under /api/requirements
app.use('/api/orders', orderRoutes); // Mount order routes under /api/orders

// Basic root route
app.get('/', (req, res) => res.send('VendHub Backend API is running!'));

// Start the server
const PORT = process.env.PORT || 5000; // Use process.env.PORT or default to 5000
app.listen(PORT, () =>
    console.log(`App is listening at port ${PORT}`)
);
