import express from 'express'
import { ObjectID } from 'mongodb'
import rimraf from 'rimraf'
import fs from 'fs'

const router = express.Router()

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
        .put()
        .delete((req, res) => {
            try {
                db.collection(req.body.category).deleteOne({ name: req.body.article })
                if (fs.existsSync(`static/images/${req.body.category}/${req.body.article}`)){
                    rimraf(`static/images/${req.body.category}/${req.body.article}`, () => console.log('delete folder', `static/images/${req.body.category}/${req.body.article}`));
                }
                res.send('success')
            } catch (err) {
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