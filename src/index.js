//Including neccessary library
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

//Including local function
const {generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT||3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New connection is up!')
    
    //Listening for new joinees
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('message',generateMessage('System','Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage('System',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    //Listening for sendMessage connection
    socket.on('sendMessage', (value, callback) => {
        const user = getUser(socket.id)
        if(user){
            const filter = new Filter()

            if(filter.isProfane(value)){
                return callback("Profanity is not allowed in this chat room!")
            }

            io.to(user.room).emit('message', generateMessage(user.username, value))
            callback()
        }
    })

    //Listening for sendLocation connection
    socket.on('sendLocation', ({latitude, longitude} = {}, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationmessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
            callback()
        }
    })

    //Listening if any user disconnects
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('System',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, ()=>{
    console.log(`Server is running up on ${port}!`)
})