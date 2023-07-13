const socket = io() // create a server connection

const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $shareLocationButton = document.querySelector("#share-location")
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (message)=> {
    const html = Mustache.render(messageTemplate,{
        createdAt: moment(message.createdAt).format("h:mm a"), 
        message: message.text,
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on("locationMessage", ( locationMessage)=>{
    console.log(locationMessage)
    const html = Mustache.render(urlTemplate,{
        url : locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format("h:mm a"),
        username : locationMessage.username
    })
    console.log(`html: ${html}`)
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on("roomData", ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room: room,
        users: users
    })
    $sidebar.innerHTML = html
    console.log(users);
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = e.target.elements.message.value 
    socket.emit('sendMessage', msg)    
    $messageFormInput.value = ''
    $messageFormInput.focus()    
    $messageFormButton.removeAttribute('disabled')
})

$shareLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by you browser")
    }
    $shareLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        loc = {latitude:position.coords.latitude, longitude: position.coords.longitude}
        socket.emit('shareLocation', loc, (error)=>{
            console.log("Location shared")
        }) 
    })
    $shareLocationButton.removeAttribute('disabled')
})

socket.emit("join", {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/' // this is the root of the site
    }
})