const express = require('express')
const app = express()
const jwt = require("jsonwebtoken")

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

// Routes
const users = require('./routes/users.routes') // Import the example routes, delete this when first issue resolved 

dotenv.config()

mongoose.connect(process.env.DATABASE_ACCESS, ()=>console.log("Database connected")) // Database connection

app.use(express.json())
app.use(cors())

app.use('/users', users)

app.listen(4000, () => console.log("Server is up and running"))