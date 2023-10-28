<template>
  <el-container>
    <el-main>
      <SymbolInfo :code="code" :chartType="chartType" :from="from" :to="to" />
      <el-tabs v-model="activeName" @tab-change="tabChange">
        <el-tab-pane name="daily-price" label="価格と出来高の推移" />
        <el-tab-pane name="daily-balance" label="融資貸株残高と出来高の推移" />
        <el-tab-pane name="volume-by-price" label="価格帯売買代金" />
        <el-tab-pane name="weekly-balance" label="信用残高の推移" />
      </el-tabs>
      <ChartDailyPrice
        v-if="activeName == 'daily-price'"
        :code="code"
        :from="from"
        :to="to"
      />
      <ChartDailyBalance
        v-if="activeName == 'daily-balance'"
        :code="code"
        :from="from"
        :to="to"
      />
      <ChartVolumeByPrice
        v-if="activeName == 'volume-by-price'"
        :code="code"
        :from="from"
        :to="to"
      />
      <ChartWeeklyBalance
        v-if="activeName == 'weekly-balance'"
        :code="code"
        :from="from"
        :to="to"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
dayjs.locale("ja");

definePageMeta({
  validate: async (route) => {
    return ["daily-price", "daily-balance", "weekly-balance", "volume-by-price"].includes(
      route.params.chart
    );
  },
});

const route = useRoute();
const { code, chart } = route.params;
const queryParams = route.query;
const from = queryParams.from ? queryParams.from : dayjs().subtract(1, "M").format("YYYY-MM-DD");
const to = queryParams.to ? queryParams.to : dayjs().format("YYYY-MM-DD");
const chartType = chart ? chart : "daily-price";
const activeName = ref(chartType);
const tabChange = (name: string) =>
  (window.location.href = `/symbol/${code}/${name}?from=${from}&to=${to}`);
</script>
