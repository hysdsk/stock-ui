<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-row :gutter="16">
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">現在時刻</el-text>
              <el-text size="large">{{ now }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">前日超数</el-text>
              <el-text size="large">{{ Object.values(ranklist).filter((e) => e.previouscloserate > 0).length }}／{{ Object.keys(ranklist).length }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-space direction="vertical" wrap>
              <el-text size="small" type="info">陽線数</el-text>
              <el-text size="large">{{ Object.values(ranklist).filter((e) => e.openingrate > 0).length }}／{{ Object.keys(ranklist).length }}</el-text>
            </el-space>
          </el-card>
        </el-col>
        <el-col :span="11"></el-col>
        <el-col :span="4">
          <el-space direction="vertical">
            <el-switch
              v-model="isAudio"
              size="large"
              style="--el-switch-on-color: #455a64; --el-switch-off-color: #455a64"
              inline-prompt
              :active-icon="Bell"
              :inactive-icon="MuteNotification"
            />
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
          </el-space>
        </el-col>
      </el-row>
      <el-card>
        <el-table
          row-key="code"
          ref="realtimeTableRef"
          :data="Object.values(ranklist)"
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
            prop="currentprice"
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
                >{{ scope.row.currentprice }}</span
              >
              <span v-else :class="colorRate(scope.row.previouscloserate)">{{
                scope.row.currentprice
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="現値対比" header-align="center">
            <el-table-column
              prop="previouscloserate"
              label="前日"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span :class="colorRate(scope.row.previouscloserate)">{{
                  formatRate(scope.row.previouscloserate)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="openingrate"
              label="始値"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span :class="colorRate(scope.row.openingrate)">{{
                  formatRate(scope.row.openingrate)
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
            prop="score"
            label="スコア"
            header-align="center"
            align="right"
            width="100"
            :filters="filterScore"
            :filter-method="filterScoreMethod"
            :filter-multiple="false"
            filter-placement="bottom"
          >
            <template #default="scope">
              <span>{{ scope.row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column label="売買代金／分" header-align="center">
            <el-table-column
              prop="tradingValueByMin"
              label="代金"
              header-align="center"
              align="right"
              width="80"
              sortable
            >
              <template #default="scope">
                <span :class="colorValue(scope.row.tradingValueByMin)">
                  {{ formatVolume(scope.row.tradingValueByMin) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="tradingValueByMinRate"
              label="売買比"
              header-align="center"
              align="right"
              width="100"
              :filters="filterRatioItems"
              :filter-method="filterContractValueBy5MinRatio"
              :filter-multiple="false"
              filter-placement="bottom"
            >
              <template #default="scope">
                <div
                  :style="
                    backgroundStrengthRatioV2(
                      scope.row.tradingValueByMin,
                      scope.row.tradingValueByMinRate
                    )
                  "
                >
                  {{ formatRate(scope.row.tradingValueByMinRate) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="注文" header-align="center">
            <el-table-column
              prop="avgLimitOrderQty"
              label="指値量"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span class="text-blue3">{{
                  formatVolume(scope.row.avgLimitOrderQty)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="avgLimitOrderRatio"
              label="指値比"
              header-align="center"
              align="right"
              width="100"
              :filters="filterRatioItems"
              :filter-method="filterLimitOrderRatio"
              :filter-multiple="false"
              filter-placement="bottom"
            >
              <template #default="scope">
                <div
                  :style="
                    backgroundStrengthRatioV2(
                      scope.row.avgLimitOrderQty,
                      scope.row.avgLimitOrderRatio
                    )
                  "
                >
                  {{ scope.row.avgLimitOrderRatio }} %
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="marketOrderValue"
              label="成行量"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <span class="text-blue3">{{
                  formatVolume(scope.row.marketOrderValue)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="marketOrderBuyRatio"
              label="成行比"
              header-align="center"
              align="right"
              width="100"
              sortable
            >
              <template #default="scope">
                <div
                  :style="
                    backgroundStrengthRatioV2(
                      scope.row.marketOrderValue,
                      scope.row.marketOrderBuyRatio
                    )
                  "
                >
                  {{ formatVolume(scope.row.marketOrderBuyRatio) }}
                </div>
              </template>
            </el-table-column>
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
      <el-tab-pane label="スコア" name="4">
        <NoticeScoreTimeLine :height="tabHeight" :symbol="dialogRow"/>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, h } from "vue";
import { io } from "socket.io-client";
import Chart from "chart.js/auto";
import { Bell, MuteNotification } from "@element-plus/icons-vue";

useHead({ title: "通知受信" });
const baseTabSize = { height: 768, width: 1440 }
const tabHeight = ref(baseTabSize.height);
const tabWidth = ref(baseTabSize.width);
const config = useRuntimeConfig().public;
const realtimeTableRef = ref<InstanceType<typeof ElTable>>();
const filtered = ref(false);
const selectedSymbols = ref([]);
const symbols = reactive({});
const ranklist = reactive({});
const now = ref("08:00:00");
const dialogVisible = ref(false);
const dialogRow = ref({});
const timeLineChartRef = ref(null);
const distributionGraphRef = ref(null);
const noticeSymbolOrderChartRef = ref(null);
const activeName = ref("1");
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
const filterScore = [
  { text: "0 以上", value: 0 },
  { text: "1 以上", value: 1 },
  { text: "2 以上", value: 2 },
  { text: "3 以上", value: 3 },
];
const filterScoreMethod = (value: string, row: SymbolTable) => {
  return row.score >= value;
};
const filterRatioItems = [
  { text: "超弱気", value: 0 },
  { text: "弱気", value: 1 },
  { text: "強気", value: 2 },
  { text: "超強気", value: 3 },
];
const filterRatioMethod = (value: number, ratio: number) => {
  switch (value) {
    case 0:
      return ratio <= 25;
    case 1:
      return ratio <= 50;
    case 2:
      return ratio >= 50;
    case 3:
      return ratio >= 75;
    default:
      return false;
  }
};
const filterContractValueBy5MinRatio = (value: string, row: SymbolTable) => {
  return filterRatioMethod(value, row.tradingValueByMinRate);
};
const filterLimitOrderRatio = (value: string, row: SymbolTable) => {
  return filterRatioMethod(value, row.avgLimitOrderRatio);
};
const filterLrgContractValueRatio = (value: string, row: SymbolTable) => {
  return filterRatioMethod(value, row.lrgContractValueBuyRatio);
};
const filterMidContractValueRatio = (value: string, row: SymbolTable) => {
  return filterRatioMethod(value, row.midContractValueBuyRatio);
};
const filterSmlContractValueRatio = (value: string, row: SymbolTable) => {
  return filterRatioMethod(value, row.smlContractValueBuyRatio);
};

const styleRows = (data) => {
  if (data.row.timeLines.length < 2) {
    return;
  }
  const crntTimeLine = data.row.timeLines.at(-1);
  const prevTimeLine = data.row.timeLines.at(-2);
  if (data.row.baseValue == 0) {
    if (crntTimeLine.close_rate > 0 && prevTimeLine.close_rate > 0) {
      return {"background-color": "rgba(255, 0, 0, 0.1)"};
    }
    if (crntTimeLine.close_rate < 0 && prevTimeLine.close_rate < 0) {
      return {"background-color": "rgba(0, 0, 255, 0.1)"};
    }
  } else {
    const sells = data.row.totalContractValues.map(c => c.sell).reduce((a, b) => a + b);
    const buys = data.row.totalContractValues.map(c => c.buy).reduce((a, b) => a + b);
    const largeAndMiddleBuys = data.row.totalContractValues.filter(c => c.id !== "small").map(c => c.buy).reduce((a, b) => a + b);
    if ((sells * 2) < buys && largeAndMiddleBuys > 0) {
      return {"background-color": "rgba(255, 0, 0, 0.1)"};
    }
    if (sells > (buys * 2)) {
      return {"background-color": "rgba(0, 0, 255, 0.1)"};
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

onMounted(() => {
  const bearAudio = new Audio("/audio/soundeffect_01.wav");
  const bullAudio = new Audio("/audio/soundeffect_02.wav");
  const socket = io(config.wsBaseURL);
  socket.on("regular-notice", (notice) => {
    now.value = notice.time;
    const code = notice.code;
    if (ranklist[code]) {
      ranklist[code].threshold = notice.threshold;
      ranklist[code].currentprice = notice.currentprice;
      ranklist[code].tradingValueByMin = notice.trading_value_by_min;
      ranklist[code].tradingValueByMinRate = notice.trading_value_by_min_ratio;
      ranklist[code].previouscloserate = notice.previouscloserate;
      ranklist[code].openingrate = notice.openingrate;
      ranklist[code].vwaprate = notice.vwaprate;
      ranklist[code].marketOrderValue = notice.market_order_value;
      ranklist[code].marketOrderBuyRatio = notice.market_order_buy_ratio;
      ranklist[code].avgLimitOrderQty = notice.avg_limit_order_qty;
      ranklist[code].avgLimitOrderRatio = notice.avg_limit_order_ratio;
      ranklist[code].bidsign = notice.bidsign;
      ranklist[code].asksign = notice.asksign;
      ranklist[code].score = notice.score;
      ranklist[code].scores = notice.scores;
      ranklist[code].totalContractValues = notice.total_contract_values;
      ranklist[code].timeLines = notice.time_lines;
      ranklist[code].baseValue = notice.base_value;
    } else {
      ranklist[code] = {
        code: code,
        name:
          notice.name.length > 20 ? `${notice.name.substring(0, 20)}...` : notice.name,
        threshold: notice.threshold,
        currentprice: notice.currentprice,
        tradingValueByMin: notice.trading_value_by_min,
        tradingValueByMinRate: notice.trading_value_by_min_ratio,
        previouscloserate: notice.previouscloserate,
        openingrate: notice.openingrate,
        vwaprate: notice.vwaprate,
        marketOrderValue: notice.market_order_value,
        marketOrderBuyRatio: notice.market_order_buy_ratio,
        avgLimitOrderQty: notice.avg_limit_order_qty,
        avgLimitOrderRatio: notice.avg_limit_order_ratio,
        bidsign: notice.bidsign,
        asksign: notice.asksign,
        score: notice.score,
        scores: notice.scores,
        totalContractValues: notice.total_contract_values,
        timeLines: notice.time_lines,
        baseValue: notice.base_value,
      };
      let index = 0;
      while (filterCode.length > index) {
        if (filterCode[index].value > code) {
          break;
        }
        index++;
      }
      filterCode.splice(index, 0, {
        text: `${code}: ${ranklist[code].name}`,
        value: code,
      });
    }
    const recent_score = parseInt(notice.increased_score);
    if (recent_score != 0) {
      const colorCode = recent_score > 0 ? "#f44336" : "#2196f3";
      const latestScore = notice.scores[notice.scores.length - 1];
      if (isAudio.value && selectedScoreOption.value.includes(latestScore.label)) {
        if (recent_score > 0) {
          bullAudio.play();
        } else {
          bearAudio.play();
        }
        ElNotification({
          title: `${notice.code}: ${notice.name.substring(0, 12)}`,
          message: h(
            "b", { style: `color: ${colorCode}` }, latestScore.label
          ),
          duration: 6000,
          position: "bottom-right",
          onClick: () => copyToClipboard(notice.code),
        });
      }
    }
  });
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