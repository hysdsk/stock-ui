<template>
  <div>
    <el-scrollbar :style="{width: `${width}px`}">
      <canvas id="daily_value"></canvas>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import Chart from "chart.js/auto";import dayjs from "dayjs";
dayjs.locale("ja");

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

const getData = async (code: string, fromDate: string) => {
  const toplinesRes  = await fetch(`/api/notice/daily?code=${code}&from=${fromDate}`);
  if (!toplinesRes.ok) {
    console.error("Error daily chart");
  }
  const toplines = await toplinesRes.json();
  return toplines;
}

const refreshChart = async (symbol) => {
  // ダイアログを表示するまではスキップする
  if (Object.keys(symbol).length == 0) {
    return;
  }
  const toplines = await getData(symbol.code, symbol.currentDate);
  // チャートを取得しデータセットの表示状態を取得する
  const chart = getChart("daily_value");
  const visibilities = Object.fromEntries(chart.data.datasets.map((dataset, i) => [dataset.label, chart.isDatasetVisible(i)]));
  // チャートを最新データで更新する
  chart.data.labels = toplines.map(topline => dayjs(topline.opening_date).format("YYYY/MM/DD"));
  chart.data.datasets = [{
    label: "VWAP",
    type: "line",
    yAxisID: "price", 
    backgroundColor: "#ff9800",
    borderColor: "#ff9800",
    data: toplines.map(topline => topline.vwap)
  }, {
    label: "一般",
    type: "bar",
    yAxisID: "value",
    backgroundColor: toplines.map(topline => (topline.small_buy_value - topline.small_sell_value) > 0 ? "#ffcdd2" : "#bbdefb"),
    data: toplines.map(topline => topline.small_buy_value - topline.small_sell_value)
  }, {
    label: "中級",
    type: "bar",
    yAxisID: "value",
    backgroundColor: toplines.map(topline => (topline.middle_buy_value - topline.middle_sell_value) > 0 ? "#e57373" : "#64b5f6"),
    data: toplines.map(topline => topline.middle_buy_value - topline.middle_sell_value)
  }, {
    label: "大口",
    type: "bar",
    yAxisID: "value",
    backgroundColor: toplines.map(topline => (topline.large_buy_value - topline.large_sell_value) > 0 ? "#f44336" : "#2196f3"),
    data: toplines.map(topline => topline.large_buy_value - topline.large_sell_value)
  }];
  chart.update();
  chart.resize(props.width, props.height);
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
  refreshChart(props.symbol);
});

defineExpose({ refreshChart });
</script>
