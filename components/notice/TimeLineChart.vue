<template>
  <div>
    <canvas id="timeline" :style="{width: `${width}px`, height: `${props.height}px`}"></canvas>
  </div>
</template>

<script lang="ts" setup>
import Chart from "chart.js/auto";
interface Props {
  height: number;
  width: number;
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});

const getChart = (chartId) => {
  if (Object.values(Chart.instances).map(c => c.canvas.id).includes(chartId)) {
    return Chart.getChart(chartId);
  }
  return new Chart(document.getElementById(chartId).getContext("2d"), {
    data: { labels: [], datasets: [] },
    options: {
      responsive: false,
      animation: {
        duration: 0
      },
      scales: {
        price: { 
          type: "linear",
          position: "left",
          beginAtZero: false,
        },
        value: {
          type: "linear",
          position: "right",
          stacked: true,
        },
        x: {
          type: "category",
          stacked: true,
          ticks: {
            minRotation: 45,
            maxRotation: 45,
          },
        },
      },
    }
  });
}

const refreshChart = (symbol) => {
  // ダイアログを表示するまではスキップする
  if (Object.keys(props.symbol).length == 0) {
    return;
  }
  // チャートを取得しデータセットの表示状態を取得する
  const chart = getChart("timeline");
  const visibilities = Object.fromEntries(chart.data.datasets.map((dataset, i) => [dataset.label, chart.isDatasetVisible(i)]));
  // チャートを最新データで更新する
  chart.data.labels = symbol.timeLines.map(timeLine => timeLine.hhmm);
  chart.data.datasets = [{
  //   label: "価格（実態）",
  //   type: "bar",
  //   yAxisID: "price", 
  //   barPercentage: 1.1,
  //   backgroundColor: symbol.timeLines.map(timeLine => timeLine.open > timeLine.close ? "#00c853" : "#d50000"),
  //   data: symbol.timeLines.map(timeLine => timeLine.open > timeLine.close ? [timeLine.close, timeLine.open] : [timeLine.open, timeLine.close]),
  // }, {
  //   label: "価格（ヒゲ）",
  //   type: "bar",
  //   yAxisID: "price", 
  //   barPercentage: 0.1,
  //   backgroundColor: symbol.timeLines.map(timeLine => timeLine.open > timeLine.close ? "#00c853" : "#d50000"),
  //   data: symbol.timeLines.map(timeLine => timeLine.low > timeLine.high ? [timeLine.high, timeLine.low] : [timeLine.low, timeLine.high]),
  // }, {
    label: "価格",
    type: "line",
    yAxisID: "price", 
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
    pointRadius: 2,
    data: symbol.timeLines.map(timeLine => timeLine.close)
  }, {
    label: "VWAP",
    type: "line",
    yAxisID: "price", 
    backgroundColor: "#ff9800",
    borderColor: "#ff9800",
    pointRadius: 2,
    data: symbol.timeLines.map(timeLine => timeLine.vwap)
  }, {
    label: "一般売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#bbdefb",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.small_sell * -1)
  }, {
    label: "中級売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#64b5f6",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.middle_sell * -1)
  }, {
    label: "大口売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#2196f3",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.large_sell * -1)
  }, {
    label: "一般買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#ffcdd2",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.small_buy)
  }, {
    label: "中級買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#e57373",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.middle_buy)
  }, {
    label: "大口買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#f44336",
    barPercentage: 0.8,
    data: symbol.timeLines.map(timeLine => timeLine.large_buy)
  }];
  chart.update();
  // データセットの表示状態を引き継ぐ
  chart.data.datasets.forEach((dataset, i) => {
    const visibility = visibilities[dataset.label];
    if (visibility != null && !visibility) {
      chart.hide(i);
    }
  })
}

onMounted(() => {
  //初回更新
  refreshChart(props.symbol)
  // チャートの自動更新設定
  setInterval(() => refreshChart(props.symbol), 5000);
});

defineExpose({ refreshChart });
</script>
