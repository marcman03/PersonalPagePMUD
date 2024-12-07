const express = require('express');
const static = require('static');
const app = express();
app.use(express.static('~/public_html/'));
app.get('/', function (req, res) {
res.send('Static server. Add a path.');
});
const server = app.listen(3017)