<template>
  <div class="client-payments">
    <h1>Client Payments</h1>
    <ul>
      <li v-for="payment in payments" :key="payment.referenceNumber" class="payment-item">
        <div class="card">
          <div class="payment-info">
            <h3>{{ payment.description }}</h3>
            <p><strong>Amount:</strong> ${{ (Number(payment.amount) / 100).toFixed(2) }}</p>
            <p><strong>Status:</strong> {{ payment.status }}</p>
          </div>
          <button @click="viewPaymentDetails(payment.referenceNumber)" class="btn-view">View Details</button>
          <button @click="updatePaymentStatus(payment.referenceNumber, 'completed')" class="btn-complete">Mark as Completed</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { fetchClientPayments, updateClientOrderStatus } from '../authService';

export default {
  data() {
    return {
      payments: [],
    };
  },
  mounted() {
    this.fetchPayments(); // Automatically fetch payments when the component is mounted
  },
  methods: {
    async fetchPayments() {
      try {
        const response = await fetchClientPayments();
        console.log('Fetched Client Payments:', response); // Log the response
        this.payments = response.payments; // Ensure you are accessing the correct property
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
        this.fetchPayments(); // Refresh the payments list
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    },
  },
};
</script>

<style scoped>
.client-payments {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.payment-item {
  margin-bottom: 15px;
}

.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.02);
}

.payment-info {
  margin-bottom: 15px;
}

.btn-view, .btn-complete {
  margin-top: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-view {
  background-color: #007bff;
  color: white;
}

.btn-complete {
  background-color: #28a745;
  color: white;
}
</style> 