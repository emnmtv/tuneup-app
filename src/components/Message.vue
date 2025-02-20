<template>
  <div class="chat-container">
    <!-- Sidebar for user list -->
    <div class="sidebar">
      <h3>Chats</h3>
      <ul>
        <li
          v-for="chat in chatHistory"
          :key="chat.user.id"
          :class="{ active: chat.user.id === selectedReceiverId }"
          @click="selectUser(chat.user.id)"
        >
          {{ chat.user.firstName }} {{ chat.user.lastName }}
        </li>
      </ul>
    </div>

    <!-- Chat window -->
    <div class="chat-window" v-if="selectedReceiverId">
      <div class="chat-header">
        <h3>{{ selectedUserName }}</h3>
      </div>

      <div class="chat-messages">
        <div
          v-for="msg in selectedUserMessages"
          :key="msg.createdAt"
          :class="{ 'message-sent': msg.senderId === currentUserId, 'message-received': msg.senderId !== currentUserId }"
        >
          <p>{{ msg.content }}</p>
          <span class="timestamp">{{ new Date(msg.createdAt).toLocaleTimeString() }}</span>
        </div>
      </div>

      <!-- Message input -->
      <div class="chat-input">
        <input v-model="messageContent" placeholder="Type your message..." />
        <button @click="handleSendMessage">Send</button>
      </div>

      <!-- Payment section (visible only to creators) -->
      <div class="payment-section" v-if="isCreator">
        <h4>Initiate Payment</h4>
        <input v-model="paymentAmount" type="number" placeholder="Amount" />
        <input v-model="paymentDescription" type="text" placeholder="Description" />
        <input v-model="paymentRemarks" type="text" placeholder="Remarks" />
        <button @click="handlePayment">Create Payment Link</button>
        <div v-if="paymentLink">
          <p>Payment link:</p>
          <a :href="paymentLink" target="_blank">{{ paymentLink }}</a>
        </div>
      </div>
    </div>

    <!-- Placeholder for when no user is selected -->
    <div v-else class="chat-placeholder">
      <p>Select a user to start chatting</p>
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
      isCreator: localStorage.getItem('userRole') === 'creator',
      currentUserId: localStorage.getItem('userId'),
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
      if (!this.selectedReceiverId) return alert('Select a user to send a message.');

      try {
        await sendMessage(this.selectedReceiverId, this.messageContent);
        this.messageContent = '';
        await this.loadChatHistory();
        this.selectUser(this.selectedReceiverId);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    async handlePayment() {
      if (!this.selectedReceiverId) return alert('Select a user to send a payment to.');

      try {
        const paymentData = await initiatePayment(this.paymentAmount, this.paymentDescription, this.paymentRemarks);
        this.paymentLink = paymentData.paymentUrl;
        this.paymentAmount = '';
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
.chat-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 25%;
  background-color: #f7f7f7;
  padding: 10px;
  border-right: 1px solid #ddd;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
}

.sidebar li.active,
.sidebar li:hover {
  background-color: #007bff;
  color: white;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #fff;
}

.chat-header {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.message-sent {
  text-align: right;
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border-radius: 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: flex-end;
}

.message-received {
  text-align: left;
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: flex-start;
}

.timestamp {
  font-size: 0.8em;
  color: #777;
  display: block;
  margin-top: 2px;
}

.chat-input {
  display: flex;
  padding: 10px 0;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.chat-input button {
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 20px;
  cursor: pointer;
}

.payment-section {
  margin-top: 10px;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
}
</style>
