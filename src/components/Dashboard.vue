<template>
  <div class="dashboard-container">
   

    <!-- Navigation Filters -->
    <div class="navigation-filters">
      <div class="main-categories">
        <button 
          class="category-btn all-btn"
          :class="{ active: !selectedCategory }"
          @click="resetFilters"
        >
          <i class="material-icons">apps</i>
          All Categories
        </button>

        <button 
          v-for="category in mainCategories" 
          :key="category.id"
          :class="['category-btn', { active: selectedCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <i class="material-icons">{{ category.icon }}</i>
          {{ category.name }}
        </button>

        <!-- Dropdown for Other Categories -->
        <div class="dropdown-container">
          <button 
            class="category-btn dropdown-toggle"
            @click="toggleOthersDropdown"
          >
            <i class="material-icons">more_horiz</i>
            Others
            <i class="material-icons">{{ isDropdownOpen ? 'expand_less' : 'expand_more' }}</i>
          </button>
          
          <div class="dropdown-menu" v-if="isDropdownOpen">
            <button 
              v-for="category in otherCategories" 
              :key="category.id"
              :class="['dropdown-item', { active: selectedCategory === category.id }]"
              @click="selectCategory(category.id)"
            >
              <i class="material-icons">{{ category.icon }}</i>
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Sort -->
      <div class="search-sort-section">
        <div class="search-box">
          <i class="material-icons">search</i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search posts..."
            @input="filterPosts"
          />
        </div>
        <select v-model="sortBy" @change="filterPosts" class="sort-select">
          <option value="recent">Most Recent</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>

    <!-- Add this after the main categories -->
    <div v-if="selectedCategory && getCurrentCategory" class="subcategories-section">
      <div class="subcategories-list">
        <!-- Add All button for subcategories -->
        <button 
          class="subcategory-btn all-subcategory-btn"
          :class="{ active: !selectedSubcategory }"
          @click="selectSubcategory(null)"
        >
          All {{ getCurrentCategory.name }}
        </button>

        <button 
          v-for="subcategory in getCurrentCategory.subcategories" 
          :key="subcategory"
          :class="['subcategory-btn', { active: selectedSubcategory === subcategory }]"
          @click="selectSubcategory(subcategory)"
        >
          {{ subcategory }}
        </button>
      </div>
    </div>

    <!-- Add this after subcategories section -->
    <div class="genre-filters" v-if="selectedCategory">
      <h3>Genre</h3>
      <div class="genre-tags">
        <!-- Add All button for genres -->
        <button 
          class="genre-tag all-genre-btn"
          :class="{ active: !selectedGenre }"
          @click="selectedGenre = null"
        >
          All Genres
        </button>

        <button 
          v-for="genre in genreFilters" 
          :key="genre"
          :class="['genre-tag', { active: selectedGenre === genre }]"
          @click="selectedGenre = genre === selectedGenre ? null : genre"
        >
          {{ genre }}
        </button>
      </div>
    </div>

    <!-- Featured Posts Section -->
    <div class="featured-section" v-if="featuredPosts.length">
      <h2>Featured Posts</h2>
      <div class="featured-posts">
        <div 
          v-for="post in featuredPosts" 
          :key="post.id"
          class="featured-post-card"
          @click="navigateToPost(post.id)"
        >
          <div class="featured-image">
            <img :src="post.image" :alt="post.title" />
            <div class="featured-badge">
              <i class="material-icons">star</i>
              Featured
            </div>
          </div>
          <div class="featured-content">
            <h3>{{ post.title }}</h3>
            <p>{{ post.description }}</p>
            <div class="creator-info">
              <img :src="post.user.avatar" :alt="post.user.firstName" class="creator-avatar" />
              <div class="creator-details">
                <h4>{{ post.user.firstName }} {{ post.user.lastName }}</h4>
                <div class="profession-details">
                  <span class="profession" v-if="post.user.creatorProfile?.typeOfProfession">
                    {{ post.user.creatorProfile?.typeOfProfession }}
                  </span>
                  <span class="specialization" v-if="post.user.creatorProfile?.profession">
                    • {{ post.user.creatorProfile?.profession }}
                  </span>
                  <span class="genre" v-if="post.user.creatorProfile?.genre">
                    • {{ post.user.creatorProfile?.genre }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Posts Grid -->
    <div class="posts-section">
      <h2>All Posts</h2>
      <div class="posts-grid">
        <div 
          v-for="post in filteredPosts" 
      :key="post.id"
      class="post-card"
          @click="navigateToPost(post.id)"
        >
          <div class="post-media">
            <img :src="post.image" :alt="post.title" class="post-image" />
            <div class="post-price" v-if="post.amount">
              ₱{{ formatAmount(post.amount) }}
            </div>
      </div>
      
      <div class="post-content">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-description">{{ post.description }}</p>
        
            <div class="post-footer">
              <div class="creator-info">
                <div class="creator-avatar">
                  {{ getInitials(post.user.firstName, post.user.lastName) }}
                </div>
                <div class="creator-details">
          <h4>{{ post.user.firstName }} {{ post.user.lastName }}</h4>
                  <div class="profession-details">
                    <span class="profession" v-if="post.user.creatorProfile?.typeOfProfession">
                      {{ post.user.creatorProfile?.typeOfProfession }}
                    </span>
                    <span class="specialization" v-if="post.user.creatorProfile?.profession">
                      • {{ post.user.creatorProfile?.profession }}
                    </span>
                    <span class="genre" v-if="post.user.creatorProfile?.genre">
                      • {{ post.user.creatorProfile?.genre }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  </div>
</template>

<script>
import { fetchAllPosts } from '../authService.js';

export default {
  data() {
    return {
      posts: [],
      featuredPosts: [],
      searchQuery: '',
      sortBy: 'recent',
      stats: {
        creators: 0,
        posts: 0,
        services: 0
      },
      error: null,
      isDropdownOpen: false,
      selectedCategory: null,
      mainCategories: [
        { 
          id: 'guitarist',
          name: 'Guitarists', 
          icon: 'music_note',
          subcategories: [
            'Lead Guitarist',
            'Rhythm Guitarist',
            'Classical Guitarist',
            'Acoustic Guitarist',
            'Electric Guitarist',
            'Bass Guitarist'
          ]
        },
        { 
          id: 'vocalist',
          name: 'Vocalists', 
          icon: 'mic',
          subcategories: [
            'Lead Vocalist',
            'Backup Vocalist',
            'Opera Singer',
            'Jazz Vocalist',
            'Rock Vocalist',
            'Session Singer'
          ]
        },
        { 
          id: 'drummer',
          name: 'Drummers', 
        
          subcategories: [
            'Rock Drummer',
            'Jazz Drummer',
            'Session Drummer',
            'Percussionist',
            'Electronic Drummer',
            'Orchestra Drummer'
          ]
        },
        { 
          id: 'keyboardist',
          name: 'Keyboardists', 
          icon: 'piano',
          subcategories: [
            'Pianist',
            'Synthesizer Player',
            'Organ Player',
            'Jazz Pianist',
            'Classical Pianist',
            'Music Director'
          ]
        }
      ],
      otherCategories: [
        { 
          id: 'producer',
          name: 'Producers', 
          icon: 'album',
          subcategories: [
            'Music Producer',
            'Beat Producer',
            'Recording Producer',
            'Mix Engineer',
            'Mastering Engineer',
            'Executive Producer'
          ]
        },
        { 
          id: 'engineer',
          name: 'Engineers', 
          icon: 'engineering',
          subcategories: [
            'Recording Engineer',
            'Live Sound Engineer',
            'Studio Engineer',
            'Acoustic Engineer',
            'Mixing Engineer',
            'Mastering Engineer'
          ]
        },
        { 
          id: 'composer',
          name: 'Composers', 
          icon: 'edit_note',
          subcategories: [
            'Film Composer',
            'Game Music Composer',
            'Orchestral Composer',
            'Song Writer',
            'Arranger',
            'Jingle Writer'
          ]
        },
        { 
          id: 'teacher',
          name: 'Teachers', 
          icon: 'school',
          subcategories: [
            'Guitar Teacher',
            'Piano Teacher',
            'Vocal Coach',
            'Drum Teacher',
            'Music Theory Teacher',
            'Bass Teacher'
          ]
        },
        { 
          id: 'technician',
          name: 'Technicians', 
          icon: 'build',
          subcategories: [
            'Guitar Tech',
            'Piano Tuner',
            'Sound Technician',
            'Equipment Maintenance',
            'Luthier',
            'Instrument Repair'
          ]
        }
      ],
      genreFilters: [
        'Rock',
        'Jazz',
        'Classical',
        'Pop',
        'Hip Hop',
        'R&B',
        'Electronic',
        'Metal',
        'Blues',
        'Country',
        'Folk',
        'Indie',
        'Alternative',
        'Reggae',
        'Soul',
        'Funk',
        'Gospel',
        'World Music',
        'Latin',
        'Orchestral'
      ],
      selectedGenre: null,
      selectedSubcategory: null,
      instrumentFilters: [
        'Guitar',
        'Piano',
        'Drums',
        'Bass',
        'Violin',
        'Saxophone',
        'Trumpet',
        'Flute',
        'Cello',
        'Clarinet',
        'Trombone',
        'Harp',
        'Accordion',
        'Synthesizer',
        'Ukulele'
      ]
    };
  },
  computed: {
    getCurrentCategory() {
      return [...this.mainCategories, ...this.otherCategories]
        .find(cat => cat.id === this.selectedCategory);
    },
    filteredPosts() {
      let filtered = [...this.posts];
      
      // Filter by main category (type of profession)
      if (this.selectedCategory) {
        filtered = filtered.filter(post => {
          const typeOfProfession = post.user?.creatorProfile?.typeOfProfession?.toLowerCase() || '';
          const profession = post.user?.creatorProfile?.profession?.toLowerCase() || '';
          const offers = post.user?.creatorProfile?.offers?.toLowerCase() || '';
          
          return typeOfProfession.includes(this.selectedCategory.toLowerCase()) ||
                 profession.includes(this.selectedCategory.toLowerCase()) ||
                 offers.includes(this.selectedCategory.toLowerCase());
        });
      }

      // Filter by subcategory (specific profession)
      if (this.selectedSubcategory) {
        filtered = filtered.filter(post => {
          const profession = post.user?.creatorProfile?.profession?.toLowerCase() || '';
          const offers = post.user?.creatorProfile?.offers?.toLowerCase() || '';
          const specialization = post.user?.creatorProfile?.specialization?.toLowerCase() || '';
          
          return profession.includes(this.selectedSubcategory.toLowerCase()) ||
                 offers.includes(this.selectedSubcategory.toLowerCase()) ||
                 specialization.includes(this.selectedSubcategory.toLowerCase());
        });
      }

      // Filter by genre
      if (this.selectedGenre) {
        filtered = filtered.filter(post => {
          const genre = post.user?.creatorProfile?.genre?.toLowerCase() || '';
          const description = post.description?.toLowerCase() || '';
          const offers = post.user?.creatorProfile?.offers?.toLowerCase() || '';
          
          return genre.includes(this.selectedGenre.toLowerCase()) ||
                 description.includes(this.selectedGenre.toLowerCase()) ||
                 offers.includes(this.selectedGenre.toLowerCase());
        });
      }

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(post => {
          // Safely access nested properties
          const creatorProfile = post.user?.creatorProfile || {};
          const searchableFields = [
            post.title?.toLowerCase() || '',
            post.description?.toLowerCase() || '',
            post.user?.firstName?.toLowerCase() || '',
            post.user?.lastName?.toLowerCase() || '',
            creatorProfile.profession?.toLowerCase() || '',
            creatorProfile.typeOfProfession?.toLowerCase() || '',
            creatorProfile.genre?.toLowerCase() || '',
            creatorProfile.offers?.toLowerCase() || '',
            creatorProfile.specialization?.toLowerCase() || ''
          ];

          return searchableFields.some(field => field.includes(query));
        });
      }

      // Apply sorting
      switch (this.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
          break;
        case 'recent':
        default:
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return filtered;
    }
  },
  async created() {
    try {
      const allPosts = await fetchAllPosts();
      this.posts = allPosts;
      
      // Set featured posts (e.g., first 3 posts)
      this.featuredPosts = allPosts.slice(0, 3);
      
      // Calculate stats
      this.stats = {
        creators: new Set(allPosts.map(post => post.user.id)).size,
        posts: allPosts.length,
        services: new Set(allPosts.map(post => post.user.creatorProfile?.profession)).size
      };
    } catch (error) {
      this.error = 'Failed to load posts';
      console.error("Error fetching posts:", error);
    }
  },
  methods: {
    navigateToPost(postId) {
      this.$router.push(`/post/${postId}`);
    },
    getInitials(firstName, lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    toggleOthersDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.isDropdownOpen = false;
      this.filterPosts();
    },
    filterPosts() {
      // The filtering is handled by the computed property
    },
    selectSubcategory(subcategory) {
      this.selectedSubcategory = subcategory;
      this.filterPosts();
    },
    resetFilters() {
      this.selectedCategory = null;
      this.selectedSubcategory = null;
      this.selectedGenre = null;
      this.isDropdownOpen = false;
      this.filterPosts();
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #ffffff;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 2.5rem;
  color: #2196f3;
  padding: 1rem;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12px;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-info p {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.navigation-filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
}

.main-categories {
  position: relative;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-right: 1rem;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 25px;
  background: #f5f5f5;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #e0e0e0;
}

.category-btn.active {
  background: #2196f3;
  color: white;
}

.dropdown-container {
  position: relative;
}

.dropdown-toggle {
  background: #f5f5f5;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 200px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  width: 100%;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #e3f2fd;
  color: #2196f3;
}

.search-sort-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  padding: 0.25rem 0;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: white;
  color: #666;
  cursor: pointer;
}

.featured-section {
  margin-bottom: 3rem;
}

.featured-posts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.featured-post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.featured-post-card:hover {
  transform: translateY(-5px);
}

.featured-image {
  position: relative;
  height: 200px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(33, 150, 243, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.post-media {
  position: relative;
  height: 250px;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-price {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.post-content {
  padding: 2rem;
}

.post-title {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  color: #333;
  font-weight: 600;
}

.post-description {
  margin: 0 0 1.5rem;
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2196f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.creator-details h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.profession-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.profession {
  color: #2196f3;
}

.specialization {
  color: #2196f3;
}

.genre {
  color: #ff9800;  /* Different color to distinguish genre */
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
    margin: 0.5rem;
  }

  .navigation-filters {
    padding: 1rem;
  }

  .search-sort-section {
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .post-media {
    height: 200px;
  }

  .post-content {
    padding: 1.5rem;
  }
}

.subcategories-section,
.genre-filters {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.subcategories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subcategory-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.subcategory-btn:hover {
  background: #e3f2fd;
  color: #2196f3;
  border-color: #2196f3;
}

.subcategory-btn.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.all-btn {
  background: #4caf50;
  color: white;
}

.all-btn:hover {
  background: #43a047;
}

.all-btn.active {
  background: #2e7d32;
  color: white;
}

.all-btn::after {
  content: '';
  position: absolute;
  right: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 1px;
  background: #ddd;
}

.genre-filters h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.genre-tag:hover {
  background: #e3f2fd;
  color: #2196f3;
  border-color: #2196f3;
}

.genre-tag.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.all-genre-btn {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.all-genre-btn:hover {
  background: #43a047;
}

.all-genre-btn.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}
</style>