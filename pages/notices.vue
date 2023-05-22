<template>
  <el-container>
    <el-main>
      <el-card>
        <el-table :data="infomations" style="width: 100%">
          <el-table-column prop="time" label="時刻"/>
          <el-table-column prop="code" label="コード"/>
          <el-table-column prop="name" label="銘柄名"/>
          <el-table-column label="現値" align="right">
            <template #default="scope">
              <span :class="colorPrice(scope.row.status)">{{ scope.row.currentprice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="前日比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.previouscloseratio)">{{ formatRate(scope.row.previouscloseratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="VWAP比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.vwapratio)">{{ formatRate(scope.row.vwapratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出来高" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.tradingvolume, scope.row.sob)">{{ formatVolume(scope.row.tradingvolume) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注文" align="right">
            <template #default="scope">
              <span v-if="scope.row.bidorder != null" :class="colorVolume(scope.row.bidorder.qty, -1)">{{ formatOrder(scope.row.bidorder) }}</span>
              <span v-if="scope.row.askorder != null" :class="colorVolume(scope.row.askorder.qty,  1)">{{ formatOrder(scope.row.askorder) }}</span>
              <span v-else></span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
  <el-container>
    <el-main>
      <el-select v-model="colnum" size="small" style="width: 60px">
        <el-option
          v-for="item in colnums"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-main>
  </el-container>
  <el-row :gutter="10" >
    <el-col :span="colnum" v-if="Object.keys(ticks).length===0">
      <el-card>
        <el-skeleton :rows="6" animated />
      </el-card>
    </el-col>
    <el-col :span="colnum" v-for="v, k in ticks">
      <el-card>
          <template #header>
            <div class="card-header">
              <el-tooltip
                content="Copied!!"
                trigger="click"
                placement="top"
                effect="light">
                <el-button size="large" text @click="copyToClipboard(k)">{{ k }}: {{ v[0].name }}</el-button>
              </el-tooltip>
            </div>
          </template>
        <el-table :data="v" style="width: 100%" :row-class-name="flashLatestRow">
          <el-table-column prop="time" label="時刻"/>
          <el-table-column label="現値" align="right">
            <template #default="scope">
              <span :class="colorPrice(scope.row.status)">{{ scope.row.currentprice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="前日比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.previouscloseratio)">{{ formatRate(scope.row.previouscloseratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="VWAP比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.vwapratio)">{{ formatRate(scope.row.vwapratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出来高" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.tradingvolume, scope.row.sob)">{{ formatVolume(scope.row.tradingvolume) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注文" align="right">
            <template #default="scope">
              <span v-if="scope.row.bidorder != null" :class="colorVolume(scope.row.bidorder.qty, -1)">{{ formatOrder(scope.row.bidorder) }}</span>
              <span v-if="scope.row.askorder != null" :class="colorVolume(scope.row.askorder.qty,  1)">{{ formatOrder(scope.row.askorder) }}</span>
              <span v-else></span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
  import { io } from "socket.io-client"
  import { reactive, ref, onMounted } from "vue";
  
  const colnums = [
    {value: 8, label: "3列"},
    {value: 6, label: "4列"},
    {value: 4, label: "6列"},
    {value: 3, label: "8列"}
  ]

  const config = useRuntimeConfig()
  const colnum = ref(6)
  const ticks = reactive({})
  const infomations = reactive([])
  onMounted(() => {
    const socket = io(config.public.wsBaseURL);
    socket.on("new-msg", msg => {
      const key = Object.keys(msg)[0]
      const data = reactive(msg[key])

      if (!ticks[key]) {
        ticks[key] = [];
      }
      while (ticks[key].length > 5) {
        ticks[key].shift();
      }
      while (infomations.length > 10) {
        infomations.shift();
      }

      data.flash = true
      ticks[key].push(data);
      infomations.push(data);
      setTimeout(() => {
        data.flash = false;
      }, 100);
    });
  })

  const copyToClipboard = (v) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(v);
    }
  }
  const formatRate = (v) => {
    return `${Math.round(v * 10) / 10}%`;
  }
  const formatVolume = (v) => {
    return v > 0 ? `${Math.round(v / 1000)}k` : null;
  }
  const formatOrder = (v) => {
    if (!v) {
      return null
    }
    const price = v.price ? v.price : "--- ";
    const qty = formatVolume(v.qty);
    return `${price}:${qty}`;
  }
  const colorRatio = (v) => {
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
  const colorVolume = (v, sob) => {
    if (sob > 0 && v > 80000) return "text-red9";
    if (sob > 0 && v > 70000) return "text-red8";
    if (sob > 0 && v > 60000) return "text-red7";
    if (sob > 0 && v > 50000) return "text-red6";
    if (sob > 0 && v > 40000) return "text-red5";
    if (sob > 0 && v > 30000) return "text-red4";
    if (sob > 0 && v > 20000) return "text-red3";
    if (sob > 0 && v > 10000) return "text-red2";
    if (sob > 0 && v >     0) return "text-red1";
    if (sob < 0 && v > 80000) return "text-blue9";
    if (sob < 0 && v > 70000) return "text-blue8";
    if (sob < 0 && v > 60000) return "text-blue7";
    if (sob < 0 && v > 50000) return "text-blue6";
    if (sob < 0 && v > 40000) return "text-blue5";
    if (sob < 0 && v > 30000) return "text-blue4";
    if (sob < 0 && v > 20000) return "text-blue3";
    if (sob < 0 && v > 10000) return "text-blue2";
    if (sob < 0 && v >     0) return "text-blue1";
    return ""
  }
  const colorPrice = (v) => {
    if (v == "nowopened") return "text-green";
    if (v == "freezing")  return "text-gray";
    return ""
  }
  const flashLatestRow = (r, i) => {
    if (r.row.flash) return "bg-highlight"
    return ""
  }
</script>
