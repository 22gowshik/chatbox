const path = require('path');
const express = require('express');
const app = express();
const http=require('http');
const server=http.createServer(app);
const socketio=require('socket.io');
const io=socketio(server);
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser, userLeave,
    getRoomUsers}=require('./utils/users');

app.use(express.static(path.join(__dirname,'chat')));
 const botName ='CHATBOX';

io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);

        socket.join(user.room);
        console.log('New WS Connection...');

    socket.emit('message',formatMessage(botName,'welcome to chat'));

    socket.broadcast
    .to(user.room)
    .emit(
        'message',
        formatMessage(botName,`${user.username} joined the chat`)); 

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    });

    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
        console.log(msg);
    });
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
        }
    });

})
const PORT = 3000 || process.env.PORT;
server.listen(PORT, ()=> console.log(`serve running on the port ${PORT}`));