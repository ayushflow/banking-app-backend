const pool = require('../config/db');

class Transaction {
    static async create({ fromAccountId, toAccountId, transactionType, amount, description }) {
        const result = await pool.query(
            `INSERT INTO transactions (from_account_id, to_account_id, transaction_type, amount, description) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fromAccountId, toAccountId, transactionType, amount, description]
        );
        return result.rows[0];
    }

    static async findByAccountId(accountId) {
        const result = await pool.query(
            `SELECT * FROM transactions WHERE from_account_id = $1 OR to_account_id = $1 
             ORDER BY transaction_date DESC`,
            [accountId]
        );
        return result.rows;
    }
}

module.exports = Transaction;