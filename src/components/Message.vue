<template>
  <div class="messenger-container">
    <!-- Sidebar -->
    <div class="messenger-sidebar">
      <div class="sidebar-header">
        <h3>Chats</h3>
        <div class="header-actions">
          <button class="action-button">
            <i class="material-icons">more_horiz</i>
          </button>
        </div>
      </div>

      <div class="search-box">
        <i class="material-icons">search</i>
        <input type="text" placeholder="Search in Messenger" />
      </div>

      <div class="chat-list">
        <div
          v-for="chat in chatHistory"
          :key="chat.user.id"
          :class="[
            'chat-item',
            { 'active': chat.user.id === selectedReceiverId },
            { 'unread': chat.lastMessage && !chat.lastMessage.read }
          ]"
          @click="selectUser(chat.user.id)"
        >
          <div class="chat-avatar" :style="{ backgroundColor: getAvatarColor(chat.user.id) }">
            {{ getInitials(chat.user.firstName, chat.user.lastName) }}
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ chat.user.firstName }} {{ chat.user.lastName }}</div>
            <div class="chat-preview" v-if="chat.lastMessage">
              {{ truncateMessage(chat.lastMessage.content) }}
              <span class="chat-time">· {{ formatTimeShort(chat.lastMessage.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="messenger-main" v-if="selectedReceiverId">
      <div class="chat-header">
        <div class="chat-user-info">
          <div class="chat-avatar" :style="{ backgroundColor: getAvatarColor(selectedReceiverId) }">
            {{ selectedUserInitials }}
          </div>
          <div class="user-details">
            <h3>{{ selectedUserName }}</h3>
            <span class="online-status">Active Now</span>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="isCreator" class="action-button" @click="togglePaymentDrawer">
            <i class="material-icons">payments</i>
          </button>
          <button class="action-button">
            <i class="material-icons">phone</i>
          </button>
          <button class="action-button">
            <i class="material-icons">videocam</i>
          </button>
          <button class="action-button">
            <i class="material-icons">info</i>
          </button>
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
                'message-bubble',
                isPaymentMessage(message.content) ? 'payment-bubble' : '',
                message.senderId === currentUserId ? 'sent' : 'received'
              ]"
              @click="handleMessageClick(message.content)"
            >
              <template v-if="isPaymentMessage(message.content)">
                <div class="payment-content">
                  <div class="payment-icon">💰</div>
                  <div class="payment-info">
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

      <div class="chat-input">
        <div class="input-actions">
          <button class="action-button">
            <i class="material-icons">add_circle</i>
          </button>
          <button class="action-button">
            <i class="material-icons">photo</i>
          </button>
          <button class="action-button">
            <i class="material-icons">gif</i>
          </button>
        </div>
        <div class="input-wrapper">
          <input 
            v-model="messageContent" 
            placeholder="Aa" 
            @keyup.enter="handleSendMessage"
          />
          <button class="emoji-button">
            <i class="material-icons">sentiment_satisfied_alt</i>
          </button>
        </div>
        <button 
          class="send-button" 
          @click="handleSendMessage"
          :disabled="!messageContent.trim()"
        >
          <i class="material-icons">send</i>
        </button>
      </div>

      <!-- Payment section for creators -->
      <div class="payment-drawer" v-if="isCreator && showPaymentDrawer" :class="{ 'drawer-active': showPaymentDrawer }">
        <div class="drawer-header">
          <h4>Payment Request</h4>
          <button class="close-button" @click="togglePaymentDrawer">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="payment-form">
          <div class="form-group">
            <label>Amount (₱)</label>
            <input v-model="paymentAmount" type="number" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="paymentDescription" type="text" />
          </div>
          <div class="form-group">
            <label>Remarks</label>
            <input v-model="paymentRemarks" type="text" />
          </div>
          <button 
            class="payment-request-button"
            @click="handlePayment"
            :disabled="!paymentAmount || !paymentDescription"
          >
            Send Payment Request
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="messenger-empty">
      <div class="empty-content">
        <img src="@/assets/logo.png" alt="Messenger" class="empty-icon" />
        <h2>Welcome to Messages</h2>
        <p>Connect with your clients and creators through instant messaging</p>
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
      showPaymentDrawer: false,
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
    },
    getAvatarColor(userId) {
      const colors = [
        '#1877F2', '#E84C3D', '#2ECC70', '#3498DB',
        '#9B59B6', '#F1C40F', '#E67E22', '#1ABC9C'
      ];
      return colors[userId % colors.length];
    },
    formatTimeShort(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    },
    togglePaymentDrawer() {
      this.showPaymentDrawer = !this.showPaymentDrawer;
    },
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
.messenger-container {
  display: flex;
  height: calc(100vh - 56px);
  background-color: white;
  margin: 0;
  padding: 0;
}

.messenger-sidebar {
  width: 360px;
  border-right: 1px solid #E4E6EB;
  display: flex;
  flex-direction: column;
  background: white;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E4E6EB;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.search-box {
  padding: 8px 16px;
  position: relative;
  border-bottom: 1px solid #E4E6EB;
}

.search-box input {
  width: 100%;
  padding: 8px 32px;
  border-radius: 20px;
  border: none;
  background: #F0F2F5;
  font-size: 15px;
}

.search-box i {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #65676B;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #F0F2F5;
}

.chat-item.active {
  background-color: #E7F3FF;
}

.chat-item.unread .chat-name {
  font-weight: bold;
  color: #1877F2;
}

.chat-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 20px;
  margin-right: 12px;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 15px;
  margin-bottom: 4px;
}

.chat-preview {
  color: #65676B;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  color: #65676B;
  font-size: 12px;
}

.messenger-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  overflow-x: hidden;
}

