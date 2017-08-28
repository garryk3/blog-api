module.exports = function (app, db, err) {
    app.post('/test', (req, res) => {
        res.send('Hello')
        console.log(req.body)
    });
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