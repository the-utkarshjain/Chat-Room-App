const socket = io()

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormbutton = messageForm.querySelector('button')
const sendlocation = document.querySelector('#send-location')
const $message = document.querySelector('#messages')
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationTemplate = document.querySelector('#locationTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const newMessage = $message.lastElementChild

    const styleNewMessage = getComputedStyle(newMessage)
    const marginNewMessage = parseInt(styleNewMessage.marginBottom)
    const heightNewMessage = newMessage.offsetHeight + marginNewMessage

    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - heightNewMessage <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })

    document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (message)=>{
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationmessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    messageFormbutton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        messageFormbutton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log("Message delivered!")
    })
})

sendlocation.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return console.log("Geolocation not supported")
    }

    sendlocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (error) => {

            sendlocation.removeAttribute('disabled')

            if(error){
                return console.log(error)
            }
            console.log("Location shared!")
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href ="/"
    }
})