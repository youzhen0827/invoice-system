<!-- 對獎功能 -->
<template>
  <div class="modal fade" id="lotteryModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning">
          <h5 class="modal-title">
            <i class="bi bi-trophy me-2"></i>發票對獎
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            請輸入開獎號碼（僅需輸入後8碼數字），系統將自動比對所有發票
          </div>

          <form @submit.prevent="handleCheck">
            <div class="mb-3">
              <label class="form-label fw-bold">特別獎（8碼）</label>
              <input 
                v-model="special" 
                type="text" 
                class="form-control" 
                placeholder="12345678"
                pattern="[0-9]{8}"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">特獎（8碼）</label>
              <input 
                v-model="grand" 
                type="text" 
                class="form-control" 
                placeholder="87654321"
                pattern="[0-9]{8}"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">頭獎（8碼）- 可輸入多組，以逗號分隔</label>
              <textarea 
                v-model="firstPrizeInput" 
                class="form-control" 
                rows="2"
                placeholder="11111111,22222222,33333333"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">二獎（後7碼）- 可輸入多組，以逗號分隔</label>
              <input 
                v-model="secondPrizeInput" 
                type="text" 
                class="form-control" 
                placeholder="1234567,1234567,1234567"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">三獎（後6碼）- 可輸入多組，以逗號分隔</label>
              <input 
                v-model="thirdPrizeInput" 
                type="text" 
                class="form-control" 
                placeholder="123456,123456,123456"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">四獎（後5碼）- 可輸入多組，以逗號分隔</label>
              <input 
                v-model="fourthPrizeInput" 
                type="text" 
                class="form-control" 
                placeholder="12345,12345,12345"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">五獎（後4碼）- 可輸入多組，以逗號分隔</label>
              <input 
                v-model="fifthPrizeInput" 
                type="text" 
                class="form-control" 
                placeholder="1234,1234,1234"
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">六獎（後3碼）- 可輸入多組，以逗號分隔</label>
              <input 
                v-model="sixthPrizeInput" 
                type="text" 
                class="form-control" 
                placeholder="123,456,789"
              >
            </div>
          </form>

          <!-- 對獎結果 -->
          <div v-if="showResult" class="mt-4">
            <hr>
            <h5 class="text-center mb-3">
              <i class="bi bi-clipboard-check me-2"></i>對獎結果
            </h5>
            
            <div v-if="winners.length === 0" class="alert alert-secondary text-center">
              <i class="bi bi-emoji-frown me-2"></i>很遺憾，本次沒有中獎發票
            </div>

            <div v-else class="alert alert-success">
              <h6 class="alert-heading">
                <i class="bi bi-emoji-smile me-2"></i>
                恭喜！共有 {{ winners.length }} 張中獎發票
              </h6>
              <ul class="mb-0">
                <li v-for="winner in winners" :key="winner.id">
                  <strong>{{ winner.number }}</strong> - 
                  {{ winner.store }} - 
                  <span class="badge bg-warning text-dark">{{ winner.prize }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            關閉
          </button>
          <button type="button" class="btn btn-warning" @click="handleCheck">
            <i class="bi bi-search me-1"></i>開始對獎
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '../services/api'
import { hideModalById } from '../utils/modal'

export default {
  name: 'LotteryCheck',
  emits: ['check'],
  setup(props, { emit }) {
    const special = ref('')
    const grand = ref('')
    const firstPrizeInput = ref('')
    const sixthPrizeInput = ref('')

    const winners = ref([])
    const showResult = ref(false)

    const resetResult = () => {
      winners.value = []
      showResult.value = false
    }

    const handleClose = () => {
      hideModalById('lotteryModal')
      resetResult()
    }

    const handleCheck = async () => {
      resetResult()

      const winningNumbers = {
        special: special.value.trim(),
        grand: grand.value.trim(),
        first: [],
        sixth: []
      }

      if (firstPrizeInput.value.trim()) {
        winningNumbers.first = firstPrizeInput.value
          .split(',')
          .map(n => n.trim())
          .filter(n => /^[0-9]{8}$/.test(n))
      }

      if (sixthPrizeInput.value.trim()) {
        winningNumbers.sixth = sixthPrizeInput.value
          .split(',')
          .map(n => n.trim())
          .filter(n => /^[0-9]{3}$/.test(n))
      }

      if (
        !winningNumbers.special &&
        !winningNumbers.grand &&
        winningNumbers.first.length === 0 &&
        winningNumbers.sixth.length === 0
      ) {
        alert('請至少輸入一種中獎號碼')
        return
      }

      try {
        const response = await api.checkLottery(winningNumbers)
        winners.value = response.data.winners || []
        showResult.value = true

        // ✅ 通知父層更新發票列表
        emit('check')

        // ✅ 對獎後直接關 modal（不留黑遮罩）
        hideModalById('lotteryModal')
      } catch (error) {
        console.error('對獎失敗:', error)
        alert('對獎失敗，請稍後再試')
      }
    }

    
    return {
      special, grand, firstPrizeInput, sixthPrizeInput,
      winners, showResult, handleCheck, handleClose
    }
  }
}
</script>


<style scoped>
.modal-header {
  color: #333;
}
</style>
