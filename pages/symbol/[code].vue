<template>
  <h1 class="va-h1">{{ data.symbol.symbolName }}</h1>
  <ul class="va-unordered">
    <li>コード： {{ code }}</li>
    <li>市場： {{ data.symbol.exchangeName }}{{ data.symbol.divisionName }}</li>
    <li>業種： {{ data.symbol.bisCategoryName }}</li>
    <li>時価総額： {{ data.symbol.marketCapitalization.toLocaleString() }}円</li>
    <li>決算日： {{ data.symbol.fiscalYearEndBasic }}</li>
    <li><a target="_blank" v-bind:href="'https://kabutan.jp/stock/?code=' + code">株探</a></li>
    <li><a target="_blank" v-bind:href="'https://kabuyoho.ifis.co.jp/index.php?sa=report_top&bcode=' + code">株予報</a></li>
    <li><a target="_blank" v-bind:href="'https://karauri.net/' + code">空売り情報</a></li>
  </ul>
  <canvas id="stockChart"></canvas>
  <canvas id="volumeChart"></canvas>
  <canvas id="priceRangeAtAmChart"></canvas>
</template>

<script setup>
  import Chart from 'chart.js/auto';
  import { onMounted } from 'vue';

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
          label: "信用買残",
          data: data._value.dailyInfoForChart.buyBalance,
          backgroundColor: "#ff8a80",
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
          type: 'bar',
          label: "信用売残",
          data: data._value.dailyInfoForChart.sellBalance,
          backgroundColor: "#B9F6CA",
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
        }
      }
    });
  });
</script>
