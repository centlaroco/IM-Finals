const express = require('express');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'assets')));

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(express.json({
    limit: '50mb'
}));

// Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', postRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});