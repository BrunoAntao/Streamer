const express = require("express");
const httpapp = express();
const app = express();

const http = require('http');
const https = require('https');
const fs = require('fs');
const { dirname } = require("path");

let port = 443;

const options = {

    key: fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/privkey.pem'),
    cert: fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/cert.pem'),
    ca: [
        fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/chain.pem'),
        fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/fullchain.pem')
    ]

};

httpapp.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

const server = https.createServer(options, app);

const io = require("socket.io")(server, {
    cors: {
        origin: '*',
    }
});

let broadcasters = [];

app.use('/', express.static(__dirname + "/client"));

app.get('/watch/*', (req, res) => {

    res.sendFile(__dirname + '/client/watch.html');

})

app.post('/streams', (req, res) => {

    res.json(Object.values(broadcasters));

})

io.sockets.on("error", e => console.log(e));

io.sockets.on("connection", socket => {

    socket.on("broadcaster", (name) => {

        broadcasters[socket.id] = name;
        socket.broadcast.emit("broadcaster");

    });

    socket.on("watcher", (name) => {

        socket.to(Object.keys(broadcasters).find(key => broadcasters[key] === name)).emit("watcher", socket.id);

    });

    socket.on("disconnect", () => {

        delete broadcasters[socket.id];

        //socket.to(broadcasters[name]).emit("disconnectPeer", socket.id);

    });

    socket.on("offer", (id, message) => {

        socket.to(id).emit("offer", socket.id, message);

    });

    socket.on("answer", (id, message) => {

        socket.to(id).emit("answer", socket.id, message);

    });

    socket.on("candidate", (id, message) => {

        socket.to(id).emit("candidate", socket.id, message);

    });

});

http.createServer(httpapp).listen(90, () => {

    console.log(`Server is running on port 80`);

});

server.listen(port, () => {

    console.log(`Server is running on port ${port}`);

});