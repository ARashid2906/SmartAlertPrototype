const express = require('express');
const colors = require('colors');
const ejs = require('ejs');

const app = express();

app.set('view engine', ejs)
app.get('/', (req, res) => res.render('pages/index'))

app.listen(2000);
console.log('Server port'.green, 2000);