//Function for returning an object with username, message and createdAt tag
const generateMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

//Function for returning an object with username, location and createdAt tag
const generateLocationMessage = (username,text) => {
    return{
        username,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}