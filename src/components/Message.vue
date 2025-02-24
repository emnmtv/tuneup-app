<template>
  <div class="chat-container">
    <!-- Sidebar for user list -->
    <div class="sidebar">
      <h3>Messages</h3>
      <div class="user-list">
        <div
          v-for="chat in chatHistory"
          :key="chat.user.id"
          :class="{ 'user-item': true, 'active': chat.user.id === selectedReceiverId }"
          @click="selectUser(chat.user.id)"
        >
          <div class="user-avatar">
            {{ getInitials(chat.user.firstName, chat.user.lastName) }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ chat.user.firstName }} {{ chat.user.lastName }}</div>
            <div class="last-message" v-if="chat.lastMessage">
              {{ truncateMessage(chat.lastMessage.content) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat window -->
    <div class="chat-main" v-if="selectedReceiverId">
      <div class="chat-header">
        <div class="selected-user">
          <div class="user-avatar">
            {{ selectedUserInitials }}
          </div>
          <h3>{{ selectedUserName }}</h3>
        </div>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div
          v-for="(msg, index) in groupedMessages"
          :key="index"
          class="message-group"
        >
          <div class="message-date">{{ formatDate(msg.date) }}</div>
          <div
            v-for="message in msg.messages"
            :key="message.id"
            :class="[
              'message',
              message.senderId === currentUserId ? 'message-sent' : 'message-received'
            ]"
          >
            <div 
              :class="[
                'message-content',
                isPaymentMessage(message.content) ? 'payment-message' : ''
              ]"
              @click="handleMessageClick(message.content)"
            >
              <template v-if="isPaymentMessage(message.content)">
                <div class="payment-order">
                  <div class="payment-icon">💰</div>
                  <div class="payment-details">
                    <div class="payment-amount">₱{{ formatAmount(getPaymentDetails(message.content).amount) }}</div>
                    <div class="payment-description">{{ getPaymentDetails(message.content).description }}</div>
                    <div class="payment-action">Click to pay</div>
                  </div>
                </div>
              </template>
              <template v-else>
                {{ message.content }}
              </template>
            </div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div class="input-wrapper">
          <input 
            v-model="messageContent" 
            placeholder="Type your message..." 
            @keyup.enter="handleSendMessage"
          />
          <button 
            class="send-button" 
            @click="handleSendMessage"
            :disabled="!messageContent.trim()"
          >
            Send
          </button>
        </div>
      </div>

      <!-- Payment section (visible only to creators) -->
      <div class="payment-section" v-if="isCreator">
        <div class="payment-header">
          <h4>Payment Request</h4>
        </div>
        <div class="payment-form">
          <div class="input-group">
            <label>Amount (₱)</label>
            <input v-model="paymentAmount" type="number" min="0" step="0.01" />
          </div>
          <div class="input-group">
            <label>Description</label>
            <input v-model="paymentDescription" type="text" />
          </div>
          <div class="input-group">
            <label>Remarks</label>
            <input v-model="paymentRemarks" type="text" />
          </div>
          <button 
            class="payment-button"
            @click="handlePayment"
            :disabled="!paymentAmount || !paymentDescription"
          >
            Create Payment Link
          </button>
        </div>
        <div v-if="paymentLink" class="payment-link">
          <p>Payment link generated:</p>
          <a :href="paymentLink" target="_blank" class="link">{{ paymentLink }}</a>
        </div>
      </div>
    </div>

    <!-- Placeholder when no chat selected -->
    <div v-else class="chat-placeholder">
      <div class="placeholder-content">
        <i class="placeholder-icon">💬</i>
        <h3>Select a conversation</h3>
        <p>Choose a user from the list to start chatting</p>
      </div>
    </div>
  </div>
</template>

