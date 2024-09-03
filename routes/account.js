const express = require('express');
const { getAccountDetails, createTransaction } = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAccountDetails);
router.post('/transaction', authMiddleware, createTransaction);

module.exports = router;