const pool = require('../config/db');

class User {
    static async create({ name, email, password, phone_number }) {
        const result = await pool.query(
            'INSERT INTO users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, phone_number]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findById(userId) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    }

    static async updateRefreshToken(userId, refreshToken) {
        await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);
    }

    static async findByRefreshToken(refreshToken) {
        const result = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
        return result.rows[0];
    }

    static async clearRefreshToken(userId) {
        await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
    }
}

module.exports = User;