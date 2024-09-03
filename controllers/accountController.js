const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

exports.getAccountDetails = async (req, res) => {
    try {
        const account = await Account.findByUserId(req.user.userId);
        const transactions = await Transaction.findByAccountId(account.id);

        account.transactions = transactions;
        res.status(200).json({ account });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createTransaction = async (req, res) => {
    const { fromAccountId, toAccountId, amount, transactionType, description } = req.body;

    try {
        // Begin transaction block
        await pool.query('BEGIN');

        if (fromAccountId) {
            await Account.updateBalance(fromAccountId, -amount);
        }

        if (toAccountId) {
            await Account.updateBalance(toAccountId, amount);
        }

        const transaction = await Transaction.create({ fromAccountId, toAccountId, transactionType, amount, description });

        // Commit transaction block
        await pool.query('COMMIT');

        res.status(201).json({ message: 'Transaction successful', transaction });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Transaction failed', error: error.message });
    }
};