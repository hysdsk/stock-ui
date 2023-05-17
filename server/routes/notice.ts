import { io } from "socket.io-client"

const config = useRuntimeConfig()
const socket = io(`http://${config.public.wsHost}:${config.public.wsPort}`);

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event);
  try {
    socket.emit("send-msg", body);
  } catch (e) {
    console.log(e)
  }
  return null;
})
