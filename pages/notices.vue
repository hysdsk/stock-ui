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
          :row-class-name="colorRows"
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
              sortable
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
    :title="`${dialogRow.code}: ${dialogRow.name}`"
    width="1024"
  >
    <NoticeSymbolInfo :symbol="dialogRow"/>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Table v1" name="1">
        <NoticeSymbolTable :symbol="dialogRow"/>
      </el-tab-pane>
      <el-tab-pane label="Table v2" name="2">
        <NoticeSymbolTableV2 :symbol="dialogRow"/>
      </el-tab-pane>
      <el-tab-pane label="Scores" name="3">
        <el-scrollbar max-height="768">
          <el-timeline>
            <el-timeline-item
              v-for="(score, index) in dialogRow.scores"
              :key="index"
              :color="score.point > 0 ? '#f44336' : '#2196f3'"
              :timestamp="score.time"
              placement="top"
              size="large"
            >
              {{ score.label }}
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, h } from "vue";
import { io } from "socket.io-client";
import { Bell, MuteNotification } from "@element-plus/icons-vue";
import { formatSymbolName, formatVolume, formatRate, formatFirstSign, formatSecondSign } from "@/modules/ValueFormatter";
import { colorRate, colorValue, backgroundStrengthRatioV2, colorFirstSign, colorSecondSign } from "@/modules/StyleHelper";

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
</script>
