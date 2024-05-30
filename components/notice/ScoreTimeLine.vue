<template>
  <el-scrollbar :height="props.height">
    <el-timeline>
      <el-timeline-item
        v-for="(score, index) in props.symbol.scores"
        :key="index"
        :color="score.point > 0 ? '#f44336' : '#2196f3'"
        :timestamp="score.time"
        placement="top"
        size="large"
      >
        {{ score.label }}
      </el-timeline-item>
    </el-timeline>
  </el-scrollbar>
</template>

<script lang="ts" setup>
interface Props {
  height: number;
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});
</script>