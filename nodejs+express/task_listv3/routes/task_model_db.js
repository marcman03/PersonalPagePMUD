'use strict';
/*jshint node: true */
/*jshint esversion: 6 */
const Sequelize = require('sequelize');

const options = { logging: false, operatorsAliases: false};
const sequelize = new Sequelize("sqlite:tasks.db", options);
const Op = Sequelize.Op;

const task = sequelize.define(
  'task', 
  { title: { 
    type: Sequelize.STRING,
    unique: { msg: "Task already exists"},
    allowNull: false,
  },
  done: {
    type: Sequelize.BOOLEAN,
  }
}
);

sequelize.sync()
.then(() => task.count())
.then( count => {
  if (count===0) {
    task.bulkCreate([
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
    ])
    .then( c => console.log(`  DB created with ${c.length} elems`));
  } else {
    console.log(`  DB exists & has ${count} elems`);
  }
})
.catch( err => console.log(`   ${err}`));


/* Returns the number of elements that meet the conditions (where)
   where:  Object with conditions to filter the elements. Example:
           {a: 3, b: ['<', 5], c: ['includes', "A"]} computes a===3 && b<5 && c.includes("A") */
exports.count = (where) => {
  where = (typeof where !== 'undefined') ?  where : {};
  for (let c in where) {
    if (where[c] instanceof Array) {
      let operator = where[c][0];
      let val = where[c][1];
      switch(operator) {
        case "includes":
          where[c] = {[Op.like]: '%'+val+'%'};
          break;
        case "!==":
          where[c] = {[Op.ne]: val};
          break;
        case "<":
          where[c] = {[Op.lt]: val};
          break;
        case "<=":
          where[c] = {[Op.lte]: val};
          break;
        case ">":
          where[c] = {[Op.gt]: val};
          break;
        case ">=":
          where[c] = {[Op.gte]: val};
          break;
      }
    }
  }
  return task.count({where})
  .then( count => count)
  .catch( err => {throw err;});
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
  for (let c in where) {
    if (where[c] instanceof Array) {
      let operator = where[c][0];
      let val = where[c][1];
      switch(operator) {
        case "includes":
          where[c] = {[Op.like]: '%'+val+'%'};
          break;
        case "!==":
          where[c] = {[Op.ne]: val};
          break;
        case "<":
          where[c] = {[Op.lt]: val};
          break;
        case "<=":
          where[c] = {[Op.lte]: val};
          break;
        case ">":
          where[c] = {[Op.gt]: val};
          break;
        case ">=":
          where[c] = {[Op.gte]: val};
          break;
      }
    }
  }
  let ord = [];
  for (let f in order) {
    if (order[f])
      ord.push([f, 'ASC']);  // Ascending order
    else
      ord.push([f, 'DESC']); // Descending order  
  }
  if (limit===0) {
    return task.findAll({where, order: ord, offset})
    .then( tasks => tasks)
    .catch( err => {throw err;});
  } else {
    return task.findAll({where, order: ord, offset, limit})
    .then( tasks => tasks)
    .catch( err => {throw err;});
  }
};


/* Returns the element identified by (id).
   id: Element identification. */
exports.get = id => {
  return task.findOne( {where: {id}})
  .then( task => {
    if (!task) {throw new Error(`The value of id parameter is not valid.`);}
    return task;
  })
  .catch( err => {throw err;});
};


/* Adds a new element
   title: String with the task title.
   done: Boolean explaining if the task is done or not. */
exports.add = (title, done) => {
  done = (typeof done !== 'undefined') ?  done : false;  
  title = (title || "").trim();
  return task.create({title, done})
  .catch( err => {throw err;});
};


/* Updates the element identified by (id).
   id: Element identification.
   title: String with the task title.
   done: Boolean explaining if the task is done or not. */
exports.update = (id, title, done) => {
  title = (title || "").trim();
  return task.update({title, done}, {where: {id}})
  .then( n => {
    if (n[0]===0) { throw new Error(`The value of id parameter is not valid.`); }
  })
  .catch( err => {throw err;});
};


/* Deletes the element identified by (id).
   id: Element identification. */
exports.delete = id => {
  return task.destroy({where: {id}})
  .then( n => {
    if (n===0) { 
      throw new Error(`The value of id parameter is not valid.`);
    }
  })
  .catch( err => {throw err;});
};


// Resets the element list to the initial values
exports.reset = function() {
  task.destroy({where: {'title': {[Op.like]: '%'}}})
  .then( () => {
    console.log('  DB deleted');
    task.bulkCreate([
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
    ])
    .then( c => console.log(`  DB created with ${c.length} elems`));
  });
};