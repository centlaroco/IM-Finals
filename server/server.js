const mysql = require('mysql');
const express = require('express');
const app= express();
const port = 3000;
const path = require('path');
const connection = require('../db/condb');


app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.urlencoded({ extended: true }));

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

//login and signup routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', '/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', '/signup.html'));
});

app.get('/forgotpass', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', '/forgotpass.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'home.html'));
});

//profile route1
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'profile.html'));
});

app.post('/forgotpass', (req, res) => {
    const { email, password } = req.body;

    const sql = `
        SELECT * FROM registry
        WHERE email = ?
    `;

    connection.query(sql, [email], (err, results) => {
        if (err) {
            console.log(err);
            res.send("Database Error");
        }

        if (results.length === 0){
            return res.send("Email not found");
        }

        //update pass
        const updatesql = `
            UPDATE registry
            SET password = ?
            WHERE email = ?
        `;

        connection.query(updatesql, [password, email], (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database error");
            }

            console.log("Password Updated");
            res.send("Password Updated");
        });
    });
});


// Handle login and signup form submissions
app.post('/login', (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT * FROM registry
        WHERE username = ? AND password = ?
    `;

    connection.query(sql, [username, password], (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (results.length > 0) {

            const user = results[0];

            res.redirect(`/home?username=${user.username}`);

        } else {
            res.send("Invalid Credentials");
        }
    });
});


// Handle signup form submission
app.post('/signup', (req, res) => {

    const {
        fullName,
        email,
        username,
        address,
        contact_no,
        password
    } = req.body;

    const sql = `
        INSERT INTO registry
        (fullName, email, username, address, contact_no, password)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [fullName, email, username, address, contact_no, password],
        (err, result) => {

            if (err) {
                console.log(err);
                res.send("Database Error");
            } else {
                console.log("User Registered");
                res.redirect('/login');
            }
        }
    );
});

app.get('/profile', (req, res) => {

    const username = req.query.username;

    const sql = `
        SELECT fullName, email, contact_no
        FROM registry
        WHERE username = ?
    `;

    connection.query(sql, [username], (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (results.length === 0) {
            return res.send("User not found");
        }

        const user = results[0];

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Profile</title>

                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="/styles/style.css">
            </head>

            <body class="bg-light">

                <main class="container py-4" style="max-width:600px;">

                    <div class="card p-4 shadow-sm border-0 rounded-4">

                        <div class="text-center">

                            <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                style="width:90px;height:90px;font-size:32px;">
                                ${user.fullName.charAt(0).toUpperCase()}
                            </div>

                            <h2 class="fw-bold">
                                ${user.fullName}
                            </h2>

                            <p class="text-muted mb-1">
                                ${user.email}
                            </p>

                            <p class="text-muted">
                                ${user.contact_no}
                            </p>

                        </div>

                    </div>

                </main>

                <nav class="mobile-nav fixed-bottom mx-auto mb-3 bg-white border d-flex align-items-center justify-content-around shadow rounded-pill"
                    style="width:92%;max-width:420px;height:68px;">

                    <button class="btn border-0 p-2"
                        onclick="goHome()">

                        <svg xmlns="http://www.w3.org/2000/svg"
                            height="26px"
                            viewBox="0 -960 960 960"
                            width="26px"
                            fill="#444">

                            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Z"/>
                        </svg>

                    </button>

                </nav>

                <script>

                    const username = "${username}";

                    function goHome() {
                        window.location.href = "/home?username=" + username;
                    }

                </script>

            </body>
            </html>
        `);
    });
});

app.get('/profile-data', (req, res) => {

    const username = req.query.username;

    const sql = `
        SELECT fullName, email, contact_no
        FROM registry
        WHERE username = ?
    `;

    connection.query(sql, [username], (err, results) => {

        if (err) {
            console.log(err);
            return res.json({ error: "Database Error" });
        }

        if (results.length === 0) {
            return res.json({ error: "User not found" });
        }

        res.json(results[0]);
    });
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


