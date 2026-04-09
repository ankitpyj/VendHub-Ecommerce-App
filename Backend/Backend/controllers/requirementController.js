const Requirement = require('../models/Requirement');
const User = require('../models/User');

// Post a new requirement (for vendors)
exports.postRequirement = async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') {
        return res.status(403).json({ msg: 'Access denied. Only vendors can post requirements.' });
    }

    const { productName, quantity, unit, maxPrice, description, category, urgency, deadline } = req.body;
    const vendorId = req.user.id;

    // Basic validation
    if (!productName || !quantity || !unit) {
        return res.status(400).json({ msg: 'Please provide product name, quantity, and unit.' });
    }

    try {
        const newRequirement = new Requirement({
            productName: productName.trim(),
            quantity: quantity.trim(),
            unit,
            maxPrice: maxPrice || null,
            description: description ? description.trim() : '',
            category: category ? category.trim() : 'General',
            urgency: urgency || 'medium',
            deadline: deadline ? new Date(deadline) : null,
            postedBy: vendorId
        });

        await newRequirement.save();

        res.status(201).json({ 
            msg: 'Requirement posted successfully!', 
            requirement: newRequirement 
        });

    } catch (err) {
        console.error('Error posting requirement:', err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ msg: `Validation Error: ${errors.join(', ')}` });
        }
        res.status(500).json({ msg: 'Server error while posting requirement.' });
    }
};

// Get all requirements (for farmers to see)
exports.getAllRequirements = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20, urgency } = req.query;
        const query = { status: 'active' };

        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = { $regex: category, $options: 'i' };
        }

        // Add urgency filter if provided
        if (urgency && urgency !== 'all') {
            query.urgency = urgency;
        }

        // Add search filter if provided
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const requirements = await Requirement.find(query)
            .populate('postedBy', 'name companyName companyAddress email phone')
            .sort({ urgency: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Requirement.countDocuments(query);

        res.status(200).json({
            msg: 'Requirements fetched successfully',
            requirements,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalRequirements: total
        });
    } catch (err) {
        console.error('Error fetching requirements:', err);
        res.status(500).json({ msg: 'Server error while fetching requirements.' });
    }
};

// Get vendor's own requirements
exports.getMyRequirements = async (req, res) => {
    try {
        const vendorId = req.user.id;
        
        const requirements = await Requirement.find({ postedBy: vendorId })
            .sort({ createdAt: -1 })
            .populate('responses.farmer', 'name farmName email phone');

        res.status(200).json({
            msg: 'Vendor requirements fetched successfully',
            requirements
        });
    } catch (err) {
        console.error('Error fetching vendor requirements:', err);
        res.status(500).json({ msg: 'Server error while fetching requirements.' });
    }
};

// Respond to a requirement (for farmers)
exports.respondToRequirement = async (req, res) => {
    if (!req.user || req.user.role !== 'farmer') {
        return res.status(403).json({ msg: 'Access denied. Only farmers can respond to requirements.' });
    }

    const { requirementId } = req.params;
    const { message, priceOffered, contactInfo } = req.body;
    const farmerId = req.user.id;

    if (!message) {
        return res.status(400).json({ msg: 'Please provide a response message.' });
    }

    try {
        const requirement = await Requirement.findById(requirementId);
        
        if (!requirement) {
            return res.status(404).json({ msg: 'Requirement not found.' });
        }

        if (requirement.status !== 'active') {
            return res.status(400).json({ msg: 'This requirement is no longer active.' });
        }

        // Check if farmer already responded
        const existingResponse = requirement.responses.find(
            response => response.farmer.toString() === farmerId.toString()
        );

        if (existingResponse) {
            return res.status(400).json({ msg: 'You have already responded to this requirement.' });
        }

        // Add new response
        requirement.responses.push({
            farmer: farmerId,
            message: message.trim(),
            priceOffered: priceOffered || null,
            contactInfo: contactInfo ? contactInfo.trim() : ''
        });

        await requirement.save();

        res.status(200).json({ 
            msg: 'Response submitted successfully!', 
            requirement 
        });

    } catch (err) {
        console.error('Error responding to requirement:', err);
        res.status(500).json({ msg: 'Server error while submitting response.' });
    }
};

// Update requirement status
exports.updateRequirementStatus = async (req, res) => {
    const { requirementId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;

    if (!['active', 'fulfilled', 'cancelled', 'expired'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status.' });
    }

    try {
        const requirement = await Requirement.findOne({ 
            _id: requirementId, 
            postedBy: vendorId 
        });

        if (!requirement) {
            return res.status(404).json({ msg: 'Requirement not found or unauthorized.' });
        }

        requirement.status = status;
        await requirement.save();

        res.status(200).json({ 
            msg: 'Requirement status updated successfully!', 
            requirement 
        });

    } catch (err) {
        console.error('Error updating requirement status:', err);
        res.status(500).json({ msg: 'Server error while updating requirement.' });
    }
};