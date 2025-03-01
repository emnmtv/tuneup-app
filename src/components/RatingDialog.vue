<template>
  <div class="rating-dialog" v-if="show">
    <div class="rating-content">
      <h3>Rate Your Experience</h3>
      
      <!-- Star Rating -->
      <div class="star-rating">
        <span 
          v-for="star in 5" 
          :key="star"
          class="star"
          :class="{ active: star <= rating }"
          @click="rating = star"
        >
          <span class="material-icons">
            {{ star <= rating ? 'star' : 'star_border' }}
          </span>
        </span>
      </div>

      <!-- Review Text -->
      <div class="review-input">
        <textarea
          v-model="review"
          placeholder="Write your review (optional)"
          rows="4"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn-cancel" @click="handleClose">Cancel</button>
        <button 
          class="btn-submit" 
          @click="handleSubmit"
          :disabled="!rating"
        >
          Submit Rating
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatingDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    paymentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      rating: 0,
      review: ''
    }
  },
  methods: {
    handleClose() {
      this.rating = 0;
      this.review = '';
      this.$emit('close');
    },
    handleSubmit() {
      if (!this.rating) {
        if (this.$toast) {
          this.$toast.error('Please select a rating');
        } else {
          alert('Please select a rating');
        }
        return;
      }

      this.$emit('submit', {
        rating: this.rating,
        review: this.review.trim()
      });
    }
  },
  watch: {
    show(newVal) {
      if (!newVal) {
        this.rating = 0;
        this.review = '';
      }
    }
  }
}
</script>

<style scoped>
.rating-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.rating-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.star {
  cursor: pointer;
  color: #ffd700;
  font-size: 2rem;
  transition: transform 0.2s;
}

.star:hover {
  transform: scale(1.2);
}

.star.active {
  color: #ffd700;
}

.review-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-submit {
  background: #4caf50;
  color: white;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit:hover:not(:disabled) {
  background: #43a047;
}

@media (max-width: 768px) {
  .rating-content {
    padding: 1.5rem;
  }
  
  .star {
    font-size: 1.75rem;
  }
}
</style> 