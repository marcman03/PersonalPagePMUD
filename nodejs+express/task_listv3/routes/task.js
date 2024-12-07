'use strict';
/*jshint node: true */
/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const task_model = require("./task_model.js");

// Show list of tasks
router.get('/', function(req, res, next) {
  let active = req.cookies.active ? JSON.parse(req.cookies.active) : false;
  let search = req.cookies.search ? req.cookies.search : "";
  let order  = req.cookies.order  ? JSON.parse(req.cookies.order)  : {};
  let itemsOnPage = req.cookies.itemsOnPage ? JSON.parse(req.cookies.itemsOnPage) : 10;
  let currentPage = req.cookies.currentPage ? JSON.parse(req.cookies.currentPage) : 1;

  let where = {};
  if (active)
    where.done = false;
  if (search)
    where.title = ["includes", search];

  task_model.getAll(where, order, (currentPage-1)*itemsOnPage, itemsOnPage)
  .then(tasks => {
    task_model.count(where)
    .then(total => {
      res.render('task_list', {
        name: 'Task',
        tasks: tasks,
        items: total,
        active,
        search,
        order,
        itemsOnPage,
      });
    })
    .catch(error => {next(Error(`DB Error:\n${error}`));});
  })
  .catch(error => {next(Error(`DB Error:\n${error}`));});
});
 
// Show form of add task
router.get('/add', function(req, res, next) {    
  res.render('task_form', {
    name: 'New task',
    id: null,
    action: 'create',
    title: '',
    done: false,
  });
});
 
// Create new task
router.post('/create', function(req, res, next) {
  task_model.add(req.body.title, req.body.done)
  .then(() => {
    res.redirect('/task');
  })
  .catch(error => {next(Error(`task not created:\n${error}`));});
});
 
// Show form of edit task
router.get('/edit/(:id)', function(req, res, next) {
  task_model.get(req.params.id)
  .then(task => {
    res.render('task_form', {
      name: 'Edit task',
      id: req.params.id,
      action: 'update',
      title: task.title,
      done: task.done,
    });
  })
  .catch(error => {next(Error(`A DB Error has occurred:\n${error}`));});
});
 
// Edit task
router.post('/update/(:id)', function(req, res, next) {
  task_model.update(req.params.id, req.body.title, req.body.done)
  .then(() => {
    res.redirect('/task');
  })
  .catch(error => {next(Error(`task not updated:\n${error}`));});
});

// Switch task
router.get('/switch/(:id)', function(req, res, next) {
  task_model.get(req.params.id)
    .then(task => {
      return task_model.update(req.params.id, task.title, !task.done);
    })
    .then(() => {
      res.redirect('/task');
    })
    .catch(error => {next(Error(`Task not switched:\n${error}`));});
});

 
// Delete task
router.get('/delete/(:id)', function(req, res, next) {
  task_model.delete(req.params.id)
    .then(() => {
      res.redirect('/task');
    })
    .catch(error => {next(Error(`Task not deleted:\n${error}`));});
});


// Reset all tasks
router.get('/reset', function(req, res, next) {
  task_model.reset()
    .then(() => {
      res.redirect('/task');
    })
    .catch(error => {next(Error(`Tasks not reset:\n${error}`));});
});


module.exports = router;