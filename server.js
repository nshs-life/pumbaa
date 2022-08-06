const express = require('express')
const server = express()

server.all("/", (request, response) => {
    response.send("nshs.life.bot is up")
})

function keepAlive() {
    server.listen(3000, () => {
        console.log('server is up')
    })
}

module.exports = keepAlive