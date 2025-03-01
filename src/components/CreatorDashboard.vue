<template>
  <div class="creator-dashboard">
    <div class="header">
      <h1>Creator Dashboard</h1>
      <div class="date-filter">
        <button 
          v-for="period in timePeriods" 
          :key="period"
          :class="['period-btn', { active: selectedPeriod === period }]"
          @click="selectedPeriod = period"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <!-- Add error message display -->
    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="stats-grid">
      <!-- Revenue Card -->
      <div class="stat-card revenue">
        <div class="stat-icon">
          <span class="material-icons">payments</span>
        </div>
        <div class="stat-content">
          <h3>Total Revenue</h3>
          <div class="stat-value">
            <span class="currency">₱</span>
            {{ formatPeso(totalRevenue) }}
          </div>
          <div class="stat-trend" :class="revenueTrend > 0 ? 'positive' : 'negative'">
            <span class="material-icons">
              {{ revenueTrend > 0 ? 'trending_up' : 'trending_down' }}
            </span>
            {{ Math.abs(revenueTrend) }}% from last period
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="stat-card orders">
        <div class="stat-icon">
          <span class="material-icons">shopping_bag</span>
        </div>
        <div class="stat-content">
          <h3>Total Orders</h3>
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-trend" :class="ordersTrend > 0 ? 'positive' : 'negative'">
            <span class="material-icons">
              {{ ordersTrend > 0 ? 'trending_up' : 'trending_down' }}
            </span>
            {{ Math.abs(ordersTrend) }}% from last period
          </div>
        </div>
      </div>

      <!-- Completion Rate Card -->
      <div class="stat-card completion">
        <div class="stat-icon">
          <span class="material-icons">payments</span>
        </div>
        <div class="stat-content">
          <h3>Paid Orders Rate</h3>
          <div class="stat-value">{{ paidOrdersRate }}%</div>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${paidOrdersRate}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Average Rating Card -->
      <div class="stat-card rating">
        <div class="stat-icon">
          <span class="material-icons">star</span>
        </div>
        <div class="stat-content">
          <h3>Average Rating</h3>
          <div class="stat-value">{{ averageRating }}/5</div>
          <div class="rating-stars">
            <span class="material-icons" v-for="n in 5" :key="n"
                  :class="{ filled: n <= Math.round(averageRating) }">
              star
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Chart -->
    <div class="chart-section">
      <div class="chart-card">
        <h3>Revenue Overview</h3>
        <div class="chart-container">
          <canvas ref="revenueChartRef"></canvas>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>Orders Statistics</h3>
        <div class="chart-container">
          <canvas ref="ordersChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-orders">
      <h3>Recent Orders</h3>
      <div class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.referenceNumber">
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ order.client.firstName }} {{ order.client.lastName }}</td>
              <td>{{ order.description }}</td>
              <td>₱{{ formatPeso(order.amount / 100) }}</td>
              <td>
                <span class="status-badge" :class="order.status.toLowerCase()">
                  {{ order.status === 'paid' ? 'Paid' : 'Unpaid' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add this section for ratings overview -->
    <div class="ratings-section">
      <div class="ratings-card">
        <h3>Ratings Overview</h3>
        <div class="ratings-content">
          <div class="rating-summary">
            <div class="average-rating">
              <div class="big-rating">{{ averageRating.toFixed(1) }}</div>
              <div class="rating-stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="material-icons"
                  :class="{ filled: n <= Math.round(averageRating) }"
                >
                  star
                </span>
              </div>
              <div class="total-ratings">{{ totalRatings }} total ratings</div>
            </div>
          </div>

          <div class="recent-ratings">
            <h4>Recent Reviews</h4>
            <div v-if="recentRatings.length > 0" class="ratings-list">
              <div v-for="rating in recentRatings" :key="rating.id" class="rating-item">
                <div class="rating-header">
                  <div class="rating-stars">
                    <span 
                      v-for="n in 5" 
                      :key="n"
                      class="material-icons"
                      :class="{ filled: n <= rating.rating }"
                    >
                      star
                    </span>
                  </div>
                  <div class="rating-date">{{ formatDate(rating.createdAt) }}</div>
                </div>
                <div class="client-name">{{ rating.client.firstName }} {{ rating.client.lastName }}</div>
                <div class="rating-review" v-if="rating.review">{{ rating.review }}</div>
                <div class="service-details">
                  <span class="amount">₱{{ formatPeso(rating.payment.amount / 100) }}</span>
                  <span class="description">{{ rating.payment.description }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-ratings">
              No ratings yet
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchUserPayments, getCreatorProfile, fetchCreatorRatings } from '../authService';
import { formatPeso } from '../utils/currencyFormatter';
import Chart from 'chart.js/auto';

export default {
  name: 'CreatorDashboard',
  setup() {
    const payments = ref([]);
    const profile = ref(null);
    const revenueChartRef = ref(null);
    const ordersChartRef = ref(null);
    const selectedPeriod = ref('This Month');
    const timePeriods = ['This Week', 'This Month', 'This Year', 'All Time'];
    const ratings = ref(null);

    let revenueChartInstance = null;
    let ordersChartInstance = null;

    const initializeCharts = () => {
      // Revenue Chart
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }

      const monthlyData = getMonthlyRevenue();
      
      revenueChartInstance = new Chart(revenueChartRef.value, {
        type: 'line',
        data: {
          labels: monthlyData.labels,
          datasets: [{
            label: 'Monthly Revenue',
            data: monthlyData.data,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => '₱' + formatPeso(value)
              }
            }
          }
        }
      });

      // Orders Chart - Updated for paid/unpaid
      if (ordersChartInstance) {
        ordersChartInstance.destroy();
      }

      const orderStatusData = getOrderStatusData();
      
      ordersChartInstance = new Chart(ordersChartRef.value, {
        type: 'doughnut',
        data: {
          labels: ['Paid', 'Unpaid'],
          datasets: [{
            data: [orderStatusData.paid, orderStatusData.unpaid],
            backgroundColor: ['#28a745', '#dc3545'], // Green for paid, red for unpaid
            hoverBackgroundColor: ['#218838', '#c82333'],
            borderWidth: 0,
            borderRadius: 5,
            spacing: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            title: {
              display: true,
              text: 'Payment Status Distribution',
              padding: {
                bottom: 15
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true
          }
        }
      });
    };

    const getMonthlyRevenue = () => {
      const months = {};
      payments.value.forEach(payment => {
        const date = new Date(payment.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        months[monthYear] = (months[monthYear] || 0) + Number(payment.amount) / 100;
      });

      return {
        labels: Object.keys(months),
        data: Object.values(months)
      };
    };

    const getOrderStatusData = () => {
      const paid = payments.value.filter(p => p.status === 'paid').length;
      const unpaid = payments.value.filter(p => p.status === 'unpaid').length;
      return { paid, unpaid };
    };

    const fetchData = async () => {
      try {
        // Get creator profile first
        const profileData = await getCreatorProfile();
        profile.value = profileData;

        // Then fetch both payments and ratings
        const [paymentsResponse, ratingsData] = await Promise.all([
          fetchUserPayments(),
          fetchCreatorRatings()
        ]);

        if (paymentsResponse?.payments) {
          payments.value = paymentsResponse.payments;
        }

        if (ratingsData) {
          ratings.value = ratingsData;
        }

        initializeCharts();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Computed properties
    const totalRevenue = computed(() => {
      return payments.value.reduce((sum, payment) => 
        sum + Number(payment.amount), 0) / 100;
    });

    const totalOrders = computed(() => payments.value.length);

    const paidOrdersRate = computed(() => {
      const total = payments.value.length;
      if (!total) return 0;
      const paid = payments.value.filter(p => p.status === 'paid').length;
      return Math.round((paid / total) * 100);
    });

    const averageRating = computed(() => {
      return ratings.value?.stats.average || 0;
    });

    const totalRatings = computed(() => {
      return ratings.value?.stats.total || 0;
    });

    const recentRatings = computed(() => {
      return ratings.value?.ratings.slice(0, 5) || [];
    });

    const revenueTrend = computed(() => {
      // Implement actual trend calculation
      return 15;
    });

    const ordersTrend = computed(() => {
      // Implement actual trend calculation
      return 8;
    });

    const recentOrders = computed(() => {
      return [...payments.value]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    });

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Watch for period changes to update charts
    watch(selectedPeriod, () => {
      initializeCharts();
    });

    onMounted(fetchData);

    return {
      selectedPeriod,
      timePeriods,
      totalRevenue,
      totalOrders,
      paidOrdersRate,
      averageRating,
      revenueTrend,
      ordersTrend,
      recentOrders,
      formatDate,
      formatPeso,
      revenueChartRef,
      ordersChartRef,
      ratings,
      totalRatings,
      recentRatings
    };
  }
};
</script>

<style scoped>
.creator-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #2c3e50;
}

.date-filter {
  display: flex;
  gap: 0.5rem;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  background: #f8f9fa;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .material-icons {
  font-size: 24px;
  color: #007bff;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.currency {
  font-size: 1.4rem;
  font-weight: normal;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.stat-trend.positive {
  color: #28a745;
}

.stat-trend.negative {
  color: #dc3545;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #28a745; /* Green for paid status */
  transition: width 0.3s ease;
}

.rating-stars {
  color: #ffc107;
  margin-top: 0.5rem;
}

.rating-stars .material-icons {
  font-size: 1.2rem;
}

.rating-stars .material-icons.filled {
  color: #ffc107;
}

.chart-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.chart-card:hover {
  transform: translateY(-4px);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  margin: 1rem 0;
}

.chart-card h3 {
  margin: 0 0 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.recent-orders {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.recent-orders h3 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.orders-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  font-weight: 600;
  color: #6c757d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.unpaid {
  background: #f8d7da;
  color: #721c24;
}

.ratings-section {
  margin: 2rem 0;
}

.ratings-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.ratings-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.rating-summary {
  padding-right: 2rem;
  border-right: 1px solid #eee;
}

.average-rating {
  text-align: center;
}

.big-rating {
  font-size: 4rem;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
}

.rating-stars {
  color: #ffd700;
  margin: 0.5rem 0;
}

.rating-stars .material-icons {
  font-size: 1.5rem;
}

.rating-stars .material-icons.filled {
  color: #ffd700;
}

.total-ratings {
  color: #666;
  font-size: 0.9rem;
}

.recent-ratings {
  flex: 1;
}

.ratings-list {
  margin-top: 1rem;
}

.rating-item {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-date {
  color: #666;
  font-size: 0.9rem;
}

.client-name {
  font-weight: 500;
  margin: 0.5rem 0;
}

.rating-review {
  color: #2c3e50;
  margin: 0.5rem 0;
  font-style: italic;
}

.service-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.amount {
  color: #28a745;
  font-weight: 500;
}

.description {
  color: #666;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.no-ratings {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .creator-dashboard {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .date-filter {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .period-btn {
    white-space: nowrap;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .orders-table {
    margin: 0 -1rem;
  }

  .chart-section {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }

  .ratings-content {
    grid-template-columns: 1fr;
  }
  
  .rating-summary {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }
}

/* Add styles for the doughnut chart legend */
.chart-card .chart-js-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.chart-card .legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-card .legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-card .legend-label {
  font-size: 0.9rem;
  color: #666;
}
</style> 