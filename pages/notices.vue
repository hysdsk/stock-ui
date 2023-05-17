<template>
  <div v-for="msg in msgs">
    {{ msg }}
  </div>
</template>

<script setup>
  import { io } from "socket.io-client"
  import { ref, onMounted } from "vue";
  
  const config = useRuntimeConfig()
  const msgs = ref([])
  onMounted(() => {
    const socket = io(`http://${config.public.wsHost}:${config.public.wsPort}`);
    socket.on("new-msg", msg => {
      msgs.value.push(msg)
    });
  })
</script>
