<!-- 新增/編輯發票 -->
<template>
  <div class="invoices">
    <h2 class="mb-4">
      <i class="bi bi-list-ul me-2"></i>發票管理
    </h2>

    <!-- 操作按鈕區 -->
    <div class="d-flex justify-content-between mb-4">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#invoiceModal" @click="openAddModal">
        <i class="bi bi-plus-circle me-2"></i>新增發票
      </button>
      <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#lotteryModal">
        <i class="bi bi-trophy me-2"></i>對獎
      </button>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="搜尋店家或品項..."
            >
          </div>
          <div class="col-md-3">
            <select v-model="filterCategory" class="form-select">
              <option value="">全部分類</option>
              <option value="飲食">飲食</option>
              <option value="交通">交通</option>
              <option value="購物">購物</option>
              <option value="娛樂">娛樂</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filterWinning" class="form-select">
              <option value="">全部狀態</option>
              <option value="winning">已中獎</option>
              <option value="notWinning">未中獎</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-secondary w-100" @click="clearFilters">
              <i class="bi bi-x-circle me-1"></i>清除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 發票列表 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>

    <div v-else-if="filteredInvoices.length === 0" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>目前沒有發票記錄
    </div>

    <div v-else class="row g-3">
      <div v-for="invoice in filteredInvoices" :key="invoice.id" class="col-md-6 col-lg-4">
        <InvoiceCard 
          :invoice="invoice"
          @edit="openEditModal"
          @delete="deleteInvoice"
        />
      </div>
    </div>

    <!-- 新增/編輯發票 Modal -->
    <InvoiceForm 
      :invoice="currentInvoice"
      :isEdit="isEdit"
      @save="saveInvoice"
      @close="closeModal"
    />

    <!-- 對獎 Modal -->
    <LotteryCheck @check="checkLottery" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import InvoiceCard from '../components/InvoiceCard.vue'
import InvoiceForm from '../components/InvoiceForm.vue'
import LotteryCheck from '../components/LotteryCheck.vue'

export default {
  name: 'Invoices',
  components: {
    InvoiceCard,
    InvoiceForm,
    LotteryCheck
  },
  setup() {
    const invoices = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterCategory = ref('')
    const filterWinning = ref('')
    const currentInvoice = ref(null)
    const isEdit = ref(false)

    const loadInvoices = async () => {
      loading.value = true
      try {
        const response = await api.getInvoices()
        invoices.value = response.data
      } catch (error) {
        console.error('載入發票失敗:', error)
        alert('載入發票失敗，請確認後端是否啟動')
      } finally {
        loading.value = false
      }
    }

    const filteredInvoices = computed(() => {
      let filtered = invoices.value

      if (searchQuery.value) {
        filtered = filtered.filter(inv => 
          inv.store.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          inv.items.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (filterCategory.value) {
        filtered = filtered.filter(inv => inv.category === filterCategory.value)
      }

      if (filterWinning.value === 'winning') {
        filtered = filtered.filter(inv => inv.isWinning)
      } else if (filterWinning.value === 'notWinning') {
        filtered = filtered.filter(inv => !inv.isWinning)
      }

      return filtered
    })

    const clearFilters = () => {
      searchQuery.value = ''
      filterCategory.value = ''
      filterWinning.value = ''
    }

    const openAddModal = () => {
      currentInvoice.value = null
      isEdit.value = false
    }

    const openEditModal = (invoice) => {
      currentInvoice.value = { ...invoice }
      isEdit.value = true
    }

    const closeModal = () => {
      currentInvoice.value = null
    }

    const saveInvoice = async (invoice) => {
      try {
        if (isEdit.value) {
          await api.updateInvoice(invoice.id, invoice)
        } else {
          await api.createInvoice(invoice)
        }
        await loadInvoices()
        closeModal()

      } catch (error) {
        console.error('儲存發票失敗:', error)
        alert('儲存發票失敗')
      }
    }

    const deleteInvoice = async (id) => {
      if (confirm('確定要刪除這張發票嗎？')) {
        try {
          await api.deleteInvoice(id)
          await loadInvoices()
        } catch (error) {
          console.error('刪除發票失敗:', error)
          alert('刪除發票失敗')
        }
      }
    }

    const checkLottery = async () => {
      await loadInvoices()
    }

    onMounted(() => {
      loadInvoices()
    })

    return {
      invoices,
      loading,
      searchQuery,
      filterCategory,
      filterWinning,
      currentInvoice,
      isEdit,
      filteredInvoices,
      clearFilters,
      openAddModal,
      openEditModal,
      closeModal,
      saveInvoice,
      deleteInvoice,
      checkLottery
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>

