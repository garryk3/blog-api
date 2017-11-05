import express from 'express'
import { db } from './'

const router = express.Router()

router.route('/')
    .get((req, res) => {
        console.log('get cat')
        res.send('get cat')
    })
    .put((req, res) => {
        console.log('put cat')
    })
    .delete((req, res) => {
        console.log('delete cat')
    })


export default router