<template>
  <el-select
    placeholder="銘柄選択"
    filterable
    remote
    :remote-method="candidate"
    @change="goSymbol"
  >
    <el-option
      v-for="symbol in symbols"
      :key="symbol.code"
      :label="`${symbol.code}:${symbol.name}`"
      :value="symbol.code"
    />
  </el-select>
</template>

<script lang="ts" setup>
const symbols = ref([]);
const { data, pending } = useFetch("/api/symbols", { lazy: true });
const candidate = (input: string) => {
  if (input && !pending.value) {
    symbols.value = data.value?.symbols.filter((s: any) => {
      return s.code.includes(input) || s.name.toLowerCase().includes(input.toLowerCase());
    });
  } else {
    symbols.value = [];
  }
}
const goSymbol = (code: string) => window.location.href = `/symbol/${code}`;
</script>
