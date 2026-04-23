<!-- 統計報表頁 -->
<template>
  <div class="reports">
    <h2 class="mb-4">
      <i class="bi bi-bar-chart me-2"></i>統計報表
    </h2>

    <!-- 總覽統計卡片 -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card text-center h-100 border-primary">
          <div class="card-body">
            <i class="bi bi-receipt-cutoff fs-1 text-primary"></i>
            <h6 class="card-title mt-2">發票總數</h6>
            <h3 class="text-primary">{{ stats.total }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100 border-success">
          <div class="card-body">
            <i class="bi bi-cash-stack fs-1 text-success"></i>
            <h6 class="card-title mt-2">總消費金額</h6>
            <h3 class="text-success">${{ stats.totalAmount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100 border-warning">
          <div class="card-body">
            <i class="bi bi-trophy-fill fs-1 text-warning"></i>
            <h6 class="card-title mt-2">中獎發票</h6>
            <h3 class="text-warning">{{ stats.winningCount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100 border-info">
          <div class="card-body">
            <i class="bi bi-calculator fs-1 text-info"></i>
            <h6 class="card-title mt-2">平均消費</h6>
            <h3 class="text-info">${{ averageAmount }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖表區域 -->
    <div class="row g-4">
      <!-- 分類統計圖 -->
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <i class="bi bi-pie-chart me-2"></i>消費分類統計
          </div>
          <div class="card-body">
            <canvas ref="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 月份趨勢圖 -->
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header bg-success text-white">
            <i class="bi bi-graph-up me-2"></i>月份消費趨勢
          </div>
          <div class="card-body">
            <canvas ref="monthChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 分類明細表 -->
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-info text-white">
            <i class="bi bi-table me-2"></i>分類詳細資料
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>分類</th>
                    <th>發票數量</th>
                    <th>總金額</th>
                    <th>平均金額</th>
                    <th>佔比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, category) in categoryDetails" :key="category">
                    <td>
                      <span class="badge bg-secondary">{{ category }}</span>
                    </td>
                    <td>{{ data.count }}</td>
                    <td>${{ data.amount }}</td>
                    <td>${{ Math.round(data.amount / data.count) }}</td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar" 
                          :style="{ width: data.percentage + '%' }"
                        >
                          {{ data.percentage }}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../services/api'

Chart.register(...registerables)

export default {
  name: 'Reports',
  setup() {
    const stats = ref({
      total: 0,
      totalAmount: 0,
      winningCount: 0,
      categoryStats: {},
      monthStats: {}
    })
    const categoryChart = ref(null)
    const monthChart = ref(null)
    let categoryChartInstance = null
    let monthChartInstance = null

    // 平均消費
    const averageAmount = computed(() => {
      if (stats.value.total === 0) return 0
      return Math.round(stats.value.totalAmount / stats.value.total)
    })

    // 分類詳細資料
    const categoryDetails = computed(() => {
      const details = {}
      Object.entries(stats.value.categoryStats).forEach(([category, data]) => {
        details[category] = {
          ...data,
          percentage: Math.round((data.amount / stats.value.totalAmount) * 100)
        }
      })
      return details
    })

    // 載入統計資料
    const loadStats = async () => {
      try {
        const response = await api.getStatistics()
        stats.value = response.data
        createCharts()
      } catch (error) {
        console.error('載入統計資料失敗:', error)
      }
    }

    // 建立圖表
    const createCharts = () => {
      // 分類圓餅圖
      if (categoryChartInstance) {
        categoryChartInstance.destroy()
      }
      
      const categoryLabels = Object.keys(stats.value.categoryStats)
      const categoryData = Object.values(stats.value.categoryStats).map(item => item.amount)
      
      categoryChartInstance = new Chart(categoryChart.value, {
        type: 'pie',
        data: {
          labels: categoryLabels,
          datasets: [{
            data: categoryData,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: '各分類消費金額分布'
            }
          }
        }
      })

      // 月份折線圖
      if (monthChartInstance) {
        monthChartInstance.destroy()
      }

      const monthLabels = Object.keys(stats.value.monthStats).sort()
      const monthData = monthLabels.map(month => stats.value.monthStats[month].amount)

      monthChartInstance = new Chart(monthChart.value, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [{
            label: '消費金額',
            data: monthData,
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: true,
              text: '每月消費趨勢'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      averageAmount,
      categoryDetails,
      categoryChart,
      monthChart
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
</style>