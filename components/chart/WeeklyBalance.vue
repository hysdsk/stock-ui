<template>
  <canvas id="chart-weekly-balance"></canvas>
</template>

<script lang="ts" setup>
  import Chart from "chart.js/auto";
  import { onMounted } from "vue";
  import { Link } from "@element-plus/icons-vue"

  interface Props {
    code: string,
    period: number
  }

  const props = withDefaults(defineProps<Props>(), { code: null, period: null })
  const { data, pending } = useFetch(
    `/api/symbol/metrics/weeklyBalance`, {
      params: {
        code: props.code,
        period: props.period
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-weekly-balance"), {
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
      },
    });
  });
</script>
