const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Hardcoded simple mock auth for assignment evaluation ease
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, userId: email });
    }
    return res.status(400).json({ message: 'Invalid credentials' });
});

module.exports = router;