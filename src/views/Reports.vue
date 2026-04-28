<!-- 統計報表頁 -->
<template>
  <div class="reports">

    <!-- 標題 + 期別選擇器 -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <h2 class="mb-0">
        <i class="bi bi-bar-chart me-2"></i>統計報表
      </h2>
      <div class="d-flex align-items-center gap-2">
        <label class="fw-semibold text-muted small">發票期別</label>
        <select class="form-select form-select-sm period-select" v-model="selectedPeriod" @change="onPeriodChange">
          <option value="all">全部</option>
          <option v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </div>
    </div>

    <!-- 總覽統計卡片 -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="stat-card stat-blue">
          <i class="bi bi-receipt-cutoff stat-icon"></i>
          <div class="stat-body">
            <div class="stat-label">發票總數</div>
            <div class="stat-value">{{ filteredStats.total }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-green">
          <i class="bi bi-cash-stack stat-icon"></i>
          <div class="stat-body">
            <div class="stat-label">總消費金額</div>
            <div class="stat-value">${{ filteredStats.totalAmount.toLocaleString() }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-yellow">
          <i class="bi bi-trophy-fill stat-icon"></i>
          <div class="stat-body">
            <div class="stat-label">中獎發票</div>
            <div class="stat-value">{{ filteredStats.winningCount }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-cyan">
          <i class="bi bi-calculator stat-icon"></i>
          <div class="stat-body">
            <div class="stat-label">平均消費</div>
            <div class="stat-value">${{ filteredStats.average.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖表區域 -->
    <div class="row g-4 mb-4">
      <!-- 分類圓餅圖 -->
      <div class="col-lg-5">
        <div class="chart-card">
          <div class="chart-header">
            <i class="bi bi-pie-chart me-2"></i>消費分類統計
          </div>
          <div class="chart-body">
            <canvas ref="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 月份折線圖 -->
      <div class="col-lg-7">
        <div class="chart-card">
          <div class="chart-header chart-header-green">
            <i class="bi bi-graph-up me-2"></i>月份消費趨勢
          </div>
          <div class="chart-body">
            <canvas ref="monthChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 分類明細表 -->
    <div class="chart-card">
      <div class="chart-header chart-header-cyan">
        <i class="bi bi-table me-2"></i>分類詳細資料
        <span class="ms-2 badge bg-white text-dark">{{ selectedPeriodLabel }}</span>
      </div>
      <div class="chart-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">分類</th>
                <th>發票數量</th>
                <th>總金額</th>
                <th>平均金額</th>
                <th class="pe-4">佔比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, category) in categoryDetails" :key="category">
                <td class="ps-4">
                  <span class="badge rounded-pill bg-secondary">{{ category }}</span>
                </td>
                <td>{{ data.count }} 筆</td>
                <td class="fw-semibold">${{ data.amount.toLocaleString() }}</td>
                <td>${{ Math.round(data.amount / data.count).toLocaleString() }}</td>
                <td class="pe-4" style="min-width:160px">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height:10px; border-radius:99px;">
                      <div class="progress-bar" :style="{ width: data.percentage + '%', background: data.color }"></div>
                    </div>
                    <span class="small text-muted">{{ data.percentage }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="Object.keys(categoryDetails).length === 0">
                <td colspan="5" class="text-center text-muted py-4">此期別無資料</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../services/api'

Chart.register(...registerables)

const CHART_COLORS = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF','#7BC67E']

// 台灣財政部發票期別（每兩個月一期）
function generatePeriods() {
  const periods = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year >= currentYear - 2; year--) {
    const pairs = [[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]]
    for (let i = pairs.length - 1; i >= 0; i--) {
      const [m1, m2] = pairs[i]
      periods.push({
        value: `${year}-${String(m1).padStart(2,'0')}-${String(m2).padStart(2,'0')}`,
        label: `${year}年 ${m1}-${m2}月`,
        months: [
          `${year}-${String(m1).padStart(2,'0')}`,
          `${year}-${String(m2).padStart(2,'0')}`
        ]
      })
    }
  }
  return periods
}

export default {
  name: 'Reports',
  setup() {
    const allInvoices = ref([])
    const selectedPeriod = ref('all')
    const periods = generatePeriods()
    const categoryChart = ref(null)
    const monthChart = ref(null)
    let categoryChartInstance = null
    let monthChartInstance = null

    // 目前選擇的期別標籤
    const selectedPeriodLabel = computed(() => {
      if (selectedPeriod.value === 'all') return '全部期別'
      return periods.find(p => p.value === selectedPeriod.value)?.label || ''
    })

    // 目前期別對應的月份
    const selectedMonths = computed(() => {
      if (selectedPeriod.value === 'all') return null
      return periods.find(p => p.value === selectedPeriod.value)?.months || null
    })

    // 篩選後的發票
    const filteredInvoices = computed(() => {
      if (!selectedMonths.value) return allInvoices.value
      return allInvoices.value.filter(inv => {
        const month = (inv.date || '').substring(0, 7)
        return selectedMonths.value.includes(month)
      })
    })

    // 篩選後的統計
    const filteredStats = computed(() => {
      const invoices = filteredInvoices.value
      const totalAmount = invoices.reduce((s, inv) => s + (parseFloat(inv.amount) || 0), 0)
      return {
        total: invoices.length,
        totalAmount: Math.round(totalAmount),
        winningCount: invoices.filter(inv => inv.isWinning).length,
        average: invoices.length ? Math.round(totalAmount / invoices.length) : 0
      }
    })

    // 分類詳細
    const categoryDetails = computed(() => {
      const invoices = filteredInvoices.value
      const total = invoices.reduce((s, inv) => s + (parseFloat(inv.amount) || 0), 0)
      const map = {}
      invoices.forEach(inv => {
        const cat = inv.category || '未分類'
        if (!map[cat]) map[cat] = { count: 0, amount: 0 }
        map[cat].count++
        map[cat].amount += parseFloat(inv.amount) || 0
      })
      const keys = Object.keys(map)
      keys.forEach((cat, i) => {
        map[cat].amount = Math.round(map[cat].amount)
        map[cat].percentage = total ? Math.round((map[cat].amount / total) * 100) : 0
        map[cat].color = CHART_COLORS[i % CHART_COLORS.length]
      })
      return map
    })

    // 月份統計
    const monthStats = computed(() => {
      const invoices = filteredInvoices.value
      const map = {}
      invoices.forEach(inv => {
        if (!inv.date) return
        const month = inv.date.substring(0, 7)
        if (!map[month]) map[month] = 0
        map[month] += parseFloat(inv.amount) || 0
      })
      return map
    })

    const createCharts = () => {
      // 圓餅圖
      if (categoryChartInstance) categoryChartInstance.destroy()
      const catLabels = Object.keys(categoryDetails.value)
      const catData = Object.values(categoryDetails.value).map(d => d.amount)
      const catColors = catLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])

      categoryChartInstance = new Chart(categoryChart.value, {
        type: 'pie',
        data: {
          labels: catLabels,
          datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 2 }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } },
            title: { display: false }
          }
        }
      })

      // 折線圖
      if (monthChartInstance) monthChartInstance.destroy()
      const monthLabels = Object.keys(monthStats.value).sort()
      const monthData = monthLabels.map(m => Math.round(monthStats.value[m]))

      monthChartInstance = new Chart(monthChart.value, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [{
            label: '消費金額',
            data: monthData,
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54,162,235,0.15)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#36A2EB',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: v => '$' + v.toLocaleString() }
            }
          }
        }
      })
    }

    const onPeriodChange = () => {
      createCharts()
    }

    const loadData = async () => {
      try {
        const res = await api.getInvoices()
        allInvoices.value = res.data
        createCharts()
      } catch (e) {
        console.error('載入資料失敗:', e)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      periods,
      selectedPeriod,
      selectedPeriodLabel,
      filteredStats,
      categoryDetails,
      categoryChart,
      monthChart,
      onPeriodChange
    }
  }
}
</script>

<style scoped>
.period-select {
  min-width: 160px;
  border-radius: 8px;
  font-size: 13px;
}

/* 統計卡片 */
.stat-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.stat-blue   { background: linear-gradient(135deg, #4f8ef7, #2563eb); }
.stat-green  { background: linear-gradient(135deg, #34d399, #059669); }
.stat-yellow { background: linear-gradient(135deg, #fbbf24, #d97706); }
.stat-cyan   { background: linear-gradient(135deg, #22d3ee, #0891b2); }
.stat-icon   { font-size: 2rem; opacity: 0.9; }
.stat-label  { font-size: 12px; opacity: 0.85; margin-bottom: 2px; }
.stat-value  { font-size: 1.5rem; font-weight: 700; }

/* 圖表卡片 */
.chart-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}
.chart-header {
  background: #2563eb;
  color: white;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 15px;
}
.chart-header-green { background: #059669; }
.chart-header-cyan  { background: #0891b2; }
.chart-body {
  padding: 20px;
}
</style>
