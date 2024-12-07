/*jshint esversion: 6 */
const jsonrpc = require('node-json-rpc');
const task_model = require('./task_model.js');

const host = 'localhost', port = 3017; // Cambia el puerto según tu asignación
const server = new jsonrpc.Server({host, port});

// Método para contar tareas
server.addMethod('count', (params, callback) => {
    console.log("Method call params for 'count':", params);
    params = Array.isArray(params) ? params : [];
    const where = params[0] || {};
    task_model.count(where)
        .then(total => callback(null, total))
        .catch(err => callback(err));
});

// Método para obtener todas las tareas
server.addMethod('getAll', (params, callback) => {
    console.log("Method call params for 'getAll':", params);
    params = Array.isArray(params) ? params : [];
    const where = params[0] || {};
    const order = params[1] || {};
    const offset = params[2] || 0;
    const limit = params[3] || 0;
    task_model.getAll(where, order, offset, limit)
        .then(tasks => callback(null, tasks))
        .catch(err => callback(err));
});

// Método para obtener una tarea por ID
server.addMethod('get', (params, callback) => {
    console.log("Method call params for 'get':", params);
    if (!Array.isArray(params) || params.length < 1) {
        return callback({code: -32602, message: "Invalid params"});
    }
    task_model.get(params[0])
        .then(task => callback(null, task))
        .catch(err => callback(err));
});

// Método para agregar una nueva tarea
server.addMethod('add', (params, callback) => {
    console.log("Method call params for 'add':", params);
    if (!Array.isArray(params) || params.length < 2) {
        return callback({code: -32602, message: "Invalid params"});
    }
    task_model.add(params[0], params[1])
        .then(() => callback(null, "Task added"))
        .catch(err => callback(err));
});

// Método para actualizar una tarea por ID
server.addMethod('update', (params, callback) => {
    console.log("Method call params for 'update':", params);
    if (!Array.isArray(params) || params.length < 3) {
        return callback({code: -32602, message: "Invalid params"});
    }
    task_model.update(params[0], params[1], params[2])
        .then(() => callback(null, "Task updated"))
        .catch(err => callback(err));
});

// Método para eliminar una tarea por ID
server.addMethod('delete', (params, callback) => {
    console.log("Method call params for 'delete':", params);
    if (!Array.isArray(params) || params.length < 1) {
        return callback({code: -32602, message: "Invalid params"});
    }
    task_model.delete(params[0])
        .then(() => callback(null, "Task deleted"))
        .catch(err => callback(err));
});

// Método para resetear la lista de tareas
server.addMethod('reset', (params, callback) => {
    console.log("Method call params for 'reset':", params);
    task_model.reset()
        .then(() => callback(null, "Tasks reset"))
        .catch(err => callback(err));
});

// Métodos del sistema
server.addMethod('system.listMethods', (params, callback) => {
    console.log("Method call params for 'system.listMethods':", params);
    callback(null, ['count', 'getAll', 'get', 'add', 'update', 'delete', 'reset']);
});

server.addMethod('system.methodHelp', (params, callback) => {
    console.log("Method call params for 'system.methodHelp':", params);
    const method = params[0];
    const help = {
        'count': "Returns the number of tasks matching the given conditions.",
        'getAll': "Returns a list of tasks with optional filters, ordering, offset, and limit.",
        'get': "Gets a task by its ID.",
        'add': "Adds a new task. Parameters: title (string), done (boolean).",
        'update': "Updates a task by ID. Parameters: id (number), title (string), done (boolean).",
        'delete': "Deletes a task by ID.",
        'reset': "Resets the task list to its initial state."
    };
    callback(null, help[method] || "Unknown method");
});

server.addMethod('system.methodSignature', (params, callback) => {
    console.log("Method call params for 'system.methodSignature':", params);
    const method = params[0];
    const signatures = {
        'count': [{where: 'Object'}],
        'getAll': [{where: 'Object', order: 'Object', offset: 'Number', limit: 'Number'}],
        'get': [{id: 'Number'}],
        'add': [{title: 'String', done: 'Boolean'}],
        'update': [{id: 'Number', title: 'String', done: 'Boolean'}],
        'delete': [{id: 'Number'}],
        'reset': []
    };
    callback(null, signatures[method] || "Unknown method");
});

// Iniciar el servidor
server.start(error => {
    if (error) throw error;
    console.log(`JSON-RPC server listening on http://${host}:${port}`);
});
