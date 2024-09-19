const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(cookieParser());

let users = []; // In-memory user store for demo purposes

// Step 3: Create a registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password }); // Store user (In a real app, hash the password)
    res.status(201).send('User registered');
});

// Step 4: Create a login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }); // Set the cookie
        return res.status(200).send('Logged in');
    }
    
    res.status(401).send('Invalid credentials');
});

// Step 5: Create a middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Step 6: Create a protected route
app.get('/protected', authenticateJWT, (req, res) => {
    res.status(200).send(`Hello, ${req.user.username}`);
});

// Step 7: Create a logout route
app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the cookie
    res.status(200).send('Logged out');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
