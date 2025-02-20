<template>
  <div>
    <h2>Chat</h2>
    <div class="user-list">
      <h3>Users</h3>
      <ul>
        <li v-for="chat in chatHistory" :key="chat.user.id" @click="selectUser(chat.user.id)">
          {{ chat.user.firstName }} {{ chat.user.lastName }}
        </li>
      </ul>
    </div>
    <div v-if="selectedReceiverId">
      <h3>Conversation with {{ selectedUserName }}</h3>
      <div v-for="msg in selectedUserMessages" :key="msg.createdAt">
        <p><strong>{{ msg.senderName }}:</strong> {{ msg.content }}</p>
      </div>
      <form @submit.prevent="handleSendMessage">
        <input v-model="messageContent" placeholder="Type your message" required />
        <button type="submit">Send</button>
      </form>
      <form @submit.prevent="handlePayment">
        <h4>Initiate Payment</h4>
        <input v-model="paymentAmount" type="number" placeholder="Amount" required />
        <input v-model="paymentDescription" type="text" placeholder="Description" required />
        <input v-model="paymentRemarks" type="text" placeholder="Remarks" required />
        <button type="submit">Pay</button>
      </form>
      <div v-if="paymentLink">
        <p>Payment link created successfully:</p>
        <a :href="paymentLink" target="_blank">{{ paymentLink }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { sendMessage, fetchUsersWithChatHistory, initiatePayment } from '../authService';

export default {
  data() {
    return {
      chatHistory: [],
      messageContent: '',
      selectedReceiverId: null,
      selectedUserMessages: [],
      selectedUserName: '',
      paymentAmount: '',
      paymentDescription: '',
      paymentRemarks: '',
      paymentLink: '',
    };
  },
  async created() {
    await this.loadChatHistory();
  },
  methods: {
    async loadChatHistory() {
      try {
        this.chatHistory = await fetchUsersWithChatHistory();
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    },
    selectUser(userId) {
      this.selectedReceiverId = userId;
      const userChat = this.chatHistory.find(chat => chat.user.id === userId);
      this.selectedUserMessages = userChat ? userChat.messages : [];
      this.selectedUserName = userChat ? `${userChat.user.firstName} ${userChat.user.lastName}` : '';
    },
    async handleSendMessage() {
      if (!this.selectedReceiverId) {
        alert('Please select a user to send a message to.');
        return;
      }

      try {
        await sendMessage(this.selectedReceiverId, this.messageContent);
        this.messageContent = ''; // Clear the input after sending
        await this.loadChatHistory(); // Reload chat history to see the new message
        this.selectUser(this.selectedReceiverId); // Refresh the selected user's messages
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    async handlePayment() {
      if (!this.selectedReceiverId) {
        alert('Please select a user to send a payment to.');
        return;
      }

      try {
        const paymentData = await initiatePayment(this.paymentAmount, this.paymentDescription, this.paymentRemarks);
        this.paymentLink = paymentData.paymentUrl; // Store the payment link
        this.paymentAmount = ''; // Clear the input fields
        this.paymentDescription = '';
        this.paymentRemarks = '';
      } catch (error) {
        console.error('Error initiating payment:', error);
      }
    },
  },
};
</script>

<style scoped>
.user-list {
  margin-bottom: 20px;
}
.user-list ul {
  list-style-type: none;
  padding: 0;
}
.user-list li {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  margin: 5px 0;
}
.user-list li:hover {
  background-color: #f0f0f0;
}
</style>
