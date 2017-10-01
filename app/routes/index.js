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

    app.get('/get-documents-names', (req, res) => {
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


    app.post(`/add-article`, upload.array('photos', 12), (req, res, next) => {
        res.setHeader('Content-Type', 'multipart/form-data');
        const keys = Object.keys(req.body)
        const invalid = keys.some((item) => {
            return !req.body[item]
        })
        if (!invalid) {
            db.collection(req.body.category).insert(req.body, (error, result) => {
                if (error) {
                    res.send({ error });
                } else {
                    res.send('success')
                }
            });
        } else {
            res.send({ error: { message: 'Заполните все поля' } })
        }
    })

    app.post('/get-article', (req, res) => {
        db.collection(req.body.category).find({name: req.body.article}).toArray(function(err, docs) {
            console.log(req.body)
            if(err) {
                res.send({error: err});
            } else {
                res.send(docs[0]);
            }
        });
    })

    app.post('/edit-article', (req, res) => {
        db.collection(req.body.category).find({name: req.body.name}).toArray(function(err, docs) {
            console.log(req.body)
            if(err) {
                res.send({error: err});
            } else {
                res.send(docs[0]);
            }
        });
    })

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