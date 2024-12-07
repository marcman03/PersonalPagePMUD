const jsonrpc = require('node-json-rpc');

const client = new jsonrpc.Client({host: 'localhost', port: 3017, path: '/'});
const task_titles = ['Conference', 'Talk', 'Exam', 'Exercise', 'Practice'];
let i = 0;

setInterval(() => {
    client.call({"method": "add", "params": [task_titles[i], false]}, (err, res) => {
        if (err) return console.error(err);
        console.log("Added task:", res);
        i = (i + 1) % task_titles.length;

        client.call({"method": "getAll"}, (err, res) => {
            if (err) return console.error(err);
            console.log("All tasks:", res);
        });
    });
}, 5000);
    