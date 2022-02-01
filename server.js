require("dotenv").config();
const { Socket } = require("dgram");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const uuid = require("uuid");
const { ExpressPeerServer } = require("peer");
const PeerServer = ExpressPeerServer(server, {
    debug: true
})
app.use("/peerjs", PeerServer);
app.use(express.static(path.join(__dirname, "./public")))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./templates"));
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", id)
    })
    socket.on("media-received", (RoomId) => {
        console.log("sending to socket =>", socket.id);
        io.to(RoomId).emit("peer-to-peer")
    })

    socket.on("send-message", (message, RoomId, peerId, Clientname) => {
        io.to(RoomId).emit("recive-message", message, peerId, Clientname);

    })
});
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/uuid", (req, res) => {
    res.redirect(`/${uuid.v4()}/${req.query.name}`);
})
app.get("/:room/:name", (req, res) => {
    console.log(req);
    res.render("room", { roomId: req.params.room, name: req.params.name });
});
server.listen(process.env.PORT || 443, () => {
    console.log("Sever is up and runing");
});