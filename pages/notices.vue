<template>
  <el-container>
    <el-main>
      <el-card>
        <el-table :data="ranklist" height="1024" style="width: 100%" @row-click="(r, c, e) => { copyToClipboard(r.code) }">
          <el-table-column prop="code" label="コード" width="100"/>
          <el-table-column prop="name" label="銘柄名" width="250" :formatter="formatName"/>
          <el-table-column label="買約定" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.buyCount*10000, 1)">{{ scope.row.buyCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="売約定" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.sellCount*10000, -1)">{{ scope.row.sellCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="直近一分／板更新" align="right">
            <template #default="scope">
              <span :class="colorTick(scope.row.tickcountbyminute)">{{ formatVolume(scope.row.tickcountbyminute) }} / {{ formatVolume(scope.row.tickcounttotal) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="直近一分／出来高" align="right">
            <template #default="scope">
              <span :class="colorValue(scope.row.tradingvolumebyminute*scope.row.currentprice, 1)">{{ formatVolume(scope.row.tradingvolumebyminute) }} / {{ formatVolume(scope.row.tradingvolumetotal) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="現値" align="right">
            <template #default="scope">
              <span :class="colorPrice(scope.row.status)">{{ scope.row.currentprice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="前日比" align="right">
            <template #default="scope">
              <span :class="colorRate(scope.row.previouscloserate)">{{ formatRate(scope.row.previouscloserate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="VWAP比" align="right">
            <template #default="scope">
              <span :class="colorRate(scope.row.vwaprate)">{{ formatRate(scope.row.vwaprate) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
  <el-container>
    <el-main>
      <el-space wrap>
        <el-select v-model="colnum" style="width: 80px">
          <el-option
            v-for="item in colnums"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="selectedSymbols"
          multiple
          collapse-tags
          collapse-tags-tooltip
          style="width: 320px"
        >
          <el-option
            v-for="v, k in symbols"
            :key="k"
            :label="`${k}: ${v.name}`"
            :value="k"
          />
        </el-select>
        <el-switch v-model="filtered" inline-prompt :active-icon="Filter" size="large"/>
      </el-space>
    </el-main>
  </el-container>
  <el-row :gutter="10" >
    <el-col :span="colnum" v-if="Object.keys(symbols).length===0">
      <el-card>
        <el-skeleton :rows="6" animated />
      </el-card>
    </el-col>
    <el-col :span="colnum" v-show="!filtered || selectedSymbols.includes(k)" v-for="v, k in symbols">
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
    </el-col>
  </el-row>
</template>

<script setup>
  import { io } from "socket.io-client";
  import { reactive, ref, onMounted } from "vue";
  import { Filter } from "@element-plus/icons-vue";

  const config = useRuntimeConfig().public
  const colnums = [
    {value:24, label: "1列"},
    {value: 8, label: "3列"},
    {value: 6, label: "4列"},
    {value: 4, label: "6列"},
    {value: 3, label: "8列"}
  ]

  const colnum = ref(6)
  const filtered = ref(false)
  const selectedSymbols = ref([])
  const symbols = reactive({})
  const ranklist = reactive([])

  onMounted(() => {
    const socket = io(config.wsBaseURL);
    socket.on("initial-notice", notices => {
      for (const notice of notices) {
        const code = notice.code;
        const name = notice.name;
        if (!symbols[code]) {
          symbols[code] = { name: name, data: [] };
          ranklist.push({
            code: code,
            name: name,
            buyCount: 0,
            sellCount: 0,
            tickcounttotal: 0,
            tickcountbyminute: 0,
            currentprice: 0,
            tradingvolumetotal: 0,
            tradingvolumebyminute: 0,
            previouscloserate: 0,
            vwaprate: 0
          })
        }
      }
    })
    socket.on("action-notice", notice => {
      const code = notice.code;
      const name = notice.name;
      if (!symbols[code]) return
      while (symbols[code].data.length > 5) {
        symbols[code].data.shift();
      }
      if (notice.status) {
        const data = reactive(notice);
        data.flash = true;
        symbols[code].data.push(data);
        setTimeout(() => { data.flash = false; }, 100);
        // 約定通知は約定回数更新後にソートする
        const rankdata = ranklist.find((e) => { return e.code == code});
        if (notice.status == "opening" && notice.tradingvolume > 0) {
          if (notice.sob > 0) {
            rankdata.buyCount++
          } else if (notice.sob < 0) {
            rankdata.sellCount++
          }
          ranklist.sort((a, b) => {
            const ac = a.buyCount - a.sellCount;
            const bc = b.buyCount - b.sellCount;
            if (ac > bc) {
              return -1;
            } else if (ac < bc) {
              return 1;
            } else {
              if (a.tickcount > b.tickcount) {
                return -1;
              } else if (a.tickcount < b.tickcount) {
                return 1;
              } else {
                return 0
              }
            }
          });
        }
      }
    });
    socket.on("regular-notice", notice => {
      const code = notice.code;
      const name = notice.name;
      if (!symbols[code]) return
      const rankdata = ranklist.find((e) => { return e.code == code});
      rankdata.currentprice = notice.currentprice
      rankdata.tickcounttotal = notice.tickcounttotal
      rankdata.tickcountbyminute = notice.tickcountbyminute
      rankdata.tradingvolumetotal = notice.tradingvolumetotal
      rankdata.tradingvolumebyminute = notice.tradingvolumebyminute
      rankdata.previouscloserate = notice.previouscloserate
      rankdata.vwaprate = notice.vwaprate
    });
  })

  const copyToClipboard = (v) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(v);
    }
  }
  const formatName = (r, c, v, i) => {
    const limit = 15;
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
    if (t >= 1000000) {
      return `${Math.round(v / 1000000)}m`;
    } else if (t >= 1000) {
      return `${Math.round(v / 1000)}k`;
    } else if (t > 0) {
      return v;
    } else {
      return "";
    }
  }
  const formatOrder = (v) => {
    if (!v) {
      return null
    }
    const price = v.price ? v.price : "--- ";
    const qty = formatVolume(v.qty);
    return `${price}:${qty}`;
  }
  const colorRate = (v) => {
    const r = Math.round(v * 10) / 10;
    if (r >  8) return  "text-red9";
    if (r >  7) return  "text-red8";
    if (r >  6) return  "text-red7";
    if (r >  5) return  "text-red6";
    if (r >  4) return  "text-red5";
    if (r >  3) return  "text-red4";
    if (r >  2) return  "text-red3";
    if (r >  1) return  "text-red2";
    if (r >  0) return  "text-red1";
    if (r < -8) return "text-blue9";
    if (r < -7) return "text-blue8";
    if (r < -6) return "text-blue7";
    if (r < -5) return "text-blue6";
    if (r < -4) return "text-blue5";
    if (r < -3) return "text-blue4";
    if (r < -2) return "text-blue3";
    if (r < -1) return "text-blue2";
    if (r <  0) return "text-blue1";
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
    const t = Math.round(v / 1000000)
    if (t > 250) return "text-red9";
    if (t > 220) return "text-red8";
    if (t > 180) return "text-red7";
    if (t > 150) return "text-red6";
    if (t > 120) return "text-red5";
    if (t >  90) return "text-red4";
    if (t >  70) return "text-red3";
    if (t >  50) return "text-red2";
    if (t >  35) return "text-red1";
    if (t >  30) return "text-blue1";
    if (t >  26) return "text-blue2";
    if (t >  22) return "text-blue3";
    if (t >  18) return "text-blue4";
    if (t >  14) return "text-blue5";
    if (t >  10) return "text-blue6";
    if (t >   6) return "text-blue7";
    if (t >   2) return "text-blue8";
    if (t >   0) return "text-blue9";
    return ""
  }
  const colorTick = (v) => {
    if (v > 450) return "text-red9";
    if (v > 400) return "text-red8";
    if (v > 350) return "text-red7";
    if (v > 300) return "text-red6";
    if (v > 250) return "text-red5";
    if (v > 200) return "text-red4";
    if (v > 150) return "text-red3";
    if (v > 100) return "text-red2";
    if (v >  50) return "text-red1";
    if (v >  40) return "text-blue1";
    if (v >  35) return "text-blue2";
    if (v >  30) return "text-blue3";
    if (v >  25) return "text-blue4";
    if (v >  20) return "text-blue5";
    if (v >  15) return "text-blue6";
    if (v >  10) return "text-blue7";
    if (v >   5) return "text-blue8";
    if (v >   0) return "text-blue1";
    return ""
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
