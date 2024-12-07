'use strict';
/*jshint node: true */
/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const TaskModel = require("./task_model.js");

let task_model = new TaskModel();

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

  res.render('task_list', {
    name: 'Task',
    tasks: task_model.getAll(where, order, (currentPage-1)*itemsOnPage, itemsOnPage),
    items: task_model.count(where),
    active,
    search,
    order,
    itemsOnPage,
  });
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
  task_model.create(req.body.title, req.body.done);
  res.redirect('/task');
});
 
// Show form of edit task
router.get('/edit/(:id)', function(req, res, next) {
  let task = task_model.get(req.params.id);
  res.render('task_form', {
    name: 'Edit task',
    id: req.params.id,
    action: 'update',
    title: task.title,
    done: task.done,
  });
});
 
// Edit task
router.post('/update/(:id)', function(req, res, next) {
  task_model.update(req.params.id, req.body.title, req.body.done);
  res.redirect('/task');
});

// Switch task
router.get('/switch/(:id)', function(req, res, next) {
  let task = task_model.get(req.params.id);
  if (task) {
    task_model.update(req.params.id, task.title, !task.done); 
  }
  res.redirect('/task');
});
// Delete task
router.get('/delete/(:id)', function(req, res, next) {
  task_model.delete(req.params.id);
  res.redirect('/task');
});

// Reset all tasks
router.get('/reset', function(req, res, next) {
  task_model.reset();
  res.redirect('/task');
});

module.exports = router;