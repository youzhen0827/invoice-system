<!-- 發票卡片 -->
<template>
  <div class="card h-100 invoice-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title mb-0">{{ invoice.store }}</h5>
        <span v-if="invoice.isWinning" class="badge bg-warning text-dark">
          <i class="bi bi-trophy-fill me-1"></i>{{ invoice.prize }}
        </span>
      </div>
      
      <h6 class="card-subtitle mb-2 text-muted">
        <i class="bi bi-receipt me-1"></i>{{ invoice.number }}
      </h6>

      <p class="card-text">
        <small class="text-muted">
          <i class="bi bi-calendar3 me-1"></i>{{ formatDate(invoice.date) }}
        </small>
      </p>

      <p class="card-text">
        <i class="bi bi-tag me-1"></i>
        <span class="badge bg-secondary">{{ invoice.category }}</span>
      </p>

      <p class="card-text">
        <i class="bi bi-basket me-1"></i>{{ invoice.items }}
      </p>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <h4 class="mb-0 text-primary">
          <i class="bi bi-currency-dollar"></i>{{ invoice.amount }}
        </h4>
        <div class="btn-group" role="group">
          <button 
            class="btn btn-sm btn-outline-primary" 
            data-bs-toggle="modal" 
            data-bs-target="#invoiceModal"
            @click="$emit('edit', invoice)"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button 
            class="btn btn-sm btn-outline-danger" 
            @click="$emit('delete', invoice.id)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoiceCard',
  props: {
    invoice: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.invoice-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #0d6efd;
}

.invoice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-title {
  color: #333;
  font-weight: 600;
}
</style>
