const express = require('express');
const { register, login, getProfile, refreshToken, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);

module.exports = router;