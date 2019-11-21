const express = require('express');
const router = express.Router();
const mySqlConnection = require('../database');
const multer = require('multer');
var fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const now = new Date().toISOString(); 
        const date = now.replace(/:/g, '-'); 
        cb(null, date + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } 
    else {
        cb(null, false);
    }
};
  
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
}).fields([
    {name: 'icon'},
    {name: 'cv'}
]);

//get all users
router.get('/api/users', (req, res) => {
    mySqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.sendStatus(400); //Status: Bad request
        }
    });
});

//get a specific user data
router.get('/api/users/:email', (req, res) => {
    const { email } = req.params;
    mySqlConnection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.status(204); //Status: No content
            res.send({});
        }
    });
});

//add a user
router.post('/api/users', (req, res) => {
    upload(req, res, (err) => {
        if(!err) {
            const { email, name, password, type, profession } = req.body;
            const icon = req.files.icon[0].filename;
            const cv = req.files.cv[0].filename;
            let query = `INSERT INTO users (\`email\`, \`name\`, \`password\`, 
                \`type\`, \`profession\`, \`icon\`, \`cv\`) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            mySqlConnection.query(query, [email, name, password, type, profession, 
                icon, cv], (error, rows, fields) => {
                if(!error) {
                    res.status(200); //status: ok
                    res.send('Ok');
                }
                else {
                    res.status(400); //status: bad request
                    res.send(error);
                }
            });  
        }
        else {
            res.sendStatus(400); //Status: Bad request
        }
    });
});

//post method for login purposes only
router.post('api/users/login', (req, res) => {
    const { email, password } = req.body;
    const query = `
        SELECT * FROM users 
        WHERE email = ? AND password = ?
    `;
    mySqlConnection.query(query, [email, password], (err, rows, fields) => {
        if(rows.length == 1) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(204); //Status: No content
        }
    });
});

//modify user without modifying icon or cv
router.put('/api/users/:email', (req, res) => {
    const { name, password, type, profession } = req.body;
    const { email } = req.params;
    const query = `
        UPDATE users
            SET \`name\` = ?, 
            \`password\` = ?, 
            \`type\` = ?, 
            \`profession\` = ?  
        WHERE email = ?
    `;
    mySqlConnection.query(query, [name, password, type, profession, email], (err, rows, fields) => {
        if(!err) {
            res.sendStatus(200); //Status: Ok
        }
        else {
            res.sendStatus(400); //Status: Bad request
        }
    }); 
});

//modify user icon
router.put('/api/users/editIcon/:email', (req, res) => {
    upload(req, res, (err) => {
        const { email } = req.params;
        const oldIconPath = req.body.icon;
        const newIconPath = req.files.icon[0].filename;
        const query = `
            UPDATE users 
                SET \`icon\` = ? 
            WHERE \`email\` = ?
        `;
        mySqlConnection.query(query, [newIconPath, email], (err, rows, fields) => {
            if(!err) {
                fs.unlinkSync(oldIconPath); //borramos la imagen anterior, no funciona
                res.status(200); //status: ok
                res.send('Ok');
            }
            else {
                res.status(400); //status: bad request
                res.send(error);
            }
        });
    });
});

//modify user cv
router.put('/api/users/editCV/:email', (req, res) => {
    upload(req, res, (err) => {
        const { email } = req.params;
        const oldCvPath = req.body.cv;
        const newCvPath = req.files.cv[0].filename;
        const query = `
            UPDATE users 
                SET \`cv\` = ? 
            WHERE \`email\` = ?
        `;
        mySqlConnection.query(query, [newCvPath, email], (err, rows, fields) => {
            if(!err) {
                fs.unlinkSync(oldCvPath); //borramos el documento anterior, no funciona
                res.status(200); //status: ok
                res.send('Ok');
            }
            else {
                res.status(400); //status: bad request
                res.send(error);
            }
        });
    });
});

//delete user (it does NOT delete images from uploads file, idk how to make that)
router.delete('/api/users/:email', (req, res) => {
    const { email } = req.params;
    mySqlConnection.query('DELETE FROM users WHERE email = ?', [email], (error, results, fields) => {
        if(!error) {
            res.sendStatus(200); //status: ok
        }
        else {
            res.sendStatus(400); //Status: Bad request
        }
    });
});

module.exports = router;