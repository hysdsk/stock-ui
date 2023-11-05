<template>
  <el-container>
    <el-main>
      <el-space wrap>
        <el-text size="large" tag="b" type="primary"
          >市場別売買代金推移</el-text
        >
        <DatePicker :from="from" :to="to" :selected="selected" />
      </el-space>
      <canvas id="chart" style="width: 100%; height: 1024px"></canvas>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import Chart from "chart.js/auto";
import { onMounted } from "vue";
import dayjs from "dayjs";
dayjs.locale("ja");

const route = useRoute();
const queryParams = route.query;
const from = queryParams.from
  ? queryParams.from
  : dayjs().subtract(1, "M").format("YYYY-MM-DD");
const to = queryParams.to ? queryParams.to : dayjs().format("YYYY-MM-DD");
const selected = (val: any) => {
  const from = dayjs(val[0]).format("YYYY-MM-DD");
  const to = dayjs(val[1]).format("YYYY-MM-DD");
  window.location.href = `?from=${from}&to=${to}`;
};

const { data, pending } = useFetch("/api/market/tradingValues", {
  lazy: true,
  params: {
    from: dayjs(from.toString()).format("YYYYMMDD"),
    to: dayjs(to.toString()).format("YYYYMMDD"),
  }
});

onMounted(() => {
  const barData = {
    labels: data.value?.prime.openingDate,
    datasets: [
      {
        label: "Prime",
        data: data.value?.prime.tradingValue,
        backgroundColor: "#ff4569",
      },
      {
        label: "Standard",
        data: data.value?.standard.tradingValue,
        backgroundColor: "#33eb91",
      },
      {
        label: "Growth",
        data: data.value?.growth.tradingValue,
        backgroundColor: "#33eaff",
      },
    ],
  };

  const options = {
    responsive: false,
    title: {
      text: "",
    },
    scales: {
      y: {
        title: { display: true, text: "売買代金（千円）" },
        stacked: true,
      },
      x: {
        title: { display: true, text: "開場日" },
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: barData,
    options: options,
  });
});
</script>
