// authroutes.js
const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authcontroller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // ✅ Destructured

router.post('/register', register);
router.post('/login', login);

// ✅ Protected route
router.get('/me', protect, (req, res) => {
  res.send('Protected route accessed by ' + req.user.name);
});

module.exports = router;
