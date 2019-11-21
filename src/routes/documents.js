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
    {name: 'source'},
    {name: 'image'}
]);

//get all documents
router.get('/api/documents', (req, res) => {
    mySqlConnection.query('SELECT * FROM documents', (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.status(400); //Status: Bad request
            res.send(err);
        }
    });
});

//get a specific document data
router.get('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    mySqlConnection.query('SELECT * FROM documents WHERE id_documents = ?', [id], (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.status(204); //Status: No content
            res.send({});
        }
    });
});

//add a document
router.post('/api/documents', (req, res) => {
    upload(req, res, (err) => {
        if(!err) {
            const { title, description, price, users_email } = req.body;
            const source = req.files.source[0].filename;
            const image = req.files.image[0].filename;
            let query = `INSERT INTO documents (\`title\`, \`description\`, \`source\`, 
                \`price\`, \`image\`, \`users_email\`) 
                VALUES (?, ?, ?, ?, ?, ?)`;
            mySqlConnection.query(query, [title, description, source, price, image, 
                users_email], (error, rows, fields) => {
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
            res.status(400); //Status: Bad request
            res.send(err);
        }
    });
});

//modify document without modifying source or image
router.put('/api/documents/:id', (req, res) => {
    const { title, description, price } = req.body;
    const { id } = req.params;
    const query = `
        UPDATE documents   
            SET \`title\` = ?, 
            \`description\` = ?, 
            \`price\` = ? 
        WHERE \`id_documents\` = ?
    `;
    mySqlConnection.query(query, [title, description, price, id], (err, rows, fields) => {
        if(!err) {
            res.status(200); //status: ok
            res.send('Ok');
        }
        else {
            res.status(400); //status: bad request
            res.send(err);
        }
    }); 
    res.send(400);
});

//modify document source
router.put('/api/documents/editSource/:id', (req, res) => {
    upload(req, res, (err) => {
        const { id } = req.params;
        const oldSource = req.body.source;
        const newSource = req.files.source[0].filename;
        const query = `
            UPDATE documents 
                SET \`source\` = ? 
            WHERE \`id_documents\` = ?
        `;
        mySqlConnection.query(query, [newSource, id], (err, rows, fields) => {
            if(!err) {
                fs.unlinkSync(oldSource); //borramos la imagen anterior, no funciona
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

//modify document image
router.put('/api/documents/editImage/:id', (req, res) => {
    upload(req, res, (err) => {
        const { id } = req.params;
        const oldImagePath = req.body.image;
        const newImagePath = req.files.image[0].filename;
        const query = `
            UPDATE documents 
                SET \`image\` = ? 
            WHERE \`id_documents\` = ?
        `;
        mySqlConnection.query(query, [newImagePath, id], (err, rows, fields) => {
            if(!err) {
                fs.unlinkSync(oldImagePath); //borramos el documento anterior, no funciona
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

//delete document (it does NOT delete images from uploads file, idk how to make that)
router.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    mySqlConnection.query('DELETE FROM documents WHERE id_documents = ?', [id], (error, results, fields) => {
        if(!error) {
            res.status(200); //status: ok
            res.send('Ok');
        }
        else {
            res.status(400);
            res.send(error);
        }
    });
    res.send(400);
});

module.exports = router;