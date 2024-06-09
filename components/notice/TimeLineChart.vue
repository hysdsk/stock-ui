<template>
  <div>
    <el-scrollbar :style="{width: `${width}px`}">
      <canvas id="timeline"></canvas>
    </el-scrollbar>
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
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      layout: {
        padding: {
          right: 64
        }
      },
      elements: {
        point: {
          radius: 0,
        },
        bar: {
          borderWidth: 0,
        },
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
      }
    }
  });
}

const refreshChart = (symbol) => {
  // ダイアログを表示するまではスキップする
  if (Object.keys(props.symbol).length == 0) {
    return;
  }
  const timeLineArray = Object.values(symbol.timeLines);
  // チャートを取得しデータセットの表示状態を取得する
  const chart = getChart("timeline");
  const visibilities = Object.fromEntries(chart.data.datasets.map((dataset, i) => [dataset.label, chart.isDatasetVisible(i)]));
  // チャートを最新データで更新する
  chart.data.labels = timeLineArray.map(timeLine => timeLine.hhmm);
  chart.data.datasets = [{
    label: "価格",
    type: "line",
    yAxisID: "price", 
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
    data: timeLineArray.map(timeLine => timeLine.close)
  }, {
    label: "VWAP",
    type: "line",
    yAxisID: "price", 
    backgroundColor: "#ff9800",
    borderColor: "#ff9800",
    data: timeLineArray.map(timeLine => timeLine.vwap)
  }, {
    label: "一般買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#ffcdd2",
    data: timeLineArray.map(timeLine => timeLine.small_buy)
  }, {
    label: "中級買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#e57373",
    data: timeLineArray.map(timeLine => timeLine.middle_buy)
  }, {
    label: "大口買",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#f44336",
    data: timeLineArray.map(timeLine => timeLine.large_buy)
  }, {
    label: "一般売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#bbdefb",
    data: timeLineArray.map(timeLine => timeLine.small_sell * -1)
  }, {
    label: "中級売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#64b5f6",
    data: timeLineArray.map(timeLine => timeLine.middle_sell * -1)
  }, {
    label: "大口売",
    type: "bar",
    yAxisID: "value",
    backgroundColor: "#2196f3",
    data: timeLineArray.map(timeLine => timeLine.large_sell * -1)
  }];
  chart.update();
  const dynamicWidth = timeLineArray.length * 24;
  chart.resize(dynamicWidth > props.width ? dynamicWidth : props.width, props.height);
  // データセットの表示状態を引き継ぐ
  chart.data.datasets.forEach((dataset, i) => {
    const visibility = visibilities[dataset.label];
    if (visibility != null && !visibility) {
      chart.hide(i);
    }
  });
}

onMounted(() => {
  //初回更新
  refreshChart(props.symbol)
  // チャートの自動更新設定
  setInterval(() => refreshChart(props.symbol), 3000);
});

defineExpose({ refreshChart });
</script>
