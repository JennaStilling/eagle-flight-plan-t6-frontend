<template>
    <div class="preview" @click="selectEvent" @mouseover="handleMouseover" @mouseleave="handleMouseleave">

        <v-row class="event-details">
            <div class="event-date">
                <h3 class="event-month">{{ getFormattedMonth(event.date) }}</h3>
                <h3 class="event-day">{{ getFormattedDay(event.date) }}</h3>
            </div>

            <div class="event-info">
                <p class="event-time">{{ formatEventTime(event.start_date_time, event.end_date_time) }}</p>
                <h3 class="event-name">{{ event.name }}</h3>
                <p class="event-description">{{ event.description }}</p>
            </div>
        </v-row>
        <v-overlay v-model="overlay" class="popup">
            <v-card class="view-event">
                <div class="scroll">
                    <h2>{{ event.name }}</h2>
                    <p>
                        <span>Description:</span> {{ event.description }}
                    </p>
                    <p>
                        <span>Date:</span> {{ event.date }}
                    </p>
                    <p>
                        <span>Time:</span> {{ event.start_date_time }} - {{ event.end_date_time }}
                    </p>
                    <p>
                        <span>Location:</span> {{ event.location }}
                    </p>
                    <p>
                        <span>Points:</span> {{ event.point_value }} pts
                    </p>
                    <p>
                        <span>Status:</span> {{ event.status }}
                    </p>
                </div>
            </v-card>
        </v-overlay>
    </div>

</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
    event: Object,
});
const emit = defineEmits(['save-user', 'delete-user']);


const overlay = ref(false);
const menu = ref(false);
const loading = ref(false)

onMounted(() => {
});

const handleMouseover = () => {
    //console.log("MOUSE ON");
};

const handleMouseleave = () => {
    //console.log("MOUSE OFF");
};

const refresh = () => {
}

const selectEvent = () => {
    refresh();
    overlay.value = !overlay.value;
};

const getFormattedMonth = (dateString) => {
    return new Date(dateString)
        .toLocaleDateString('en-US', { month: 'short' })
        .toLocaleUpperCase();
};

const getFormattedDay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit' });
};

const formatEventTime = (startDateTime, endDateTime) => {
    const formatTime = (dateTime) =>
        new Date(dateTime)
            .toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            .replace('AM', 'am')
            .replace('PM', 'pm');

    return `${formatTime(startDateTime)} - ${formatTime(endDateTime)}`;
};

</script>

<style scoped>
/* Main Preview Card */
.preview {
    background-color: rgba(249, 247, 247, 1);
    width: 100%;
    min-height: 10vw;
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

/* Event Details */
.event-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
}

.event-date {
    text-align: center;
    margin-right: 20px;
}

.event-month {
    font-size: 1.5vw;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
}

.event-day {
    font-size: 2vw;
    font-weight: 700;
    color: #333;
}

.event-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.event-name {
    font-size: 1.8vw;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
}

.event-time {
    font-size: 1.5vw;
    color: #555;
    margin-bottom: 5px;
}

.event-description {
    font-size: 1.2vw;
    color: #777;
    line-height: 1.5;
}

/* Popup Overlay */
.popup {
    align-items: center;
    justify-content: center;
}

.view-event {
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
.view-event h2 {
    font-size: 2vw;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.view-event p {
    font-size: 1.5vw;
    color: #555;
    margin: 10px 0;
    line-height: 1.6;
}

.view-event span {
    font-weight: 600;
    color: #333;
}
</style>