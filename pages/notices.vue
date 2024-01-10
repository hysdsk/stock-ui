<template>
  <el-row :gutter="10" >
    <el-col :span="24">
      <el-card>
        <el-descriptions :column="5" border>
          <el-descriptions-item label="現在時刻" label-align="center" align="right" width="10%">
            {{ now }}
          </el-descriptions-item>
          <el-descriptions-item label="総板更新数" label-align="center" align="right" width="10%">
            {{ Object.keys(ranklist).length > 0 ? Object.values(ranklist).map(e => e.tickcountbyminute).reduce((a, b) => a + b).toLocaleString() : 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="総売買代金" label-align="center" align="right" width="10%">
            {{ Object.keys(ranklist).length > 0 ? Object.values(ranklist).map(e => e.trading_value_by_min).reduce((a, b) => a + b).toLocaleString() : 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="前日超数" label-align="center" align="center" width="10%">
            {{ Object.values(ranklist).filter(e => e.previouscloserate > 0).length }} ／ {{ Object.keys(ranklist).length }}
          </el-descriptions-item>
          <el-descriptions-item label="陽線数" label-align="center" align="center" width="10%">
            {{ Object.values(ranklist).filter(e => e.openingrate > 0).length }} ／ {{ Object.keys(ranklist).length }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card>
        <el-table
          row-key="code"
          ref="realtimeTableRef"
          :data="Object.values(ranklist)"
          :row-class-name="colorRows"
          @row-click="(r, c, e) => { copyToClipboard(r.code) }"
          height="1024"
        >
          <el-table-column type="selection" header-align="center" align="center" width="50" reserve-selection fixed/>
          <el-table-column prop="code" label="コード" header-align="center" align="center" width="100" sortable fixed>
            <template #default="scope">
              <span :class="colorSelectedText(scope.row.code)">{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="銘柄名" header-align="center" :formatter="formatName" width="320" sortable fixed>
            <template #default="scope">
              <span :class="colorSelectedText(scope.row.code)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="気配" header-align="center" align="center" width="80">
            <template #default="scope">
              <span :class="colorFirstSign(scope.row.bidsign, scope.row.asksign)">{{ formatFirstSign(scope.row.bidsign, scope.row.asksign) }}</span>
              <span :class="colorSecondSign(scope.row.bidsign, scope.row.asksign)">{{ formatSecondSign(scope.row.bidsign, scope.row.asksign) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="currentprice" label="現値" header-align="center" align="right" width="100" sortable>
            <template #default="scope">
              <span :class="colorRate(scope.row.previouscloserate)">{{ scope.row.currentprice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="現値対比" header-align="center">
            <el-table-column prop="previouscloserate" label="前日" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span :class="colorRate(scope.row.previouscloserate)">{{ formatRate(scope.row.previouscloserate) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="openingrate" label="始値" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span :class="colorRate(scope.row.openingrate)">{{ formatRate(scope.row.openingrate) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="vwaprate" label="VWAP" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span :class="colorRate(scope.row.vwaprate)">{{ formatRate(scope.row.vwaprate) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="threshold" label="閾値" header-align="center" align="right" width="80" sortable>
            <template #default="scope">
              <span>{{ formatVolume(scope.row.threshold) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="大約定" header-align="center">
            <el-table-column prop="sellCount" label="売" header-align="center" align="center" width="80" sortable>
              <template #default="scope">
                <span :class="colorVolume(scope.row.sellCount*10000, -1)">{{ scope.row.sellCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="buyCount" label="買" header-align="center" align="center" width="80" sortable>
              <template #default="scope">
                <span :class="colorVolume(scope.row.buyCount*10000, 1)">{{ scope.row.buyCount }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="毎分" header-align="center">
            <el-table-column prop="tickcountbyminute" label="板" header-align="center" align="right" width="80" sortable>
              <template #default="scope">
                <span :class="colorTick(scope.row.tickcountbyminute)">{{ formatVolume(scope.row.tickcountbyminute) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="trading_value_by_min" label="金" header-align="center" align="right" width="80" sortable>
              <template #default="scope">
                <span :class="colorValue(scope.row.trading_value_by_min)">{{ formatVolume(scope.row.trading_value_by_min) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="score" label="スコア" header-align="center" align="right" width="150" sortable>
            <template #default="scope">
              <span class="">{{ scope.row.scoreHistory.join(" ← ") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注文" header-align="center">
            <el-table-column prop="avgLimitOrderSellQty" label="売指" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-blue3">{{ formatVolume(scope.row.avgLimitOrderSellQty) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="avgLimitOrderBuyQty" label="買指" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-red3">{{ formatVolume(scope.row.avgLimitOrderBuyQty) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="marketOrderSellQty" label="売成" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-blue3">{{ formatVolume(scope.row.marketOrderSellQty) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="marketOrderBuyQty" label="買成" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-red3">{{ formatVolume(scope.row.marketOrderBuyQty) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="overSellQty" label="売圧" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-blue3">{{ formatVolume(scope.row.overSellQty) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="underBuyQty" label="買圧" header-align="center" align="right" width="100" sortable>
              <template #default="scope">
                <span class="text-red3">{{ formatVolume(scope.row.underBuyQty) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
    <!-- <el-col :span="6" v-show="showEachSymbol(k)" v-for="v, k in symbols">
      <el-card>
          <template #header>
            <div class="card-header">
              <el-tooltip
                content="Copied!!"
                trigger="click"
                placement="top"
                effect="light">
                <el-button size="large" text @click="copyToClipboard(k)">{{ k }}: {{ v.name }}</el-button>
              </el-tooltip>
            </div>
          </template>
        <el-table :data="v.data" style="width: 100%" :row-class-name="flashLatestRow">
          <el-table-column prop="time" label="時刻" width="100"/>
          <el-table-column label="現値" align="right">
            <template #default="scope">
              <span :class="colorPrice(scope.row.status)">{{ scope.row.currentprice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="約定" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.tradingvolume, scope.row.sob)">{{ formatVolume(scope.row.tradingvolume) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注文" align="right">
            <template #default="scope">
              <span v-if="scope.row.order != null" :class="colorVolume(scope.row.order.qty, scope.row.order.type)">{{ formatOrder(scope.row.order) }}</span>
              <span v-else></span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col> -->
    <el-col :span="6" v-show="showEachSymbol(k)" v-for="v, k in symbols">
      <el-card>
          <template #header>
            <div class="card-header">
              <el-tooltip
                content="Copied!!"
                trigger="click"
                placement="top"
                effect="light">
                <el-button size="large" text @click="copyToClipboard(k)">{{ k }}: {{ v.name }}</el-button>
              </el-tooltip>
            </div>
          </template>
        <el-table :data="v.scores" style="width: 100%" :row-class-name="flashLatestRow">
          <el-table-column prop="time" label="時刻" width="100"/>
          <el-table-column label="現値" align="right">
            <template #default="scope">
              <span>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="スコア" align="right">
            <template #default="scope">
              <span>{{ scope.row.score }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, h } from "vue";
  import { io } from "socket.io-client";

  useHead({title: "通知受信"})
  const config = useRuntimeConfig().public;
  const realtimeTableRef = ref<InstanceType<typeof ElTable>>();
  const filtered = ref(false);
  const selectedSymbols = ref([]);
  const symbols = reactive({});
  const ranklist = reactive({});
  const now = ref("08:00:00");

  onMounted(async () => {
    const socket = io(config.wsBaseURL);
    socket.on("initial-notice", notices => {
      for (const notice of notices) {
        const code = notice.code;
        const name = notice.name;
        if (!symbols[code]) {
          symbols[code] = { name: name, data: [], scores: [] };
          ranklist[code] = {
            code: code,
            name: name,
            threshold: notice.threshold,
            buyCount: 0,
            sellCount: 0,
            currentprice: 0,
            tickcountbyminute: 0,
            trading_value_by_min: 0,
            previouscloserate: 0,
            openingrate: 0,
            vwaprate: 0,
            overSellQty: 0,
            underBuyQty: 0,
            marketOrderSellQty: 0,
            marketOrderBuyQty: 0,
            avgLimitOrderSellQty: 0,
            avgLimitOrderBuyQty: 0,
            bidsign: "",
            asksign: "",
            score: null,
            scoreHistory: []
          }
        }
      }
    })
    socket.on("action-notice", notice => {
      const code = notice.code;
      if (!symbols[code]) return
      while (symbols[code].data.length > 5) {
        symbols[code].data.shift();
      }
      const data = reactive(notice);
      data.flash = true;
      symbols[code].data.push(data);
      setTimeout(() => { data.flash = false; }, 100);
      // 約定通知時に約定回数をインクリメントする
      const rankdata = ranklist[code];
      if (notice.order == null && notice.status == "opening") {
        if (notice.sob > 0) {
          rankdata.buyCount++
          ElNotification({
            title: notice.time,
            message: h("b", {style: "color: #f44336"}, `買約定 ${rankdata.code}: ${rankdata.name.substring(0, 10)}`),
            onClick: () => copyToClipboard(rankdata.code)
          });
        } else if (notice.sob < 0) {
          rankdata.sellCount++
          ElNotification({
            title: notice.time,
            message: h("b", {style: "color: #2196f3"}, `売約定 ${rankdata.code}: ${rankdata.name.substring(0, 10)}`),
            onClick: () => copyToClipboard(rankdata.code)
          });
        }
      } else if (notice.order != null) {
        if (notice.order.type > 0 && notice.order.price == null && notice.order.qty > 0) {
          // 成行買い
          ElNotification({
            title: notice.time,
            message: h("b", {style: "color: #f44336"}, `成行買 ${rankdata.code}: ${rankdata.name.substring(0, 10)}`),
            onClick: () => copyToClipboard(rankdata.code)
          });
        } else if (notice.order.type < 0 && notice.order.price == null && notice.order.qty > 0) {
          // 成行売り
          ElNotification({
            title: notice.time,
            message: h("b", {style: "color: #2196f3"}, `成行売 ${rankdata.code}: ${rankdata.name.substring(0, 10)}`),
            onClick: () => copyToClipboard(rankdata.code)
          });
        }
      }
    });
    socket.on("regular-notice", notice => {
      now.value = notice.time;
      const code = notice.code;
      if (!symbols[code]) return;
      const rankdata = ranklist[code];
      rankdata.threshold = notice.threshold;
      rankdata.currentprice = notice.currentprice;
      rankdata.tickcountbyminute = notice.tickcountbyminute;
      rankdata.trading_value_by_min = notice.trading_value_by_min;
      rankdata.previouscloserate = notice.previouscloserate;
      rankdata.openingrate = notice.openingrate;
      rankdata.vwaprate = notice.vwaprate;
      rankdata.overSellQty = notice.over_sell_qty;
      rankdata.underBuyQty = notice.under_buy_qty;
      rankdata.marketOrderSellQty = notice.market_order_sell_qty;
      rankdata.marketOrderBuyQty = notice.market_order_buy_qty;
      rankdata.avgLimitOrderSellQty = notice.avg_limit_order_sell_qty;
      rankdata.avgLimitOrderBuyQty = notice.avg_limit_order_buy_qty;
      rankdata.bidsign = notice.bidsign;
      rankdata.asksign = notice.asksign;
      if (rankdata.score != notice.score) {
        rankdata.scoreHistory.unshift(notice.score);
        rankdata.score = notice.score;
        symbols[code].scores.push({
          time: notice.time,
          price: notice.currentprice,
          score: notice.score,
        })
        while (rankdata.scoreHistory.length > 3) {
          rankdata.scoreHistory.pop();
        }
        while (symbols[code].scores.length > 5) {
          symbols[code].scores.shift();
        }
      }
    });
  })

  const showEachSymbol = (code) => {
    const rows = realtimeTableRef.value!.getSelectionRows();
    return (rows.length > 0 && rows.filter(row => row.code == code).length > 0);
  }
  const colorSelectedText = (v) => {
    const rows = realtimeTableRef.value!.getSelectionRows();
    if (rows.length > 0 && rows.filter(row => row.code == v).length > 0) {
      return "text-selected";
    }
  }
  const colorRows = (v) => {
    const tvbm = v.row.trading_value_by_min >= (v.row.threshold * 2);
    const scores = symbols[v.row.code].scores;
    if (scores.length > 2) {
      const scoreDiff = scores[scores.length-1].score - scores[scores.length-3].score;
      return tvbm && scoreDiff >= 2 ? "bg-chance" : "";
    }
    return "";
  }
  const copyToClipboard = (v) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(v);
    }
  }
  const formatName = (r, c, v, i) => {
    const limit = 20;
    if (v.length > limit) {
      return `${v.substring(0, limit)}...`;
    }
    return v;
  }
  const formatRatio = (v) => {
    return `${Math.round(v * 100) / 100}%`;
  }
  const formatRate = (v) => {
    return `${Math.round(v * 10) / 10}%`;
  }
  const formatVolume = (v) => {
    const t = v < 0 ? v * -1 : v;
    if (t >= 1000000000) return `${Math.round(v / 100000000)/10}g`;
    if (t >=    1000000) return `${Math.round(v /    100000)/10}m`;
    if (t >=       1000) return `${Math.round(v /       100)/10}k`;
    return v;
  }
  const formatOrder = (v) => {
    if (!v) {
      return null
    }
    const price = v.price ? v.price : "--- ";
    const qty = formatVolume(v.qty);
    return `${price}:${qty}`;
  }
  const colorFirstSign = (bidSign, askSign) => {
    if (bidSign == "0118") return "text-blue5"
    if (askSign == "0118") return "text-red5"
    if (bidSign == "0102" || askSign == "0102") return "text-yellow"
    return ""
  }
  const colorSecondSign = (bidSign, askSign) => {
    if (bidSign == "0118" || bidSign == "0102") return "text-blue5"
    if (askSign == "0118" || askSign == "0102") return "text-red5"
    return ""
  }
  const formatFirstSign = (bidSign, askSign) => {
    if (bidSign == "0118" || askSign == "0118") return "連"
    if (bidSign == "0102" || askSign == "0102") return "特"
    return ""
  }
  const formatSecondSign = (bidSign, askSign) => {
    if (bidSign == "0118" || bidSign == "0102") return "売"
    if (askSign == "0118" || askSign == "0102") return "買"
    return ""
  }
  const colorRate = (v) => {
    const r = Math.round(v * 10) / 10;
    if (r >  16) return  "text-red9";
    if (r >  14) return  "text-red8";
    if (r >  12) return  "text-red7";
    if (r >  10) return  "text-red6";
    if (r >   8) return  "text-red5";
    if (r >   6) return  "text-red4";
    if (r >   4) return  "text-red3";
    if (r >   2) return  "text-red2";
    if (r >   0) return  "text-red1";
    if (r < -16) return "text-blue9";
    if (r < -14) return "text-blue8";
    if (r < -12) return "text-blue7";
    if (r < -10) return "text-blue6";
    if (r <  -8) return "text-blue5";
    if (r <  -6) return "text-blue4";
    if (r <  -4) return "text-blue3";
    if (r <  -2) return "text-blue2";
    if (r <   0) return "text-blue1";
    return ""
  }

  const colorHighRate = (v) => {
    if (v < 0.2) return  "text-red9";
    if (v < 0.5) return  "text-red8";
    if (v < 0.8) return  "text-red7";
    if (v < 1.2) return  "text-red6";
    if (v < 1.5) return  "text-red5";
    if (v < 2.0) return  "text-red4";
    if (v < 2.5) return  "text-red3";
    if (v < 3.0) return  "text-red2";
    if (v < 3.5) return  "text-red1";
    return ""
  }

  const colorLowRate = (v) => {
    if (v > -0.2) return "text-blue9";
    if (v > -0.5) return "text-blue8";
    if (v > -0.8) return "text-blue7";
    if (v > -1.2) return "text-blue6";
    if (v > -1.5) return "text-blue5";
    if (v > -2.0) return "text-blue4";
    if (v > -2.5) return "text-blue3";
    if (v > -3.0) return "text-blue2";
    if (v > -3.5) return "text-blue1";
    return ""
  }

  const colorOrderRate = (v) => {
    return colorRate(v / 100);
  }
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
    if (sob > 0 && t >     0) return "text-red1";
    if (sob < 0 && t > 80000) return "text-blue9";
    if (sob < 0 && t > 70000) return "text-blue8";
    if (sob < 0 && t > 60000) return "text-blue7";
    if (sob < 0 && t > 50000) return "text-blue6";
    if (sob < 0 && t > 40000) return "text-blue5";
    if (sob < 0 && t > 30000) return "text-blue4";
    if (sob < 0 && t > 20000) return "text-blue3";
    if (sob < 0 && t > 10000) return "text-blue2";
    if (sob < 0 && t >     0) return "text-blue1";
    return ""
  }
  const colorValue = (v) => {
    if (v >=  300000000) return "text-red9";
    if (v >=  250000000) return "text-red8";
    if (v >=  200000000) return "text-red7";
    if (v >=  150000000) return "text-red6";
    if (v >=  100000000) return "text-red5";
    if (v >=   90000000) return "text-red4";
    if (v >=   70000000) return "text-red3";
    if (v >=   50000000) return "text-red2";
    if (v >=   30000000) return "text-red1";
    if (v >=   25000000) return "text-blue1";
    if (v >=   20000000) return "text-blue2";
    if (v >=   15000000) return "text-blue3";
    if (v >=   10000000) return "text-blue4";
    if (v >=    8000000) return "text-blue5";
    if (v >=    6000000) return "text-blue6";
    if (v >=    4000000) return "text-blue7";
    if (v >=    2000000) return "text-blue8";
    return                      "text-blue9";
  }
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
    if (v >=  80) return "text-blue2";
    if (v >=  60) return "text-blue3";
    if (v >=  40) return "text-blue4";
    if (v >=  30) return "text-blue5";
    if (v >=  20) return "text-blue6";
    if (v >=  10) return "text-blue7";
    if (v >=   5) return "text-blue8";
    return               "text-blue9";
  }
  const colorPrice = (v) => {
    if (v == "nowopened") return "text-green";
    if (v == "reopened")  return "text-green";
    if (v == "resumed")   return "text-yellow";
    if (v == "freezing")  return "text-gray";
    if (v == "preparing") return "text-gray";
    if (v == "resting")   return "text-gray";
    return ""
  }
  const flashLatestRow = (r, i) => {
    if (r.row.flash) return "bg-highlight"
    return ""
  }
</script>
