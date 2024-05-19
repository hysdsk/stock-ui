<template>
  <el-row :gutter="20">
    <el-col :span="4" style="text-align: center">
      <el-text size="large" tag="b" type="primary">{{ data.symbol.symbolName }}</el-text>
    </el-col>
    <el-col :span="14">
      <el-descriptions title="" :column="3" border>
        <el-descriptions-item label="銘柄コード">
          {{ code }}
        </el-descriptions-item>
        <el-descriptions-item label="市場">
          {{ data.symbol.exchangeName }}{{ data.symbol.divisionName }}
        </el-descriptions-item>
        <el-descriptions-item label="業種">
          {{ data.symbol.bisCategoryName }}
        </el-descriptions-item>
        <el-descriptions-item label="決算日">
          {{ data.symbol.fiscalYearEndBasic }}
        </el-descriptions-item>
        <el-descriptions-item label="時価総額">
          {{ data.symbol.marketCapitalization.toLocaleString() }}円
        </el-descriptions-item>
        <el-descriptions-item label="発行済株式数">
          {{ data.symbol.totalStocks.toLocaleString() }}株
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
    <el-col :span="6">
      <div style="display: inline-block; vertical-align: top;">
        <el-icon><Link /></el-icon>
        <el-link
          target="_blank"
          v-bind:href="'https://jp.tradingview.com/chart/?symbol=TSE:' + code"
          >TradingView</el-link
        ><br />

        <el-icon><Link /></el-icon>
        <el-link target="_blank" v-bind:href="'https://karauri.net/' + code"
          >空売り情報</el-link
        >
      </div>
      <div style="display: inline-block; vertical-align: top; margin: 0px 20px 0px 20px">
        <el-icon><Link /></el-icon>
        <el-link target="_blank" v-bind:href="'https://kabutan.jp/stock/?code=' + code"
          >株探</el-link
        ><br />
        <el-icon><Link /></el-icon>
        <el-link
          target="_blank"
          v-bind:href="
            'https://kabuyoho.ifis.co.jp/index.php?sa=report_top&bcode=' + code
          "
          >株予報</el-link
        >
      </div>
      <div style="display: inline-block; vertical-align: top;">
        <el-icon><Link /></el-icon>
        <el-link target="_blank" v-bind:href="'https://ipokabu.net/ipo/' + code"
          >庶民のIPO</el-link
        >
      </div>
      <div style="margin-top: 5px;">
        <DatePicker :from="props.from" :to="props.to" :selected="selected" />
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
dayjs.locale("ja");
import { Link } from "@element-plus/icons-vue";
interface Props {
  code: string;
  chartType: string;
  from: string;
  to: string;
}

const route = useRoute();
const props = withDefaults(defineProps<Props>(), {});
const { data, pending } = await useFetch("/api/symbol/infomation", {
  params: { code: props.code },
});
useHead({ title: `${data.value?.symbol.symbolName}` });

const selected = (val: any) => {
  const from = dayjs(val[0]).format("YYYY-MM-DD");
  const to = dayjs(val[1]).format("YYYY-MM-DD");
  window.location.href = `/symbol/${props.code}/${props.chartType}?from=${from}&to=${to}`
}
</script>
