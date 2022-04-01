const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3000, console.log('Server started at http://localhost:3000'));