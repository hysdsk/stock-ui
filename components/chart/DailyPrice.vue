<template>
  <canvas id="chart-daily-price"></canvas>
</template>

<script lang="ts" setup>
  import Chart from "chart.js/auto";
  import { onMounted } from "vue";
  import dayjs from "dayjs";
  dayjs.locale("ja");

  interface Props {
    code: string,
    from: string,
    to: string
  }

  const props = withDefaults(defineProps<Props>(), {})
  const { data, pending } = useFetch(
    `/api/symbol/metrics/dailyPrice`, {
      params: {
        code: props.code,
        from: dayjs(props.from).format("YYYYMMDD"),
        to: dayjs(props.to).format("YYYYMMDD")
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-daily-price"), {
      data: {
        labels: data.value?.dailyInfoForChart.openingDate,
        datasets: [{
          type: 'bar',
          label: "実態",
          data: data.value?.dailyInfoForChart.priceBody,
          backgroundColor: data.value?.dailyInfoForChart.tickColor,
          order: 1,
          yAxisID: "price",
          barPercentage: 1.1
        },{
          type: 'bar',
          label: "ヒゲ",
          data: data.value?.dailyInfoForChart.highAndLow,
          backgroundColor: data.value?.dailyInfoForChart.tickColor,
          order: 1,
          yAxisID: "price",
          barPercentage: 0.1
        },{
          type: "bar",
          label: "出来高",
          data: data.value?.dailyInfoForChart.tradingVolume,
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
