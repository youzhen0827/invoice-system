import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // 取得所有發票
  getInvoices() {
    return api.get('/invoices')
  },

  // 取得單一發票
  getInvoice(id) {
    return api.get(`/invoices/${id}`)
  },

  // 新增發票
  createInvoice(invoice) {
    return api.post('/invoices', invoice)
  },

  // 更新發票
  updateInvoice(id, invoice) {
    return api.put(`/invoices/${id}`, invoice)
  },

  // 刪除發票
  deleteInvoice(id) {
    return api.delete(`/invoices/${id}`)
  },

  // 對獎
  checkLottery(winningNumbers) {
    return api.post('/invoices/lottery', { winningNumbers })
  },

  // 取得統計資料
  getStatistics() {
    return api.get('/invoices/stats/summary')
  }
}