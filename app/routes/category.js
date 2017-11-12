import express from 'express'
import rimraf from 'rimraf'
import fs from 'fs'

const router = express.Router()

export default (db) => {

    router.route('/')
        .post(async (req, res) => {
            try {
                const created = await db.createCollection(req.body.title, {})
                created.ensureIndex({ name: 1 }, { unique: true });
                res.send('success');
            } catch (err) {
                console.log('err', err)
                res.send({error: err});
            }
        })

        .delete(async (req, res) => {
            try {
                const deleted = await db.collection(req.query.category).drop()
                console.log('req.body.category', req.query.category)
                if (fs.existsSync(`static/images/${req.query.category}`)){
                    rimraf(`static/images/${req.query.category}`, () => console.log('delete folder', `static/images/${req.body.category}`));
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
                const items = await db.listCollections({
                    name: { $ne: 'system.indexes' }
                }).toArray()

                if(req.query.onlyNames) {
                    const docList = []
                    items.forEach(async (item) => {
                        const articles = await db.collection(item.name).find({}, {name: true}).toArray()
                        docList.push({
                            name: item.name,
                            articles,
                            id: item._id
                        })
                        if (items.length === docList.length) {
                            const response = docList.sort((a, b) => {
                                return a.name > b.name
                            })
                            res.send(response)
                        }
                    })
                } else {
                    res.send(items)
                }
            } catch(err)  {
                console.log('err', err)
                res.send({ err })
            }
        })

    return router
}