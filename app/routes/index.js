const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = function (app, db, err, upload) {
    app.get('/get-categories', (req, res) => {
        db.listCollections().toArray().then((items) => {
            if(err) {
                res.send(err)
            } else {
                const names = items.map((item) => {
                    if(item.name !== 'system.indexes') {
                        return {
                            name: item.name,
                            articles: []
                        }
                    }
                }).filter((item) => {
                    if (item) return item
                })
                res.send(names)
            }
        })
    })

    app.post('/get-articles', (req, res) => {
        db.collection(req.body.name).find({}).toArray().then((docs) => {
            if(err) {
                res.send(err);
            } else {
                res.send(docs);
            }
        })
    })

    app.get('/get-articles-names', (req, res) => {
        db.listCollections().toArray().then((items) => {
            if(err) {
                res.send({error: err})
            } else {
                const docList = []
                const ignore = ['system.indexes']
                const finalLength = items.length - ignore.length
                items.forEach((item) => {
                    if (ignore.findIndex((ignore) => ignore === item.name) === -1) {
                        db.collection(item.name).find({}, {name: true}).toArray().then((docs) => {
                            docList.push({
                                name: item.name,
                                articles: docs,
                                id: item._id
                            })
                            if(docList.length === finalLength) {
                                const response = docList.sort((a, b) => {
                                    return a.name > b.name
                                })
                                res.send(response)
                            }
                        })
                    }
                })
            }
        })
    })


    app.post([`/add-article`, '/edit-article'], upload.fields([{ name: 'mainImg', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]), (req, res, next) => {
        res.setHeader('Content-Type', 'multipart/form-data');
        const data = Object.assign({}, req.body)
        let invalid = false
        for (let key in data) {
            if (!data[key]) { invalid = true }
        }
        if (!req.files.mainImg) {
            invalid = true
        }
        if (!invalid) {
            if (err) {
                res.send({ error: err })
            } else {
                Promise.all([imgUploader(req, 'mainImg'), imgUploader(req, 'gallery')]).then((response) => {
                    data.mainImg = response[0]
                    data.gallery = response[1]
                    if (req.url === '/add-article') {
                        console.log('data 1', req.url)
                        db.collection(req.body.category).insert(data, (error, result) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                res.send('success')
                            }
                        });
                    } else {
                        console.log('data 2', req.url)
                        delete data._id
                        db.collection(req.body.category).update(
                            {'_id': ObjectID(req.body._id)},
                            data)
                        res.send('success')
                    }
                })
            }
        } else {
            res.send({ error: { message: 'Заполните все поля' } })
        }
    })

    app.post('/get-article', (req, res) => {
        db.collection(req.body.category).find({'_id': ObjectID(req.body._id)}).toArray(function(err, docs) {
            if(err) {
                res.send({error: err});
            } else {
                res.send(docs[0]);
            }
        });
    })

    // app.post('/edit-article', upload.array('photos', 12), (req, res) => {
    //     console.log('rreq', req.body)
    //     res.setHeader('Content-Type', 'multipart/form-data');
    //     const content =  Object.assign({}, req.body)
    //     delete content._id
    //     db.collection(req.body.category).update(
    //         {'_id': ObjectID(req.body._id)},
    //         content)
    //     res.send('success');
    // });

    app.post(`/add-category`, (req, res) => {
        res.setHeader('Content-Type', 'text/json');
        db.createCollection(req.body.title, {}, (err, col) => {
            if(err) {
                res.send({error: err});
            } else {
                col.ensureIndex({ name: 1 }, { unique: true });
                res.send('success');
            }
        });
    });

    app.post('/delete-article', (req, res) => {
        db.collection(req.body.category).deleteOne({ name: req.body.article })
    })

    app.post('/delete-category', (req, res) => {
        db.collection(req.body.category).drop((err, reply) => {
            if(err) {
                res.send({error: err});
            } else {
                res.send('success');
            }
        })
    })
}

const imgUploader = (req, key) => {
    return new Promise((resolve, reject) => {
        const files = []
        if (!req.files[key]) {
            resolve(files)
        } else {
            req.files[key].forEach((item, index) => {
                const tmpPath = item.path;

                if (!fs.existsSync(`images/${req.body.category}`)){
                    fs.mkdirSync(`images/${req.body.category}`);
                }
                if (!fs.existsSync(`images/${req.body.category}/${req.body.name}`)){
                    fs.mkdirSync(`images/${req.body.category}/${req.body.name}`);
                }
                const targetPath = `images/${req.body.category}/${req.body.name}/${key}_${item.originalname}`;

                const src = fs.createReadStream(tmpPath);
                const dest = fs.createWriteStream(targetPath);
                src.pipe(dest);
                src.on('end', () => {
                    files.push(targetPath)
                    if (index + 1 === req.files[key].length) {
                        resolve(files)
                    }
                });
                src.on('error', (err) => { reject(err) });
            })
        }
    })
}