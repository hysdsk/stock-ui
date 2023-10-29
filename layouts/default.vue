<template>
  <el-page-header title="Home" @back="goHome">
    <template #content>
    <el-space wrap>
      <SelectSymbols />
      <el-dropdown @command="goSearched">
        <el-button>
          銘柄一覧<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="increase-volume">出来高増加</el-dropdown-item>
            <el-dropdown-item command="increase-price">支持線上</el-dropdown-item>
            <el-dropdown-item command="increase-sell-balance">踏み上げ期待</el-dropdown-item>
            <el-dropdown-item command="low-rank">仕手上げ期待</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button @click="goNotices">
        通知受信
      </el-button>
    </el-space>
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
import { ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core'
import { Search, Moon, Sunny, ArrowDown } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const goHome = () => window.location.href = "/";
const goSearched = (key: string) => window.location.href = `/search/${key}`;
const goNotices = () => window.location.href = "/notices";

useHead({
  titleTemplate: (title) => {
    return title == "Lorenzini" ? "Lorenzini" : `${title} - Lorenzini`
  },
})
</script>
