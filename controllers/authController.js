const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAccessToken = (userId) => {
    const expiresIn = '15m';  // Set access token validity
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
    
    // Calculate expiration timestamp in seconds since the Epoch
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes from now
    
    return { token, expiresAt };
};

const generateRefreshToken = () => {
    const expiresIn = '7d';  // Set refresh token validity
    const token = jwt.sign({}, process.env.JWT_REFRESH_SECRET, { expiresIn });
    
    // Calculate expiration timestamp in seconds since the Epoch
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
    
    return { token, expiresAt };
};

exports.register = async (req, res) => {
    const { name, email, password, phone_number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ name, email, password: hashedPassword, phone_number });

        const { token: accessToken, expiresAt: accessTokenExpiresAt } = generateAccessToken(user.id);
        const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = generateRefreshToken();

        await User.updateRefreshToken(user.id, refreshToken);

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { token: accessToken, expiresAt: accessTokenExpiresAt } = generateAccessToken(user.id);
        const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = generateRefreshToken();

        await User.updateRefreshToken(user.id, refreshToken);

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json({ profile: user });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ message: 'Refresh token is required' });
    }

    try {
        const user = await User.findByRefreshToken(refreshToken);
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const { token: accessToken, expiresAt: accessTokenExpiresAt } = generateAccessToken(user.id);
            res.status(200).json({
                accessToken,
                accessTokenExpiresAt
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        await User.clearRefreshToken(req.user.userId);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
