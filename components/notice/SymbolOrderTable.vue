<template>
  <el-table :data="props.symbol.timeLines" :max-height="props.height">
    <el-table-column
      property="hhmm"
      label="時間"
      header-align="center"
      align="center"
      width="70"
    />
    <el-table-column
      property="close"
      label="終値"
      header-align="center"
      align="right"
      width="100"
    />
    <el-table-column
      property="close_rate"
      label="現値変化率"
      header-align="center"
      align="right"
      width="100"
    >
      <template #default="scope">
        <div :class="colorRate(scope.row.close_rate)">{{ scope.row.close_rate }} %</div>
      </template>
    </el-table-column>
    <el-table-column label="成行" header-align="center">
      <el-table-column
        property="order_limit_bid"
        label="売"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.order_market_bid, maxMarketOrder(props.symbol.timeLines))"
          >
            {{ scope.row.order_market_bid.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="order_market_ask"
        label="買"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBullRatio(scope.row.order_market_ask, maxMarketOrder(props.symbol.timeLines))"
          >
            {{ scope.row.order_market_ask.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      label="指値"
      header-align="center"
    >
      <el-table-column
        property="order_limit_bid"
        label="売"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.order_limit_bid, maxLimitOrder(props.symbol.timeLines))"
          >
            {{ scope.row.order_limit_bid.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="order_limit_ask"
        label="買"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="
              backgroundBullRatio(scope.row.order_limit_ask, maxLimitOrder(props.symbol.timeLines))
            "
          >
            {{ scope.row.order_limit_ask.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      label="圧"
      header-align="center"
    >
      <el-table-column
        property="order_over"
        label="Over"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.order_over, maxOverUnder(props.symbol.timeLines))"
          >
            {{ scope.row.order_over.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="order_under"
        label="Under"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBullRatio(scope.row.order_under, maxOverUnder(props.symbol.timeLines))"
          >
            {{ scope.row.order_under.toLocaleString() }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
interface Props {
  height: number;
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});

const maxMarketOrder = (timeLines) => {
  const b = Math.max(...timeLines.map(tl => tl.order_market_bid));
  const a = Math.max(...timeLines.map(tl => tl.order_market_ask));
  return b > a ? b : a;
}
const maxLimitOrder = (timeLines) => {
  const b = Math.max(...timeLines.map(tl => tl.order_limit_bid));
  const a = Math.max(...timeLines.map(tl => tl.order_limit_ask));
  return b > a ? b : a;
}
const maxOverUnder = (timeLines) => {
  const o = Math.max(...timeLines.map(tl => tl.order_over));
  const u = Math.max(...timeLines.map(tl => tl.order_over));
  return o > u ? o : u;
}

// import { formatVolume } from "~/modules/ValueFormatter";
// import { colorRate, backgroundBearRatio, backgroundBullRatio } from "~/modules/StyleHelper";

const colorRate = (v: number) => {
  const r = Math.round(v * 10) / 10;
  if (r > 16) return "text-red9";
  if (r > 14) return "text-red8";
  if (r > 12) return "text-red7";
  if (r > 10) return "text-red6";
  if (r > 8) return "text-red5";
  if (r > 6) return "text-red4";
  if (r > 4) return "text-red3";
  if (r > 2) return "text-red2";
  if (r > 0) return "text-red1";
  if (r < -16) return "text-blue9";
  if (r < -14) return "text-blue8";
  if (r < -12) return "text-blue7";
  if (r < -10) return "text-blue6";
  if (r < -8) return "text-blue5";
  if (r < -6) return "text-blue4";
  if (r < -4) return "text-blue3";
  if (r < -2) return "text-blue2";
  if (r < 0) return "text-blue1";
  return "";
};

const colorValue = (v: number) => {
  if (v >= 300000000) return "text-red9";
  if (v >= 250000000) return "text-red8";
  if (v >= 200000000) return "text-red7";
  if (v >= 150000000) return "text-red6";
  if (v >= 100000000) return "text-red5";
  if (v >= 90000000) return "text-red4";
  if (v >= 70000000) return "text-red3";
  if (v >= 50000000) return "text-red2";
  if (v >= 30000000) return "text-red1";
  if (v >= 25000000) return "text-blue1";
  if (v >= 20000000) return "text-blue2";
  if (v >= 15000000) return "text-blue3";
  if (v >= 10000000) return "text-blue4";
  if (v >= 8000000) return "text-blue5";
  if (v >= 6000000) return "text-blue6";
  if (v >= 4000000) return "text-blue7";
  if (v >= 2000000) return "text-blue8";
  return "text-blue9";
};

const progressColors = [
  { color: "#1e88e5", percentage: 25 },
  { color: "#42a5f5", percentage: 30 },
  { color: "#64b5f6", percentage: 35 },
  { color: "#90caf9", percentage: 40 },
  { color: "#bbdefb", percentage: 45 },
  { color: "#e3f2fd", percentage: 49 },
  { color: "#ffebee", percentage: 50 },
  { color: "#ffcdd2", percentage: 55 },
  { color: "#ef9a9a", percentage: 60 },
  { color: "#e57373", percentage: 65 },
  { color: "#ef5350", percentage: 70 },
  { color: "#f44336", percentage: 75 },
];

const backgroundStrengthRatioV2 = (num: number, ratio: number) => {
  if (num) {
    return `background: linear-gradient(to left, #f44336 ${ratio}%, #2196f3 ${ratio}%)`;
  }
  return "";
};

const backgroundStrengthRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to left, #f44336 ${ratio}%, #2196f3 ${ratio}%)`;
};

const backgroundBearRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to left, #2196f3 ${ratio}%, transparent ${ratio}%)`;
};

const backgroundBullRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to right, #f44336 ${ratio}%, transparent ${ratio}%)`;
}

const backgroundStyleVolume = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to right, rgba(255, 235, 59, 0.5) ${ratio}%, transparent ${ratio}%)`;
};

const colorFirstSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118") return "text-blue5";
  if (askSign == "0118") return "text-red5";
  if (bidSign == "0102" || askSign == "0102") return "text-yellow";
  return "";
};
const colorSecondSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118" || bidSign == "0102") return "text-blue5";
  if (askSign == "0118" || askSign == "0102") return "text-red5";
  return "";
};

const formatSymbolName = (row: any, column: any, cellValue: string, index: number) => {
  const limit = 20;
  if (cellValue.length > limit) {
    return `${cellValue.substring(0, limit)}...`;
  }
  return cellValue;
};

const formatRate = (v: number) => {
  return `${Math.round(v * 10) / 10} %`;
};

const formatVolume = (v: number) => {
  const t = v < 0 ? v * -1 : v;
  if (t >= 1000000000) return `${Math.round(v / 100000000) / 10}g`;
  if (t >=    1000000) return `${Math.round(v / 100000) / 10}m`;
  if (t >=       1000) return `${Math.round(v / 100) / 10}k`;
  if (t >=          1) return v;
  return "-";
};

const formatFirstSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118" || askSign == "0118") return "連";
  if (bidSign == "0102" || askSign == "0102") return "特";
  return "";
};

const formatSecondSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118" || bidSign == "0102") return "売";
  if (askSign == "0118" || askSign == "0102") return "買";
  return "";
};
</script>
