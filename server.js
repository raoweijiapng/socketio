const  express = require('express');
const  app = express();

const server = require('http').createServer(app);

const io = require('socket.io').listen(server);

var su={};
users  = [ ];
connections =[ ];

server.listen(process.env.PORT || 2000);
console.log("server running on port 2000");

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

io.sockets.on('connection',function(socket){
    connections.push(socket);
    console.log('user connected: %s  online',connections.length);

    socket.on('disconnect',function(data){
        if(socket.username){
            users.splice(users.indexOf(socket.username),1);
            updateUsers();
        }
        connections.splice(connections.indexOf(socket),1);
        console.log('user connected: %s  online',connections.length);
    });

    socket.on('send message',function(data){
        if(data.substring(0,1)=='@'){
            socket.emit("new message",{msg:data,user:socket.username});
            var i = data.indexOf(" ");
            var u = data.substring(1,i);
            var m = data.substring(i,data.length);
            if(typeof su[u] != 'undefined'){
                su[u].emit('new message',{msg:"[private]"+data.substring(i,data.length),user:socket.username});
            }
        }else{
            io.sockets.emit('new message',{msg:data,user:socket.username});
        }
    });

    socket.on('send user',function(data, callback){
        su[data]=socket;
        if(users.indexOf(data) != -1){
            callback(false);
        }else{
            callback(true);
            socket.username =  data;
            users.push(socket.username);
            updateUsers();
        }
    });

    function updateUsers(){
        io.sockets.emit('get users', users);
    }

});