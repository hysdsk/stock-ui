import http from "http";
import { Server, Socket }  from "socket.io";

const config = useRuntimeConfig()
const server = http.createServer()
const io = new Server(server, {
    cors:{ origin: [config.public.uiOrigin] }
});

io.on("connection", (socket: Socket) => {
    socket.on("initial", msg => {
        socket.broadcast.emit("initial-notice", msg);
    })
    socket.on("action", msg => {
        socket.broadcast.emit("action-notice", msg);
    })
    socket.on("regular", msg => {
        socket.broadcast.emit("regular-notice", msg);
    })
})

server.listen(config.public.wsPort);

export default defineEventHandler((event) => {})
