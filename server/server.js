const mysql = require('mysql');
const express = require('express');
const app= express();
const port = 3000;
const path = require('path');
const connection = require('../db/condb');


app.use(express.static(path.join(__dirname, '../assets')));

app.use(express.urlencoded({ extended: true }));


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
            res.send("Database Error");
        }
        else{
            if (results.length > 0) {
                console.log("Login Successful");
                res.send("Login Successful");
            } 
            else {
                alert("Invalid Credentials");
                res.send("Invalid Credentials");
            }
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
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


