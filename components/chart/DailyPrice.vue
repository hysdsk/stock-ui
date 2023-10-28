<template>
  <canvas id="chart-daily-price"></canvas>
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
    `/api/symbol/metrics/dailyPrice`, {
      params: {
        code: props.code,
        period: props.period
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-daily-price"), {
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
            position: "left",
            beginAtZero: false
          },
          volume: {
            type: "linear",
            position: "right"
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
