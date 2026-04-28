<!-- 對獎功能 -->
<template>
  <div class="modal fade" id="lotteryModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content lottery-modal">

        <!-- Header -->
        <div class="lottery-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-trophy-fill text-warning fs-5"></i>
            <span class="fw-bold fs-5">統一發票對獎</span>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>

        <!-- Period selector -->
        <div class="period-bar">
          <span class="period-label">對獎期別</span>
          <select class="form-select form-select-sm period-select" v-model="selectedPeriod">
            <option v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>

        <div class="modal-body p-4">

          <!-- 獎項輸入區 -->
          <div class="prize-section mb-3">
            <div class="prize-row special">
              <div class="prize-badge special-badge">特別獎</div>
              <div class="prize-desc">1,000萬元</div>
              <input v-model="special" type="text" class="form-control prize-input"
                placeholder="輸入8碼號碼" maxlength="8" @input="onlyDigits('special')">
            </div>

            <div class="prize-row grand">
              <div class="prize-badge grand-badge">特獎</div>
              <div class="prize-desc">200萬元</div>
              <input v-model="grand" type="text" class="form-control prize-input"
                placeholder="輸入8碼號碼" maxlength="8" @input="onlyDigits('grand')">
            </div>

            <div class="prize-row first">
              <div class="prize-badge first-badge">頭獎</div>
              <div class="prize-desc">20萬元　可多組以逗號分隔</div>
              <input v-model="firstPrizeInput" type="text" class="form-control prize-input"
                placeholder="例：11111111,22222222">
            </div>

            <div class="prize-hint">
              <i class="bi bi-info-circle me-1"></i>
              輸入頭獎號碼後，系統自動推算二獎（末7碼）至六獎（末3碼）
            </div>

            <div class="prize-row sixth">
              <div class="prize-badge sixth-badge">增開六獎</div>
              <div class="prize-desc">200元　可多組以逗號分隔</div>
              <input v-model="sixthPrizeInput" type="text" class="form-control prize-input"
                placeholder="例：123,456,789">
            </div>
          </div>

          <!-- 對獎結果 -->
          <div v-if="showResult" class="result-section">
            <div v-if="winners.length === 0" class="result-empty">
              <i class="bi bi-emoji-neutral fs-2 mb-2 d-block"></i>
              很遺憾，本期沒有中獎發票
            </div>
            <div v-else class="result-win">
              <div class="result-win-title">
                <i class="bi bi-emoji-smile-fill me-2"></i>
                恭喜！共有 <strong>{{ winners.length }}</strong> 張中獎發票
              </div>
              <div class="winner-list">
                <div v-for="winner in winners" :key="winner.id" class="winner-item">
                  <span class="winner-number">{{ winner.number }}</span>
                  <span class="winner-store">{{ winner.store }}</span>
                  <span class="winner-prize" :class="prizeClass(winner.prize)">{{ winner.prize }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="lottery-footer">
          <button type="button" class="btn btn-outline-secondary btn-sm px-4" @click="handleClose">
            關閉
          </button>
          <button type="button" class="btn btn-warning px-5 fw-bold" @click="handleCheck" :disabled="loading">
            <span v-if="loading"><i class="bi bi-hourglass-split me-1"></i>對獎中...</span>
            <span v-else><i class="bi bi-search me-1"></i>開始對獎</span>
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

function generatePeriods() {
  const periods = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const pairs = [[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]]
  for (let year = currentYear; year >= currentYear - 2; year--) {
    for (let i = pairs.length - 1; i >= 0; i--) {
      const [m1, m2] = pairs[i]
      periods.push({
        value: `${year}-${m1}-${m2}`,
        label: `${year}年 ${m1}～${m2}月`
      })
    }
  }
  return periods
}

export default {
  name: 'LotteryCheck',
  emits: ['check'],
  setup(props, { emit }) {
    const periods = generatePeriods()
    const selectedPeriod = ref(periods[0].value)
    const special = ref('')
    const grand = ref('')
    const firstPrizeInput = ref('')
    const sixthPrizeInput = ref('')
    const winners = ref([])
    const showResult = ref(false)
    const loading = ref(false)

    const onlyDigits = (field) => {
      if (field === 'special') special.value = special.value.replace(/\D/g, '')
      if (field === 'grand')   grand.value   = grand.value.replace(/\D/g, '')
    }

    const prizeClass = (prize) => {
      if (prize === '特別獎') return 'badge-special'
      if (prize === '特獎')   return 'badge-grand'
      if (prize === '頭獎')   return 'badge-first'
      return 'badge-other'
    }

    const handleClose = () => {
      hideModalById('lotteryModal')
      showResult.value = false
      winners.value = []
    }

    const handleCheck = async () => {
      showResult.value = false
      winners.value = []

      const winningNumbers = {
        special: special.value.trim(),
        grand:   grand.value.trim(),
        first:   firstPrizeInput.value.split(',').map(n => n.trim()).filter(n => /^[0-9]{8}$/.test(n)),
        sixth:   sixthPrizeInput.value.split(',').map(n => n.trim()).filter(n => /^[0-9]{3}$/.test(n))
      }

      if (!winningNumbers.special && !winningNumbers.grand &&
          winningNumbers.first.length === 0 && winningNumbers.sixth.length === 0) {
        alert('請至少輸入一種中獎號碼')
        return
      }

      loading.value = true
      try {
        const response = await api.checkLottery(winningNumbers)
        winners.value = response.data.winners || []
        showResult.value = true
        emit('check')
      } catch (error) {
        console.error('對獎失敗:', error)
        alert('對獎失敗，請稍後再試')
      } finally {
        loading.value = false
      }
    }

    return {
      periods, selectedPeriod,
      special, grand, firstPrizeInput, sixthPrizeInput,
      winners, showResult, loading,
      onlyDigits, prizeClass, handleCheck, handleClose
    }
  }
}
</script>

<style scoped>
.lottery-modal { border-radius: 16px; overflow: hidden; border: none; }

.lottery-header {
  background: #1a3a6b;
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.period-bar {
  background: #f0f4ff;
  border-bottom: 1px solid #dde3f0;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.period-label { font-size: 13px; font-weight: 600; color: #444; white-space: nowrap; }
.period-select { max-width: 200px; font-size: 13px; border-radius: 8px; }

/* 獎項列 */
.prize-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #eee;
}
.prize-row.special { border-left: 4px solid #dc2626; }
.prize-row.grand   { border-left: 4px solid #ea580c; }
.prize-row.first   { border-left: 4px solid #ca8a04; }
.prize-row.sixth   { border-left: 4px solid #16a34a; }

.prize-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
  color: white;
}
.special-badge { background: #dc2626; }
.grand-badge   { background: #ea580c; }
.first-badge   { background: #ca8a04; }
.sixth-badge   { background: #16a34a; }

.prize-desc { font-size: 12px; color: #666; white-space: nowrap; min-width: 160px; }
.prize-input { font-size: 14px; border-radius: 8px; }

.prize-hint {
  font-size: 12px;
  color: #6b7280;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

/* 結果區 */
.result-section { margin-top: 16px; }
.result-empty {
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 10px;
  padding: 24px;
}
.result-win {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 16px;
}
.result-win-title { color: #15803d; font-size: 15px; margin-bottom: 12px; }
.winner-list { display: flex; flex-direction: column; gap: 8px; }
.winner-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 8px;
  padding: 8px 14px;
  border: 1px solid #d1fae5;
}
.winner-number { font-family: monospace; font-size: 15px; font-weight: 600; }
.winner-store  { flex: 1; color: #555; font-size: 13px; }
.winner-prize  { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; color: white; }
.badge-special { background: #dc2626; }
.badge-grand   { background: #ea580c; }
.badge-first   { background: #ca8a04; }
.badge-other   { background: #16a34a; }

.lottery-footer {
  padding: 14px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fafafa;
}
</style>
