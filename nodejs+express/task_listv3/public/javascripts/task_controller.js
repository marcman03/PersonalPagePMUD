/*jshint esversion: 6 */
$(function() {

function TaskC(name = "Task", id = "#tasks") {
  this.name = name;
  this.id = id;
  this.active = Cookie.get("active") ? JSON.parse(Cookie.get("active")) : false;
  this.search = Cookie.get("search") ? JSON.parse(Cookie.get("search")) : "";
  this.order  = Cookie.get("order")  ? JSON.parse(Cookie.get("order"))  : {};
  this.itemsOnPage = Cookie.get("itemsOnPage") ? JSON.parse(Cookie.get("itemsOnPage")) : 10;
  this.currentPage = Cookie.get("currentPage") ? JSON.parse(Cookie.get("currentPage")) : 1;

  // CONTROLLERs

  TaskC.prototype.listController = function() {
    Cookie.set("active", JSON.stringify(this.active), 7);
    Cookie.set("search", JSON.stringify(this.search), 7);
    Cookie.set("order",  JSON.stringify(this.order),  7);
    Cookie.set("itemsOnPage", JSON.stringify(this.itemsOnPage), 7);
    Cookie.set("currentPage", JSON.stringify(this.currentPage), 7);
    window.location.href = window.location.pathname.split('/').slice(0,2).join('/');
  };

  TaskC.prototype.newController = function() {
    window.location.href = window.location.pathname + '/add';
  };

  TaskC.prototype.editController = function(id) {
    window.location.href = window.location.pathname + '/edit/' + id;
  };

  TaskC.prototype.switchController = function(id) {
    window.location.href = window.location.pathname + '/switch/' + id;
  };

  TaskC.prototype.deleteController = function(id, title) {
    if (confirm(`Delete: ${title}`))
      window.location.href = window.location.pathname + '/delete/' + id;
  };

  TaskC.prototype.resetController = function() {
    window.location.href = window.location.pathname + '/reset';
  };


  // ROUTER
  TaskC.prototype.eventsController = function() {
    $(document).on('click', this.id+' .list',   () => this.listController());
    $(document).on('click', this.id+' .list_a', () => {this.active = !this.active; this.listController();});
    $(document).on('click', this.id+' .new',    () => this.newController());
    $(document).on('click', this.id+' .edit',   (e)=> this.editController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .switch', (e)=> this.switchController(Number($(e.currentTarget).attr('taskid'))));
    $(document).on('click', this.id+' .delete', (e)=> this.deleteController(Number($(e.currentTarget).attr('taskid')), $(e.currentTarget).attr('tasktitle')));
    $(document).on('click', this.id+' .reset',  (e)=> this.resetController());
    $(document).on('input', this.id+' .iopage', () => {this.itemsOnPage = Number($(this.id+' .iopage').val()); this.currentPage = 1; this.listController();});
    $(document).on('input', this.id+' .search', () => {this.search = $(this.id+' .search').val(); this.listController(); $(this.id+' .search').focus();});
    $(document).on('click', this.id+' .dsearch',() => {this.search = ''; this.listController();});
    $(document).on('click', this.id+' .uporder',() => {this.order = {};             this.listController();});
    $(document).on('click', this.id+' .doorder',() => {this.order = {title: false}; this.listController();});
    $(document).on('click', this.id+' .noorder',() => {this.order = {title: true};  this.listController();});
    // $(document).on('keypress', this.id+' .form',(e)=> {if (e.keyCode === 13) $(this.id+ " button[type=submit]").trigger("click");});
  };

  $(this.id+' .pagination').pagination({
    items: $(this.id+' .items').val(), // Gets the number of items from a hidden input form field
    itemsOnPage: this.itemsOnPage,
    currentPage: this.currentPage,
    cssStyle: 'compact-theme',
    onPageClick: (pn, e) => {this.currentPage = pn; this.listController(); $(this.id+' .pagination').pagination('drawPage', pn);}  
  });

  this.eventsController();
}

// Creation of an object Controller for the tasks
let task_c = new TaskC();
});
