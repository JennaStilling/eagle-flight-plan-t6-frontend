<template>
    <div class="preview" @click="selectBadge" @mouseover="handleMouseover" @mouseleave="handleMouseleave">
        <!-- Badge Preview -->
        <v-row class="badge-details">
            <div class="badge-item">
                <v-progress-circular :model-value="progress" :size="180" :width="12" color="green" v-if="!obtained">
                    <img :src="badge.image" :alt="badge.name" class="badge-image">
                </v-progress-circular>
                <img :src="badge.image" :alt="badge.name" class="badge-image" v-if="obtained">
                <p class="badge-name">{{ badge.name }}</p>
                <p class="badge-date" v-if="obtained">{{ formatDate(badge.date_acquired) }}</p>
                <p class="badge-date" v-if="!obtained">{{ badge.points }} pts</p>
                <v-btn v-if="!obtained && badge.completed" class="button" variant="elevated" color="#5EC4B6"
                    @click.stop="claimBadge()">
                    Claim
                </v-btn>
            </div>
        </v-row>

        <!-- Badge Popup -->
        <v-overlay v-model="overlay" class="popup">
            <v-card class="view-badge">
                <v-row class="badge-popup-details">
                    <div class="badge-popup-item">
                        <v-progress-circular :model-value="progress" :size="250" :width="12" color="green"
                            v-if="!obtained">
                            <img :src="badge.image" :alt="badge.name" class="badge-popup-image">
                        </v-progress-circular>
                        <img :src="badge.image" :alt="badge.name" class="badge-popup-image" v-if="obtained">
                        <p class="badge-popup-points" v-if="!obtained">
                            {{ formatType(badge.type) }}: {{ badge.progress }} / {{ badge.total }}
                        </p>
                    </div>
                    <v-col>
                        <div class="badge-popup-info">
                            <h3 class="badge-popup-name">{{ badge.name }}</h3>
                            <p class="badge-popup-description">{{ badge.description }}</p>
                            <p class="badge-popup-date" v-if="obtained">
                                Date Aquired: {{ formatDate(badge.date_acquired) }}
                            </p>
                            <p class="badge-popup-points" v-if="obtained">
                                Points Gained: {{ badge.points_earned }}
                            </p>
                            <p class="badge-popup-points" v-if="!obtained">
                                Points: {{ badge.points }}
                            </p>
                        </div>
                        <div class="button-right">
                            <v-btn v-if="!obtained && badge.completed" class="button" variant="elevated" color="#5EC4B6"
                                @click="claimBadge()">
                                Claim
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </v-overlay>
    </div>

</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
    badge: Object,
    obtained: Boolean,
});
const emit = defineEmits(['claim-badge']);

const progress = ref((props.badge.progress ?? 0) / (props.badge.total ?? 1) * 100);
const overlay = ref(false);

onMounted(() => {
});

const refresh = () => {
}

const selectBadge = () => {
    refresh();
    overlay.value = !overlay.value;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
}

const formatType = (type) => {
    return type.split('_')[0].replace(/^\w/, (c) => c.toUpperCase());
}

const claimBadge = () => {
    emit('claim-badge', props.badge);
    overlay.value = false;
}
</script>

<style scoped>
/* Main Preview Card */
.preview {
    background-color: rgba(249, 247, 247, 1);
    width: 100%;
    min-height: 19.5vw;
    padding: 2vw;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 2vw;
    border-radius: 1vw;
    cursor: pointer;
}

.preview:hover {
    background-color: rgba(230, 230, 230, 1);
    transition: background-color 0.3s ease;
}

/* Badge Details */
.badge-details {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2vw;
}

/* Badge Item */
.badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 10vw;
    flex-shrink: 0;
}

.badge-image {
    width: 8vw;
    height: 8vw;
    border-radius: 50%;
    background: rgba(32, 32, 32, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.badge-name {
    font-size: 1.5vw;
    font-weight: 600;
    margin: 0.5vw 0;
}

.badge-date {
    font-size: 1.2vw;
    color: #777;
}

/* Popup Overlay */
.popup {
    align-items: center;
    justify-content: center;
}

.view-badge {
    background-color: #ffffff;
    width: 50vw;
    height: 18vw;
    padding: 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    overflow-y: auto;
    display: flex;
}

/* Badge Popup Details */
.badge-popup-details {
    display: flex;
    align-items: center;
}

/* Badge Popup Item */
.badge-popup-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 15vw;
}

.badge-popup-image {
    width: 12vw;
    height: 12vw;
    border-radius: 50%;
    background: rgba(32, 32, 32, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.badge-popup-name {
    font-size: 2vw;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
}

.badge-popup-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.badge-popup-description {
    font-size: 1.5vw;
    color: #555;
    line-height: 1.6;
}

.badge-popup-date,
.badge-popup-points {
    font-size: 1.2vw;
    color: #777;
}

.button-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
}
</style>