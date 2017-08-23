module.exports = function (app, db) {
    app.post('/test', (req, res) => {
        res.send('Hello')
    });
}