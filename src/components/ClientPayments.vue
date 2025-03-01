<template>
  <div class="client-payments">
    <div class="header">
      <h1>Payment History</h1>
      <div class="payment-stats">
        <div class="stat-card">
          <span class="stat-value">
            <span class="currency">₱</span>{{ formatPeso(totalAmount) }}
          </span>
          <span class="stat-label">Total Payments</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ filteredPayments.length }}</span>
          <span class="stat-label">Transactions</span>
        </div>
      </div>
    </div>

    <!-- Filter and Search Section -->
    <div class="filters-section">
      <div class="search-box">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by description or reference..."
        >
      </div>

      <div class="filter-group">
        <div class="filter-select">
          <label>Status</label>
          <select v-model="statusFilter">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="filter-select">
          <label>Sort By</label>
          <select v-model="sortBy">
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div class="filter-select">
          <label>Order</label>
          <select v-model="sortOrder">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <button @click="resetFilters" class="btn-reset">
          <span class="material-icons">refresh</span>
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="date-filter">
      <div class="date-input">
        <label>From</label>
        <input type="date" v-model="dateRange.from">
      </div>
      <div class="date-input">
        <label>To</label>
        <input type="date" v-model="dateRange.to">
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      Showing {{ filteredPayments.length }} of {{ payments.length }} payments
    </div>

    <!-- Payments Grid -->
    <div class="payments-grid">
      <div v-for="payment in filteredPayments" 
           :key="payment.referenceNumber" 
           class="payment-card"
           :class="payment.status.toLowerCase()">
        <div class="payment-header">
          <div class="payment-amount">
            <span class="currency">₱</span>{{ formatPeso(Number(payment.amount) / 100) }}
          </div>
          <div class="payment-status" :class="payment.status.toLowerCase()">
            <span class="status-dot"></span>
            {{ payment.status }}
          </div>
        </div>
        
        <div class="payment-body">
          <h3>{{ payment.description }}</h3>
          <p class="reference">Ref: {{ payment.referenceNumber }}</p>
          <p class="date">{{ formatDate(payment.createdAt) }}</p>
        </div>

        <div class="payment-actions">
          <button @click="viewPaymentDetails(payment.referenceNumber)" 
                  class="btn-action btn-view">
            <span class="material-icons">visibility</span>
            Details
          </button>
          <button v-if="payment.status !== 'completed'"
                  @click="updatePaymentStatus(payment.referenceNumber, 'completed')" 
                  class="btn-action btn-complete">
            <span class="material-icons">check_circle</span>
            Complete
          </button>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div v-if="filteredPayments.length === 0" class="no-results">
      <span class="material-icons">search_off</span>
      <p>No payments found matching your filters</p>
      <button @click="resetFilters" class="btn-reset">Reset Filters</button>
    </div>
  </div>
</template>

<script>
import { fetchClientPayments, updateClientOrderStatus } from '../authService';
import { formatPeso } from '../utils/currencyFormatter';

export default {
  data() {
    return {
      payments: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'date',
      sortOrder: 'desc',
      dateRange: {
        from: '',
        to: ''
      }
    };
  },
  mounted() {
    this.fetchPayments();
  },
  methods: {
    async fetchPayments() {
      try {
        const response = await fetchClientPayments();
        this.payments = response.payments;
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    },
    viewPaymentDetails(referenceNumber) {
      this.$router.push({ name: 'ViewClientPaymentDetails', params: { referenceNumber } });
    },
    async updatePaymentStatus(referenceNumber, newStatus) {
      try {
        await updateClientOrderStatus(referenceNumber, newStatus);
        this.fetchPayments();
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.sortBy = 'date';
      this.sortOrder = 'desc';
      this.dateRange.from = '';
      this.dateRange.to = '';
    },
    formatPeso
  },
  computed: {
    filteredPayments() {
      let result = [...this.payments];

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(payment => 
          payment.description.toLowerCase().includes(query) ||
          payment.referenceNumber.toLowerCase().includes(query)
        );
      }

      // Status filter
      if (this.statusFilter) {
        result = result.filter(payment => 
          payment.status.toLowerCase() === this.statusFilter
        );
      }

      // Date range filter
      if (this.dateRange.from) {
        result = result.filter(payment => 
          new Date(payment.createdAt) >= new Date(this.dateRange.from)
        );
      }
      if (this.dateRange.to) {
        result = result.filter(payment => 
          new Date(payment.createdAt) <= new Date(this.dateRange.to)
        );
      }

      // Sorting
      result.sort((a, b) => {
        let compareA, compareB;
        
        switch (this.sortBy) {
          case 'amount':
            compareA = Number(a.amount);
            compareB = Number(b.amount);
            break;
          case 'status':
            compareA = a.status;
            compareB = b.status;
            break;
          default: // date
            compareA = new Date(a.createdAt);
            compareB = new Date(b.createdAt);
        }

        if (this.sortOrder === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });

      return result;
    },
    totalAmount() {
      return this.filteredPayments.reduce((sum, payment) => 
        sum + Number(payment.amount), 0) / 100;
    }
  }
};
</script>

<style scoped>
.client-payments {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.payment-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-width: 200px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.currency {
  font-size: 0.9em;
  font-weight: normal;
  opacity: 0.9;
}

.stat-value .currency {
  font-size: 1.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.search-box {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.search-box input {
  border: none;
  background: none;
  padding: 0.5rem;
  margin-left: 0.5rem;
  width: 100%;
  font-size: 1rem;
  outline: none;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
}

.filter-select label {
  display: block;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.filter-select select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select select:hover {
  border-color: #007bff;
}

.date-filter {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.date-input {
  flex: 1;
  max-width: 200px;
}

.date-input label {
  display: block;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.date-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;
}

.date-input input:hover {
  border-color: #007bff;
}

.results-summary {
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.payments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.payment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.payment-card:hover {
  transform: translateY(-4px);
}

.payment-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.payment-amount {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.payment-status {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.payment-status.completed {
  background: #d4edda;
  color: #155724;
}

.payment-status.completed .status-dot {
  background: #28a745;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.payment-status.pending .status-dot {
  background: #ffc107;
}

.payment-body {
  padding: 1.5rem;
}

.payment-body h3 {
  margin: 0 0 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.reference, .date {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.payment-actions {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background: #007bff;
  color: white;
  flex: 1;
}

.btn-complete {
  background: #28a745;
  color: white;
  flex: 1;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.no-results {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.no-results .material-icons {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .client-payments {
    padding: 1rem;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .payment-stats {
    flex-direction: column;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .date-filter {
    flex-direction: column;
  }
  
  .date-input {
    max-width: 100%;
  }
  
  .payments-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
  }
}
</style> 