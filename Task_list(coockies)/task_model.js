/*jshint esversion: 6 */

function TaskModel(name = "tasks") {
  this.name = name;
  this.initial_tasks = [
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

  this.tasks = JSON.parse(JSON.stringify(this.initial_tasks));

  /* Returns the number of elements that meet the conditions (where)
     where:  Object with conditions to filter the elements. Example:
             {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A") */
  TaskModel.prototype.count = function(where = {}) {
    if (Object.keys(where).length === 0)
      return this.tasks.length;
    else {
      let tasks = this.tasks.filter(e => {
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
      return tasks.length;
    }
  };

  /* Returns (limit) elements that meet the conditions (where) bypassing the first (offset).
     where:  Object with conditions to filter the elements. Example:
             {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A")
     order:  Object with fields+booleans to sort the element. Example:
             {a: true, b: false} Ascending order by a field and descending order by b field.
     offset: First elements to bypass. 0 to start by the first.
     limit:  Number of elements to return. 0 to reach the last. */
  TaskModel.prototype.getAll = function(where = {}, order = {}, offset = 0, limit = 0) {
    let tasks = this.tasks;
    tasks.map((e, i) => e.id = i);
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
    tasks = tasks.sort((e1, e2) => {
      for (let f in order) {
        if (e1[f] < e2[f])
          return order[f] ? -1 : 1;
        else
          return order[f] ? 1 : -1;
      }
      return 0;
    });
    if (limit===0) {
      return tasks.slice(offset);
    } else {
      return tasks.slice(offset, offset+limit);
    }
  };

  /* Returns the element identified by (id).
     id: Element identification. */
  TaskModel.prototype.get = function(id) {
    const task = this.tasks[id];
    if (typeof task === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      return task;
    }
  };

  /* Adds a new element
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.create = function(title, done = false) {
    this.tasks.push({
      title: (title || "").trim(),
      done
    });
  };

  /* Updates the element identified by (id).
     id: Element identification.
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.update = function(id, title, done) {
    if (typeof this.tasks[id] === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      this.tasks.splice(id, 1, {
        title: (title || "").trim(),
        done
      });
    }
  };

  /* Deletes the element identified by (id).
     id: Element identification. */
  TaskModel.prototype.delete = function(id) {
    if (typeof this.tasks[id] === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      this.tasks.splice(id, 1);
    }
  };

  // Resets the element list to the initial values
  TaskModel.prototype.reset = function() {
    this.tasks = JSON.parse(JSON.stringify(this.initial_tasks));
  };

}