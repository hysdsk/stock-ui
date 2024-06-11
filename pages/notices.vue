<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-row :gutter="16">
        <el-col :span="4">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">現在時刻</el-text>
              <el-text size="large">{{ clock }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">前日超数</el-text>
              <el-text size="large">{{ Object.values(symbolRows).filter((e) => e.previousCloseRate > 0).length }}／{{ Object.keys(symbolRows).length }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">陽線数</el-text>
              <el-text size="large">{{ Object.values(symbolRows).filter((e) => e.openingRate > 0).length }}／{{ Object.keys(symbolRows).length }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="9"></el-col>
        <el-col :span="5">
          <el-space>
            <el-select
              v-model="selectedScoreOption"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="Select score label"
            >
              <el-option
                v-for="item in scoreOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-switch
              v-model="isAudio"
              size="large"
              style="--el-switch-on-color: #455a64; --el-switch-off-color: #455a64"
              inline-prompt
              :active-icon="Bell"
              :inactive-icon="MuteNotification"
            />
          </el-space>
          <br/><br/>
          <el-space>
            <el-date-picker
              v-model="fromDateTime"
              type="datetime"
              placeholder="Select date and time"
              @change="changeDateTime"
            />
          </el-space>
        </el-col>
      </el-row>
      <el-card>
        <el-table
          row-key="code"
          ref="realtimeTableRef"
          :data="Object.values(symbolRows)"
          :row-style="styleRows"
          @row-click="
            (r, c, e) => {
              openDialog(r);
            }
          "
          height="1075"
        >
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="50"
            reserve-selection
            fixed
          />
          <el-table-column
            prop="code"
            label="コード"
            header-align="center"
            align="center"
            width="100"
            :filters="filterCode"
            :filter-method="filterCodeMethod"
            filter-placement="bottom"
            fixed
          >
            <template #default="scope">
              <span :class="colorSelectedText(scope.row.code)">{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="銘柄名"
            header-align="center"
            width="320"
            :formatter="formatSymbolName"
            fixed
          >
            <template #default="scope">
              <span :class="colorSelectedText(scope.row.code)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="気配" header-align="center" align="center" width="80">
            <template #default="scope">
              <span :class="colorFirstSign(scope.row.bidsign, scope.row.asksign)">{{
                formatFirstSign(scope.row.bidsign, scope.row.asksign)
              }}</span>
              <span :class="colorSecondSign(scope.row.bidsign, scope.row.asksign)">{{
                formatSecondSign(scope.row.bidsign, scope.row.asksign)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="currentPrice"
            label="現値"
            header-align="center"
            align="right"
            width="100"
            sortable
          >
            <template #default="scope">
              <span
                v-if="scope.row.bidsign == '0107' && scope.row.asksign == '0107'"
                class="text-gray"
                >{{ scope.row.currentPrice }}</span
              >
              <span v-else :class="colorRate(scope.row.previousCloseRate)">{{
                scope.row.currentPrice
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="現値対比" header-align="center">
            <el-table-column
              prop="previousCloseRate"
              label="前日"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span :class="colorRate(scope.row.previousCloseRate)">{{
                  formatRate(scope.row.previousCloseRate)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="openingRate"
              label="始値"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span :class="colorRate(scope.row.openingRate)">{{
                  formatRate(scope.row.openingRate)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="vwaprate"
              label="VWAP"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span :class="colorRate(scope.row.vwaprate)">{{
                  formatRate(scope.row.vwaprate)
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            prop="threshold"
            label="閾値"
            header-align="center"
            align="right"
            width="80"
            sortable
          >
            <template #default="scope">
              <span>{{ formatVolume(scope.row.threshold) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="tradingValueByMin"
            label="直近売買代金"
            header-align="center"
            align="right"
            width="160"
            sortable
          >
            <template #default="scope">
              <span :class="colorValue(scope.row.tradingValueByMin)">
                {{ scope.row.tradingValueByMin.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="tradingValueByMin"
            label="当日売買代金"
            header-align="center"
            align="right"
            width="160"
            sortable
          >
            <template #default="scope">
              <span :class="colorValue(scope.row.tradingValue/100)">
                {{ scope.row.tradingValue.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
  <el-dialog
    v-model="dialogVisible"
    @opened="openedDialog"
    :width="tabWidth"
    top="8vh"
  >
    <template #header>
      <el-button @click="copyToClipboard(dialogRow.code)" text>
        {{dialogRow.code}}
      </el-button>
      <el-text>
        {{dialogRow.name}}
      </el-text>
    </template>
    <NoticeSymbolInfo :symbol="dialogRow"/>
    <el-tabs v-model="activeName">
      <el-tab-pane label="分布別総出来高" name="1">
        <NoticeDistributionGraph :height="tabHeight" :width="tabWidth" :symbol="dialogRow" ref="distributionGraphRef"/>
      </el-tab-pane>
      <el-tab-pane label="時系列出来高" name="2">
        <NoticeTimeLineChart :height="tabHeight" :width="tabWidth" :symbol="dialogRow" ref="timeLineChartRef"/>
      </el-tab-pane>
      <el-tab-pane label="時系列注文数量" name="3">
        <NoticeSymbolOrderChart :height="tabHeight" :width="tabWidth" :symbol="dialogRow" ref="noticeSymbolOrderChartRef"/>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, h } from "vue";
import { io } from "socket.io-client";
import Chart from "chart.js/auto";
import { Bell, MuteNotification } from "@element-plus/icons-vue";
import dayjs from "dayjs";
dayjs.locale("ja");

useHead({ title: "通知受信" });

// クエリパラメータ
const route = useRoute();
const queryParams = route.query;

// 時間
const clock = ref(dayjs().format("YYYY/MM/DD HH:mm:ss"));
const fromDateTime = ref(queryParams.from != null && /[0-9]*/.test(queryParams.from)
  ? dayjs(queryParams.from*1000).toDate()
  : dayjs().toDate());
const lastTime = ref(dayjs(fromDateTime.value).format("HH:mm:ss"));

// メインテーブル
const realtimeTableRef = ref<InstanceType<typeof ElTable>>();
const symbolRows = reactive({});

// ダイアログ
const dialogVisible = ref(false);
const dialogRow = ref({});
const activeName = ref("1");
const baseTabSize = { height: 768, width: 1440 }
const tabHeight = ref(baseTabSize.height);
const tabWidth = ref(baseTabSize.width);
const timeLineChartRef = ref(null);
const distributionGraphRef = ref(null);
const noticeSymbolOrderChartRef = ref(null);

// オーディオ
const isAudio = ref(false);
const scoreOptions = [
  {
    label: "BIG_SELL",
    value: "BIG_SELL"
  }, {
    label: "BIG_BUY",
    value: "BIG_BUY"
  }, {
    label: "APPEARED_BUY_ORDER",
    value: "APPEARED_BUY_ORDER"
  }, {
    label: "APPEARED_SELL_ORDER",
    value: "APPEARED_SELL_ORDER"
  }, {
    label: "DISAPPEARED_BUY_ORDER",
    value: "DISAPPEARED_BUY_ORDER"
  }, {
    label: "DISAPPEARED_SELL_ORDER",
    value: "DISAPPEARED_SELL_ORDER"
  }
];
const selectedScoreOption = ref(scoreOptions.map(o => o.value));

const changeDateTime = () => {
  window.location.href = `?from=${dayjs(fromDateTime.value).unix()}`;
}

watch(dialogRow, (row, prevRow) => {
  if (timeLineChartRef.value) {
    timeLineChartRef.value.refreshChart(row);
  }
  if (distributionGraphRef.value) {
    distributionGraphRef.value.refreshChart(row);
  }
  if (noticeSymbolOrderChartRef.value) {
    noticeSymbolOrderChartRef.value.refreshChart(row);
  }
});

interface SymbolTable {
  code: string;
  score: number;
  avgLimitOrderRatio: number;
  lrgContractValueBuyRatio: number;
  midContractValueBuyRatio: number;
  smlContractValueBuyRatio: number;
}
const filterCode = [];
const filterCodeMethod = (value: string, row: SymbolTable) => {
  return row.code == value;
};

// メインテーブル ハイライト
const styleRows = (data) => {
  const timeLineArray = Object.values(data.row.timeLines);
  if (data.row.tradingValue == 0) {
    if (timeLineArray.length >= 2) {
      const scope = timeLineArray.slice(-2);
      if (scope.filter(timeLine => timeLine.close_rate > 0).length >= 2) {
        return {"background-color": "rgba(255 0 0 / .1)"};
      }
      if (scope.filter(timeLine => timeLine.close_rate < 0).length >= 2) {
        return {"background-color": "rgba(0 0 255 / .1)"};
      }
    }
    return;
  }
  if (timeLineArray.length >= 10) {
    const scope = timeLineArray.slice(-10);
    const bulls = scope.filter(timeLine => timeLine.large_buy > timeLine.large_sell);
    const bears = scope.filter(timeLine => timeLine.large_sell > 0 && timeLine.large_buy < timeLine.large_sell);
    const power = bulls.length - bears.length;
    if (power >= 2) {
      const alpha = power - 1;
      return {"background-color": `rgb(255 0 0 / .${alpha})`};
    }
    if (power <= -2) {
      const alpha = (power * -1) - 1;
      return {"background-color": `rgba(0, 0, 255, .${alpha})`};
    }
  }
};


const colorSelectedText = (v) => {
  const rows = realtimeTableRef.value!.getSelectionRows();
  if (rows.length > 0 && rows.filter((row) => row.code == v).length > 0) {
    return "text-selected";
  }
};
const copyToClipboard = (v) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(v);
  }
};
const openDialog = (row) => {
  dialogVisible.value = true;
  dialogRow.value = row;
};

const openedDialog = () => {
  // ダイアログのCanvasが描画されてからサイズを反映する
  tabHeight.value = tabHeight.value == baseTabSize.height ? baseTabSize.height + 1 : baseTabSize.height;
  tabWidth.value = tabWidth.value == baseTabSize.width ? baseTabSize.width + 1 : baseTabSize.width;
}

const calcRate = (to: number, from: number) => {
  if (from > 0 && to > 0) {
    return (to / from * 100) - 100;
  }
  return 0;
}

const refreshData = async () => {
  const fromDate = dayjs(fromDateTime.value).format("YYYY-MM-DD");
  const toplinesRes  = await fetch(`/api/toplines?today=${fromDate}`);
  if (!toplinesRes.ok) {
    console.error("Error toplines");
  }
  const toplines = await toplinesRes.json();
  toplines.forEach(data => {
    if (symbolRows[data.symbol_code]) {
      symbolRows[data.symbol_code].currentDateTime = data.current_datetime;
      symbolRows[data.symbol_code].currentPrice = data.current_price;
      symbolRows[data.symbol_code].previousCloseRate = calcRate(data.current_price, data.previous_close_price);
      symbolRows[data.symbol_code].openingRate = calcRate(data.current_price, data.opening_price);
      symbolRows[data.symbol_code].vwaprate = calcRate(data.current_price, data.vwap);
      symbolRows[data.symbol_code].tradingValue = data.trading_value;
      symbolRows[data.symbol_code].tradingValueByMin = data.recent_value;
      symbolRows[data.symbol_code].largeBuyValue = data.large_buy_value;
      symbolRows[data.symbol_code].middleBuyValue = data.middle_buy_value;
      symbolRows[data.symbol_code].smallBuyValue = data.small_buy_value;
      symbolRows[data.symbol_code].largeSellValue = data.large_sell_value;
      symbolRows[data.symbol_code].middleSellValue = data.middle_sell_value;
      symbolRows[data.symbol_code].smallSellValue = data.small_sell_value;
      symbolRows[data.symbol_code].bidsign = data.bid_sign;
      symbolRows[data.symbol_code].asksign = data.ask_sign;
    } else {
      const symbolName = data.symbol_name == null ? "未登録" : data.symbol_name;
      symbolRows[data.symbol_code] = {
        currentDateTime: data.current_datetime,
        code: data.symbol_code,
        name: symbolName.length > 20 ? `${symbolName.substring(0, 20)}...` : symbolName,
        threshold: 0,
        currentPrice: data.current_price,
        previousCloseRate: calcRate(data.current_price, data.previous_close_price),
        openingRate: calcRate(data.current_price, data.opening_price),
        vwaprate: calcRate(data.current_price, data.vwap),
        tradingValue: data.trading_value,
        tradingValueByMin: data.recent_value,
        largeBuyValue: data.large_buy_value,
        middleBuyValue: data.middle_buy_value,
        smallBuyValue: data.small_buy_value,
        largeSellValue: data.large_sell_value,
        middleSellValue: data.middle_sell_value,
        smallSellValue: data.small_sell_value,
        bidsign: data.bid_sign,
        asksign: data.ask_sign,
        score: 0,
        scores: [],
        totalContractValues: [],
        timeLines: {},
      }
    }
    clock.value = dayjs(data.current_datetime).format("YYYY/MM/DD HH:mm:ss");
  });


  const timelinesRes  = await fetch(`/api/timelines?today=${fromDate}&lastTime=${lastTime.value}`);
  if (!timelinesRes.ok) {
    console.error("Error");
  }
  const timelines = await timelinesRes.json();
  timelines.forEach(data => {
    const tickTime = data.tick_time;
    if (lastTime.value < tickTime) {
      lastTime.value = tickTime;
    }
    if (symbolRows[data.symbol_code]) {
      symbolRows[data.symbol_code].timeLines[tickTime] = {
        hhmm: tickTime,
        open: data.opening_price,
        high: data.high_price,
        low: data.low_price,
        close: data.close_price,
        close_rate: 0,
        vwap: data.vwap,
        large_sell: data.large_sell_value,
        middle_sell: data.middle_sell_value,
        small_sell: data.small_sell_value,
        large_buy: data.large_buy_value,
        middle_buy: data.middle_buy_value,
        small_buy: data.small_buy_value,
        order_limit_bid: data.bid_limit_order,
        order_limit_ask: data.ask_limit_order,
        order_market_bid: data.bid_market_order,
        order_market_ask: data.ask_market_order,
        order_over: data.bid_over_order,
        order_under: data.ask_under_order,
      }
    }
  });
}

onMounted(async () => {
  const bearAudio = new Audio("/audio/soundeffect_01.wav");
  const bullAudio = new Audio("/audio/soundeffect_02.wav");
  refreshData();
  setInterval(() => refreshData(), 3000);
});

// import { formatSymbolName, formatVolume, formatRate, formatFirstSign, formatSecondSign } from "@/modules/ValueFormatter";
// import { colorRate, colorValue, backgroundStrengthRatioV2, colorFirstSign, colorSecondSign } from "@/modules/StyleHelper";

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