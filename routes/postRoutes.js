const express = require('express');
const router = express.Router();
const connection = require('../db/condb');

// All posts

router.get('/posts',(req,res)=>{

    const sql = `
        SELECT
            posts.*,
            registry.profile_pic
        FROM posts
        LEFT JOIN registry
        ON posts.username = registry.username
        ORDER BY posts.id DESC
    `;

    connection.query(sql,(err,results)=>{

        if(err){
            console.log(err);
            return res.json({error:"Database Error"});
        }

        res.json(results);
    });
});

// Add post

router.post('/add-post',(req,res)=>{

    const { username,content,image } = req.body;

    const sql = `
        INSERT INTO posts
        (username,content,image)
        VALUES(?,?,?)
    `;

    connection.query(
        sql,
        [username,content,image],
        (err,result)=>{

            if(err){
                console.log(err);
                return res.json({error:"Database Error"});
            }

            res.json({success:true});
        }
    );
});

// Delete post

router.post('/delete-post',(req,res)=>{

    const { id,username } = req.body;

    connection.query(
        'DELETE FROM posts WHERE id=? AND username=?',
        [id,username],
        (err,result)=>{

            if(err){
                console.log(err);
                return res.json({error:"Database Error"});
            }

            res.json({success:true});
        }
    );
});

// Like post

router.post('/like-post',(req,res)=>{

    const { postId } = req.body;

    connection.query(
        'UPDATE posts SET likes = likes + 1 WHERE id=?',
        [postId],
        (err,result)=>{

            if(err){
                console.log(err);
                return res.json({error:"Database Error"});
            }

            res.json({success:true});
        }
    );
});

// User posts

router.get('/user-posts',(req,res)=>{

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

    connection.query(sql,[username],(err,results)=>{

        if(err){
            console.log(err);
            return res.json({error:"Database Error"});
        }

        res.json(results);
    });
});

module.exports = router;