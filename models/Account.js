const pool = require('../config/db');

class Account {
    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM accounts WHERE user_id = $1',
            [userId]
        );
        return result.rows[0];
    }

    static async updateBalance(accountId, amount) {
        await pool.query(
            'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
            [amount, accountId]
        );
    }
}

module.exports = Account;