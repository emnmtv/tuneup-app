<template>
  <div class="admin-analytics-container">
    <h1 class="admin-title">Admin Analytics Dashboard</h1>
    
    <div v-if="!isAdmin" class="unauthorized-message">
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
    </div>
    
    <div v-else class="dashboard-container">
      <!-- Tab Navigation -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Revenue Analytics Tab -->
        <div v-if="activeTab === 'revenue'" class="tab-panel">
          <div class="panel-header">
            <h2>Revenue Analytics</h2>
            <div class="date-filter">
              <label>Period:</label>
              <select v-model="revenueTimeframe" @change="loadRevenueData">
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          
          <div class="summary-cards">
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p class="amount">₱{{ revenue.totalRevenue?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="summary-card">
              <h3>Unclaimed Fees</h3>
              <p class="amount">₱{{ revenue.unclaimedRevenue?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="summary-card">
              <h3>Transactions</h3>
              <p class="amount">{{ revenue.totalTransactions || 0 }}</p>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Revenue Over Time</h3>
            <canvas ref="revenueChart"></canvas>
          </div>
          
          <!-- New Transaction List Section -->
          <div class="transaction-list-container">
            <div class="section-header">
              <h3>Transaction List</h3>
              <div class="filter-controls">
                <select v-model="transactionFilter">
                  <option value="all">All Transactions</option>
                  <option value="unclaimed">Unclaimed Fees Only</option>
                  <option value="claimed">Claimed Fees Only</option>
                </select>
                <button class="refresh-btn" @click="loadTransactionList">Refresh</button>
              </div>
            </div>
            
            <div class="transaction-table-wrapper">
              <table class="transaction-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" v-model="selectAllTransactions" @change="toggleAllTransactions"></th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Creator</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Admin Fee</th>
                    <th>Status</th>
                    <th>Claimed</th>
                  </tr>
                </thead>
                <tbody v-if="transactions.length > 0">
                  <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                    <td>
                      <input 
                        type="checkbox" 
                        v-model="selectedTransactions" 
                        :value="transaction.id" 
                        :disabled="transaction.isFeeClaimed"
                      >
                    </td>
                    <td>{{ transaction.referenceNumber }}</td>
                    <td>{{ formatDate(transaction.createdAt) }}</td>
                    <td>{{ transaction.creatorName }}</td>
                    <td>{{ transaction.clientName }}</td>
                    <td>₱{{ (transaction.amount / 100).toFixed(2) }}</td>
                    <td>₱{{ (transaction.adminFee / 100).toFixed(2) }}</td>
                    <td>
                      <span 
                        :class="['status-badge', 
                          transaction.status === 'paid' ? 'status-success' : 
                          transaction.status === 'unpaid' ? 'status-warning' : 'status-default'
                        ]"
                      >
                        {{ transaction.status }}
                      </span>
                    </td>
                    <td>
                      <span v-if="transaction.isFeeClaimed" class="claimed-badge">Claimed</span>
                      <button 
                        v-else 
                        class="claim-btn"
                        @click="claimFee(transaction.id)"
                      >
                        Claim
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="9" class="no-data">No transactions found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="batch-actions">
              <button 
                class="action-btn" 
                @click="claimSelectedFees"
                :disabled="selectedTransactions.length === 0"
              >
                Claim Selected Fees ({{ selectedTransactions.length }})
              </button>
              <button class="action-btn" @click="claimAllFees">Claim All Fees</button>
            </div>
          </div>
        </div>
        
        <!-- User Growth Tab -->
        <div v-if="activeTab === 'users'" class="tab-panel">
          <div class="panel-header">
            <h2>User Growth Analytics</h2>
            <div class="date-filter">
              <label>Period:</label>
              <select v-model="userTimeframe" @change="loadUserData">
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          
          <div class="summary-cards">
            <div class="summary-card">
              <h3>Total Users</h3>
              <p class="amount">{{ userGrowth.totalUsers || 0 }}</p>
            </div>
            <div class="summary-card">
              <h3>Total Creators</h3>
              <p class="amount">{{ userGrowth.totalCreators || 0 }}</p>
            </div>
            <div class="summary-card">
              <h3>Verified Users</h3>
              <p class="amount">{{ userGrowth.verifiedUsers || 0 }}</p>
              <p class="percentage">{{ ((userGrowth.verifiedUsers / userGrowth.totalUsers) * 100).toFixed(1) }}%</p>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>User Growth Over Time</h3>
            <canvas ref="userGrowthChart"></canvas>
          </div>
        </div>
        
        <!-- Creator Performance Tab -->
        <div v-if="activeTab === 'creators'" class="tab-panel">
          <h2>Creator Performance</h2>
          
          <div class="performance-tables">
            <div class="performance-table">
              <h3>Top Earning Creators</h3>
              <table>
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Profession</th>
                    <th>Earnings (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(creator, index) in creatorPerformance.topEarners" :key="'earner-'+index">
                    <td>{{ creator.name }}</td>
                    <td>{{ creator.profession }}</td>
                    <td>₱{{ creator.value.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="performance-table">
              <h3>Most Engaging Creators</h3>
              <table>
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Profession</th>
                    <th>Engagements</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(creator, index) in creatorPerformance.topEngagers" :key="'engager-'+index">
                    <td>{{ creator.name }}</td>
                    <td>{{ creator.profession }}</td>
                    <td>{{ creator.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="performance-table">
              <h3>Highest Rated Creators</h3>
              <table>
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Profession</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(creator, index) in creatorPerformance.topRated" :key="'rated-'+index">
                    <td>{{ creator.name }}</td>
                    <td>{{ creator.profession }}</td>
                    <td>{{ creator.value.toFixed(1) }}/5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Content Performance Tab -->
        <div v-if="activeTab === 'content'" class="tab-panel">
          <h2>Content Performance</h2>
          
          <div class="performance-tables">
            <div class="performance-table">
              <h3>Most Viewed Posts</h3>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(post, index) in contentPerformance.topViewedPosts" :key="'post-'+index">
                    <td>{{ post.title }}</td>
                    <td>{{ post.creatorName }}</td>
                    <td>{{ post.viewCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="performance-table">
              <h3>Audio Engagement</h3>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Avg. Duration (s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(post, index) in contentPerformance.topAudioEngagements" :key="'audio-'+index">
                    <td>{{ post.title }}</td>
                    <td>{{ post.creatorName }}</td>
                    <td>{{ Math.round(post.avgDuration) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Fee Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-panel">
          <h2>Platform Fee Settings</h2>
          
          <div class="settings-container">
            <div class="current-settings">
              <h3>Current Fee Percentage</h3>
              <p class="fee-value">{{ feeSettings.feePercentage }}%</p>
              <p class="fee-info">Last updated: {{ formatDate(feeSettings.lastUpdated) }}</p>
            </div>
            
            <div class="update-settings">
              <h3>Update Fee Percentage</h3>
              <div class="fee-form">
                <label for="newFeePercentage">New Fee Percentage (0-50%):</label>
                <input 
                  type="number" 
                  id="newFeePercentage" 
                  v-model.number="newFeePercentage"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <button 
                  class="update-btn" 
                  @click="updateFee"
                  :disabled="!isValidFee"
                >
                  Update Fee
                </button>
              </div>
              <p class="warning-text" v-if="!isValidFee">Fee must be between 0 and 50%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  isUserAdmin,
  getAdminRevenueAnalytics,
  getAdminUserGrowthAnalytics,
  getAdminCreatorPerformance,
  getAdminContentPerformance,
  getCurrentFeePercentage,
  updateFeePercentage,
  claimAdminFees
} from '../authService';
import Chart from 'chart.js/auto';

export default {
  name: 'AdminAnalyticsView',
  data() {
    return {
      isAdmin: false,
      activeTab: 'revenue',
      tabs: [
        { id: 'revenue', name: 'Revenue' },
        { id: 'users', name: 'Users' },
        { id: 'creators', name: 'Creators' },
        { id: 'content', name: 'Content' },
        { id: 'settings', name: 'Fee Settings' }
      ],
      // Revenue data
      revenueTimeframe: 'month',
      revenue: {
        totalRevenue: 0,
        claimedRevenue: 0,
        unclaimedRevenue: 0,
        totalTransactions: 0,
        revenueTimeline: []
      },
      revenueChart: null,
      
      // User data
      userTimeframe: 'month',
      userGrowth: {
        totalUsers: 0,
        totalCreators: 0,
        verifiedUsers: 0,
        userGrowthTimeline: []
      },
      userGrowthChart: null,
      
      // Creator performance
      creatorPerformance: {
        topEarners: [],
        topEngagers: [],
        topRated: []
      },
      
      // Content performance
      contentPerformance: {
        topViewedPosts: [],
        topAudioEngagements: []
      },
      
      // Fee settings
      feeSettings: {
        feePercentage: 20,
        lastUpdated: null,
        lastUpdatedBy: null
      },
      newFeePercentage: 20,
      
      // Loading states
      loading: {
        revenue: false,
        users: false,
        creators: false,
        content: false,
        fee: false,
        claiming: false,
        transactions: false
      },
      
      // Transaction list
      transactions: [],
      transactionFilter: 'all',
      selectAllTransactions: false,
      selectedTransactions: [],
    };
  },
  computed: {
    isValidFee() {
      return this.newFeePercentage >= 0 && this.newFeePercentage <= 50;
    },
    filteredTransactions() {
      if (this.transactionFilter === 'all') {
        return this.transactions;
      } else if (this.transactionFilter === 'unclaimed') {
        return this.transactions.filter(t => !t.isFeeClaimed);
      } else if (this.transactionFilter === 'claimed') {
        return this.transactions.filter(t => t.isFeeClaimed);
      }
      return [];
    }
  },
  methods: {
    async checkAdminStatus() {
      this.isAdmin = isUserAdmin();
      if (!this.isAdmin) {
        console.warn('Unauthorized access to admin dashboard');
        return false;
      }
      return true;
    },
    
    async loadData() {
      if (!await this.checkAdminStatus()) return;
      
      // Load data for the active tab
      switch (this.activeTab) {
        case 'revenue':
          // First load transactions, then load revenue data to prevent overwriting
          await this.loadTransactionList();
          await this.loadRevenueData(); // This should run after transactions are loaded
          break;
        case 'users':
          this.loadUserData();
          break;
        case 'creators':
          this.loadCreatorData();
          break;
        case 'content':
          this.loadContentData();
          break;
        case 'settings':
          this.loadFeeSettings();
          break;
      }
    },
    
    async loadRevenueData() {
      this.loading.revenue = true;
      try {
        // Use a much wider date range to capture all possible transactions
        // Start from 5 years ago up to 1 year in the future
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Go 1 year into the future
        
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5); // Go 5 years into the past
        
        // Log the date range we're using
        console.log('Using date range:', {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          groupBy: this.revenueTimeframe
        });
        
        const response = await getAdminRevenueAnalytics(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          this.revenueTimeframe
        );
        
        this.revenue = response;
        this.updateRevenueChart();
      } catch (error) {
        console.error('Error loading revenue data:', error);
      } finally {
        this.loading.revenue = false;
      }
    },
    
    updateRevenueChart() {
      console.log('Updating revenue chart with data:', this.revenue);
      
      if (!this.revenue.revenueTimeline || this.revenue.revenueTimeline.length === 0) {
        console.warn('No revenue timeline data available for chart');
        
        // If we have revenue data but no timeline, create a simple chart with today's date
        if (this.revenue.totalRevenue > 0) {
          console.log('Creating simple chart with total revenue');
          
          const ctx = this.$refs.revenueChart;
          if (!ctx) return;
          
          // Destroy existing chart if it exists
          if (this.revenueChart) {
            this.revenueChart.destroy();
          }
          
          // Create a simple chart with today's date and total revenue
          const today = new Date().toISOString().split('T')[0];
          
          this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [today],
              datasets: [{
                label: 'Revenue (₱)',
                data: [this.revenue.totalRevenue],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '₱' + value.toFixed(2);
                    }
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return '₱' + context.parsed.y.toFixed(2);
                    }
                  }
                }
              }
            }
          });
        }
        
        return;
      }
      
      const ctx = this.$refs.revenueChart;
      if (!ctx) return;
      
      // Destroy existing chart if it exists
      if (this.revenueChart) {
        this.revenueChart.destroy();
      }
      
      const labels = this.revenue.revenueTimeline.map(item => item.date);
      
      // Check if the revenue needs to be divided by 100 (cents to dollars)
      // This handles different API response formats between environments
      const firstItem = this.revenue.revenueTimeline[0];
      const useRawValue = firstItem && firstItem.revenue <= 1000; // If revenue is small, assume it's already in dollars
      
      console.log('Revenue chart values:', {
        useRawValue, 
        firstItemRevenue: firstItem ? firstItem.revenue : 'N/A'
      });
      
      const data = this.revenue.revenueTimeline.map(item => {
        if (useRawValue) {
          return item.revenue; // Use raw value (already in dollars)
        } else {
          return item.revenue / 100; // Convert from cents to dollars
        }
      });
      
      this.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue (₱)',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₱' + value.toFixed(2);
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return '₱' + context.parsed.y.toFixed(2);
                }
              }
            }
          }
        }
      });
    },
    
    async loadUserData() {
      this.loading.users = true;
      try {
        // Get 6 months of data by default
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        
        const response = await getAdminUserGrowthAnalytics(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          this.userTimeframe
        );
        
        this.userGrowth = response;
        this.updateUserGrowthChart();
      } catch (error) {
        console.error('Error loading user data:', error);
        // Show error notification
      } finally {
        this.loading.users = false;
      }
    },
    
    updateUserGrowthChart() {
      if (!this.userGrowth.userGrowthTimeline || this.userGrowth.userGrowthTimeline.length === 0) return;
      
      const ctx = this.$refs.userGrowthChart;
      if (!ctx) return;
      
      // Destroy existing chart if it exists
      if (this.userGrowthChart) {
        this.userGrowthChart.destroy();
      }
      
      const labels = this.userGrowth.userGrowthTimeline.map(item => item.date);
      
      this.userGrowthChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Users',
              data: this.userGrowth.userGrowthTimeline.map(item => item.newUsers),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderWidth: 1
            },
            {
              label: 'New Creators',
              data: this.userGrowth.userGrowthTimeline.map(item => item.newCreators),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderWidth: 1
            },
            {
              label: 'Verified Users',
              data: this.userGrowth.userGrowthTimeline.map(item => item.newVerifiedUsers),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Users'
              }
            }
          }
        }
      });
    },
    
    async loadCreatorData() {
      this.loading.creators = true;
      try {
        const response = await getAdminCreatorPerformance();
        this.creatorPerformance = response;
      } catch (error) {
        console.error('Error loading creator data:', error);
        // Show error notification
      } finally {
        this.loading.creators = false;
      }
    },
    
    async loadContentData() {
      this.loading.content = true;
      try {
        const response = await getAdminContentPerformance();
        this.contentPerformance = response;
      } catch (error) {
        console.error('Error loading content data:', error);
        // Show error notification
      } finally {
        this.loading.content = false;
      }
    },
    
    async loadFeeSettings() {
      this.loading.fee = true;
      try {
        const response = await getCurrentFeePercentage();
        this.feeSettings = response;
        this.newFeePercentage = response.feePercentage;
      } catch (error) {
        console.error('Error loading fee settings:', error);
        // Show error notification
      } finally {
        this.loading.fee = false;
      }
    },
    
    async updateFee() {
      if (!this.isValidFee) return;
      
      this.loading.fee = true;
      try {
        const response = await updateFeePercentage(this.newFeePercentage);
        this.feeSettings.feePercentage = response.feePercentage;
        this.feeSettings.lastUpdated = new Date();
        alert('Fee percentage updated successfully');
      } catch (error) {
        console.error('Error updating fee:', error);
        alert('Failed to update fee percentage');
      } finally {
        this.loading.fee = false;
      }
    },
    
    async claimAllFees() {
      if (!confirm('Are you sure you want to claim all unclaimed fees?')) return;
      
      this.loading.claiming = true;
      try {
        const response = await claimAdminFees();
        alert(`Successfully claimed ${response.claimedCount} fees`);
        // Refresh revenue data
        this.loadRevenueData();
      } catch (error) {
        console.error('Error claiming fees:', error);
        alert('Failed to claim fees');
      } finally {
        this.loading.claiming = false;
      }
    },
    
    async claimFee(transactionId) {
      if (!confirm('Are you sure you want to claim this fee?')) return;
      
      this.loading.claiming = true;
      try {
        await claimAdminFees([transactionId]);
        alert(`Successfully claimed fee`);
        // Refresh transaction list and revenue data
        await this.loadTransactionList();
        await this.loadRevenueData();
      } catch (error) {
        console.error('Error claiming fee:', error);
        alert('Failed to claim fee');
      } finally {
        this.loading.claiming = false;
      }
    },
    
    async claimSelectedFees() {
      if (this.selectedTransactions.length === 0) {
        alert('No fees selected to claim');
        return;
      }
      
      if (!confirm(`Are you sure you want to claim ${this.selectedTransactions.length} selected fees?`)) return;
      
      this.loading.claiming = true;
      try {
        const result = await claimAdminFees(this.selectedTransactions);
        alert(`Successfully claimed ${result.claimedCount} fees`);
        // Refresh transaction list and revenue data
        await this.loadTransactionList();
        await this.loadRevenueData();
        // Reset selections
        this.selectedTransactions = [];
        this.selectAllTransactions = false;
      } catch (error) {
        console.error('Error claiming selected fees:', error);
        alert('Failed to claim selected fees');
      } finally {
        this.loading.claiming = false;
      }
    },
    
    async loadTransactionList() {
      this.loading.transactions = true;
      try {
        // Use a much wider date range to capture all possible transactions
        // Start from 5 years ago up to 1 year in the future
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Go 1 year into the future
        
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5); // Go 5 years into the past
        
        console.log('Using date range for transactions:', {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
        
        // Get transactions from revenue analytics with the includeTransactions flag
        const response = await getAdminRevenueAnalytics(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          'day',
          true  // includeTransactions = true
        );
        
        // IMPORTANT: Only update the transactions array, not the entire revenue object
        if (response.transactions) {
          this.transactions = response.transactions;
          console.log('Loaded transactions:', this.transactions.length);
        } else {
          this.transactions = [];
          console.warn('No transaction data received from the server');
        }
      } catch (error) {
        console.error('Error loading transaction list:', error);
        alert('Failed to load transaction list');
        this.transactions = [];
      } finally {
        this.loading.transactions = false;
      }
    },
    
    toggleAllTransactions() {
      if (this.selectAllTransactions) {
        this.selectedTransactions = this.transactions.map(t => t.id);
      } else {
        this.selectedTransactions = [];
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Never';
      
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  },
  watch: {
    activeTab() {
      this.loadData();
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<style scoped>
.admin-analytics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-title {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.unauthorized-message {
  text-align: center;
  color: #d9534f;
  margin-top: 50px;
}

.dashboard-container {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.tab-btn {
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
  min-width: 100px;
  text-align: center;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.tab-btn.active {
  background: #fff;
  color: #007bff;
  border-bottom: 3px solid #007bff;
}

.tab-content {
  padding: 20px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #6c757d;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #212529;
  margin: 0;
}

.percentage {
  font-size: 14px;
  color: #28a745;
  margin: 5px 0 0 0;
}

.chart-container {
  height: 300px;
  margin-bottom: 30px;
}

.action-panel {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.action-btn {
  padding: 10px 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn:hover {
  background: #218838;
}

.performance-tables {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.performance-table {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.performance-table h3 {
  margin-top: 0;
  color: #495057;
  font-size: 18px;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  color: #6c757d;
  font-weight: 600;
}

.settings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.current-settings, .update-settings {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.fee-value {
  font-size: 36px;
  font-weight: bold;
  color: #212529;
  margin: 20px 0;
}

.fee-info {
  color: #6c757d;
  font-size: 14px;
}

.fee-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.fee-form label {
  color: #495057;
}

.fee-form input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.update-btn {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 10px;
}

.update-btn:hover {
  background: #0069d9;
}

.update-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.warning-text {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex-grow: 1;
    min-width: auto;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}

.transaction-list-container {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.refresh-btn:hover {
  background: #0069d9;
}

.transaction-table-wrapper {
  margin-bottom: 10px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th, .transaction-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.transaction-table th {
  color: #6c757d;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-success {
  background-color: #dff0d8;
  color: #28a745;
}

.status-warning {
  background-color: #fff3cd;
  color: #ffc107;
}

.status-default {
  background-color: #f8f9fa;
  color: #6c757d;
}

.claimed-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background-color: #dff0d8;
  color: #28a745;
}

.claim-btn {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.claim-btn:hover {
  background: #0069d9;
}

.batch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.no-data {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
</style>
