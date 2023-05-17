import http from "http";
import { Server, Socket }  from "socket.io";

const config = useRuntimeConfig()
const server = http.createServer()
const io = new Server(server, {
    cors:{
        origin: [`http://${config.public.uiHost}:${config.public.uiPort}`]
    }
});

io.on("connection", (socket: Socket) => {
    // console.log(`socket_id: ${socket.id} is connected.`);
    socket.on("send-msg", msg => {
        socket.broadcast.emit("new-msg", msg);
    })
})

server.listen(config.public.wsPort);

export default defineEventHandler((event) => {})
