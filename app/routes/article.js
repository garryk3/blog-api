import express from 'express'
import { ObjectID } from 'mongodb'
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'
import multer from'multer'

const tmpDir = 'tmp/'
const upload = multer({ dest: tmpDir })
const router = express.Router()
const uploadFilesParams = [{ name: 'mainImg', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]

export default (db) => {
    router.route('/')
        .get(async (req, res) => {
            try {
                const category = req.query.category
                const id = req.query.id
                if (category && id) {
                    const article = await db.collection(category).find({'_id': ObjectID(id)}).toArray()
                    res.send(article[0])
                } else {
                    res.send({ error: {
                        message: 'Неверные параметры запроса'
                    } })
                }
            } catch (err) {
                console.log('err', err)
                res.send({ error: err })
            }
        })

        .post(upload.fields(uploadFilesParams), (req, res) => {
            articleSave(req, res, db)
        })

        .put(upload.fields(uploadFilesParams), (req, res) => {
            articleSave(req, res, db)
        })

        .delete((req, res) => {
            try {
                db.collection(req.query.category).deleteOne({ name: req.query.article })
                if (fs.existsSync(`static/images/${req.query.category}/${req.query.article}`)){
                    rimraf(`static/images/${req.query.category}/${req.query.article}`, () => console.log('delete folder', `static/images/${req.query.category}/${req.query.article}`));
                }
                res.send('success')
            } catch (err) {
                console.log('err', err)
                res.send({error: err})
            }
        })

    router.route('/all')
        .get(async (req, res) => {
            try {
                const category = req.query.category
                if (category) {
                    const articles = await db.collection(category).find({}).toArray()
                    res.send(articles)
                } else {
                    res.send({ error: {
                        message: 'Некорректное название категории'
                    } })
                }
            } catch (err) {
                res.send({ error: err })
            }
        })

    return router
}

const imgUploader = (req, key) => {
    return new Promise((resolve, reject) => {
        const files = []
        if (!req.files[key]) {
            resolve(files)
        } else {
            req.files[key].forEach((item, index) => {
                const tmpPath = item.path;

                if (!fs.existsSync(`static/images/${req.body.category}`)){
                    fs.mkdirSync(`static/images/${req.body.category}`);
                }
                if (!fs.existsSync(`static/images/${req.body.category}/${req.body.name}`)){
                    fs.mkdirSync(`static/images/${req.body.category}/${req.body.name}`);
                }
                const dbPath = `images/${req.body.category}/${req.body.name}/${key}_${item.originalname}`;
                const targetPath = 'static/' + dbPath;

                const src = fs.createReadStream(tmpPath);
                const dest = fs.createWriteStream(targetPath);
                src.pipe(dest);
                src.on('end', () => {
                    fs.readdir(directory, (err, files) => {
                        if (err) throw err;

                        for (const file of files) {
                            fs.unlink(path.join(tmpDir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                    files.push(dbPath)
                    if (index + 1 === req.files[key].length) {
                        resolve(files)
                    }
                });
                src.on('error', (err) => { reject(err) });
            })
        }
    })
}

const articleSave = (req, res, db) => {
        const data = Object.assign({}, req.body)
        let invalid = false
        for (let key in data) {
            if (!data[key]) { invalid = true }
        }
        if (!req.files.mainImg) {
            invalid = true
        }
        if (!invalid) {
            Promise.all([imgUploader(req, 'mainImg'), imgUploader(req, 'gallery')]).then((response) => {
                data.mainImg = response[0]
                data.gallery = response[1]
                if (req.method === 'POST') {
                    db.collection(req.body.category).insert(data, (error, result) => {
                        if (error) {
                            res.send({ error: error });
                        } else {
                            res.send('success')
                        }
                    });
                } else if ((req.method === 'PUT')) {
                    delete data._id
                    db.collection(req.body.category).update(
                        {'_id': ObjectID(req.body._id)},
                        data)
                    res.send('success')
                }
            })
        } else {
            res.send({ error: { message: 'Заполните все поля' } })
        }
}