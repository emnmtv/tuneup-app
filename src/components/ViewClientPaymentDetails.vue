<template>
  <div class="payment-details">
    <div class="container">
      <button @click="goBack" class="btn-back">
        <span class="material-icons">arrow_back</span>
        Back to Payments
      </button>

      <div v-if="payment" class="details-card">
        <div class="card-header">
          <h1>Payment Details</h1>
          <div class="status-badge" :class="payment.status.toLowerCase()">
            {{ payment.status === 'paid' ? 'Paid' : 'Unpaid' }}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-section">
            <h2>Payment Information</h2>
            <div class="info-row">
              <span class="label">Amount</span>
              <span class="value amount">
                <span class="currency">₱</span>
                {{ formatPeso(payment.amount / 100) }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Reference Number</span>
              <span class="value">{{ payment.referenceNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Description</span>
              <span class="value">{{ payment.description }}</span>
            </div>
            <div class="info-row">
              <span class="label">Remarks</span>
              <span class="value">{{ payment.remarks || 'No remarks' }}</span>
            </div>
          </div>

          <div class="info-section">
            <h2>Order Details</h2>
            <div class="info-row">
              <span class="label">Order Status</span>
              <span class="value status-text" :class="payment.orderStatus.toLowerCase()">
                {{ payment.orderStatus }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Created</span>
              <span class="value">{{ formatDate(payment.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Last Updated</span>
              <span class="value">{{ formatDate(payment.updatedAt) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Seller</span>
              <span class="value">{{ payment.user.firstName }} {{ payment.user.lastName }}</span>
            </div>
          </div>
        </div>

        <div class="actions" v-if="payment.status === 'paid' && payment.orderStatus === 'completed'">
          <button 
            v-if="!payment.rating"
            @click="showRatingDialog = true" 
            class="btn-rate"
          >
            <span class="material-icons">star</span>
            Rate Service
          </button>
          <div v-else class="rating-display">
            <div class="stars">
              <span 
                v-for="star in 5" 
                :key="star"
                class="material-icons"
                :class="{ filled: star <= payment.rating.rating }"
              >
                star
              </span>
            </div>
            <p class="review-text" v-if="payment.rating.review">
              {{ payment.rating.review }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="loading">
        <div class="spinner"></div>
        <p>Loading payment details...</p>
      </div>

      <RatingDialog
        v-if="payment"
        :show="showRatingDialog"
        :userId="payment.userId"
        :paymentId="payment.id"
        @close="showRatingDialog = false"
        @submit="handleRatingSubmit"
      />
    </div>
  </div>
</template>

<script>
import { fetchClientPayments, submitRating } from '../authService';
import { formatPeso } from '../utils/currencyFormatter';
import RatingDialog from './RatingDialog.vue';

export default {
  components: {
    RatingDialog
  },
  data() {
    return {
      payment: null,
      showRatingDialog: false,
      isLoading: true
    };
  },
  async created() {
    await this.fetchPaymentDetails();
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async fetchPaymentDetails() {
      const referenceNumber = this.$route.params.referenceNumber;
      try {
        this.isLoading = true;
        const response = await fetchClientPayments();
        const payments = response.payments;
        this.payment = payments.find(p => p.referenceNumber === referenceNumber);
        if (!this.payment) {
          throw new Error('Payment not found');
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        if (this.$toast) {
          this.$toast.error('Failed to fetch payment details');
        }
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    formatPeso,
    async handleRatingSubmit({ rating, review }) {
      try {
        await submitRating(
          this.payment.userId,
          this.payment.id,
          rating,
          review
        );
        await this.fetchPaymentDetails();
        this.showRatingDialog = false; // Close dialog after successful submission
        
        if (this.$toast) {
          this.$toast.success('Rating submitted successfully!');
        } else {
          alert('Rating submitted successfully!');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        if (this.$toast) {
          this.$toast.error(error.message || 'Failed to submit rating');
        } else {
          alert('Failed to submit rating: ' + (error.message || 'Unknown error'));
        }
      }
    }
  }
};
</script>

<style scoped>
.payment-details {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
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
  padding: 0.5rem;
  margin-bottom: 2rem;
}

.details-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.status-badge {
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

.value.amount {
  font-size: 1.25rem;
  color: #28a745;
}

.status-text {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.status-text.completed {
  background: #d4edda;
  color: #155724;
}

.status-text.pending {
  background: #fff3cd;
  color: #856404;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
  
  .details-card {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.btn-rate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-rate:hover {
  background: #43a047;
}

.rating-display {
  background: #f5f7fb;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.stars {
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.stars .material-icons {
  font-size: 1.25rem;
}

.stars .material-icons.filled {
  color: #ffd700;
}

.review-text {
  color: #666;
  font-style: italic;
  margin: 0.5rem 0 0;
}
</style> 