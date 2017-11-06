import config from '../config/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import categoryRoute from './category'
import articleRoute from './article'

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

export default router

