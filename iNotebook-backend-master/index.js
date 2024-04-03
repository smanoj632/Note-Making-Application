const connectToMongo = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const port = 5000;
connectToMongo();
app.use(cors());
app.use(express.json());
app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));
app.listen(port, () => {
    console.log(`iNotebook server listening on port ${port}`);
})
