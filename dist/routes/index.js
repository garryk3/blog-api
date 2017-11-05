'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongodb = require('mongodb');

var _category = require('./category');

var _category2 = _interopRequireDefault(_category);

var _article = require('./article');

var _article2 = _interopRequireDefault(_article);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var upload = (0, _multer2.default)({ dest: 'tmp/' });
var router = _express2.default.Router();
var db = _mongodb.MongoClient.connect(_config2.default.dbUrl);

router.use(async function (req, res, next) {
    try {
        var dbConnect = await db;
        next();
    } catch (err) {
        res.send({ error: { message: '\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F \u0441 \u0431\u0430\u0437\u043E\u0439 \u0434\u0430\u043D\u043D\u044B\u0445: ' + err.message } });
    }
});

router.route('/').get(function (req, res) {
    try {
        console.log('api ready');
        res.send('api ready');
    } catch (err) {
        res.send(err);
    }
});

router.use('/category', _category2.default);
router.use('/article', _article2.default);

router.route('/categories').get(async function (req, res) {
    try {
        var items = await db.listCollections({}, {
            $ne: [{ 'name': 'system.indexes' }]
        }).toArray();
        console.log('items', items);
        res.send(items);
    } catch (err) {
        res.send({ error: err });
    }
});

router.get('/get-categories', function (req, res) {
    console.log('get cats route');
    db.listCollections().toArray().then(function (items) {
        if (false) {
            res.send('err');
        } else {
            var names = items.map(function (item) {
                if (item.name !== 'system.indexes') {
                    return {
                        name: item.name,
                        articles: []
                    };
                }
            }).filter(function (item) {
                if (item) return item;
            });
            res.send(names);
        }
    });
});

router.get('/get-articles-names', function (req, res) {
    console.log('get names route');
    db.listCollections().toArray().then(function (items) {
        if (err) {
            res.send({ error: err });
        } else {
            var docList = [];
            var ignore = ['system.indexes'];
            var finalLength = items.length - ignore.length;
            items.forEach(function (item) {
                if (ignore.findIndex(function (ignore) {
                    return ignore === item.name;
                }) === -1) {
                    db.collection(item.name).find({}, { name: true }).toArray().then(function (docs) {
                        docList.push({
                            name: item.name,
                            articles: docs,
                            id: item._id
                        });
                        if (docList.length === finalLength) {
                            var response = docList.sort(function (a, b) {
                                return a.name > b.name;
                            });
                            res.send(response);
                        }
                    });
                }
            });
        }
    });
});
var imgUploader = function imgUploader(req, key) {
    return new Promise(function (resolve, reject) {
        var files = [];
        if (!req.files[key]) {
            resolve(files);
        } else {
            req.files[key].forEach(function (item, index) {
                var tmpPath = item.path;

                if (!_fs2.default.existsSync('static/images/' + req.body.category)) {
                    _fs2.default.mkdirSync('static/images/' + req.body.category);
                }
                if (!_fs2.default.existsSync('static/images/' + req.body.category + '/' + req.body.name)) {
                    _fs2.default.mkdirSync('static/images/' + req.body.category + '/' + req.body.name);
                }
                var dbPath = 'images/' + req.body.category + '/' + req.body.name + '/' + key + '_' + item.originalname;
                var targetPath = 'static/' + dbPath;

                var src = _fs2.default.createReadStream(tmpPath);
                var dest = _fs2.default.createWriteStream(targetPath);
                src.pipe(dest);
                src.on('end', function () {
                    files.push(dbPath);
                    if (index + 1 === req.files[key].length) {
                        resolve(files);
                    }
                });
                src.on('error', function (err) {
                    reject(err);
                });
            });
        }
    });
};

exports.default = router;

