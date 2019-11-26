const express = require('express');
const router = express.Router();
const mySqlConnection = require('../database');
const multer = require('multer');

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
    cb(null, true);
    // reject a file
    /*
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'image/jpg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
    */
};

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 40
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

//filter documents by questions category
router.get('/api/documents/questions', (req, res) => {
    mySqlConnection.query('SELECT * FROM documents WHERE category = \"Preguntas Frecuentes\"', (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.status(204); //Status: No content
            res.send({});
        }
    });
});

//filter documents by games category
router.get('/api/documents/games', (req, res) => {
    mySqlConnection.query('SELECT * FROM documents WHERE category = \"Actividades y Juegos\"', (err, rows, fields) => {
        if(!err) {
            res.send(rows);
        }
        else {
            res.status(204); //Status: No content
            res.send({});
        }
    });
});

//get all documents of a specific author
router.get('/api/documents/author/:email', (req, res) => {
    const { email } = req.params;
    mySqlConnection.query('SELECT * FROM documents WHERE users_email = ?', [email], (err, rows, fields) => {
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
            const { title, description, price, users_email, category } = req.body;
            const source = req.files.source[0].filename;
            const image = req.files.image[0].filename;
            let query = `INSERT INTO documents (\`title\`, \`description\`, \`source\`,
                \`price\`, \`image\`, \`users_email\`, \`category\`)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            mySqlConnection.query(query, [title, description, source, price, image,
                users_email, category], (error, rows, fields) => {
                if(!error) {
                    res.sendStatus(200); //status: ok
                }
                else {
                    res.sendStatus(400); //status: bad request
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
    const { title, description, price, category } = req.body;
    const { id } = req.params;
    const query = `
        UPDATE documents
            SET \`title\` = ?,
            \`description\` = ?,
            \`price\` = ?,
            \`category\` = ?
        WHERE \`id_documents\` = ?
    `;
    mySqlConnection.query(query, [title, description, price, category, id], (err, rows, fields) => {
        if(!err) {
            res.sendStatus(200); //status: ok
        }
        else {
            res.sendStatus(400); //status: bad request
        }
    });
});

//modify document source
router.put('/api/documents/editSource/:id', (req, res) => {
    upload(req, res, (err) => {
        const { id } = req.params;
        const newSource = req.files.source[0].filename;
        const query = `
            UPDATE documents
                SET \`source\` = ?
            WHERE \`id_documents\` = ?
        `;
        mySqlConnection.query(query, [newSource, id], (err, rows, fields) => {
            if(!err) {
                res.sendStatus(200); //status: ok
            }
            else {
                res.sendStatus(400); //status: bad request
            }
        });
    });
});

//modify document image
router.put('/api/documents/editImage/:id', (req, res) => {
    upload(req, res, (err) => {
        const { id } = req.params;
        const newImagePath = req.files.image[0].filename;
        const query = `
            UPDATE documents
                SET \`image\` = ?
            WHERE \`id_documents\` = ?
        `;
        mySqlConnection.query(query, [newImagePath, id], (err, rows, fields) => {
            if(!err) {
                res.sendStatus(200); //status: ok
            }
            else {
                res.sendStatus(400); //status: bad request
            }
        });
    });
});

//delete document (it does NOT delete images from uploads file, idk how to make that)
router.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    mySqlConnection.query('DELETE FROM documents WHERE id_documents = ?', [id], (error, results, fields) => {
        if(!error) {
            res.sendStatus(200); //status: ok
        }
        else {
            res.status(400);
            res.send(error);
        }
    });
});

module.exports = router;
