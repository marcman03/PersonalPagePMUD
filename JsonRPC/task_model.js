'use strict';
/*jshint node: true */
/*jshint esversion: 6 */
const fs = require("fs");

// Nom del fitxer de text on es guarden els elements en format JSON.
const DB_FILENAME = "tasks.json";


// Model de dades.
//
// Aquesta variable guarda tots els elements com un array d'objectes,
// on els atributs de cada objecte són els seus camps.
//
// Al principi aquesta variable conté tres elements, però desprès es crida a load()
// per carregar els elements guardats en el fitxer DB_FILENAME si existeix.
let tasks = [
{
  title: "PMUD HTML exercise",
  done: true
},
{
  title: "PMUD node exercise",
  done: false
},
{
  title: "PMUD practice",
  done: false
}
];


/**
 *  Carrega els elements en format JSON del fitxer DB_FILENAME.
 *
 *  El primer cop que s'executa aquest mètode, el fitxer DB_FILENAME no
 *  existeix, i es produirà l'error ENOENT. En aquest cas es guardarà el
 *  contingut inicial.
 */
const load = () => {
  fs.readFile(DB_FILENAME, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        save();
        return;
      }
      throw err;
    }

    let json = JSON.parse(data);
    if (json) {
      tasks = json;
    }
  });
};


/**
 *  Guarda els elements en format JSON en el fitxer DB_FILENAME.
 */
const save = () => {
  fs.writeFile(DB_FILENAME, JSON.stringify(tasks),
    err => {
      if (err) throw err;
    });
};


/* Returns the number of elements that meet the conditions (where)
   where:  Object with conditions to filter the elements. Example:
           {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A") */
exports.count = (where) => {
  where = (typeof where !== 'undefined') ?  where : {};
  return new Promise((resolve, reject) => {
    if (Object.keys(where).length === 0)
      resolve(tasks.length);
    else {
      let t = tasks.filter(e => {
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
      resolve(t.length);
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
exports.getAll = (where, order, offset, limit) => {
  where  = (typeof where  !== 'undefined') ?  where : {};
  order  = (typeof order  !== 'undefined') ?  order : {};
  offset = (typeof offset !== 'undefined') ?  offset : 0;
  limit  = (typeof limit  !== 'undefined') ?  limit : 0;
  return new Promise((resolve, reject) => {
    tasks.map((e, i) => e.id = i);
    let t = tasks.filter(e => {
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
    t = t.sort((e1, e2) => {
      for (let f in order) {
        if (e1[f] < e2[f])
          return order[f] ? -1 : 1;
        else
          return order[f] ? 1 : -1;
      }
      return 0;
    });
    if (limit===0) {
      resolve(t.slice(offset));
    } else {
      resolve(t.slice(offset, offset+limit));
    }
  });
};


/* Returns the element identified by (id).
   id: Element identification. */
exports.get = id => {
  return new Promise((resolve, reject) => {
    const task = tasks[id];
    if (typeof task === "undefined") {
      reject(new Error(`El valor del parámetro id no es válido.`));
    } else {
      resolve(JSON.parse(JSON.stringify(task)));
    }
  });
};


/* Adds a new element
   title: String with the task title.
   done: Boolean explaining if the task is done or not. */
exports.add = (title, done) => {
  done = (typeof done !== 'undefined') ?  done : false;  
  return new Promise((resolve, reject) => {
    tasks.push({
      title: (title || "").trim(),
      done
    });
    save();
    resolve();
  });
};


/* Updates the element identified by (id).
   id: Element identification.
   title: String with the task title.
   done: Boolean explaining if the task is done or not. */
exports.update = (id, title, done) => {
  return new Promise((resolve, reject) => {
    const task = tasks[id];
    if (typeof task === "undefined") {
      reject(new Error(`El valor del parámetro id no es válido.`));
    } else {
      tasks.splice(id, 1, {
        title: (title || "").trim(),
        done
      });
      save();
      resolve();
    }
  });
};


/* Deletes the element identified by (id).
   id: Element identification. */
exports.delete = id => {
  return new Promise((resolve, reject) => {
    const task = tasks[id];
    if (typeof task === "undefined") {
      reject(new Error(`El valor del parámetro id no es válido.`));
    } else {
      tasks.splice(id, 1);
      save();
      resolve();
    }
  });
};


// Resets the element list to the initial values
exports.reset = function() {
  return new Promise((resolve, reject) => {
    tasks = [
    {
      title: "PMUD HTML exercise",
      done: true
    },
    {
      title: "PMUD node exercise",
      done: false
    },
    {
      title: "PMUD practice",
      done: false
    }
    ];
    save();
    resolve();
  });
};

// Carrega els elements guardats en el fitxer si existeix.
load();
