import { io } from "socket.io-client"

const config = useRuntimeConfig()
const socket = io(`${config.public.wsBaseURL}`);

export default defineEventHandler(async (event: any) => {
  const query = getQuery(event);
  if (!query.hasOwnProperty("type") || query.type == null) {
    throw createError({
        statusCode: 400,
        statusMessage: '"type" required.',
    });
  }
  const body = await readBody(event);
  try {
    socket.emit(String(query.type), body);
  } catch (e) {
    console.log(e)
  }
  return null;
})
