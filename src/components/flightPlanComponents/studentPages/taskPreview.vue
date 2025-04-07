<template>
    <div class="preview" :class="{
        'task-approved': task.status === 'approved',
        'task-ready-for-review': task.status === 'ready_for_review',
        'task-unapproved': task.status === 'unapproved'
    }" @click="selectTask" @mouseover="handleMouseover" @mouseleave="handleMouseleave">

        <v-row class="task-details">
            <div class="task-info">
                <h3 class="task-name">{{ task.name }}</h3>
                <p class="task-description">{{ task.description }}</p>
                <p class="task-points">{{ task.point_value }} pts</p>
            </div>
        </v-row>

        <v-overlay v-model="overlay" class="popup" :z-index="1">
            <v-card class="view-task">
                <div class="scroll">
                    <h2>{{ task.name }}</h2>
                    <p>
                        <span>Description:</span> {{ task.description }}
                    </p>
                    <p>
                        <span>Rationale:</span> {{ task.rationale }}
                    </p>
                    <p>
                        <span>Status:</span> {{ task.status }}
                    </p>
                    <p>
                        <span>Points:</span> {{ task.point_value }} pts
                    </p>
                    <a v-if="task.video_link" :href="task.video_link" target="_blank">
                        Watch Video
                    </a>
                    <v-card-actions class="popup-actions">
                        <v-btn class="button" variant="elevated" color="#5EC4B6" v-if="!task.video_link"
                            @click="showRecommendedEventsHandler">View Recommended Events</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-overlay>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
    task: Object,
    showOverlay: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['save-user', 'delete-user', 'show-recommended-events', 'update:showOverlay']);

const overlay = ref(false);

watch(() => props.showOverlay, (newValue) => {
    overlay.value = newValue;
});

watch(overlay, (newValue) => {
    emit('update:showOverlay', newValue);
});

const showRecommendedEventsHandler = () => {
    overlay.value = false; 
    emit('show-recommended-events', props.task); 
};

const selectTask = () => {
    overlay.value = !overlay.value;
};

const handleMouseover = () => {
    //console.log("MOUSE ON");
};

const handleMouseleave = () => {
    //console.log("MOUSE OFF");
};

const loading = ref(false)
</script>

<style scoped>
/* Main Preview Card */
.preview {
    background-color: rgba(249, 247, 247, 1);
    width: 100%;
    min-height: 11vw;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    border-radius: 20px;
    cursor: pointer;
}

.preview:hover {
    background-color: rgba(230, 230, 230, 1);
    transition: background-color 0.3s ease;
}

/* Task Colors */
.task-approved {
    box-shadow: 2px 2px 5px #4caf50;
}

.task-ready-for-review {
    box-shadow: 2px 2px 5px #ffeb3b;
}

.task-unapproved {
    box-shadow: 2px 2px 5px #f44336;
}

/* Task Details */
.task-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.task-info {
    margin-left: 10px;
}

.task-name {
    font-size: 1.75vw;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.task-description {
    font-size: 1.5vw;
    color: #555;
    margin: 5px 0;
}

.task-points {
    font-size: 1.25vw;
    font-weight: 600;
    color: #811429;
    margin: 0;
}

/* Popup Overlay */
.popup {
    align-items: center;
    justify-content: center;
    position: fixed;
}

.view-task {
    background-color: #ffffff;
    width: 50vw;
    max-height: 80vh;
    min-height: 50vh;
    padding: 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    overflow-y: auto;
}

.scroll {
    overflow-y: auto;
    max-height: 100%;
}

/* Popup Content */
.view-task h2 {
    font-size: 2vw;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.view-task p {
    font-size: 1.5vw;
    color: #555;
    margin: 10px 0;
    line-height: 1.6;
}

.view-task p span {
    font-weight: 600;
    color: #333;
}

.view-task a {
    font-size: 1.5vw;
    color: #811429;
    text-decoration: underline;
    margin-top: 10px;
    display: inline-block;
}

.view-task a:hover {
    color: #5e0f1f;
}

.popup-actions {
    padding: 12px;
    display: flex;
    justify-content: center;
}
</style>