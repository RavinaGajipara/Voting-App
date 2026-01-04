const express = require('express');
const app = express();
const db = require('./db')
require('dotenv').config();

app.use(express.json());
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

const PORT = process.env.PORT || 3000;

const userRouters = require('./routes/userRoutes'); //Import route file
const candidateRouters = require('./routes/candidateRoutes');

app.use('/user', userRouters);
app.use('/candidate', candidateRouters);

app.listen(PORT, () => {
    console.log('server is listening on port 3000');
})