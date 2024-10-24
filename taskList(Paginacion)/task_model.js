/*jshint esversion: 6 */

function TaskModel(name = "tasks") {
  this.name = name;

  TaskModel.prototype.initial_tasks = JSON.stringify([
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
  ]);

  localStorage[this.name] = localStorage[this.name] || this.initial_tasks;

  /* Returns the number of elements that meet the conditions (where)
     where:  Object with conditions to filter the elements. Example:
             {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A") */
  TaskModel.prototype.count = function(where = {}) {
    let tasks = JSON.parse(localStorage[this.name]);
    if (Object.keys(where).length === 0)
      return tasks.length;
    else {
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
    let tasks = JSON.parse(localStorage[this.name]);
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
    const task = JSON.parse(localStorage[this.name])[id];
    if (typeof task === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      return JSON.parse(JSON.stringify(task));
    }
  };

  /* Adds a new element
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.create = function(title, done = false) {
    let tasks = JSON.parse(localStorage[this.name]);
    tasks.push({
      title: (title || "").trim(),
      done
    });
    localStorage[this.name] = JSON.stringify(tasks);
  };

  /* Updates the element identified by (id).
     id: Element identification.
     title: String with the task title.
     done: Boolean explaining if the task is done or not. */
  TaskModel.prototype.update = function(id, title, done) {
    let tasks = JSON.parse(localStorage[this.name]);
    if (typeof tasks[id] === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      tasks.splice(id, 1, {
        title: (title || "").trim(),
        done
      });
      localStorage[this.name] = JSON.stringify(tasks);
    }
  };

  /* Deletes the element identified by (id).
     id: Element identification. */
  TaskModel.prototype.delete = function(id) {
    let tasks = JSON.parse(localStorage[this.name]);
    if (typeof tasks[id] === "undefined") {
      throw new Error(`The value of id parameter is not valid.`);
    } else {
      tasks.splice(id, 1);
      localStorage[this.name] = JSON.stringify(tasks);
    }
  };

  // Resets the element list to the initial values
  TaskModel.prototype.reset = function() {
    localStorage[this.name] = this.initial_tasks;
  };

}