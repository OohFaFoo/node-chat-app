const users = []

const addUser = ({id, username, room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {error: "username and room must be provided"}
    }

    // Check for exting user
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {error: username + " is already taken in the " + room + " room"}
    }

    const user = {id,username,room}
    users.push(user)
    
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id)

    if(index === -1){
        return {error: "user not found"}
    }

    return users.splice(index,1)[0]
}

const getUser = (id) => {
    const index = users.findIndex((user)=> user.id === id)

    return users[index]
}

const getUsersInRoom = (room) => {
    if(room){
        room = room.trim().toLowerCase()
    }
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}