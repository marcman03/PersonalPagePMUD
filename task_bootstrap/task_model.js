/*jshint esversion: 6 */

function TaskModel(name = "tasks") {
  this.name = name;

  let task_store_schema = {
    name: 'task',
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      {
        keyPath: 'title'
      },
    ],
  };
  let schema = {
    stores: [
      task_store_schema
    ]
  };

  TaskModel.prototype.initial_tasks = [
  {
    title: "PMUD HTML exercise",
    done: true
  },
  {
    title: "PMUD CSS exercise",
    done: false
  },
  {
    title: "PMUD JavaScript exercise",
    done: false
  }
  ];

  /* Returns the number of elements that meet the conditions (where)
     where:  Object with conditions to filter the elements. Example:
             {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A") */
  TaskModel.prototype.count = function(where = {}) {
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0)
        this.db.count('task')
        .done(n => resolve(n));
      else {
        this.db.from('task').list()
        .done(tasks => {
          tasks = tasks.filter(e => {
            for (let f in where) {
              let ok = false;
              if (where[f] instanceof Array) {
                let operator = where[f][0];
                let val = where[f][1];
                switch(operator) {
                  case "includes":
                    ok = e[f].includes(val);
                    break;
                  case "!==":
                    ok = e[f] !== val;
                    break;
                  case "<":
                    ok = e[f] < val;
                    break;
                  case "<=":
                    ok = e[f] <= val;
                    break;
                  case ">":
                    ok = e[f] > val;
                    break;
                  case ">=":
                    ok = e[f] >= val;
                    break;
                }
              } else {// No operator means === operator
                ok = e[f] === where[f];
              }
              if (!ok) return false;
            }
            return true;
          });
          resolve(tasks.length);
        })  
        .fail(error => reject(error));
      }
    });
  };

  /* Returns (limit) elements that meet the conditions (where) bypassing the first (offset).
     where:  Object with conditions to filter the elements. Example:
             {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A")
     order:  Object with fields+booleans to sort the element. Example:
             {a: true, b: false} Ascending order by a field and descending order by b field.
     offset: First elements to bypass. 0 to start by the first.
     limit:  Number of elements to return. 0 to reach the last. */
  TaskModel.prototype.getAll = function(where = {}, order = {}, offset = 0, limit = 0) {
    // this.db.values('task', key_range, limit, offset, reverse)
    //return this.db.values('task');
    return new Promise((resolve, reject) => {
      let q = this.db.from('task');
      for (let f in order) {
        q = q.order(f);
        if (!order[f]) q = q.reverse();
      }
      q.list()
      .done(tasks => {
        tasks = tasks.filter(e => {
          for (let f in where) {
            let ok = false;
            if (where[f] instanceof Array) {
              let operator = where[f][0];
              let val = where[f][1];
              switch(operator) {
                case "includes":
                ok = e[f].includes(val);
                break;
                case "!==":
                ok = e[f] !== val;
                break;
                case "<":
                ok = e[f] < val;
                break;
                case "<=":
                ok = e[f] <= val;
                break;
                case ">":
                ok = e[f] > val;
                break;
                case ">=":
                ok = e[f] >= val;
                break;
              }
            } else {// No operator means === operator
              ok = e[f] === where[f];
            }
            if (!ok) return false;
          }
          return true;
        });
        if (limit===0)
          resolve(tasks.slice(offset));
        else
          resolve(tasks.slice(offset, offset+limit));
      })
      .fail(error => reject(error));
    });
  };

  /* Returns the element identified by (id).
     id: Element identification. */
  TaskModel.prototype.get = function(id) {
    return new Promise((resolve, reject) => {
      this.db.get('task', id)
      .done(task => {
        if (task === undefined)
          reject(new Error(`The value of id parameter is not valid.`));
        resolve(task);
      })
      .fail(error => reject(error));
    });
  };

  /* Adds a new element
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.create = function(title, done = false) {
    let data = {
      title: (title || "").trim(),
      done,
    };
    return new Promise((resolve, reject) => {
      this.db.add('task', data)
      .done(id => resolve(id))
      .fail(error => reject(error));
    });
  };

  /* Updates the element identified by (id).
     id: Element identification.
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.update = function(id, title, done) {
    let data = {
      id,
      title: (title || "").trim(),
      done,
    };
    return new Promise((resolve, reject) => {
      this.db.put('task', data)
      .done(id => resolve(id))
      .fail(error => reject(error));
    });
  };

  /* Deletes the element identified by (id).
     id: Element identification. */
  TaskModel.prototype.delete = function(id) {
    return new Promise((resolve, reject) => {
      this.db.remove('task', id)
      .done(n => {
        if (n===0)
          reject(new Error(`The value of id parameter is not valid.`));
        resolve(n);
      });
    });
  };

  // Resets the element list to the initial values
  TaskModel.prototype.reset = function() {
    return new Promise((resolve, reject) => {
      this.db.clear('task')
      .done(() => {
        this.db.addAll('task', this.initial_tasks)
        .done(ids => resolve(ids))
        .fail(errors => reject(errors));
      });
    });
  };

  this.db = new ydn.db.Storage(this.name, schema);
  let that = this;
  this.db.onReady(e => {
    if (e) throw e;
    that.db.count('task')
    .done(n => {
      if(n === 0) {
        that.reset()
        .then(ids => console.log(`Added ${ids.length} tasks.`))
        .catch(error => {throw error;});
      }
    });
  });

}