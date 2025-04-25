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

    <!-- Add Engagement Stats Section -->
    <div class="analytics-header">
      <h2>Engagement Analytics</h2>
      <div class="analytics-date-filter">
        <label for="date-range">Date Range:</label>
        <select id="date-range" v-model="analyticsDateRange" @change="fetchAnalytics">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>
    </div>

    <div class="stats-grid">
      <!-- Profile Views Card -->
      <div class="stat-card profile-views">
        <div class="stat-icon">
          <span class="material-icons">visibility</span>
        </div>
        <div class="stat-content">
          <h3>Profile Views</h3>
          <div class="stat-value">{{ analytics?.summary?.profileViews || 0 }}</div>
          <div class="stat-trend" :class="profileViewsTrend > 0 ? 'positive' : (profileViewsTrend < 0 ? 'negative' : '')">
            <span class="material-icons" v-if="profileViewsTrend !== 0">
              {{ profileViewsTrend > 0 ? 'trending_up' : 'trending_down' }}
            </span>
            <span v-if="profileViewsTrend !== 0">
              {{ Math.abs(profileViewsTrend) }}% from last period
            </span>
            <span v-else>No change</span>
          </div>
        </div>
      </div>

      <!-- Post Views Card -->
      <div class="stat-card post-views">
        <div class="stat-icon">
          <span class="material-icons">article</span>
        </div>
        <div class="stat-content">
          <h3>Post Views</h3>
          <div class="stat-value">{{ analytics?.summary?.postViews || 0 }}</div>
          <div class="stat-trend" :class="postViewsTrend > 0 ? 'positive' : (postViewsTrend < 0 ? 'negative' : '')">
            <span class="material-icons" v-if="postViewsTrend !== 0">
              {{ postViewsTrend > 0 ? 'trending_up' : 'trending_down' }}
            </span>
            <span v-if="postViewsTrend !== 0">
              {{ Math.abs(postViewsTrend) }}% from last period
            </span>
            <span v-else>No change</span>
          </div>
        </div>
      </div>

      <!-- Audio Plays Card -->
      <div class="stat-card audio-plays">
        <div class="stat-icon">
          <span class="material-icons">audiotrack</span>
        </div>
        <div class="stat-content">
          <h3>Audio Plays</h3>
          <div class="stat-value">{{ analytics?.summary?.audioPlays || 0 }}</div>
          <div class="stat-trend" :class="audioPlaysTrend > 0 ? 'positive' : (audioPlaysTrend < 0 ? 'negative' : '')">
            <span class="material-icons" v-if="audioPlaysTrend !== 0">
              {{ audioPlaysTrend > 0 ? 'trending_up' : 'trending_down' }}
            </span>
            <span v-if="audioPlaysTrend !== 0">
              {{ Math.abs(audioPlaysTrend) }}% from last period
            </span>
            <span v-else>No change</span>
          </div>
        </div>
      </div>

      <!-- Engagement Rate Card -->
      <div class="stat-card engagement">
        <div class="stat-icon">
          <span class="material-icons">thumb_up</span>
        </div>
        <div class="stat-content">
          <h3>Click-Through Rate</h3>
          <div class="stat-value">{{ (analytics?.summary?.clickThroughRate * 100 || 0).toFixed(1) }}%</div>
          <div class="progress-bar">
            <div class="progress" 
                 :style="{ width: `${(analytics?.summary?.clickThroughRate * 100) || 0}%`, 
                          maxWidth: '100%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Engagement Analytics Chart -->
    <div class="chart-section">
      <div class="chart-card">
        <h3>Engagement Trends</h3>
        <div class="chart-container">
          <canvas ref="engagementChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Add after the engagement analytics chart -->
    <div class="chart-section">
      <div class="chart-card device-chart">
        <h3>Device Breakdown</h3>
        <div class="chart-container">
          <canvas ref="deviceChartRef"></canvas>
        </div>
        <div class="device-legend" v-if="analytics?.charts?.deviceBreakdown">
          <div v-for="device in analytics.charts.deviceBreakdown" :key="device.device" class="device-item">
            <div class="device-icon" :class="device.device">
              <i class="material-icons">
                {{ getDeviceIcon(device.device) }}
              </i>
            </div>
            <div class="device-info">
              <div class="device-name">{{ formatDeviceName(device.device) }}</div>
              <div class="device-percentage">{{ device.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-card location-chart">
        <h3>Geographic Distribution</h3>
        <div class="chart-container">
          <canvas ref="locationChartRef"></canvas>
        </div>
        <div class="location-list" v-if="analytics?.charts?.locationBreakdown">
          <div v-for="location in analytics.charts.locationBreakdown" :key="location.country" class="location-item">
            <div class="country-flag">{{ getCountryFlag(location.country) }}</div>
            <div class="country-name">{{ location.country }}</div>
            <div class="country-percentage">{{ location.percentage }}%</div>
            <div class="country-bar">
              <div class="country-bar-fill" :style="{ width: location.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-card referrer-chart">
        <h3>Traffic Sources</h3>
        <div class="chart-container">
          <canvas ref="referrerChartRef"></canvas>
        </div>
        <div class="referrer-list" v-if="analytics?.charts?.referrerBreakdown">
          <div v-for="referrer in analytics.charts.referrerBreakdown" :key="referrer.domain" class="referrer-item">
            <div class="referrer-icon">
              <i class="material-icons">{{ getReferrerIcon(referrer.domain) }}</i>
            </div>
            <div class="referrer-info">
              <div class="referrer-domain">{{ referrer.domain }}</div>
              <div class="referrer-count">{{ referrer.count }} visits</div>
            </div>
            <div class="referrer-percentage">{{ referrer.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Original Revenue Stats -->
    <h2>Revenue & Orders</h2>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { 
  fetchUserPayments, 
  getCreatorProfile, 
  fetchCreatorRatings, 
  getCreatorAnalytics 
} from '../authService';
import { formatPeso } from '../utils/currencyFormatter';
import Chart from 'chart.js/auto';

export default {
  name: 'CreatorDashboard',
  setup() {
    const payments = ref([]);
    const profile = ref(null);
    const revenueChartRef = ref(null);
    const ordersChartRef = ref(null);
    const engagementChartRef = ref(null);
    const deviceChartRef = ref(null);
    const locationChartRef = ref(null);
    const referrerChartRef = ref(null);
    const selectedPeriod = ref('This Month');
    const timePeriods = ['This Week', 'This Month', 'This Year', 'All Time'];
    const ratings = ref(null);
    const analytics = ref(null);
    const analyticsDateRange = ref('30');
    const previousAnalytics = ref(null);
    const hasError = ref(false);
    const errorMessage = ref('');

    let revenueChartInstance = null;
    let ordersChartInstance = null;
    let engagementChartInstance = null;
    let deviceChartInstance = null;
    let locationChartInstance = null;
    let referrerChartInstance = null;

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

      // Initialize Engagement Chart
      if (analytics.value && analytics.value.dailyData) {
        initializeEngagementChart();
      }

      // Initialize Device, Location, and Referrer Charts
      if (analytics.value && analytics.value.charts) {
        initializeDeviceChart();
        initializeLocationChart();
        initializeReferrerChart();
      }
    };

    const initializeEngagementChart = () => {
      if (engagementChartInstance) {
        engagementChartInstance.destroy();
      }

      // Only proceed if we have daily data
      if (!analytics.value || !analytics.value.dailyData) {
        return;
      }

      // Transform data for chart
      const dates = Object.keys(analytics.value.dailyData).sort();
      const profileViewsData = [];
      const postViewsData = [];
      const audioPlaysData = [];

      dates.forEach(date => {
        const dayData = analytics.value.dailyData[date];
        profileViewsData.push(dayData?.profile_views || 0);
        postViewsData.push(dayData?.post_views || 0);
        audioPlaysData.push(dayData?.audio_plays || 0);
      });

      // Format dates for display
      const formattedDates = dates.map(date => {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year.substring(2)}`;
      });

      engagementChartInstance = new Chart(engagementChartRef.value, {
        type: 'line',
        data: {
          labels: formattedDates,
          datasets: [
            {
              label: 'Profile Views',
              data: profileViewsData,
              borderColor: '#4e73df',
              backgroundColor: 'rgba(78, 115, 223, 0.05)',
              fill: false,
              tension: 0.1,
              borderWidth: 3
            },
            {
              label: 'Post Views',
              data: postViewsData,
              borderColor: '#f6c23e',
              backgroundColor: 'rgba(246, 194, 62, 0.05)',
              fill: false,
              tension: 0.1,
              borderWidth: 3
            },
            {
              label: 'Audio Plays',
              data: audioPlaysData,
              borderColor: '#36b9cc',
              backgroundColor: 'rgba(54, 185, 204, 0.05)',
              fill: false,
              tension: 0.1,
              borderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          }
        }
      });
    };

    const initializeDeviceChart = () => {
      if (deviceChartInstance) {
        deviceChartInstance.destroy();
      }

      if (!analytics.value?.charts?.deviceBreakdown) {
        console.warn('No device breakdown data available for chart');
        return;
      }

      if (!deviceChartRef.value) {
        console.warn('Device chart reference not found in DOM');
        // Wait until next tick to check again - might be a timing issue
        setTimeout(initializeDeviceChart, 100);
        return;
      }

      try {
        const deviceData = analytics.value.charts.deviceBreakdown;
        if (!deviceData.length) {
          console.warn('Device breakdown data is empty');
          return;
        }

        const labels = deviceData.map(item => formatDeviceName(item.device));
        const data = deviceData.map(item => parseFloat(item.percentage));
        const backgroundColors = deviceData.map(item => getDeviceColor(item.device));

        deviceChartInstance = new Chart(deviceChartRef.value, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0,
              borderRadius: 4,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        });
        console.log('Device chart initialized successfully');
      } catch (error) {
        console.error('Error initializing device chart:', error);
      }
    };

    const initializeLocationChart = () => {
      if (locationChartInstance) {
        locationChartInstance.destroy();
      }

      if (!analytics.value?.charts?.locationBreakdown) {
        console.warn('No location breakdown data available for chart');
        return;
      }

      if (!locationChartRef.value) {
        console.warn('Location chart reference not found in DOM');
        // Wait until next tick to check again - might be a timing issue
        setTimeout(initializeLocationChart, 100);
        return;
      }

      try {
        const locationData = analytics.value.charts.locationBreakdown;
        if (!locationData.length) {
          console.warn('Location breakdown data is empty');
          return;
        }

        const labels = locationData.map(item => item.country);
        const data = locationData.map(item => parseFloat(item.percentage));
        
        // Generate gradient colors from blue to purple
        const backgroundColors = locationData.map((_, index) => {
          const hue = 240 - (index * (80 / locationData.length));
          return `hsl(${hue}, 70%, 60%)`;
        });

        locationChartInstance = new Chart(locationChartRef.value, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Visitors by Country',
              data: data,
              backgroundColor: backgroundColors,
              borderRadius: 4,
              maxBarThickness: 35
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.raw}% of visitors`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
        console.log('Location chart initialized successfully');
      } catch (error) {
        console.error('Error initializing location chart:', error);
      }
    };

    const initializeReferrerChart = () => {
      if (referrerChartInstance) {
        referrerChartInstance.destroy();
      }

      if (!analytics.value?.charts?.referrerBreakdown) {
        console.warn('No referrer breakdown data available for chart');
        return;
      }

      if (!referrerChartRef.value) {
        console.warn('Referrer chart reference not found in DOM');
        // Wait until next tick to check again - might be a timing issue
        setTimeout(initializeReferrerChart, 100);
        return;
      }

      try {
        const referrerData = analytics.value.charts.referrerBreakdown;
        if (!referrerData.length) {
          console.warn('Referrer breakdown data is empty');
          return;
        }

        const labels = referrerData.map(item => item.domain);
        const data = referrerData.map(item => parseFloat(item.percentage));
        
        // Generate colors
        const backgroundColors = referrerData.map((_, index) => {
          const hue = 120 + (index * (200 / referrerData.length));
          return `hsl(${hue}, 65%, 55%)`;
        });

        referrerChartInstance = new Chart(referrerChartRef.value, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        });
        console.log('Referrer chart initialized successfully');
      } catch (error) {
        console.error('Error initializing referrer chart:', error);
      }
    };

    const getDeviceIcon = (deviceType) => {
      const icons = {
        'desktop': 'desktop_windows',
        'mobile': 'smartphone',
        'tablet': 'tablet_android',
        'other': 'devices_other'
      };
      return icons[deviceType] || 'devices_other';
    };

    const getDeviceColor = (deviceType) => {
      const colors = {
        'desktop': '#4e73df', // blue
        'mobile': '#1cc88a', // green
        'tablet': '#f6c23e', // yellow
        'other': '#858796'   // gray
      };
      return colors[deviceType] || '#858796';
    };

    const formatDeviceName = (deviceType) => {
      if (!deviceType) return 'Unknown';
      
      // Capitalize first letter
      return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    };

    const getCountryFlag = (countryCode) => {
      // Simple function to return emoji flag based on country code
      // For a full implementation, you'd use a proper country code to flag converter
      // This is a simplified version using regional indicator symbols
      if (!countryCode || countryCode === 'Unknown') return '🌐';
      
      // For proper country codes like "US" convert to emoji flag
      if (countryCode.length === 2) {
        const offset = 127397;
        const firstChar = countryCode.charCodeAt(0);
        const secondChar = countryCode.charCodeAt(1);
        return String.fromCodePoint(firstChar + offset) + String.fromCodePoint(secondChar + offset);
      }
      
      return '🏳️';
    };

    const getReferrerIcon = (domain) => {
      // Return appropriate icon based on domain
      if (!domain) return 'public';
      
      const domainLower = domain.toLowerCase();
      if (domainLower.includes('google')) return 'search';
      if (domainLower.includes('facebook') || domainLower.includes('fb')) return 'facebook';
      if (domainLower.includes('instagram')) return 'photo_camera';
      if (domainLower.includes('twitter') || domainLower.includes('x.com')) return 'chat';
      if (domainLower.includes('youtube')) return 'smart_display';
      if (domainLower.includes('linkedin')) return 'work';
      if (domainLower.includes('mail') || domainLower.includes('gmail')) return 'email';
      
      // Default icon
      return 'public';
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

    const fetchAnalytics = async () => {
      try {
        hasError.value = false;
        
        // Save current analytics as previous for trend calculation
        previousAnalytics.value = analytics.value;
        
        // Get the date range based on selection
        const days = parseInt(analyticsDateRange.value);
        
        // Calculate start date as days ago from now
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        // Get current date
        const endDate = new Date().toISOString().split('T')[0];
        
        // Fetch analytics from the API
        const result = await getCreatorAnalytics(null, formattedStartDate, endDate);
        console.log('Analytics API response:', result);
        
        // Debugging - log the structure of charts data
        if (result && result.charts) {
          console.log('Charts data found:', {
            deviceBreakdown: result.charts.deviceBreakdown,
            locationBreakdown: result.charts.locationBreakdown,
            referrerBreakdown: result.charts.referrerBreakdown
          });
        } else {
          console.warn('Analytics result is missing expected charts data:', result);
          
          // Create some dummy data for development/testing if needed
          if (result && !result.charts) {
            result.charts = {
              deviceBreakdown: [
                { device: 'desktop', count: 45, percentage: '60.0' },
                { device: 'mobile', count: 25, percentage: '30.0' },
                { device: 'tablet', count: 5, percentage: '10.0' }
              ],
              locationBreakdown: [
                { country: 'US', count: 30, percentage: '40.0' },
                { country: 'PH', count: 20, percentage: '30.0' },
                { country: 'UK', count: 15, percentage: '20.0' },
                { country: 'CA', count: 10, percentage: '10.0' }
              ],
              referrerBreakdown: [
                { domain: 'google.com', count: 25, percentage: '50.0' },
                { domain: 'facebook.com', count: 15, percentage: '30.0' },
                { domain: 'instagram.com', count: 10, percentage: '20.0' }
              ]
            };
            console.log('Added dummy charts data for development');
          }
        }
        
        analytics.value = result;
        
        // Initialize all charts with new data
        initializeEngagementChart();
        
        // Initialize device, location, and referrer charts if data is available
        if (analytics.value?.charts) {
          initializeDeviceChart();
          initializeLocationChart();
          initializeReferrerChart();
        } else {
          console.warn('Analytics data does not contain charts data');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        hasError.value = true;
        errorMessage.value = 'Failed to load analytics data. Please try again later.';
      }
    };

    const fetchData = async () => {
      try {
        hasError.value = false;
        
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

        // Initialize charts and fetch analytics
        initializeCharts();
        await fetchAnalytics();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        hasError.value = true;
        errorMessage.value = 'Failed to load dashboard data. Please try again later.';
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

    // Compute analytics trends (comparing current data to previous period)
    const profileViewsTrend = computed(() => {
      if (!analytics.value || !previousAnalytics.value) return 0;
      const current = analytics.value.summary.profileViews || 0;
      const previous = previousAnalytics.value.summary.profileViews || 1; // Avoid division by zero
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    });

    const postViewsTrend = computed(() => {
      if (!analytics.value || !previousAnalytics.value) return 0;
      const current = analytics.value.summary.postViews || 0;
      const previous = previousAnalytics.value.summary.postViews || 1;
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    });

    const audioPlaysTrend = computed(() => {
      if (!analytics.value || !previousAnalytics.value) return 0;
      const current = analytics.value.summary.audioPlays || 0;
      const previous = previousAnalytics.value.summary.audioPlays || 1;
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
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

    // Watch for date range changes in analytics
    watch(analyticsDateRange, () => {
      fetchAnalytics();
    });

    onMounted(async () => {
      try {
        await fetchData();
        // Use nextTick to ensure DOM is updated before initializing charts
        nextTick(() => {
          // Additional check to make sure chart containers exist
          console.log('Chart references after nextTick:', {
            engagementChartRef: !!engagementChartRef.value,
            deviceChartRef: !!deviceChartRef.value,
            locationChartRef: !!locationChartRef.value,
            referrerChartRef: !!referrerChartRef.value
          });
          
          // Force re-initialization of all charts
          if (analytics.value) {
            setTimeout(() => {
              console.log('Initializing all charts after delay');
              initializeEngagementChart();
              if (analytics.value?.charts) {
                initializeDeviceChart();
                initializeLocationChart();
                initializeReferrerChart();
              }
            }, 500); // Give DOM time to fully render
          }
        });
      } catch (error) {
        console.error('Error in onMounted:', error);
        hasError.value = true;
        errorMessage.value = 'Failed to initialize dashboard. Please try refreshing the page.';
      }
    });

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
      engagementChartRef,
      ratings,
      totalRatings,
      recentRatings,
      analytics,
      analyticsDateRange,
      profileViewsTrend,
      postViewsTrend,
      audioPlaysTrend,
      hasError,
      errorMessage,
      deviceChartRef,
      locationChartRef,
      referrerChartRef,
      getDeviceIcon,
      formatDeviceName,
      getCountryFlag,
      getReferrerIcon
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

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 1rem;
}

.analytics-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}

.analytics-date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analytics-date-filter label {
  color: #6c757d;
}

.analytics-date-filter select {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
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
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
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

  .analytics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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

/* Stat card colors for analytics */
.stat-card.profile-views .stat-icon {
  background-color: #e8eaf6;
}

.stat-card.profile-views .stat-icon .material-icons {
  color: #3f51b5;
}

.stat-card.post-views .stat-icon {
  background-color: #fff8e1;
}

.stat-card.post-views .stat-icon .material-icons {
  color: #ff9800;
}

.stat-card.audio-plays .stat-icon {
  background-color: #e0f7fa;
}

.stat-card.audio-plays .stat-icon .material-icons {
  color: #00bcd4;
}

.stat-card.engagement .stat-icon {
  background-color: #e8f5e9;
}

.stat-card.engagement .stat-icon .material-icons {
  color: #4caf50;
}

/* Add these new styles for device and location charts */
.device-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 1rem;
  margin-top: 1.5rem;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
  min-width: 120px;
}

.device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: white;
}

.device-icon.desktop {
  background-color: #4e73df;
}

.device-icon.mobile {
  background-color: #1cc88a;
}

.device-icon.tablet {
  background-color: #f6c23e;
}

.device-icon.other {
  background-color: #858796;
}

.device-info {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: 500;
  color: #2c3e50;
}

.device-percentage {
  color: #6c757d;
  font-size: 0.9rem;
}

.location-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.country-flag {
  width: 30px;
  font-size: 1.2rem;
}

.country-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.country-percentage {
  width: 50px;
  text-align: right;
  color: #6c757d;
  font-weight: 500;
}

.country-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  margin: 0 1rem;
  overflow: hidden;
}

.country-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4e73df, #6e8eff);
  border-radius: 3px;
}

.referrer-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.referrer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.referrer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(45deg, #2cc46b, #21a179);
  color: white;
}

.referrer-info {
  flex: 1;
}

.referrer-domain {
  font-weight: 500;
  color: #2c3e50;
}

.referrer-count {
  font-size: 0.85rem;
  color: #6c757d;
}

.referrer-percentage {
  font-weight: 600;
  color: #4e73df;
}

/* Add to existing chart cards for better consistency */
.chart-card.device-chart,
.chart-card.location-chart,
.chart-card.referrer-chart {
  display: flex;
  flex-direction: column;
}
</style> 