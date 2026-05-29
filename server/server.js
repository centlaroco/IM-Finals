const mysql = require('mysql');
const express = require('express');
const app= express();
const port = 3000;
const path = require('path');
const connection = require('../db/condb');


app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(express.json({
    limit: '50mb'
}));

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

app.get('/posts', (req, res) => {

   const sql = `
    SELECT
        posts.*,
        registry.profile_pic
        FROM posts
        LEFT JOIN registry
        ON posts.username = registry.username
        ORDER BY posts.id DESC
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.json({ error: "Database Error" });
        }

        res.json(results);
    });
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


// Handle login form submissions
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
            // CHANGE THIS line to redirect back with a query parameter
            res.redirect('/login?error=1');
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
    res.sendFile(path.join(__dirname, '../pages', 'profile.html'));
});

app.get('/profile-data', (req, res) => {

    const username = req.query.username;

    const sql = `
        SELECT
            fullName,
            email,
            contact_no,
            bio,
            profile_pic,
            cover_pic
        FROM registry
        WHERE username = ?
    `;

    connection.query(sql, [username], (err, results) => {

        if (err) {
            console.log(err);
            return res.json({
                error: "Database Error"
            });
        }

        if (results.length === 0) {
            return res.json({
                error: "User not found"
            });
        }

        res.json(results[0]);
    });
});

app.post('/update-profile', (req, res) => {

    const { username, bio, profile_pic, cover_pic } = req.body;

    const sql = `
        UPDATE registry
        SET bio = ?, profile_pic = ?, cover_pic = ?
        WHERE username = ?
    `;

    connection.query(
        sql,
        [bio, profile_pic, cover_pic, username],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({ error: "Database error" });
            }

            res.json({ success: true });
        }
    );
});

// Handle new post submission
app.post('/add-post', (req, res) => {

    const { username, content, image } = req.body;

    if(!username || (!content && !image)) {
        return res.json({ error: "Username and at least content or image are required" });
    }

    const sql = `
        INSERT INTO posts (username, content, image)
        VALUES (?, ?, ?)
    `;

    connection.query(
        sql,
        [username, content, image],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({ error: "Database error" });
            }

            res.json({ success: true });
        }
    );
});

// Handle password change
app.post('/change-password', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ error: "Missing required fields" });
    }

    const sql = `
        UPDATE registry
        SET password = ?
        WHERE username = ?
    `;

    connection.query(sql, [password, username], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ error: "Database exception error occurs" });
        }

        // Check if a row was actually found and altered
        if (result.affectedRows === 0) {
            return res.json({ error: "User context not found" });
        }

        console.log(`Password updated directly for user: ${username}`);
        return res.json({ success: true });
    });
});


// Handle account deletion
app.post('/delete-account', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ error: "Username and password verification fields are required." });
    }

    // verify credentials first before deletion
    const verifySql = `SELECT * FROM registry WHERE username = ? AND password = ?`;
    
    connection.query(verifySql, [username, password], (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ error: "Database authentication error." });
        }

        if (results.length === 0) {
            return res.json({ error: "Incorrect password verification." });
        }

        // credentials verified, proceed with deletion
        const deleteSql = `DELETE FROM registry WHERE username = ?`;
        
        connection.query(deleteSql, [username], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ error: "Failed to clear registry records." });
            }

            console.log(`Account permanently deleted for user: ${username}`);
            return res.json({ success: true });
        });
    });
});

// Handle post deletion
app.post('/delete-post', (req, res) => {

    const { id, username } = req.body;

    const sql = `
        DELETE FROM posts
        WHERE id = ? AND username = ?
    `;

    connection.query(sql, [id, username], (err, result) => {

        if(err) {
            console.log(err);
            return res.json({ error: "Database error" });
        }

        res.json({ success: true });
    });
});


// Handle likes
app.post('/like-post', (req, res) => {

    const { postId } = req.body;

    const sql = `
        UPDATE posts
        SET likes = likes + 1
        WHERE id = ?
    `;

    connection.query(sql, [postId], (err, result) => {

        if(err) {
            console.log(err);
            return res.json({ error: "Database error" });
        }

        res.json({ success: true });
    });
});

app.get('/user-posts', (req, res) => {
    const username = req.query.username;

    const sql = `
        SELECT 
            posts.*,
            registry.profile_pic
        FROM posts
        LEFT JOIN registry 
        ON posts.username = registry.username
        WHERE posts.username = ?
        ORDER BY posts.id DESC
    `;

    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ error: "Database error" });
        }

        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