<script>
import { sendMessage, fetchMessages, fetchUsersWithChatHistory, initiatePayment, getUserIdFromToken, checkPaymentStatus } from '../authService';
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
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
      currentUserId: null,
    };
  },
  async created() {
    this.currentUserId = getUserIdFromToken();
    if (!this.currentUserId) {
      console.error('No valid token found');
      return;
    }
    
    await this.loadChatHistory();
    this.connectSocket();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  computed: {
    selectedUserInitials() {
      if (!this.selectedUserName) return '';
      const names = this.selectedUserName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    groupedMessages() {
      const groups = {};
      this.selectedUserMessages.forEach(msg => {
        const date = new Date(msg.createdAt).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = {
            date: new Date(msg.createdAt),
            messages: []
          };
        }
        groups[date].messages.push(msg);
      });
      return Object.values(groups);
    }
  },
  methods: {
    connectSocket() {
      if (!this.currentUserId) return;

      this.socket = io('http://localhost:3200', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Emit event to join the user's room
      this.socket.emit('joinChat', this.currentUserId.toString()); // Convert to string

      this.socket.on('connect', () => {
        console.log('Connected to socket server with userId:', this.currentUserId);
      });

      this.socket.on('receiveMessage', (data) => {
        console.log('New message received:', data);

        if (data.senderId === this.selectedReceiverId || data.senderId === this.currentUserId) {
          this.selectedUserMessages.push(data);
        }

        this.$forceUpdate();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    },
    async loadChatHistory() {
      try {
        this.chatHistory = await fetchUsersWithChatHistory();
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    },
    async loadMessages(userId) {
      try {
        this.selectedUserMessages = await fetchMessages(userId);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },
    async selectUser(userId) {
      this.selectedReceiverId = userId;
      const userChat = this.chatHistory.find(chat => chat.user.id === userId);
      this.selectedUserName = userChat ? `${userChat.user.firstName} ${userChat.user.lastName}` : '';
      await this.loadMessages(userId);
    },
    async handleSendMessage() {
      if (!this.messageContent.trim() || !this.selectedReceiverId) return;

      try {
        const result = await sendMessage(this.selectedReceiverId, this.messageContent);
        this.socket.emit('sendMessage', {
          ...result.newMessage,
          receiverId: this.selectedReceiverId,
          senderId: this.currentUserId,
        });
        this.messageContent = '';
        
        // Scroll to bottom after sending
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    async handlePayment() {
      if (!this.selectedReceiverId) return alert('Select a user to send a payment to.');

      try {
        const paymentData = await initiatePayment(
          this.paymentAmount, 
          this.paymentDescription, 
          this.paymentRemarks,
          this.selectedReceiverId
        );

        // Create payment order message
        const paymentMessage = {
          type: 'payment',
          amount: this.paymentAmount,
          description: this.paymentDescription,
          paymentUrl: paymentData.paymentUrl,
        };

        // Send the payment order as a message
        const result = await sendMessage(
          this.selectedReceiverId, 
          JSON.stringify(paymentMessage)
        );

        // Emit the message through socket
        this.socket.emit('sendMessage', {
          ...result.newMessage,
          receiverId: this.selectedReceiverId,
          senderId: this.currentUserId,
        });

        // Clear payment form
        this.paymentAmount = '';
        this.paymentDescription = '';
        this.paymentRemarks = '';
        this.paymentLink = '';
      } catch (error) {
        console.error('Error initiating payment:', error);
      }
    },
    getInitials(firstName, lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    },
    
    truncateMessage(message) {
      return message.length > 30 ? message.substring(0, 27) + '...' : message;
    },
    
    formatDate(date) {
      const today = new Date();
      const messageDate = new Date(date);
      
      if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      return messageDate.toLocaleDateString();
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    scrollToBottom() {
      if (this.$refs.messageContainer) {
        this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
      }
    },
    isPaymentMessage(content) {
      try {
        const message = JSON.parse(content);
        return message.type === 'payment';
      } catch {
        return false;
      }
    },
    getPaymentDetails(content) {
      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    },
    handleMessageClick(content) {
      if (this.isPaymentMessage(content)) {
        const paymentDetails = this.getPaymentDetails(content);
        if (paymentDetails?.paymentUrl) {
          window.open(paymentDetails.paymentUrl, '_blank');
        }

        // Check payment status
        this.checkPaymentStatus(paymentDetails.referenceNumber);
      }
    },
    async checkPaymentStatus(referenceNumber) {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          const statusData = await checkPaymentStatus(referenceNumber);
          console.log(`Payment status for ${referenceNumber}: ${statusData.status}`);

          // If the payment is paid, break the loop
          if (statusData.status === 'paid') {
            alert('Payment has been completed.');
            return; // Exit the function if payment is completed
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }

        attempts++;
        // Wait for 30 seconds before the next check
        await new Promise(resolve => setTimeout(resolve, 30 * 1000));
      }

      // If still unpaid after 5 attempts, revert to checking every hour
      console.log(`Payment for ${referenceNumber} is still unpaid after ${maxAttempts} attempts. Reverting to hourly checks.`);
      // You can implement a mechanism to check every hour here if needed
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  },
  watch: {
    selectedUserMessages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.sidebar {
  width: 300px;
  background-color: white;
  border-right: 1px solid #e6e9f0;
  display: flex;
  flex-direction: column;
}

.sidebar h3 {
  padding: 20px;
  margin: 0;
  color: #1a1a1a;
  border-bottom: 1px solid #e6e9f0;
}

.user-list {
  overflow-y: auto;
  flex: 1;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f5f7fb;
}

.user-item.active {
  background-color: #e8f0fe;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2196f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.last-message {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-header {
  padding: 15px 25px;
  border-bottom: 1px solid #e6e9f0;
  background-color: white;
}

.selected-user {
  display: flex;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fb;
}

.message-group {
  margin-bottom: 20px;
}

.message-date {
  text-align: center;
  margin: 20px 0;
  color: #666;
  font-size: 0.9em;
}

.message {
  max-width: 70%;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
}

.message-sent {
  margin-left: auto;
  align-items: flex-end;
}

.message-received {
  margin-right: auto;
  align-items: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.95em;
  line-height: 1.4;
}

.message-sent .message-content {
  background-color: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-content {
  background-color: #e9ecef;
  color: #1a1a1a;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75em;
  color: #666;
  margin-top: 4px;
}

.chat-input-container {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #e6e9f0;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.input-wrapper input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e6e9f0;
  border-radius: 24px;
  font-size: 0.95em;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2196f3;
}

.send-button {
  padding: 0 24px;
  border: none;
  border-radius: 24px;
  background-color: #2196f3;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #1976d2;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.payment-section {
  padding: 20px;
  border-top: 1px solid #e6e9f0;
  background-color: white;
}

.payment-header {
  margin-bottom: 16px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 0.9em;
  color: #666;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid #e6e9f0;
  border-radius: 4px;
}

.payment-button {
  margin-top: 8px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-button:hover {
  background-color: #43a047;
}

.payment-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.payment-link {
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fb;
  border-radius: 4px;
}

.link {
  color: #2196f3;
  word-break: break-all;
}

.payment-amount {
  font-weight: 600;
  font-size: 1.1em;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.payment-message {
  cursor: pointer;
  transition: transform 0.2s;
  background-color: #e8f5e9 !important;
}

.message-sent .payment-message {
  background-color: #43a047 !important;
}

.payment-icon {
  font-size: 24px;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-description {
  font-size: 0.9em;
  opacity: 0.9;
}

.payment-action {
  font-size: 0.8em;
  color: #4caf50;
  font-weight: 500;
  margin-top: 4px;
}

.message-sent .payment-action {
  color: #fff;
}

.message-received .payment-message {
  background-color: #e8f5e9;
}
</style>
