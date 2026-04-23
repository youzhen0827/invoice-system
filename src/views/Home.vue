<template>
  <div class="home">
    <div class="jumbotron bg-light p-5 rounded-3 mb-4">
      <h1 class="display-4">
        <i class="bi bi-receipt-cutoff text-primary me-3"></i>
        歡迎使用發票管理系統
      </h1>
      <p class="lead">輕鬆管理您的消費發票，對獎、統計一次搞定！</p>
      <hr class="my-4">
      <p>開始記錄您的發票，讓消費更透明，理財更輕鬆。</p>
      <router-link to="/invoices" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle me-2"></i>開始使用
      </router-link>
    </div>

    <!-- 統計卡片 -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card text-center border-primary">
          <div class="card-body">
            <i class="bi bi-receipt fs-1 text-primary"></i>
            <h5 class="card-title mt-2">發票總數</h5>
            <p class="display-6">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center border-success">
          <div class="card-body">
            <i class="bi bi-currency-dollar fs-1 text-success"></i>
            <h5 class="card-title mt-2">總消費金額</h5>
            <p class="display-6">{{ stats.totalAmount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center border-warning">
          <div class="card-body">
            <i class="bi bi-trophy fs-1 text-warning"></i>
            <h5 class="card-title mt-2">中獎發票</h5>
            <p class="display-6">{{ stats.winningCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center border-info">
          <div class="card-body">
            <i class="bi bi-calendar-month fs-1 text-info"></i>
            <h5 class="card-title mt-2">本月發票</h5>
            <p class="display-6">{{ currentMonthCount }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 功能介紹 -->
    <div class="row g-4">
      <div class="col-md-4" @click="$router.push('/invoices')" style="cursor: pointer;">
        <div class="card h-100">
          <div class="card-body">
            <i class="bi bi-pencil-square fs-1 text-primary"></i>
            <h5 class="card-title mt-3">發票管理</h5>
            <p class="card-text">新增、編輯、刪除發票記錄，完整管理您的消費資訊。</p>
          </div>
        </div>
      </div>

      <div class="col-md-4" @click="$router.push('/invoices')" style="cursor: pointer;">
        <div class="card h-100">
          <div class="card-body">
            <i class="bi bi-award fs-1 text-warning"></i>
            <h5 class="card-title mt-3">自動對獎</h5>
            <p class="card-text">輸入開獎號碼，系統自動比對所有發票，不錯過任何中獎機會。</p>
          </div>
        </div>
      </div>

      <div class="col-md-4" @click="$router.push('/reports')" style="cursor: pointer;">
        <div class="card h-100">
          <div class="card-body">
            <i class="bi bi-graph-up fs-1 text-success"></i>
            <h5 class="card-title mt-3">消費統計</h5>
            <p class="card-text">視覺化圖表分析您的消費習慣，幫助您更好地管理財務。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../services/api'

export default {
  name: 'Home',
  setup() {
    const stats = ref({
      total: 0,
      totalAmount: 0,
      winningCount: 0
    })
    const currentMonthCount = ref(0)

    const loadStats = async () => {
      try {
        const response = await api.getStatistics()
        stats.value = response.data

        // 計算本月發票數
        const currentMonth = new Date().toISOString().substring(0, 7)
        if (response.data.monthStats[currentMonth]) {
          currentMonthCount.value = response.data.monthStats[currentMonth].count
        }
      } catch (error) {
        console.error('載入統計資料失敗:', error)
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      currentMonthCount
    }
  }
}
</script>

<style scoped>
.jumbotron {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.jumbotron .btn {
  background: white;
  color: #667eea;
  border: none;
}

.jumbotron .btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>