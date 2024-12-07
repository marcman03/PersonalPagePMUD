var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
  title: 'Rainbow',
  colors: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'], 
    });
 });
 



module.exports = router;
