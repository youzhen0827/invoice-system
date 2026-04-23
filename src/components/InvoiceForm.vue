<!-- 新增/編輯表單 -->
<template>
  <div class="modal fade" id="invoiceModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-receipt me-2"></i>
            {{ isEdit ? '編輯發票' : '新增發票' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <!-- 發票號碼 -->
              <div class="col-md-6">
                <label class="form-label">發票號碼 *</label>
                <input 
                  v-model="form.number" 
                  type="text" 
                  class="form-control" 
                  placeholder="AB12345678"
                  pattern="[A-Z]{2}[0-9]{8}"
                  required
                >
                <div class="form-text">格式：2個大寫英文 + 8個數字</div>
              </div>

              <!-- 日期 -->
              <div class="col-md-6">
                <label class="form-label">日期 *</label>
                <input 
                  v-model="form.date" 
                  type="date" 
                  class="form-control"
                  required
                >
              </div>

              <!-- 店家 -->
              <div class="col-md-6">
                <label class="form-label">店家 *</label>
                <input 
                  v-model="form.store" 
                  type="text" 
                  class="form-control" 
                  placeholder="店家名稱"
                  required
                >
              </div>

              <!-- 金額 -->
              <div class="col-md-6">
                <label class="form-label">金額 *</label>
                <input 
                  v-model.number="form.amount" 
                  type="number" 
                  class="form-control" 
                  placeholder="350"
                  min="0"
                  required
                >
              </div>

              <!-- 分類 -->
              <div class="col-md-12">
                <label class="form-label">分類 *</label>
                <select v-model="form.category" class="form-select" required>
                  <option value="">請選擇分類</option>
                  <option value="飲食">飲食</option>
                  <option value="交通">交通</option>
                  <option value="購物">購物</option>
                  <option value="娛樂">娛樂</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <!-- 品項 -->
              <div class="col-md-12">
                <label class="form-label">品項</label>
                <textarea 
                  v-model="form.items" 
                  class="form-control" 
                  rows="3"
                  placeholder="購買的商品或服務內容"
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit">
            <i class="bi bi-check-circle me-1"></i>儲存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { hideModalById } from '@/utils/modal'

export default {
  name: 'InvoiceForm',
  props: {
    invoice: { type: Object, default: null },
    isEdit: { type: Boolean, default: false }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const today = () => new Date().toISOString().split('T')[0]

    const form = ref({
      number: '',
      date: today(),
      store: '',
      amount: 0,
      category: '',
      items: '',
      isWinning: false,
      prize: null
    })

    const resetForm = () => {
      form.value = {
        number: '',
        date: today(),
        store: '',
        amount: 0,
        category: '',
        items: '',
        isWinning: false,
        prize: null
      }
    }

    watch(
      () => props.invoice,
      (newInvoice) => {
        if (newInvoice) form.value = { ...newInvoice }
        else resetForm()
      },
      { immediate: true }
    )

    const handleClose = () => {
      hideModalById('invoiceModal')
      resetForm()
      emit('close')
    }

    const handleSubmit = () => {
      const pattern = /^[A-Z]{2}[0-9]{8}$/
      if (!pattern.test(form.value.number)) {
        alert('發票號碼格式錯誤！請輸入2個大寫英文字母加8個數字')
        return
      }

      emit('save', { ...form.value })
      hideModalById('invoiceModal')   // ✅ 用 JS 正常關，避免黑遮罩
      resetForm()
    }

    return { form, handleSubmit, handleClose }
  }
}
</script>

