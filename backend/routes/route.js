// A route example, delete this file when first issue resolved 

const express = require('express')
const router = express.Router()
const exampleSchema = require('../models/models') // Import the model

router.post('/', (req, res) => {
    res.send('send')
})

module.exports = router