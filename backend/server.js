const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

// Routes
const exampleUrls = require('./routes/route') // Import the example routes, delete this when first issue resolved 

dotenv.config()

mongoose.connect(process.env.DATABASE_ACCESS, ()=>console.log("Database connected")) // Database connection

app.use(express.json())
app.use(cors())

app.use('/app', exampleUrls)

app.listen(4000, () => console.log("Server is up and running"))