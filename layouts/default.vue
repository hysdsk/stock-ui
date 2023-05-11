<template>
  <el-page-header title="Home" @back="goHome">
    <template #content>
      <el-select v-model="target" filterable placeholder="銘柄選択">
        <el-option
          v-for="symbol in data.symbols"
          :key="symbol.code"
          :label="`${symbol.code}:${symbol.name}`"
          :value="symbol.code"
        />
      </el-select>
      <el-button text @click="goSymbol">
        銘柄情報へ
      </el-button>
    </template>
  </el-page-header>
  <slot />
</template>

<script setup>
import { ref } from 'vue'

const { data } = useFetch("/api/symbols");
const target = ref('')

const goHome = () => {
  window.location.href = "/";
}

const goSymbol = () => {
  const exists = data.value.symbols.map(s => s.code).includes(target.value);
  if (exists) {
    window.location.href = `/symbol/${target.value}`;
  } else {
    ElMessage.error("Not found symbol.")
  }
}
</script>
