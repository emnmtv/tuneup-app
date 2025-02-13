<template>
  <div>
    <h2>Upgrade to Creator</h2>
    <form @submit.prevent="handleUpgrade">
      <div>
        <label for="offers">Offers</label>
        <input type="text" v-model="offers" required />
      </div>
      <div>
        <label for="bio">Bio (optional)</label>
        <textarea v-model="bio"></textarea>
      </div>
      <div>
        <label for="profession">Profession (optional)</label>
        <input type="text" v-model="profession" />
      </div>
      <div>
        <label for="typeOfProfession">Type of Profession (optional)</label>
        <input type="text" v-model="typeOfProfession" />
      </div>
      <div>
        <label for="genre">Genre (optional)</label>
        <input type="text" v-model="genre" />
      </div>
      <button type="submit" :disabled="isSubmitting">Upgrade</button>
    </form>
    <div v-if="message" :class="messageClass">{{ message }}</div>

    <div v-if="creatorProfile">
      <h3>Your Profile</h3>
      <p><strong>Offers:</strong> {{ creatorProfile.offers }}</p>
      <p><strong>Bio:</strong> {{ creatorProfile.bio }}</p>
      <p><strong>Profession:</strong> {{ creatorProfile.profession }}</p>
      <p><strong>Type of Profession:</strong> {{ creatorProfile.typeOfProfession }}</p>
      <p><strong>Genre:</strong> {{ creatorProfile.genre }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { upgradeToCreator, getCreatorProfile } from '../authService'; // Adjust the import path accordingly

export default {
  name: 'UpgradeToCreator',
  setup() {
    const offers = ref('');
    const bio = ref('');
    const profession = ref('');
    const typeOfProfession = ref('');
    const genre = ref('');
    const message = ref('');
    const messageClass = ref('');
    const isSubmitting = ref(false);
    const creatorProfile = ref(null);

    const handleUpgrade = async () => {
      isSubmitting.value = true;
      message.value = '';
      messageClass.value = '';

      try {
        const response = await upgradeToCreator({
          offers: offers.value,
          bio: bio.value,
          profession: profession.value,
          typeOfProfession: typeOfProfession.value,
          genre: genre.value,
        });

        message.value = response.message;
        messageClass.value = 'success';
        
        // Fetch the updated creator profile after upgrade
        await fetchCreatorProfile();
      } catch (error) {
        message.value = error.message;
        messageClass.value = 'error';
      } finally {
        isSubmitting.value = false;
      }
    };

    const fetchCreatorProfile = async () => {
      try {
        const profile = await getCreatorProfile();
        creatorProfile.value = profile.creatorProfile;
      } catch (error) {
        message.value = error.message;
        messageClass.value = 'error';
      }
    };

    return {
      offers,
      bio,
      profession,
      typeOfProfession,
      genre,
      message,
      messageClass,
      isSubmitting,
      creatorProfile,
      handleUpgrade,
    };
  },
};
</script>

<style scoped>
.success {
  color: green;
}

.error {
  color: red;
}
</style>
