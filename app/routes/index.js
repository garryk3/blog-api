import fs from 'fs'
import multer from'multer'
import config from '../config/config'
import rimraf from 'rimraf'
import express from 'express'
import { MongoClient } from 'mongodb'
import categoryRoute from './category'
import articleRoute from './article'

const upload = multer({ dest: 'tmp/' })
const router = express.Router()

MongoClient.connect(config.dbUrl, (err, db) => {
    router.use((req, res, next) => {
        if (err) {
            res.send({ error: { message: `Ошибка соединения с базой данных: ${err.message}` } })
        }
        next()
    })
    router.use('/category', categoryRoute(db))

    router.use('/article', articleRoute(db))

})

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

export default router

// module.exports = function (app, db, err, upload) {
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
//
//
// }

