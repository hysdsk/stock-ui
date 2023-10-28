<template>
  <canvas id="chart-volume-by-price"></canvas>
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
    `/api/symbol/metrics/volumeByPrice`, {
      params: {
        code: props.code,
        from: dayjs(props.from).format("YYYYMMDD"),
        to: dayjs(props.to).format("YYYYMMDD")
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-volume-by-price"), {
      data: {
        labels: data.value?.dailyInfoForChart.price,
        datasets: [{
          type: "bar",
          label: "売買代金",
          data: data.value?.dailyInfoForChart.tradingValue,
          backgroundColor: "#FFEE58",
          order: 2,
          yAxisID: "volume",
          stack: "Volume"
        }]
      },
      options: {
        indexAxis: "y",
        scales: {
          x: { }
        }
      },
    });
  });
</script>