.chat-header {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E4E6EB;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 12px;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
}

.online-status {
  font-size: 13px;
  color: #65676B;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676B;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #F0F2F5;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: white;
}

.message-group {
  margin-bottom: 16px;
}

.message-date {
  text-align: center;
  margin: 16px 0;
  color: #65676B;
  font-size: 12px;
}

.message {
  max-width: 60%;
  margin: 4px 0;
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

.message-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  position: relative;
}

.message-bubble.sent {
  background-color: #0084FF;
  color: white;
}

.message-bubble.received {
  background-color: #F0F2F5;
  color: black;
}

.message-time {
  font-size: 11px;
  color: #65676B;
  margin-top: 2px;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #E4E6EB;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #F0F2F5;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  flex: 1;
  padding: 8px 40px 8px 16px;
  border: none;
  background: none;
  font-size: 15px;
}

.input-wrapper input:focus {
  outline: none;
}

.emoji-button {
  padding: 8px;
  background: none;
  border: none;
  color: #65676B;
  cursor: pointer;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: none;
  color: #0084FF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:disabled {
  color: #BCC0C4;
  cursor: not-allowed;
}

.payment-bubble {
  background-color: #E8F3FF !important;
  padding: 12px !important;
  border-radius: 12px !important;
}

.payment-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  font-size: 24px;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-amount {
  font-weight: bold;
  font-size: 16px;
  color: #1877F2;
}

.payment-description {
  font-size: 14px;
  color: #65676B;
}

.payment-action {
  font-size: 13px;
  color: #1877F2;
  font-weight: 500;
}

.messenger-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.empty-content {
  text-align: center;
  color: #65676B;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.payment-drawer {
  position: absolute;
  right: -320px;
  top: 0;
  width: 320px;
  height: 100%;
  background: white;
  border-left: 1px solid #E4E6EB;
  padding: 16px;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.drawer-active {
  transform: translateX(-320px);
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #F0F2F5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676B;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #E4E6EB;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #65676B;
  font-size: 13px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #E4E6EB;
  border-radius: 6px;
  font-size: 15px;
}

.payment-request-button {
  width: 100%;
  padding: 8px;
  background: #0084FF;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.payment-request-button:disabled {
  background: #BCC0C4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .messenger-sidebar {
    width: 100%;
    position: absolute;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .messenger-sidebar.active {
    transform: translateX(0);
  }

  .messenger-main {
    width: 100%;
  }

  .payment-drawer {
    width: 100%;
    right: -100%;
  }

  .drawer-active {
    transform: translateX(-100%);
  }
}
</style>

