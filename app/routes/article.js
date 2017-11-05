import express from 'express'

const router = express.Router()

router.route('/article')
    .get()
    .put()
    .delete()

export default router