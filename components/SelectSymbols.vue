<template>
  <el-select
    filterable
    placeholder="銘柄選択"
    :loading="pending"
    @change="goSymbol"
  >
    <el-option
      v-for="symbol in data.symbols"
      :key="symbol.code"
      :label="`${symbol.code}:${symbol.name}`"
      :value="symbol.code"
    />
  </el-select>
</template>

<script lang="ts" setup>
const { data, pending } = useFetch("/api/symbols");
const goSymbol = code => window.location.href = `/symbol/${code}`;
</script>
