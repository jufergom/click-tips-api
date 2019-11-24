const express = require('express');
const app = express();
//Solve cors problem
const cors = require('cors');
const bodyParser = require('body-parser');

//settings
app.set('port', process.env.PORT || 3001);

//middlewares
app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use('/uploads', express.static('uploads'));

//routes
app.use(require('./src/routes/users'));
app.use(require('./src/routes/documents'));

app.get('/', (req, res) => {
    res.send('Hello world');
});

//start the server
app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}`);
});
