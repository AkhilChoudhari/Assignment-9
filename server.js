/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
"use strict";
var express = require("express"),
    http = require("http"),
    mongoose = require("mongoose"),
    Socket_Io = require("socket.io"),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

mongoose.connect("mongodb://localhost/amazeriffic");

var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);
var server = http.createServer(app);
var io = new Socket_Io(server);
server.listen(3000);
console.log("listening on port : 3000");

io.on("connection", function(socket) {
    console.log("User connected");
    socket.on("add", function(data) {
        console.log("Broadcast Emit");
        io.sockets.emit("newToDO", data);
    });
});

app.get("/todos.json", function(req, res) {
    ToDo.find({}, function(err, toDos) {
        res.json(toDos);
    });
});

app.post("/todos", function(req, res) {
    console.log(req.body);
    var newToDo = new ToDo({
        "description": req.body.description,
        "tags": req.body.tags
    });
    newToDo.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send("ERROR");
        } else {
            console.log(result);
            ToDo.find({}, function(err, result) {
                if (err !== null) {
                    res.send("ERROR");
                }
                res.json(result);
            });
        }
    });
});