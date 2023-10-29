<template>
  <el-date-picker
    v-model="period"
    type="daterange"
    unlink-panels
    range-separator="To"
    start-placeholder="From date"
    end-placeholder="To date"
    :shortcuts="shortcuts"
    size="small"
    @change="props.selected"
  />
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
dayjs.locale("ja");

interface Props {
  from: string;
  to: string;
  selected: () => {};
}

const props = withDefaults(defineProps<Props>(), {});
const period = ref([Date.parse(props.from), Date.parse(props.to)]);
const shortcuts = [
  {
    text: "Last month",
    value: [dayjs().subtract(1, "M").toDate(), dayjs().toDate()],
  },
  {
    text: "Last 3 months",
    value: [dayjs().subtract(3, "M").toDate(), dayjs().toDate()],
  },
  {
    text: "Last 6 months",
    value: [dayjs().subtract(6, "M").toDate(), dayjs().toDate()],
  },
];
</script>
