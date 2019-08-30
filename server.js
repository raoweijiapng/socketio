const  express = require('express');
const  app = express();

const server = require('http').createServer(app);

const io = require('socket.io').listen(server);

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
        io.sockets.emit('new message',{msg:data,user:socket.username});
    });

    socket.on('send user',function(data, callback){
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