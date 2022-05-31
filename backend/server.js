const express = require('express');
const app = express();
const { connectDB, disconnectDB } = require('./configs/db.config');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

connectDB();

app.use(express.json());
app.use(cors());

// Import routers
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');

// Use routers
app.use('/users', usersRouter);
app.use('/posts', postsRouter);


app.listen(4000, () => console.log('Server is up and running'));
