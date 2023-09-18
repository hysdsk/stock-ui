<template>
  <el-container>
    <el-main>
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
      <el-tabs>
        <el-tab-pane label="価格と出来高の推移">
          <canvas id="stockChart"></canvas>
        </el-tab-pane>
        <el-tab-pane label="融資貸株残高と出来高の推移">
          <canvas id="volumeChart"></canvas>
        </el-tab-pane>
        <el-tab-pane label="信用残高の推移">
          <canvas id="balanceChart"></canvas>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
  import Chart from 'chart.js/auto';
  import { onMounted } from 'vue';
  import { Link } from '@element-plus/icons-vue'

  const route = useRoute();
  const { code } = route.params;
  const queryParams = route.query;
  const { data } = useFetch("/api/symbol", {params: {
    code: code,
    period: queryParams.period === undefined ? 1 : queryParams.period
  }});
  onMounted(() => {
    new Chart(document.getElementById("stockChart"), {
      data: {
        labels: data._value.dailyInfoForChart.openingDate,
        datasets: [{
          type: 'bar',
          label: "実態",
          data: data._value.dailyInfoForChart.priceBody,
          backgroundColor: data._value.dailyInfoForChart.tickColor,
          order: 1,
          yAxisID: "price",
          barPercentage: 1.1
        },{
          type: 'bar',
          label: "ヒゲ",
          data: data._value.dailyInfoForChart.highAndLow,
          backgroundColor: data._value.dailyInfoForChart.tickColor,
          order: 1,
          yAxisID: "price",
          barPercentage: 0.1
        },{
          type: 'line',
          label: "VWAP",
          data: data._value.dailyInfoForChart.vwap,
          borderColor: "#CFD8DC",
          backgroundColor: "#CFD8DC",
          order: 1,
          yAxisID: "price"
        },{
          type: "bar",
          label: "出来高",
          data: data._value.dailyInfoForChart.tradingVolume,
          backgroundColor: "#FFEE58",
          order: 5,
          yAxisID: "volume",
          barPercentage: 0.8
        }]
      },
      options: {
        scales: {
          price: { 
            type: "linear",
            position: "right",
            beginAtZero: false
          },
          volume: {
            type: "linear",
            position: "left"
          },
          x: {
            stacked: true
          }
        },
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

    new Chart(document.getElementById("volumeChart"), {
      data: {
        labels: data._value.dailyInfoForChart.openingDate,
        datasets: [{
          type: "bar",
          label: "出来高",
          data: data._value.dailyInfoForChart.tradingVolume,
          backgroundColor: "#FFEE58",
          order: 2,
          yAxisID: "volume",
          stack: "Volume"
        },{
          type: 'bar',
          label: "融資残",
          data: data._value.dailyInfoForChart.loaningBalance,
          backgroundColor: "#ff1744",
          order: 2,
          yAxisID: "volume",
          stack: "Buy"
        },{
          type: 'bar',
          label: "貸株残",
          data: data._value.dailyInfoForChart.lendingBalance,
          backgroundColor: "#00E676",
          order: 2,
          yAxisID: "volume",
          stack: "Sell"
        },{
          type: "line",
          label: "回転日数",
          data: data._value.dailyInfoForChart.rotationDays,
          borderColor: "#CFD8DC",
          backgroundColor: "#CFD8DC",
          order: 1,
          yAxisID: "days",
          stack: "Volume"
        }]
      },
      options: {
        scales: {
          days: { 
            type: "linear",
            position: "right"
          },
          volume: {
            type: "linear",
            position: "left"
          },
          x: {
            stacked: true
          }
        },
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

    new Chart(document.getElementById("balanceChart"), {
      data: {
        labels: data._value.weeklyInfoForChart.weekendDate,
        datasets: [{
          type: 'line',
          label: "貸付残高回帰直線",
          data: data._value.weeklyInfoForChart.lendBalanceRegressionLine,
          pointRadius: 0,
          borderColor: "#2979FF"
        },{
          type: 'line',
          label: "信用買残回帰直線",
          data: data._value.weeklyInfoForChart.buyBalanceRegressionLine,
          pointRadius: 0,
          borderColor: "#ff1744"
        },{
          type: "bar",
          label: "信用売残",
          data: data._value.weeklyInfoForChart.sellBalance,
          backgroundColor: "#B9F6CA"
        },{
          type: 'bar',
          label: "信用買残",
          data: data._value.weeklyInfoForChart.buyBalance,
          backgroundColor: "#ff8a80"
        },{
          type: 'bar',
          label: "貸付残高",
          data: data._value.weeklyInfoForChart.lendBalance,
          backgroundColor: "#82b1ff"
        }]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  });
</script>
