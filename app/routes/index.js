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

    app.post('/get-documents', (req, res) => {
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
                res.send(err)
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
                            console.log('id', item)
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
            console.log(item, !req.body[item])
            return !req.body[item]
        })
        if (!invalid) {
            db.collection(req.body.category).insert(req.body, (error, result) => {
                if (error) {
                    res.send(error);
                } else {
                    res.send('success')
                }
            });
        } else {
            res.send(new Error('Заполните все поля'))
        }

        console.log('req', invalid)
    });

    app.post(`/add-category`, (req, res) => {
        res.setHeader('Content-Type', 'text/json');
        db.createCollection(req.body.title, {}, (err, col) => {
            if(err) {
                res.send(err);
            } else {
                res.send('success');
            }
        });
    });

    app.post('/delete-article', (req, res) => {
        console.log('aaa', req.body.article, req.body.category)
        db.collection(req.body.category).deleteOne({ name: req.body.article })
    })
}