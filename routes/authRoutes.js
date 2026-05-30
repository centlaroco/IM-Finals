const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../db/condb');

// Pages

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/signup.html'));
});

router.get('/forgotpass', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/forgotpass.html'));
});

router.get('/logout', (req, res) => {
    res.redirect('/login');
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/home.html'));
});

// Login

router.post('/login', (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT *
        FROM registry
        WHERE username = ?
        AND password = ?
    `;

    connection.query(sql, [username, password], (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if(results.length > 0){
            res.redirect(`/home?username=${results[0].username}`);
        }else{
            res.redirect('/login?error=1');
        }
    });
});

// Signup

router.post('/signup', (req, res) => {

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
        (fullName,email,username,address,contact_no,password)
        VALUES(?,?,?,?,?,?)
    `;

    connection.query(
        sql,
        [fullName,email,username,address,contact_no,password],
        (err,result) => {

            if(err){
                console.log(err);
                return res.send("Database Error");
            }

            res.redirect('/login');
        }
    );
});

// Forgot Password

router.post('/forgotpass', (req, res) => {

    const { email, password } = req.body;

    const sql = `
        UPDATE registry
        SET password = ?
        WHERE email = ?
    `;

    connection.query(sql,[password,email],(err,result)=>{

        if(err){
            console.log(err);
            return res.send("Database Error");
        }

        res.send("Password Updated");
    });
});

module.exports = router;