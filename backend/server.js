import express  from 'express'
const app = express()
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'

// Routes
import  exampleUrls from './routes/route.js' // Import the example routes, delete this when first issue resolved 

dotenv.config()

mongoose.connect(process.env.DATABASE_ACCESS, ()=>{console.log("Database connected")}) // Database connection

app.use(express.json())
app.use(cors())

app.use('/app', exampleUrls)

app.listen(4000, () => console.log("Server is up and running"))