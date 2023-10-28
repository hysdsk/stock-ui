<template>
  <el-container>
    <el-main>
      <SymbolInfo :code="code" />
      <el-tabs
        v-model="activeName"
        @tab-change="tabChange"
      >
        <el-tab-pane name="daily-price" label="価格と出来高の推移" />
        <el-tab-pane name="daily-balance" label="融資貸株残高と出来高の推移" />
        <el-tab-pane name="volume-by-price" label="価格帯売買代金" />
        <el-tab-pane name="weekly-balance" label="信用残高の推移" />
      </el-tabs>
      <ChartDailyPrice    v-if="activeName == 'daily-price'" :code="code" :period="period" />
      <ChartDailyBalance  v-if="activeName == 'daily-balance'" :code="code" :period="period" />
      <ChartVolumeByPrice v-if="activeName == 'volume-by-price'" :code="code" :period="period" />
      <ChartWeeklyBalance v-if="activeName == 'weekly-balance'" :code="code" :period="period" />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
  definePageMeta({
    validate: async(route) => {
      return [
        "daily-price",
        "daily-balance",
        "weekly-balance",
        "volume-by-price"
      ].includes(route.params.chart)
    }
  })

  const route = useRoute();
  const { code, chart } = route.params;
  const queryParams = route.query;
  const period = queryParams.period ? Number(queryParams.period) : 1;
  const chartType = chart ? chart : "daily-price";
  const activeName = ref(chartType)
  const tabChange = (name) => window.location.href = `/symbol/${code}/${name}?period=${period}`;
</script>
