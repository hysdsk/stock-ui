<template>
  <div :style="{display: 'flex', 'justify-content': 'center'}">
    <canvas id="distribution" :style="{width: `${width}px`, height: `${props.height}px`}"></canvas>
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
const totalContractValue = ref("");

const getChart = (chartId) => {
  if (Object.values(Chart.instances).map(c => c.canvas.id).includes(chartId)) {
    return Chart.getChart(chartId);
  }
  return new Chart(document.getElementById(chartId).getContext("2d"), {
    type: "doughnut",
    data: { labels: ["大口買", "中級買", "一般買", "一般売", "中級売", "大口売"], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
    },
    plugins: [{
      id: "center-text",
      beforeDraw: (chart, args, options) => {
        const { ctx, chartArea: { top, width, height } } = chart;
        ctx.save();
        ctx.fillRect(width / 2, top + (height / 2), 0, 0);
        ctx.font = "32px Roboto"
        ctx.fillStyle = "grey"
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(totalContractValue.value, width / 2, top + (height / 2));
      }
    }],
  });
}

const refreshChart = (symbol) => {
  // ダイアログを表示するまではスキップする
  if (Object.keys(props.symbol).length == 0) {
    return;
  }
  // 合計代金を更新する
  const sum = props.symbol.totalContractValues.reduce((total, cv) => total + cv.sell + cv.buy, 0);
  totalContractValue.value = sum.toLocaleString() + "円";
  // チャートを取得しデータセットの表示状態を取得する
  const chart = getChart("distribution");
  const visibilities = Object.fromEntries(chart.data.datasets.map((dataset, i) => [dataset.label, chart.isDatasetVisible(i)]));
  // チャートを最新データで更新する
  const large = symbol.totalContractValues.find(cv => cv.id === "large");
  const middle = symbol.totalContractValues.find(cv => cv.id === "middle");
  const small = symbol.totalContractValues.find(cv => cv.id === "small");
  chart.data.datasets = [{
    label: "投資家分布",
    borderWidth: 0,
    backgroundColor: ["#f44336", "#e57373", "#ffcdd2", "#bbdefb", "#64b5f6", "#2196f3"],
    data: [large.buy, middle.buy, small.buy, small.sell, middle.sell, large.sell],
  }];
  chart.update();
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
  setInterval(() => refreshChart(props.symbol), 5000);
});

defineExpose({ refreshChart });
</script>
