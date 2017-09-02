module.exports = function (app, db, err) {
    app.get('/get-categories', (req, res) => {
        db.listCollections().toArray().then((items) => {
            if(err) {
                res.send(err)
            } else {
                res.send(items)
            }
        })
    })

    app.get('/get-documents-names', (req, res) => {
        db.listCollections().toArray().then((items) => {
            if(err) {
                res.send(err)
            } else {
                const docList = []
                items.forEach((item, index) => {
                    db.collection(item.name).find({}, {name: true}).toArray().then((docs) => {
                        docList.push({
                            name: item.name,
                            docs
                        })
                        if((index + 1) === items.length) {
                            res.send(docList)
                        }
                    })
                })
            }
        })
    })


    app.post(`/add-article`, (req, res, next) => {
        res.setHeader('Content-Type', 'multipart/form-data');
        db.collection('notes').insert(req.body, (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send('success')
            }
        });
    });

    app.post(`/add-category`, (req, res) => {
        res.setHeader('Content-Type', 'text/json');
        db.createCollection(req.body.title);
        if(err) {
            res.send('fail');
        } else {
            res.send('success');
        }
    });
}