<template>
  <canvas id="chart-daily-balance"></canvas>
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
    `/api/symbol/metrics/dailyBalance`, {
      params: {
        code: props.code,
        period: props.period
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-daily-balance"), {
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
      },
    });
  });
</script>
