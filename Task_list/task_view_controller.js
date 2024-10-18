/*jshint esversion: 6 */
$(function() {

// VIEWs

const taskList = function(tasks, showAll = true) { 
  return `<h1>Task list</h1>
  <button class="new">New task</button>
  <button class="reset">Reset tasks</button>
  <button class="toggle-tasks">${showAll ? "Active tasks" : "All tasks"}</button>  <!-- Aquí cambiamos el texto del botón -->
  <input type="text" id="search" placeholder="Search tasks"/>
  <p/>
  <div id="task-list-container">
    ${renderTaskList(tasks)}
  </div>`;
};


const renderTaskList = function(tasks) {
  return tasks.reduce(
    (ac, task) => ac += 
    `<div>
    <button type="submit" class="delete" taskid="${task.id}" title="Delete"> <img src="public/icon_delete.png"/> </button>
    <button type="button" class="edit"   taskid="${task.id}" title="Edit"  > <img src="public/icon_edit.png"/> </button>
    <button type="button" class="switch" taskid="${task.id}" title=${task.done ? 'Start' : 'Stop'}> <img src="${task.done ? 'public/icon_play.png' : 'public/icon_stop.png'}"/> </button>
    ${task.title}
    </div>\n`, 
    "");
};




const taskForm = function(msg, id, action, title, done) {
  return `<h1>Task form</h1>
  ${msg}: <p>
  <input type="text"     name="title"  value="${title}" placeholder="title"/>
  Done: 
  <input type="checkbox" name="done"   ${done ? 'checked' : ''}/>
  <button class="${action}" taskid="${id}">${action}</button>
  </p>
  <button class="list">Go back</button>
  `;
};


// CONTROLLERs

const listController = function(showAll = true) {
  let tasks = showAll ? task_model.getAll() : task_model.getAll({ done: false });
  $('#tasks').html(taskList(tasks, showAll)); 
};



const newController = function() {
  $('#tasks').html(taskForm('New task', null, 'create', '', ''));
};

const editController = function(id) {
  let task = task_model.get(id);
  $('#tasks').html(taskForm('Edit task', id, 'update', task.title, task.done));
};

const createController = function() {
  task_model.create($('input[name=title]').val(), $('input[name=done]').is(':checked'));  
  listController();
};

const updateController = function(id) {
  task_model.update(id, $('input[name=title]').val(), $('input[name=done]').is(':checked'));
  listController();
};

const switchController = function(id) {
  let task = task_model.get(id);
  task_model.update(id, task.title, !task.done);
  listController();  
};

const deleteController = function(id) {
  task_model.delete(id);
  listController();  
};


const resetController = function() {
  task_model.reset();
  listController();  
};



// ROUTER

const eventsController = function() {
  $(document).on('click','.list',   () => listController());
  $(document).on('click','.new',    () => newController());
  $(document).on('click','.edit',   (e)=> editController(Number($(e.currentTarget).attr("taskid"))));
  $(document).on('click','.create', () => createController());
  $(document).on('click','.update', (e)=> updateController(Number($(e.currentTarget).attr("taskid"))));
  $(document).on('click','.switch', (e)=> switchController(Number($(e.currentTarget).attr("taskid"))));
  $(document).on('click','.delete', (e)=> deleteController(Number($(e.currentTarget).attr("taskid"))));
  $(document).on('click','.reset',  (e)=> resetController());
 
  let showAllTasks = true;

 
  $(document).on('click', '.toggle-tasks', () => {
    showAllTasks = !showAllTasks;  
    listController(showAllTasks);  
  });

  $(document).on('input', '#search', function() {
    const searchText = $(this).val().toLowerCase(); 
    const filteredTasks = task_model.getAll().filter(task => task.title.toLowerCase().includes(searchText));  
    
    $('#task-list-container').html(renderTaskList(filteredTasks));
  });
};


let task_model = new TaskModel();
listController();
eventsController();
});
