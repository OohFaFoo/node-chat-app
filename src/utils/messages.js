const generateMessage = (username, text)=>{
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username, url)=>{
    url = "https://google.com/maps?q=" + url
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}