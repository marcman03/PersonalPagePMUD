var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('tasks', {
      title: 'Task list',
      tasks: [ {title: "PMUD HTML exercise", done: true},
                        {title: "PMUD CSS exercise", done: false},
                        {title: "PMUD JavaScript exercise",done: false}],
      });
   });

module.exports = router;
