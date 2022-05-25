// A route example, delete this file when first issue resolved 

import express  from 'express'
const router = express.Router()

router.post('/', (req, res) => {
    res.send('send')
})

export default router