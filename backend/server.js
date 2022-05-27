<<<<<<< HEAD
const express = require('express')
const app = express()
const jwt = require("jsonwebtoken")

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

// Routes
const users = require('./routes/users.routes') // Import the example routes, delete this when first issue resolved 
=======
const express = require('express');
const app = express();
const { connectDB, disconnectDB } = require('./configs/db.config');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
>>>>>>> c4ce85e057d570a998a58da331e821a6095f6f13

connectDB();

app.use(express.json());
app.use(cors());

// Import routers
const usersRouter = require('./routes/users.routes');

<<<<<<< HEAD
app.use('/users', users)
=======
// Use routers
app.use('/users', usersRouter);
>>>>>>> c4ce85e057d570a998a58da331e821a6095f6f13

app.listen(4000, () => console.log('Server is up and running'));
