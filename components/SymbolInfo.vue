<template>
  <el-row :gutter="20">
    <el-col :span="4" style="text-align: center;">
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
    <el-col :span="2">
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://jp.tradingview.com/chart/?symbol=TSE:' + code">TradingView</el-link><br/>
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://tyn-imarket.com/stocks/search?query=' + code">iMarket</el-link><br/>
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://karauri.net/' + code">空売り情報</el-link>
    </el-col>
    <el-col :span="2">
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://kabutan.jp/stock/?code=' + code">株探</el-link><br/>
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://kabuyoho.ifis.co.jp/index.php?sa=report_top&bcode=' + code">株予報</el-link><br/>
      <el-icon><Link /></el-icon> <el-link target="_blank" v-bind:href="'https://ipokabu.net/ipo/' + code">庶民のIPO</el-link>
    </el-col>
    <el-col :span="2">
      <el-icon><Link /></el-icon> <el-link :href="`${route.path}?period=1`">直近一ヵ月</el-link><br/>
      <el-icon><Link /></el-icon> <el-link :href="`${route.path}?period=2`">直近二ヵ月</el-link><br/>
      <el-icon><Link /></el-icon> <el-link :href="`${route.path}?period=3`">直近三ヵ月</el-link>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
  import { Link } from "@element-plus/icons-vue"
  interface Props {
    code: string
  }

  const route = useRoute();
  const props = withDefaults(defineProps<Props>(), { code: null })
  const { data, pending } = await useFetch(`/api/symbol/infomation`, {params: { code: props.code }});
  useHead({title: `${data._value.symbol.symbolName}`})
</script>
