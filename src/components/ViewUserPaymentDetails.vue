<template>
  <div class="payment-details">
    <h1>User Payment Details</h1>
    <div v-if="payment" class="card">
      <h2>Payment Information</h2>
      <p><strong>Reference Number:</strong> {{ payment.referenceNumber }}</p>
      <p><strong>Amount:</strong> ${{ (payment.amount / 100).toFixed(2) }}</p>
      <p><strong>Description:</strong> {{ payment.description }}</p>
      <p><strong>Remarks:</strong> {{ payment.remarks }}</p>
      <p><strong>Status:</strong> {{ payment.status }}</p>
      <p><strong>Order Status:</strong> {{ payment.orderStatus }}</p>
      <p><strong>Created At:</strong> {{ new Date(payment.createdAt).toLocaleString() }}</p>
      <p><strong>Updated At:</strong> {{ new Date(payment.updatedAt).toLocaleString() }}</p>
      <p><strong>Client:</strong> {{ payment.client.firstName }} {{ payment.client.lastName }}</p>
    </div>
    <div v-else>
      <p>Loading payment details...</p>
    </div>
  </div>
</template>

<script>
import { fetchUserPayments } from '../authService';

export default {
  data() {
    return {
      payment: null,
    };
  },
  async created() {
    const referenceNumber = this.$route.params.referenceNumber; // Get reference number from route params
    try {
      const response = await fetchUserPayments();
      const payments = response.payments; // Access the payments array
      this.payment = payments.find(p => p.referenceNumber === referenceNumber); // Find the specific payment
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  },
};
</script>

<style scoped>
.payment-details {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style> 