const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const db             = require('./config/config');
const cors           = require('cors');

const port = 8000;

app.use(cors({origin: db.siteUrl}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(db.dbUrl, (err, database) => {
    if (err) return console.log(err)
    require('./app/routes')(app, database, err);
    app.listen(port, () => {
        console.log('We are live on ' + port);
    });
})
