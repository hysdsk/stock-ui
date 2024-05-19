<template>
  <el-page-header title="Home" @back="goHome">
    <template #content>
      <el-space wrap>
        <SelectSymbols />
        <el-dropdown @command="goSearched" :teleported="false">
          <el-button>
            銘柄一覧<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="increase-volume"
                >出来高増加</el-dropdown-item
              >
              <el-dropdown-item command="increase-price"
                >支持線上</el-dropdown-item
              >
              <el-dropdown-item command="increase-sell-balance"
                >踏み上げ期待</el-dropdown-item
              >
              <el-dropdown-item command="low-rank"
                >仕手上げ期待</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="goNotices"> 通知受信 </el-button>
      </el-space>
    </template>
    <template #extra>
      <div style="padding-right: 1em">
        <el-space>
          <el-switch
            v-model="isAudio"
            size="large"
            style="--el-switch-on-color: #455a64; --el-switch-off-color: #455a64"
            inline-prompt
            :active-icon="Bell"
            :inactive-icon="MuteNotification"
          />
          <el-switch
            :key="isDarkKey"
            v-model="isDark"
            size="large"
            style="--el-switch-on-color: #455a64; --el-switch-off-color: #455a64"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
          />
          </el-space>
        </div>
    </template>
  </el-page-header>
  <slot />
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useState } from "#app";
import { useDark } from "@vueuse/core";
import { ArrowDown, Moon, Sunny, Bell, MuteNotification } from "@element-plus/icons-vue";
import "element-plus/theme-chalk/dark/css-vars.css";

const isAudio = useState("isAudio", () => ref(false));
const isDark = useDark();
const isDarkKey = ref(0);

const goHome = () => (window.location.href = "/");
const goSearched = (key: string) => (window.location.href = `/search/${key}`);
const goNotices = () => (window.location.href = "/notices");

useHead({
  titleTemplate: (title) => {
    return title == "Lorenzini" ? "Lorenzini" : `${title} - Lorenzini`;
  }
});
onMounted(() => {
  // テーマ同期のためel-switchを強制的に再レンダリングする
  isDarkKey.value++;
});
</script>
