const path = require('path')
const http = require("http")
const express = require('express')
const socketio = require("socket.io")
const {generateMessage, generateLocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {addUser, removeUsers, getUser, getUsersInRoom, removeUser} = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

console.log(__dirname)
console.log(publicDirectoryPath)

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    //console.log(`New web socket connection - ${new Date()}`)

    socket.on('join',({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username,room})

        if(error){
            return callback(error)
        }

        console.log("joining: ",user.id)
        socket.join(user.room)
        socket.emit('message', generateMessage('admin','Failte!'))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${user.username} has joined!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, msg))
    })

    socket.on('shareLocation', (loc, callback)=>{
        const user = getUser(socket.id)
        const locString = `${loc.latitude},${loc.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, locString))
        callback()
    })

    socket.on('disconnect',(id)=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            console.log("removing: ", socket.id)
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})