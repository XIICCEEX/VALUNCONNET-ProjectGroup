const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Config Multer สำหรับ Profile ---
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/img/');
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Config Multer สำหรับ Post Images ---
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/img'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const postUpload = multer({ storage: storage2 });

// --- Database Connection ---
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myassign12"   
});

con.connect(err => {
    if (err) throw err;
    else console.log("MySQL connected");
});

let userTable = "userInfo";
let postTable = "posts";

const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, result, fields) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// --- ROUTES ---

// Register
app.post('/regisDB', async (req, res) => {
    let now_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { firstname, lastname, username, email, password, confirm_password, newsletter } = req.body;

    if (password !== confirm_password) {
        return res.redirect('register.html?error=1');
    }

    try {
        await queryDB(`CREATE TABLE IF NOT EXISTS ${userTable} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reg_date TIMESTAMP,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(100),
            password VARCHAR(100),
            img VARCHAR(100),
            firstname VARCHAR(50),
            lastname VARCHAR(50),
            newsletter TINYINT(1) DEFAULT 0
        )`);

        await queryDB(`CREATE TABLE IF NOT EXISTS ${postTable} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user VARCHAR(255),
            title VARCHAR(255),
            message TEXT,
            img TEXT,
            post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            event_date DATE
        )`);

        let newsletterFlag = newsletter ? 1 : 0;
        await queryDB(`INSERT INTO ${userTable} (firstname, lastname, username, email, password, newsletter, reg_date, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [firstname, lastname, username, email, password, newsletterFlag, now_date, "avatar.png"]);

        return res.redirect('login.html');
    } catch (err) {
        console.error("Error register:", err);
        return res.redirect('register.html?error=1');
    }
});

// Update Profile Pic
app.post('/profilepic', upload.single('avatar'), async (req, res) => {
    const username = req.cookies.username;
    if (!username || !req.file) return res.redirect('profile.html');
    
    await queryDB(`UPDATE ${userTable} SET img = ? WHERE username = ?`, [req.file.filename, username]);
    res.cookie('img', req.file.filename);
    return res.redirect('profile.html');
});

// Login
app.post('/checkLogin', async (req, res) => {
    const { username, password } = req.body;
    try {
        let result = await queryDB(`SELECT * FROM ${userTable} WHERE username = ?`, [username]);
        if (result.length > 0 && result[0].password === password) {
            res.cookie('username', result[0].username);
            res.cookie('img', result[0].img || 'avatar.png');
            return res.redirect('Feed.html');
        } else {
            return res.redirect('login.html?error=1');
        }
    } catch (err) {
        return res.redirect('login.html?error=1');
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('img');
    return res.redirect('login.html');
});

// Update Username
app.post('/updateUsername', async (req, res) => {
 const oldUsername = req.cookies.username;
  const newUsername = (req.body.new_username || '').trim();
  if (!oldUsername) {
    return res.redirect('login.html');
  }
  //  ถ้าชื่อว่างให้กลับไปหน้า profile พร้อม error
  if (!newUsername) {
    return res.redirect('profile.html?error=1'); 
  }
  try {
    //อัปเดตชื่อในตาราง userInfo 
    await queryDB(
      'UPDATE userInfo SET username = ? WHERE username = ?',
      [newUsername, oldUsername]
    );
    //อัปเดตชื่อในตาราง posts 
    await queryDB(
      'UPDATE posts SET user = ? WHERE user = ?',
      [newUsername, oldUsername]
    );
    //อัปเดตชื่อในตาราง comments 
    await queryDB(
      'UPDATE comments SET user = ? WHERE user = ?',
      [newUsername, oldUsername]
    );
    //อัปเดตชื่อในตาราง activity 
    await queryDB(
      'UPDATE activity SET user = ? WHERE user = ?',
      [newUsername, oldUsername]
    );

    // เปลี่ยนค่า cookie ให้เป็นชื่อใหม่
    res.cookie('username', newUsername);

    // กลับไปหน้า profile ตามปกติ
    return res.redirect('profile.html');

  } catch (err) {
    console.error('Error while updating username:', err);
    return res.redirect('profile.html?error=1');
  }
});


// CREATE POST (Multiple Images) 

app.post('/addPost', postUpload.array('postImg', 10), async (req, res) => {
    try {
        const username = req.cookies.username;
        // แก้ให้รับค่าให้ตรงกับ name ใน HTML
        const { title, message, event_date } = req.body; 

        let imgString = '[]';
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map(f => f.filename);
            imgString = JSON.stringify(filenames);
        }

        await queryDB(
            "INSERT INTO posts(user, title, message, img, event_date) VALUES (?, ?, ?, ?, ?)",
            [username, title, message, imgString, event_date]
        );

        res.redirect('profile.html');
    } catch (err) {
        console.error("Add post error:", err);
        res.redirect('profile.html?error=upload_failed');
    }
});


//  EDIT POST 

app.post('/editPost', postUpload.array('postImg', 10), async (req, res) => {
    try {
        const username = req.cookies.username;
        const { post_id, title, message, event_date } = req.body;

        // เช็คความเป็นเจ้าของ
        const check = await queryDB("SELECT user, img FROM posts WHERE id = ?", [post_id]);
        if (check.length === 0 || check[0].user !== username) {
            return res.redirect('profile.html?error=edit_failed');
        }

        let imgString = check[0].img; // ใช้รูปเดิมไปก่อน
        
        // ถ้าอัปรูปใหม่ ก็ให้ใช้รูปใหม่แทนเลย
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map(f => f.filename);
            imgString = JSON.stringify(filenames);
        }

        await queryDB(
            "UPDATE posts SET title=?, message=?, img=?, event_date=? WHERE id=?",
            [title, message, imgString, event_date, post_id]
        );

        res.redirect('profile.html');

    } catch (err) {
        console.error("Edit error:", err);
        res.redirect('profile.html?error=edit_error');
    }
});


// DELETE POST 

app.delete('/deletePost/:id', async (req, res) => {
    const postId = req.params.id;
    const username = req.cookies.username;

    if (!username) return res.status(401).json({ error: "Unauthorized" });

    try {
        const checkOwner = await queryDB("SELECT user FROM posts WHERE id = ?", [postId]);
        if (checkOwner.length === 0) return res.status(404).json({ error: "Post not found" });
        if (checkOwner[0].user !== username) return res.status(403).json({ error: "Not owner" });

        await queryDB("DELETE FROM activity WHERE post_id = ?", [postId]);
        await queryDB("DELETE FROM comments WHERE post_id = ?", [postId]);
        await queryDB("DELETE FROM posts WHERE id = ?", [postId]);

        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

// Get Posts (Feed)
app.get('/getPosts', async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, 
            (SELECT COUNT(*) FROM activity WHERE activity.post_id = posts.id AND activity.status = 'accept') AS interest_count 
            FROM posts 
            ORDER BY id DESC
        `;
        const posts = await queryDB(sql);
        res.json(posts);
    } catch (err) {
        res.status(500).send("Error");
    }
});

// Get My Posts (For Profile)
app.get('/getMyPosts', async (req, res) => {
    try {
        const username = req.cookies.username;
        if (!username) return res.json([]);
        const sql = "SELECT * FROM posts WHERE user = ? ORDER BY id DESC";
        const results = await queryDB(sql, [username]);
        res.json(results);
    } catch (err) {
        res.json([]);
    }
});

// User Activities (History)
app.get('/userActivities', async (req, res) => {
    const username = req.cookies.username;
    if (!username) return res.json([]);
    const sql = `
      SELECT a.status, p.id, p.title, p.img, p.message
      FROM activity a
      JOIN posts p ON a.post_id = p.id
      WHERE a.user = ?
    `;
    const results = await queryDB(sql, [username]);
    res.json(results);
});

// Record Activity (Accept/Decline)
app.post("/activity", async (req, res) => {
    const { user, post_id, status } = req.body;
    await queryDB("INSERT INTO activity(user, post_id, status) VALUES(?, ?, ?)", [user, post_id, status]);
    res.json({ ok: true });
});

// Comments
app.post("/addComment", async (req, res) => {
    const { user, post_id, comment } = req.body;
    await queryDB("INSERT INTO comments(user, post_id, comment) VALUES(?, ?, ?)", [user, post_id, comment]);
    res.json({ ok: true });
});

app.get("/getComments/:post_id", async (req, res) => {
    const rows = await queryDB("SELECT user, comment, comment_time FROM comments WHERE post_id = ? ORDER BY comment_time DESC", [req.params.post_id]);
    res.json(rows);
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/login.html`);
});