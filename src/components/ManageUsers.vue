<template>
  <div class="manage-users">
    <h2>Manage Users</h2>
    
    <div class="filters">
      <input 
        v-model="searchTerm" 
        placeholder="Search users..." 
        class="search-input"
      />
      <select v-model="roleFilter" class="role-filter">
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="creator">Creator</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Posts</th>
            <th>Payments</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ `${user.firstName || ''} ${user.lastName || ''}` }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.role]">
                {{ user.role }}
              </span>
            </td>
            <td>{{ user._count.posts }}</td>
            <td>{{ user._count.payments + user._count.clientPayments }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions">
              <button 
                @click="viewUserDetails(user)" 
                class="action-btn view"
                title="View Details"
              >
                <i class="material-icons">visibility</i>
              </button>
              <button 
                v-if="user.role !== 'admin'"
                @click="confirmDeleteUser(user)" 
                class="action-btn delete"
                title="Delete User"
              >
                <i class="material-icons">delete</i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal">
      <div class="modal-content">
        <span class="close" @click="selectedUser = null">&times;</span>
        <h3>User Details</h3>
        <div class="user-details">
          <p><strong>Name:</strong> {{ `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}` }}</p>
          <p><strong>Email:</strong> {{ selectedUser.email }}</p>
          <p><strong>Phone:</strong> {{ selectedUser.phoneNumber || 'Not provided' }}</p>
          <p><strong>Address:</strong> {{ selectedUser.address || 'Not provided' }}</p>
          <p><strong>Role:</strong> {{ selectedUser.role }}</p>
          <p><strong>Joined:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
          
          <!-- Show creator profile if exists -->
          <div v-if="selectedUser.creatorProfile" class="creator-details">
            <h4>Creator Profile</h4>
            <p><strong>Profession:</strong> {{ selectedUser.creatorProfile.profession || 'Not specified' }}</p>
            <p><strong>Genre:</strong> {{ selectedUser.creatorProfile.genre || 'Not specified' }}</p>
            <p><strong>Bio:</strong> {{ selectedUser.creatorProfile.bio || 'No bio provided' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchAllUsers } from '../authService';
import Swal from 'sweetalert2';

export default {
  name: 'ManageUsers',
  data() {
    return {
      users: [],
      searchTerm: '',
      roleFilter: '',
      selectedUser: null,
      loading: false,
      error: null
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = 
          (user.firstName?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
          (user.lastName?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesRole = !this.roleFilter || user.role === this.roleFilter;
        
        return matchesSearch && matchesRole;
      });
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await fetchAllUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
        this.error = error.message;
        await Swal.fire({
          title: 'Error',
          text: 'Failed to fetch users',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    viewUserDetails(user) {
      this.selectedUser = user;
    },
    async confirmDeleteUser(user) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete user ${user.email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        // TODO: Implement user deletion
        await Swal.fire(
          'Deleted!',
          'The user has been deleted.',
          'success'
        );
      }
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.manage-users {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input, .role-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.users-table th, .users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  text-transform: capitalize;
}

.role-badge.admin {
  background-color: #dc3545;
  color: white;
}

.role-badge.creator {
  background-color: #28a745;
  color: white;
}

.role-badge.user {
  background-color: #007bff;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.action-btn.view {
  color: #007bff;
}

.action-btn.delete {
  color: #dc3545;
}

.action-btn:hover {
  background-color: #f8f9fa;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
}

.user-details p {
  margin: 8px 0;
}

.creator-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .search-input {
    max-width: 100%;
  }
}
</style> 