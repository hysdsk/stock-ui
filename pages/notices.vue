<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-row :gutter="16">
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-statistic title="現在時刻" :value="now" />
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-statistic
              title="前日超数"
              :value="
                Object.values(ranklist).filter((e) => e.previouscloserate > 0).length
              "
            >
              <template #suffix>／ {{ Object.keys(ranklist).length }}</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="3">
          <el-card style="text-align: center">
            <el-statistic
              title="陽線数"
              :value="Object.values(ranklist).filter((e) => e.openingrate > 0).length"
            >
              <template #suffix>／ {{ Object.keys(ranklist).length }}</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="15"></el-col>
      </el-row>
      <el-card>
        <el-table
          row-key="code"
          ref="realtimeTableRef"
          :data="Object.values(ranklist)"
          :row-class-name="colorRows"
          @row-click="
            (r, c, e) => {
              openDialog(r);
            }
          "
          height="1070"
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
            :formatter="formatName"
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
              sortable
            >
              <template #default="scope">
                <div
                  :style="
                    backgroundStyleRatio(
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
                    backgroundStyleRatio(
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
                    backgroundStyleRatio(
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
    :title="`${dialogRow.code}: ${dialogRow.name}`"
    width="1024"
  >
    <el-row style="text-align: center">
      <el-col :span="6">
        <div>現値（前日比）</div>
        <div
          style="font-size: 1.5em; padding: 5px"
          :class="colorRate(dialogRow.previouscloserate)"
        >
          {{
            dialogRow.currentprice == null
              ? " - "
              : dialogRow.currentprice.toLocaleString()
          }}（{{ formatRate(dialogRow.previouscloserate) }}）
        </div>
      </el-col>
      <el-col :span="6">
        <div>始値比</div>
        <div
          style="font-size: 1.5em; padding: 5px"
          :class="colorRate(dialogRow.openingrate)"
        >
          {{ formatRate(dialogRow.openingrate) }}
        </div>
      </el-col>
      <el-col :span="6">
        <div>VWAP比</div>
        <div
          style="font-size: 1.5em; padding: 5px"
          :class="colorRate(dialogRow.vwaprate)"
        >
          {{ formatRate(dialogRow.vwaprate) }}
        </div>
      </el-col>
      <el-col :span="6">
        <div>買指値率（総指値量）</div>
        <div style="font-size: 1.5em; padding: 5px">
          <el-progress
            :percentage="dialogRow.avgLimitOrderRatio"
            :color="dashboardColors"
            :text-inside="true"
            :stroke-width="25"
          >
            {{ formatVolume(dialogRow.avgLimitOrderQty) }}
          </el-progress>
        </div>
      </el-col>
    </el-row>
    <el-table :data="dialogRow.timeLines" max-height="768">
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
      <el-table-column label="一般" header-align="center">
        <el-table-column
          property="small_value"
          label="代金"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="backgroundStyleVolume(scope.row.small_value, dialogRow.baseValue)"
            >
              {{ formatVolume(scope.row.small_value) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          property="small_ratio"
          label="買率"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="backgroundStyleRatio(scope.row.small_value, scope.row.small_ratio)"
            >
              {{ scope.row.small_value > 0 ? scope.row.small_ratio : "-" }} %
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        :label="`中級（${formatVolume(dialogRow.threshold / 6)}）`"
        header-align="center"
      >
        <el-table-column
          property="middle_value"
          label="代金"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="backgroundStyleVolume(scope.row.middle_value, dialogRow.baseValue)"
            >
              {{ formatVolume(scope.row.middle_value) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          property="middle_ratio"
          label="買率"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="
                backgroundStyleRatio(scope.row.middle_value, scope.row.middle_ratio)
              "
            >
              {{ scope.row.middle_value > 0 ? scope.row.middle_ratio : "-" }} %
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        :label="`大口（${formatVolume(dialogRow.threshold / 2)}）`"
        header-align="center"
      >
        <el-table-column
          property="large_value"
          label="代金"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="backgroundStyleVolume(scope.row.large_value, dialogRow.baseValue)"
            >
              {{ formatVolume(scope.row.large_value) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          property="large_ratio"
          label="買率"
          header-align="center"
          align="right"
        >
          <template #default="scope">
            <div
              :style="backgroundStyleRatio(scope.row.large_value, scope.row.large_ratio)"
            >
              {{ scope.row.large_value > 0 ? scope.row.large_ratio : "-" }} %
            </div>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, h } from "vue";
import { io } from "socket.io-client";

useHead({ title: "通知受信" });
const config = useRuntimeConfig().public;
const realtimeTableRef = ref<InstanceType<typeof ElTable>>();
const filtered = ref(false);
const selectedSymbols = ref([]);
const symbols = reactive({});
const ranklist = reactive({});
const now = ref("08:00:00");
const dialogVisible = ref(false);
const dialogRow = ref({});
const isAudio = useState("isAudio");

const dashboardColors = [
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
      if (isAudio.value) {
        if (recent_score > 0) {
          bullAudio.play();
        } else {
          bearAudio.play();
        }
        ElNotification({
          title: `${notice.score} - ${notice.time}`,
          message: h(
            "b",
            { style: `color: ${colorCode}` },
            `${notice.code}: ${notice.name.substring(0, 12)}`
          ),
          duration: 6000,
          position: "bottom-right",
          onClick: () => copyToClipboard(notice.code),
        });
      }
    }
  });
});

const colorRows = (v) => {
  const timeLines = ranklist[v.row.code].timeLines;
  if (timeLines.length > 0) {
    const timeLine = timeLines[timeLines.length - 1];
    if (timeLine.middle_ratio > 50 && timeLine.large_ratio > 75) {
      return "bg-chance";
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
const formatName = (r, c, v, i) => {
  const limit = 20;
  if (v.length > limit) {
    return `${v.substring(0, limit)}...`;
  }
  return v;
};
const formatRate = (v) => {
  return `${Math.round(v * 10) / 10} %`;
};
const formatVolume = (v) => {
  const t = v < 0 ? v * -1 : v;
  if (t >= 1000000000) return `${Math.round(v / 100000000) / 10}g`;
  if (t >= 1000000) return `${Math.round(v / 100000) / 10}m`;
  if (t >= 1000) return `${Math.round(v / 100) / 10}k`;
  if (t >= 1) return v;
  return "-";
};
const colorFirstSign = (bidSign, askSign) => {
  if (bidSign == "0118") return "text-blue5";
  if (askSign == "0118") return "text-red5";
  if (bidSign == "0102" || askSign == "0102") return "text-yellow";
  return "";
};
const colorSecondSign = (bidSign, askSign) => {
  if (bidSign == "0118" || bidSign == "0102") return "text-blue5";
  if (askSign == "0118" || askSign == "0102") return "text-red5";
  return "";
};
const formatFirstSign = (bidSign, askSign) => {
  if (bidSign == "0118" || askSign == "0118") return "連";
  if (bidSign == "0102" || askSign == "0102") return "特";
  return "";
};
const formatSecondSign = (bidSign, askSign) => {
  if (bidSign == "0118" || bidSign == "0102") return "売";
  if (askSign == "0118" || askSign == "0102") return "買";
  return "";
};
const colorRate = (v) => {
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
const colorVolume = (v, sob) => {
  const t = v < 0 ? v * -1 : v;
  if (sob > 0 && t > 80000) return "text-red9";
  if (sob > 0 && t > 70000) return "text-red8";
  if (sob > 0 && t > 60000) return "text-red7";
  if (sob > 0 && t > 50000) return "text-red6";
  if (sob > 0 && t > 40000) return "text-red5";
  if (sob > 0 && t > 30000) return "text-red4";
  if (sob > 0 && t > 20000) return "text-red3";
  if (sob > 0 && t > 10000) return "text-red2";
  if (sob > 0 && t > 0) return "text-red1";
  if (sob < 0 && t > 80000) return "text-blue9";
  if (sob < 0 && t > 70000) return "text-blue8";
  if (sob < 0 && t > 60000) return "text-blue7";
  if (sob < 0 && t > 50000) return "text-blue6";
  if (sob < 0 && t > 40000) return "text-blue5";
  if (sob < 0 && t > 30000) return "text-blue4";
  if (sob < 0 && t > 20000) return "text-blue3";
  if (sob < 0 && t > 10000) return "text-blue2";
  if (sob < 0 && t > 0) return "text-blue1";
  return "";
};
const colorValue = (v) => {
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
const colorTick = (v) => {
  if (v >= 600) return "text-red9";
  if (v >= 500) return "text-red8";
  if (v >= 450) return "text-red7";
  if (v >= 400) return "text-red6";
  if (v >= 350) return "text-red5";
  if (v >= 300) return "text-red4";
  if (v >= 250) return "text-red3";
  if (v >= 200) return "text-red2";
  if (v >= 150) return "text-red1";
  if (v >= 100) return "text-blue1";
  if (v >= 80) return "text-blue2";
  if (v >= 60) return "text-blue3";
  if (v >= 40) return "text-blue4";
  if (v >= 30) return "text-blue5";
  if (v >= 20) return "text-blue6";
  if (v >= 10) return "text-blue7";
  if (v >= 5) return "text-blue8";
  return "text-blue9";
};
const colorLimitOrderRate = (v) => {
  if (v >= 500) return "text-red9";
  if (v >= 400) return "text-red8";
  if (v >= 300) return "text-red7";
  if (v >= 250) return "text-red6";
  if (v >= 200) return "text-red5";
  if (v >= 150) return "text-red4";
  if (v >= 100) return "text-red3";
  if (v >= 50) return "text-red2";
  if (v >= 10) return "text-red1";
  if (v <= -500) return "text-blue9";
  if (v <= -400) return "text-blue8";
  if (v <= -300) return "text-blue7";
  if (v <= -250) return "text-blue6";
  if (v <= -200) return "text-blue5";
  if (v <= -150) return "text-blue4";
  if (v <= -100) return "text-blue3";
  if (v <= -50) return "text-blue2";
  if (v <= -10) return "text-blue1";
  return "";
};

const backgroundStyleVolume = (volume, baseVolume) => {
  const ratio = (volume / baseVolume) * 100;
  return `background: linear-gradient(to right, rgba(255, 235, 59, 0.5) ${ratio}%, transparent ${ratio}%)`;
};
const backgroundStyleRatio = (num, ratio) => {
  if (num) {
    return `background: linear-gradient(to left, #f44336 ${ratio}%, #2196f3 ${ratio}%)`;
  }
  return "";
};
</script>
