/*jshint esversion: 6 */
$(function() {

function TaskVC(name = "Task", id = "#tasks") {
  this.name = name;
  this.id = id;
  this.active = Cookie.get("active") ? JSON.parse(Cookie.get("active")) : false;
  this.search = Cookie.get("search") ? JSON.parse(Cookie.get("search")) : "";
  this.order  = Cookie.get("order")  ? JSON.parse(Cookie.get("order"))  : {};
  this.itemsOnPage = Cookie.get("itemsOnPage") ? JSON.parse(Cookie.get("itemsOnPage")) : 10;
  this.currentPage = 1;

  // VIEWs

  TaskVC.prototype.taskList = function(tasks) {
    return `<h1>${this.name} list</h1>
    <span class="nobr" style="float:left;">Items/page <select name="itemsOnPage" class="iopage"><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select>
    Pagination: </span><div class="pagination"></div>
    <div class="btn-group" role="group">
      <button class="btn btn-success new">New task</button>
      <button class="btn btn-danger reset">Reset tasks</button>
      <button class="btn btn-secondary list_a"></button>
    </div>
    <p/>
    Task Title
    <button class="uporder" title="Up order">&blacktriangle;</button>
    <button class="doorder" title="Down order">&blacktriangledown;</button>
    <button class="noorder" title="No order">&blacklozenge;</button>
    <span class="nobr"><input type="text" class="search" value="${this.search}" placeholder="Search" onfocus="let v=this.value; this.value=''; this.value=v"> <img class="dsearch" title="Clean Search" src="public/icon_delete.png"/></span>
    ` +
    tasks.reduce(
      (ac, task) => ac += 
      `<div>
      <button type="submit" class="delete" taskid="${task.id}" title="Delete"> <img src="public/icon_delete.png"/> </button>
      <button type="button" class="edit"   taskid="${task.id}" title="Edit"  > <img src="public/icon_edit.png"/> </button>
      <button type="button" class="switch" taskid="${task.id}" title=${task.done ? 'Start' : 'Stop'}> <img src="${task.done ? 'public/icon_play.png' : 'public/icon_stop.png'}"/> </button>
      ${task.title}
      </div>\n`, 
      "");
  };

  TaskVC.prototype.taskForm = function(msg, id, action, title, done) {
    return `<h1>${this.name} form</h1>
    ${msg}: <p class="form">
    <input type="text"     name="title"  value="${title}" placeholder="title"/>
    Done: 
    <input type="checkbox" name="done"   ${done ? 'checked' : ''}/>
    <button type="submit" class="${action}" taskid="${id}">${action}</button>
    </p>
    <button class="list">Go back</button>
    `;
  };


  // CONTROLLERs

  TaskVC.prototype.listController = function() {
    Cookie.set("active", JSON.stringify(this.active), 7);
    Cookie.set("search", JSON.stringify(this.search), 7);
    Cookie.set("order",  JSON.stringify(this.order),  7);
    Cookie.set("itemsOnPage", JSON.stringify(this.itemsOnPage), 7);

    let where = {};
    if (this.active)
      where.done = false;
    if (this.search)
      where.title = ["includes", this.search];

    let that = this;
    let p1 = this.task_model.getAll(where, this.order, (this.currentPage-1)*this.itemsOnPage, this.itemsOnPage);
    let p2 = this.task_model.count(where);
    Promise.all([p1, p2])
    .then(([tasks, count]) => {
      $(this.id).html(this.taskList(tasks));
      $(this.id+' .list_a').html(this.active ? 'All tasks' : 'Active tasks');
      $(this.id+' .iopage').val(this.itemsOnPage);
      $(this.id+' .pagination').pagination({
          items: count,
          itemsOnPage: this.itemsOnPage,
          currentPage: this.currentPage,
          cssStyle: 'compact-theme',
          onPageClick: (pn, e) => {this.currentPage = pn; this.listController(); $(this.id+' .pagination').pagination('drawPage', pn);}  
      });
      if (this.order.title === undefined) {
        $(this.id+' .noorder').show(); $(this.id+' .uporder').hide(); $(this.id+' .doorder').hide();
      } else if (this.order.title) {
        $(this.id+' .noorder').hide(); $(this.id+' .uporder').hide(); $(this.id+' .doorder').show();
      } else { 
        $(this.id+' .noorder').hide(); $(this.id+' .uporder').show(); $(this.id+' .doorder').hide();
      }
      if (this.search) $(this.id+' .search').focus();
    })
    .catch(error => {throw error;});
  };
  $('.collapse').on('hidden.bs.collapse shown.bs.collapse', function () {
    let state = $(this).hasClass('show') ? 'expanded' : 'collapsed';
    Cookie.set($(this).attr('id') + '_state', state, 7); // Guardar estado de colapso en cookies
  });
  $(document).ready(function() {
    $('.collapse').each(function() {
      let state = Cookie.get($(this).attr('id') + '_state');
      if (state === 'collapsed') {
        $(this).collapse('hide'); // Colapsar listas si están en estado 'collapsed'
      }
    });

    // Colapsar automáticamente las listas en pantallas pequeñas
    $(window).resize(function() {
      if ($(window).width() < 768) {
        $('.collapse').collapse('hide');
      }
    });
    $(window).trigger('resize'); // Llamar al cargar para verificar el estado inicial
  });


  TaskVC.prototype.newController = function() {
    $(this.id).html(this.taskForm('New task', null, 'create', '', ''));
    $(this.id+' input[name=title]').focus();
  };

  TaskVC.prototype.editController = function(id) {
    this.task_model.get(id)
    .then(task => {
      $(this.id).html(this.taskForm('Edit task', id, 'update', task.title, task.done));
      $(this.id+' input[name=title]').focus();
    })
    .catch(error => {throw error;});
  };

  TaskVC.prototype.createController = function() {
    this.task_model.create($(this.id+' input[name=title]').val(), $(this.id+' input[name=done]').is(':checked')) 
    .then(() => {this.listController();})
    .catch(error => {throw error;});
  };

  TaskVC.prototype.updateController = function(id) {
    this.task_model.update(id, $(this.id+' input[name=title]').val(), $(this.id+' input[name=done]').is(':checked'))
    .then(() => {this.listController();})
    .catch(error => {throw error;});
  };

  TaskVC.prototype.switchController = function(id) {
    this.task_model.get(id)
    .then(task => {
        return this.task_model.update(id, task.title, !task.done)
        .then(() => {
            return this.listController(); 
        })
        .catch(updateError => {
            console.error("Error al actualizar la tarea: ", updateError);
            
        });
    })
    .catch(getError => {
        console.error("Error al obtener la tarea: ", getError);
        
    });

  };

  TaskVC.prototype.deleteController = function(id) {
    this.task_model.delete(id)
    .then(() => {
        this.listController(); 
    })
    .catch(error => {
        console.error("Error al eliminar la tarea: ", error);
        
    });
};


TaskVC.prototype.resetController = function() {
  this.task_model.reset()
  .then(() => {
      this.listController(); 
  })
  .catch(error => {
      console.error("Error al restablecer las tareas: ", error);
      
  });
};



  // ROUTER

  TaskVC.prototype.eventsController = function() {
    $(document).on('click', this.id+' .list',   () => this.listController());
    $(document).on('click', this.id+' .list_a', () => {this.active = !this.active; this.listController();});
    $(document).on('click', this.id+' .new',    () => this.newController());
    $(document).on('click', this.id+' .edit',   (e)=> this.editController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .create', () => this.createController());
    $(document).on('click', this.id+' .update', (e)=> this.updateController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .switch', (e)=> this.switchController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .delete', (e)=> this.deleteController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .reset',  (e)=> this.resetController());
    $(document).on('input', this.id+' .iopage', () => {this.itemsOnPage = Number($(this.id+' .iopage').val()); this.currentPage = 1; this.listController();});
    $(document).on('input', this.id+' .search', () => {this.search = $(this.id+' .search').val(); this.listController();});
    $(document).on('click', this.id+' .dsearch',() => {this.search = ''; this.listController();});
    $(document).on('click', this.id+' .uporder',() => {this.order = {};             this.listController();});
    $(document).on('click', this.id+' .doorder',() => {this.order = {title: false}; this.listController();});
    $(document).on('click', this.id+' .noorder',() => {this.order = {title: true};  this.listController();});
    $(document).on('keypress', this.id+' .form',(e) => {if (e.keyCode === 13) $(this.id+ " button[type=submit]").trigger("click");});
  };

  // Creation of an object to manage the task model
  this.task_model = new TaskModel(this.id);
  setTimeout(() => {
    this.listController();
    this.eventsController();
  }, 500);
}

// Creation of an object View-Controller for the tasks
let task_vc = new TaskVC();
let task_vch = new TaskVC('Home task', '#home_tasks');
let task_vcu = new TaskVC('University task', '#university_tasks');
});
