const express = require('express');
const app = express();
//Solve cors problem
const cors = require('cors');

//settings
app.set('port', process.env.PORT || 3001);

//middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Hello world');
});

//start the server
app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}`);
});