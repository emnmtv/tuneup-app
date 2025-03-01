<template>
  <div class="payment-details">
    <div class="container">
      <div class="navigation-bar">
        <button @click="goBack" class="btn-back">
          <span class="material-icons">arrow_back</span>
          Back to Payments
        </button>
        <div class="actions">
          <button v-if="payment && payment.status !== 'completed'" 
                  @click="updateStatus('completed')" 
                  class="btn-action">
            <span class="material-icons">check_circle</span>
            Mark as Complete
          </button>
          <button class="btn-action btn-print">
            <span class="material-icons">print</span>
            Print Details
          </button>
        </div>
      </div>

      <div v-if="payment" class="content-wrapper">
        <!-- Status Banner -->
        <div class="status-banner" :class="payment.status.toLowerCase()">
          <div class="status-icon">
            <span class="material-icons">
              {{ payment.status === 'paid' ? 'check_circle' : 'pending_payments' }}
            </span>
          </div>
          <div class="status-info">
            <h3>Payment {{ payment.status === 'paid' ? 'Paid' : 'Unpaid' }}</h3>
            <p>Last updated {{ formatDate(payment.updatedAt) }}</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Amount Card -->
          <div class="amount-card">
            <div class="amount-header">Payment Amount</div>
            <div class="amount-value">
              <span class="currency">₱</span>
              {{ formatPeso(payment.amount / 100) }}
            </div>
            <div class="amount-reference">Ref: {{ payment.referenceNumber }}</div>
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <!-- Payment Information -->
            <div class="detail-section">
              <h2>
                <span class="material-icons">payment</span>
                Payment Information
              </h2>
              <div class="detail-content">
                <div class="detail-row">
                  <span class="label">Description</span>
                  <span class="value">{{ payment.description }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Remarks</span>
                  <span class="value">{{ payment.remarks || 'No remarks' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Created Date</span>
                  <span class="value">{{ formatDate(payment.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Client Information -->
            <div class="detail-section">
              <h2>
                <span class="material-icons">person</span>
                Client Information
              </h2>
              <div class="detail-content">
                <div class="detail-row">
                  <span class="label">Name</span>
                  <span class="value">{{ payment.client.firstName }} {{ payment.client.lastName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status</span>
                  <span class="value status-badge" :class="payment.status.toLowerCase()">
                    {{ payment.status === 'paid' ? 'Paid' : 'Unpaid' }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Order Status</span>
                  <span class="value status-badge" :class="payment.orderStatus.toLowerCase()">
                    {{ payment.orderStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <div class="spinner"></div>
      <p>Loading payment details...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUserPayments, updateUserOrderStatus } from '../authService';
import { formatPeso } from '../utils/currencyFormatter';

export default {
  data() {
    return {
      payment: null,
    };
  },
  async created() {
    await this.fetchPaymentDetails();
  },
  methods: {
    async fetchPaymentDetails() {
      const referenceNumber = this.$route.params.referenceNumber;
    try {
      const response = await fetchUserPayments();
        this.payment = response.payments.find(p => p.referenceNumber === referenceNumber);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async updateStatus(newStatus) {
      try {
        await updateUserOrderStatus(this.payment.referenceNumber, newStatus);
        await this.fetchPaymentDetails();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    formatPeso
  }
};
</script>

<style scoped>
.payment-details {
  min-height: 100vh;
  background: white;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(-4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.actions {
  display: flex;
  gap: 1rem;
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
  background: #28a745;
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
}

.btn-print {
  background: #6c757d;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.2);
}

.btn-print:hover {
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
}

.content-wrapper {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.status-banner {
  display: flex;
  align-items: center;
  padding: 2rem;
  color: white;
  gap: 1.5rem;
}

.status-banner.paid {
  background: linear-gradient(135deg, #28a745, #20c997);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
}

.status-banner.unpaid {
  background: linear-gradient(135deg, #dc3545, #fd7e14);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);
}

.status-icon .material-icons {
  font-size: 2.5rem;
}

.status-info h3 {
  margin: 0;
  font-size: 1.5rem;
}

.status-info p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.main-content {
  padding: 2rem;
}

.amount-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.amount-card:hover {
  border-color: #28a745;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(40, 167, 69, 0.15);
}

.amount-header {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount-value {
  font-size: 3rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 0.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.currency {
  font-size: 2.5rem;
  font-weight: normal;
  opacity: 0.9;
}

.amount-reference {
  color: #6c757d;
  font-size: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.detail-section:hover {
  border-color: #007bff;
  box-shadow: 0 8px 30px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.detail-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.detail-section h2 .material-icons {
  color: #007bff;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #6c757d;
  font-size: 0.9rem;
}

.value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.unpaid {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .payment-details {
    padding: 1rem;
  }
  
  .navigation-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .amount-value {
    font-size: 2.5rem;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .value {
    max-width: 100%;
    text-align: left;
  }
  
  .content-wrapper {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .amount-card {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  }
  
  .detail-section {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  }
}
</style> 