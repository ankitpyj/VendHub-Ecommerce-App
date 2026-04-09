const User = require("../models/User"); // Ensure this path is correct for your User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    // Destructure all potential fields from the request body
    // ✅ ADDED 'businessType' here
    const { name, email, password, role, farmName, farmLocation, companyName, address, businessType } = req.body;

    try {
        // 1. Check if user with this email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        // 2. Basic validation for required fields based on role
        if (!name || !email || !password || !role) {
            return res.status(400).json({ msg: "Please enter all required fields: name, email, password, and role." });
        }

        if (!['farmer', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ msg: "Invalid role specified. Must be 'farmer', 'vendor', or 'admin'." });
        }

        // Validate role-specific fields
        if (role === 'farmer') {
            if (!farmName || !farmLocation) {
                return res.status(400).json({ msg: "For 'farmer' role, farm name and location are required." });
            }
        } else if (role === 'vendor') {
            if (!companyName || !address || !businessType) { // ✅ ADDED 'businessType' to this validation check
                return res.status(400).json({ msg: "For 'vendor' role, company name, address, and business type are required." });
            }
            // You might want to add more granular checks for address sub-fields here
            // e.g., if (!address.street || !address.city || !address.state || !address.pincode) { ... }
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create the user object including role-specific data
        const newUserFields = {
            name,
            email,
            password: hashedPassword,
            role
        };

        // Conditionally add role-specific fields
        if (role === 'farmer') {
            newUserFields.farmName = farmName;
            newUserFields.farmLocation = farmLocation;
            // Assuming you'll add farmAddress and bankDetails to schema and controller later
            // newUserFields.farmAddress = farmAddress;
            // newUserFields.bankDetails = bankDetails;
        } else if (role === 'vendor') {
            newUserFields.companyName = companyName;
            newUserFields.companyAddress = address; // This maps frontend 'address' to backend 'companyAddress'
            newUserFields.businessType = businessType; // ✅ ADDED 'businessType' assignment
            // Assuming you'll add gstNumber, fssaiLicense, businessHours to schema and controller later
            // newUserFields.gstNumber = gstNumber;
            // newUserFields.fssaiLicense = fssaiLicense;
            // newUserFields.businessHours = businessHours;
        } else if (role === 'admin') {
            // Assuming you'll add adminLevel and permissions to schema and controller later
            // newUserFields.adminLevel = adminLevel;
            // newUserFields.permissions = permissions;
        }


        // 5. Create and save the new user in the database
        user = await User.create(newUserFields);

        // 6. Generate JWT token
        // The JWT payload should include user ID and role for authentication middleware
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Include role in JWT payload
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 7. Respond with token and user details
        // Include relevant user details in the response, especially the role
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        // Add role-specific data to the response if it exists
        if (user.role === 'farmer') {
            userResponse.farmName = user.farmName;
            userResponse.farmLocation = user.farmLocation;
            // userResponse.farmAddress = user.farmAddress;
            // userResponse.bankDetails = user.bankDetails;
        } else if (user.role === 'vendor') {
            userResponse.companyName = user.companyName;
            userResponse.companyAddress = user.companyAddress;
            userResponse.businessType = user.businessType;
            // userResponse.gstNumber = user.gstNumber;
            // userResponse.fssaiLicense = user.fssaiLicense;
            // userResponse.businessHours = user.businessHours;
        } else if (user.role === 'admin') {
            // userResponse.adminLevel = user.adminLevel;
            // userResponse.permissions = user.permissions;
        }

        res.status(201).json({ token, user: userResponse });

    } catch (err) {
        console.error("Registration error:", err); // Log the full error for debugging
        res.status(500).json({ msg: "Server error during registration." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials (email not found)" });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials (password mismatch)" });
        }

        // 3. Generate JWT token
        // Include user ID and role in the JWT payload
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Include role in JWT payload
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 4. Respond with token and user details
        // Include relevant user details in the response, especially the role
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        // Add role-specific data to the response if it exists (optional for login,
        // often full profile data is fetched via a separate endpoint after login)
        if (user.role === 'farmer') {
            userResponse.farmName = user.farmName;
            userResponse.farmLocation = user.farmLocation;
            // userResponse.farmAddress = user.farmAddress;
            // userResponse.bankDetails = user.bankDetails;
        } else if (user.role === 'vendor') {
            userResponse.companyName = user.companyName;
            userResponse.companyAddress = user.companyAddress;
            userResponse.businessType = user.businessType;
            // userResponse.gstNumber = user.gstNumber;
            // userResponse.fssaiLicense = user.fssaiLicense;
            // userResponse.businessHours = user.businessHours;
        } else if (user.role === 'admin') {
            // userResponse.adminLevel = user.adminLevel;
            // userResponse.permissions = user.permissions;
        }

        res.json({ token, user: userResponse });

    } catch (err) {
        console.error("Login error:", err); // Log the full error for debugging
        res.status(500).json({ msg: "Server error during login." });
    }
};
