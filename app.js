const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});