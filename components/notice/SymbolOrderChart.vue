<template>
  <div>
    <el-scrollbar :style="{width: `${width}px`}">
      <canvas id="order"></canvas>
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
      },
      scales: {
        price: { 
          type: "linear",
          position: "left",
          beginAtZero: false,
        },
        order: {
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
  const timeLineArray = Object.values(symbol.timeLines);
  // チャートを取得しデータセットの表示状態を取得する
  const chart = getChart("order");
  const visibilities = Object.fromEntries(chart.data.datasets.map((dataset, i) => [dataset.label, chart.isDatasetVisible(i)]));
  // チャートを最新データで更新する
  chart.data.labels = timeLineArray.map(timeLine => timeLine.hhmm);
  const timeLineOvers = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return (e.order_over - pe.order_over) * -1;
  });
  const timeLineUnders = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return e.order_under - pe.order_under;
  });
  const timeLineLimitBids = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return (e.order_limit_bid - pe.order_limit_bid) * -1;
  });
  const timeLineLimitAsks = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return e.order_limit_ask - pe.order_limit_ask;
  });
  const timeLineMarketBids = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return (e.order_market_bid - pe.order_market_bid) * -1;
  });
  const timeLineMarketAsks = timeLineArray.map((e, i, arr) => {
    const pe = i > 0 ? arr[i-1] : e;
    return e.order_market_ask - pe.order_market_ask;
  });
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
    label: "売圧",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineOvers.map(e => e > 0 ? "#ffcdd2" : "#bbdefb"),
    data: timeLineOvers
  }, {
    label: "買圧",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineUnders.map(e => e > 0 ? "#ffcdd2" : "#bbdefb"),
    data: timeLineUnders
  }, {
    label: "売指",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineLimitBids.map(e => e > 0 ? "#e57373" : "#64b5f6"),
    data: timeLineLimitBids
  }, {
    label: "買指",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineLimitAsks.map(e => e > 0 ? "#e57373" : "#64b5f6"),
    data: timeLineLimitAsks
  }, {
    label: "成売",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineMarketBids.map(e => e > 0 ? "#f44336" : "#2196f3"),
    data: timeLineMarketBids
  }, {
    label: "成買",
    type: "bar",
    yAxisID: "order",
    backgroundColor: timeLineMarketAsks.map(e => e > 0 ? "#f44336" : "#2196f3"),
    data: timeLineMarketAsks
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