// module.exports = function (app, db, err, upload) {
//     app.get('/get-categories', (req, res) => {
//         db.listCollections().toArray().then((items) => {
//             if(err) {
//                 res.send(err)
//             } else {
//                 const names = items.map((item) => {
//                     if(item.name !== 'system.indexes') {
//                         return {
//                             name: item.name,
//                             articles: []
//                         }
//                     }
//                 }).filter((item) => {
//                     if (item) return item
//                 })
//                 res.send(names)
//             }
//         })
//     })
//
//     app.post('/get-articles', (req, res) => {
//         db.collection(req.body.name).find({}).toArray().then((docs) => {
//             if(err) {
//                 res.send(err);
//             } else {
//                 res.send(docs);
//             }
//         })
//     })
//
//     app.get('/get-articles-names', (req, res) => {
//         db.listCollections().toArray().then((items) => {
//             if(err) {
//                 res.send({error: err})
//             } else {
//                 const docList = []
//                 const ignore = ['system.indexes']
//                 const finalLength = items.length - ignore.length
//                 items.forEach((item) => {
//                     if (ignore.findIndex((ignore) => ignore === item.name) === -1) {
//                         db.collection(item.name).find({}, {name: true}).toArray().then((docs) => {
//                             docList.push({
//                                 name: item.name,
//                                 articles: docs,
//                                 id: item._id
//                             })
//                             if(docList.length === finalLength) {
//                                 const response = docList.sort((a, b) => {
//                                     return a.name > b.name
//                                 })
//                                 res.send(response)
//                             }
//                         })
//                     }
//                 })
//             }
//         })
//     })
//
//
//     app.post([`/add-article`, '/edit-article'], upload.fields([{ name: 'mainImg', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]), (req, res, next) => {
//         res.setHeader('Content-Type', 'multipart/form-data');
//         const data = Object.assign({}, req.body)
//         let invalid = false
//         for (let key in data) {
//             if (!data[key]) { invalid = true }
//         }
//         if (!req.files.mainImg) {
//             invalid = true
//         }
//         if (!invalid) {
//             if (err) {
//                 res.send({ error: err })
//             } else {
//                 Promise.all([imgUploader(req, 'mainImg'), imgUploader(req, 'gallery')]).then((response) => {
//                     data.mainImg = response[0]
//                     data.gallery = response[1]
//                     if (req.url === '/add-article') {
//                           db.collection(req.body.category).insert(data, (error, result) => {
//                             if (error) {
//                                 res.send({ error });
//                             } else {
//                                 res.send('success')
//                             }
//                         });
//                     } else {
//                         delete data._id
//                         db.collection(req.body.category).update(
//                             {'_id': ObjectID(req.body._id)},
//                             data)
//                         res.send('success')
//                     }
//                 })
//             }
//         } else {
//             res.send({ error: { message: 'Заполните все поля' } })
//         }
//     })
//
//     app.post('/get-article', (req, res) => {
//         db.collection(req.body.category).find({'_id': ObjectID(req.body._id)}).toArray(function(err, docs) {
//             if(err) {
//                 res.send({error: err});
//             } else {
//                 res.send(docs[0]);
//             }
//         });
//     })
//
//     app.post(`/add-category`, (req, res) => {
//         res.setHeader('Content-Type', 'text/json');
//         db.createCollection(req.body.title, {}, (err, col) => {
//             if(err) {
//                 res.send({error: err});
//             } else {
//                 col.ensureIndex({ name: 1 }, { unique: true });
//                 res.send('success');
//             }
//         });
//     });
//
//     app.post('/delete-article', (req, res) => {
//         db.collection(req.body.category).deleteOne({ name: req.body.article })
//         if (fs.existsSync(`static/images/${req.body.category}/${req.body.article}`)){
//             rimraf(`static/images/${req.body.category}/${req.body.article}`, () => console.log('delete folder', `static/images/${req.body.category}/${req.body.article}`));
//         }
//     })
//
//     app.post('/delete-category', (req, res) => {
//         db.collection(req.body.category).drop((err, reply) => {
//             if(err) {
//                 res.send({error: err});
//             } else {
//                 if (fs.existsSync(`static/images/${req.body.category}`)){
//                     rimraf(`static/images/${req.body.category}`, () => console.log('delete folder', `static/images/${req.body.category}`));
//                 }
//                 res.send('success');
//             }
//         })
//     })
// }