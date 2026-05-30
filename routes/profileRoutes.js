const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../db/condb');

router.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/profile.html'));
});

// Get profile

router.get('/profile-data', (req, res) => {

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

    connection.query(sql,[username],(err,results)=>{

        if(err){
            console.log(err);
            return res.json({error:"Database Error"});
        }

        res.json(results[0]);
    });
});

// Update profile

router.post('/update-profile', (req,res)=>{

    const {
        username,
        bio,
        profile_pic,
        cover_pic
    } = req.body;

    const sql = `
        UPDATE registry
        SET bio=?,
            profile_pic=?,
            cover_pic=?
        WHERE username=?
    `;

    connection.query(
        sql,
        [bio,profile_pic,cover_pic,username],
        (err,result)=>{

            if(err){
                console.log(err);
                return res.json({error:"Database Error"});
            }

            res.json({success:true});
        }
    );
});

// Change password

router.post('/change-password',(req,res)=>{

    const { username,password } = req.body;

    const sql = `
        UPDATE registry
        SET password=?
        WHERE username=?
    `;

    connection.query(sql,[password,username],(err,result)=>{

        if(err){
            console.log(err);
            return res.json({error:"Database Error"});
        }

        res.json({success:true});
    });
});

// Delete account

router.post('/delete-account',(req,res)=>{

    const { username,password } = req.body;

    const verifySql = `
        SELECT *
        FROM registry
        WHERE username=?
        AND password=?
    `;

    connection.query(
        verifySql,
        [username,password],
        (err,results)=>{

            if(err){
                console.log(err);
                return res.json({error:"Database Error"});
            }

            if(results.length===0){
                return res.json({error:"Incorrect password"});
            }

            connection.query(
                'DELETE FROM registry WHERE username=?',
                [username],
                (err,result)=>{

                    if(err){
                        console.log(err);
                        return res.json({error:"Database Error"});
                    }

                    res.json({success:true});
                }
            );
        }
    );
});

module.exports = router;