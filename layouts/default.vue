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
      <el-button text @click="goNotices">
        通知受信へ
      </el-button>
    </template>
    <template #extra>
      <div style="padding-right: 1em;">
        <el-switch
          v-model="isDark"
          size="large"
          style="--el-switch-on-color: #455a64; --el-switch-off-color: #cfd8dc"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          :change="toggleDark"
        />
      </div>
    </template>
  </el-page-header>
  <slot />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sunny } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'

const isDark = useDark({"dark": false, "light": true});
const toggleDark = useToggle(isDark);

const { data } = useFetch("/api/symbols");
const target = ref('');

const goHome = () => {
  window.location.href = "/";
}

const goSymbol = () => {
  const exists = data.value.symbols?.map(s => s.code).includes(target.value);
  if (exists) {
    window.location.href = `/symbol/${target.value}`;
  } else {
    ElMessage.error("Not found symbol.")
  }
}

const goNotices = () => {
  window.location.href = "/notices";
}
</script>
