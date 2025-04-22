<template>
    <div>
        <v-card flat>
            <div class="title-row">
                <h1 class="table-title">Events</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>

                    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="requestEventPopup()">
                        Request Custom Event
                    </v-btn>

                    <v-checkbox v-model="viewPersonalCalendar" label="Show Only My Events"
                        @click="togglePersonalCalendar()" density="compact" class="my-auto" hide-details></v-checkbox>

                    <v-btn variant="plain" size="small" @click="toggleCalendarView()">
                        <Icon icon="material-symbols:calendar-month-outline" width="24" height="24" />
                    </v-btn>
                    <v-btn variant="plain" size="small" @click="toggleListView()">
                        <Icon icon="material-symbols:format-list-bulleted" width="24" height="24" />
                    </v-btn>
                </div>
            </div>
        </v-card>

        <div v-if="showCalendarView">
            <div class="sx-calendar-container">
                <ScheduleXCalendar v-if="calendarApp" :calendar-app="calendarApp">
                    <!-- Week view event on calendar -->
                    <template #timeGridEvent="{ calendarEvent }">
                        <div class="event-item" :style="{ ...eventStyles, ...getEventColor(calendarEvent.type) }"
                            @click="openEventModal(calendarEvent)">
                            <div class="event-header">
                                <div class="event-title">{{ calendarEvent.title }}</div>
                                <v-tooltip text="You are registered for this event">
                                    <template v-slot:activator="{ props }">
                                        <Icon v-if="calendarEvent.isRegistered" v-bind="props"
                                            icon="material-symbols:bookmark-rounded" width="24" height="24" />
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="You are not registered for this event">
                                    <template v-slot:activator="{ props }">
                                        <Icon v-if="!calendarEvent.isRegistered" v-bind="props"
                                            icon="material-symbols:bookmark-outline-rounded" width="24" height="24" />
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="This event is recommended for you">
                                    <template v-slot:activator="{ props }">
                                        <Icon v-if="calendarEvent.isRecommended" v-bind="props"
                                            icon="material-symbols:kid-star" width="24" height="24" />
                                    </template>
                                </v-tooltip>
                            </div>
                            <div v-if="getEventDuration(calendarEvent.start, calendarEvent.end) > 60"
                                class="event-time">
                                {{ formatEventTime(calendarEvent.start) }} - {{ formatEventTime(calendarEvent.end) }}
                            </div>
                            <div v-if="calendarEvent.location && getEventDuration(calendarEvent.start, calendarEvent.end) >= 120"
                                class="event-location">{{ calendarEvent.location }}</div>
                        </div>
                    </template>

                    <!-- Multi day events -->
                    <template #dateGridEvent="{ calendarEvent }">
                        <div :style="{ ...eventStyles, ...getEventColor(calendarEvent.type) }">
                            {{ calendarEvent.title }}
                        </div>
                    </template>

                    <!-- Event display on month view -->
                    <template #monthGridEvent="{ calendarEvent }">
                        <div :style="{ ...eventStyles, ...getEventColor(calendarEvent.type) }">
                            {{ calendarEvent.title }}
                        </div>
                    </template>

                    <!-- Event modal after click -->
                    <template #eventModal="{ calendarEvent }">
                        <div :style="eventModalStyles">
                            <div @click="openEventModal(calendarEvent)">
                                <div class="event-header">
                                    <div class="event-title">{{ calendarEvent.title }}</div>
                                </div>
                                <div class="event-time">{{ formatEventTime(calendarEvent.start) }} - {{
                                    formatEventTime(calendarEvent.end)
                                }}</div>
                                <div v-if="calendarEvent.location" class="event-location">{{ calendarEvent.location }}
                                </div>
                                <div style="margin-left: 75%">
                                    <v-btn v-if="!checkIfStudentIsSignedUp(calendarEvent.id)"
                                        @click="closeModal(); studentSignUpForEvent(calendarEvent.id)"
                                        color="#F68D76">Register</v-btn>
                                    <v-btn v-if="checkIfStudentIsSignedUp(calendarEvent.id)"
                                        @click="closeModal(); studentDeleteStudentEvent(calendarEvent.id)"
                                        color="#F68D76">Unregister</v-btn>
                                </div>
                            </div>
                            <button @click="closeModal"></button>
                        </div>
                    </template>
                </ScheduleXCalendar>
            </div>
        </div>

        <div v-if="!showCalendarView">
            <v-data-table :headers="headers" :items="filteredEvents" :search="search"
                @click:row="(event, { item }) => editEventPopup(item)">
            </v-data-table>
        </div>

        <!-- This is the div for the event modal. Recommendation: abstract the request custom event into a modal -->
        <div v-if="showEventDetails" class="modal edit-form-body">
            <v-card class="edit-popup mx-auto">
                <!-- <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}</div> -->
                <v-card-title class="popup-header">
                    <v-text-field v-model="eventName" variant="outlined" density="compact" hide-details
                        :disabled="!eventAdd">
                    </v-text-field>
                </v-card-title>

                <v-container>
                    <!-- Description-->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.description }}</label>
                        </v-col>
                        <v-col cols="7">
                            <v-textarea v-model="eventDescription" auto-grow variant="outlined" density="compact"
                                :disabled="!eventAdd">
                            </v-textarea>
                        </v-col>
                    </v-row>

                    <!-- Type-->
                    <v-row class="form-row" v-if="!eventAdd">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.type }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventType" :items="eventTypes" variant="solo-filled" density="compact"
                                hide-details class="filter-menu" disabled></v-select>
                        </v-col>
                    </v-row>

                    <!-- Start Date -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>Start Date</label>
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="eventStartDate" type="date" variant="outlined" density="compact"
                                hide-details @update:model-value="updateEndDate" :disabled="!eventAdd"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- End Date -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>End Date</label>
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="eventEndDate" type="date" variant="outlined" density="compact"
                                hide-details :min="eventStartDate" :disabled="!eventAdd"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Start Time -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>Start Time</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventStartTime" type="time" variant="outlined" density="compact"
                                hide-details :disabled="!eventAdd"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- End Time  -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>End Time</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventEndTime" type="time" variant="outlined" density="compact"
                                hide-details :disabled="!eventAdd"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Location  -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.location }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventLocation" variant="outlined" density="compact" hide-details
                                :disabled="!eventAdd"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Attendance Type -->
                    <v-row class="form-row">
                        <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}
                        </div>
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.attendance }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventAttendanceType" :items="attendanceTypes" variant="solo-filled"
                                density="compact" hide-details class="filter-menu" :disabled="!eventAdd"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Status - -->
                    <v-row class="form-row" v-if="!eventAdd">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.status }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventStatus" :items="statusOptions" variant="solo-filled"
                                density="compact" hide-details class="filter-menu" disabled></v-select>
                        </v-col>
                    </v-row>

                    <!-- Point Value -->
                    <v-row class="form-row" v-if="!eventAdd">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.points }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventPointValue" variant="outlined" density="compact" hide-details
                                disabled></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>

                <v-divider></v-divider>

                <v-card-actions class="popup-actions">
                    <v-spacer></v-spacer>
                    <v-btn v-if="checkIfStudentIsSignedUp(eventId)"
                        @click="studentDeleteStudentEvent(eventId), showEventDetails = false" color="#708E9A"
                        variant="flat">Unregister</v-btn>
                    <v-btn v-if="!viewPersonalCalendar && eventEdit"
                        @click="studentSignUpForEvent(eventId), showEventDetails = false" color="#5EC4B6" variant="flat"
                        style="color: white;">Register</v-btn>
                    <v-btn v-if="eventAdd" @click="requestEvent(), showEventDetails = false" color="#5EC4B6"
                        variant="flat" style="color: white;">Request</v-btn>
                    <v-btn color="#708E9A" variant="flat" @click="showEventDetails = false">Close</v-btn>

                </v-card-actions>
            </v-card>
        </div>
        <v-snackbar v-model="showSnackbar" timeout="3000" color="success" style="color: white">
            {{ snackbarMessage }}
        </v-snackbar>
    </div>
</template>

<script setup>

import { ScheduleXCalendar } from '@schedule-x/vue'
import {
    createCalendar,
    viewMonthAgenda,
    viewMonthGrid,
    viewWeek,
    viewDay,
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import { createCalendarEvent, deleteCalendarEvent } from "@/utils/google";

import { ref, computed, shallowRef, onMounted, watch, nextTick } from 'vue';
import EventServices from '@/services/flightPlanServices/eventServices';
import StudentEventServices from '@/services/flightPlanServices/studentEventServices'
import UserServices from '@/services/resumeBuilderServices/userServices';
import StudentServices from '@/services/resumeBuilderServices/studentServices'
import { Icon } from "@iconify/vue";
import { format, parseISO, set } from 'date-fns';
import Utils from '@/config/utils';
import EventModal from '@/components/flightPlanComponents/studentPages/EventModal.vue';
import "@/assets/generic-stylesheet.css";

const search = ref('');

const events = ref([]);
const studentEvents = ref([]);
const recommendedEvents = ref([]);

const message = ref('');
const selected = ref([]);
const showEventDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');

const eventToEdit = ref(null);
const typeToDelete = ref(null);
const eventEdit = ref(false);
const eventAdd = ref(false);

const eventId = ref("")
const eventName = ref("");
const eventType = ref("");
const eventScheduleType = ref("");
const eventDescription = ref("");
const eventStartDate = ref("")
const eventEndDate = ref("")
const eventStartTime = ref("")
const eventEndTime = ref("")
const eventLocation = ref("")
const eventAttendanceType = ref("")
const eventCustomEvent = ref(false)
const eventStatus = ref("")
const eventPointValue = ref("");
const errorMessage = ref("");
const hasError = ref(false);

const isStudentRegistered = ref(false);

const user = ref(null);
const userStudentId = ref("")

const specificStudentEvents = ref([])

const showCalendarView = ref(localStorage.getItem('showCalendarView') === 'false' ? false : true);
const viewPersonalCalendar = ref(localStorage.getItem('viewPersonalCalendar') === 'false' ? false : true);

//Snackbar variables
const showSnackbar = ref(false);
const snackbarMessage = ref("");

const toggleCalendarView = () => {
    showCalendarView.value = true;
    nextTick(() => {
        if (calendarApp.value) {
            const currentEvents = [...calendarFormattedEvents.value];
            calendarApp.value.events = currentEvents;
            calendarControls.setView(viewWeek.name);
            calendarControls.setDate(new Date());
        }
    });
};

const toggleListView = () => {
    showCalendarView.value = false;
};

const togglePersonalCalendar = () => {
    viewPersonalCalendar.value = !viewPersonalCalendar.value;
    localStorage.setItem('viewPersonalCalendar', viewPersonalCalendar.value)
    reloadPage();
}

const checkIfStudentIsSignedUp = (id) => {
    const studentSpecificEvent = studentEvents.value.find(studentEvent => studentEvent.id === id);
    return !!studentSpecificEvent;
}

const studentSignUpForEvent = async (id) => {
    if (!userStudentId.value) {
        return
    }

    else {
        EventServices.getEvent(id)
            .then(async (res) => {
                const result = await createCalendarEvent({
                    summary: res.data.name,
                    description: res.data.description,
                    location: res.data.location,
                    start: res.data.start_date_time,
                    end: res.data.end_date_time,
                    timezone: "America/Chicago",
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: "email", minutes: 2880 },
                            { method: "email", minutes: 1440 },
                        ],
                    },
                });

                console.log(result)
                const newStudentEvent = {
                    eventId: id,
                    studentId: userStudentId.value,
                    calendar_id: result.id,
                }
                StudentEventServices.createStudentEvent(newStudentEvent)
                    .then(async (res) => {
                        reloadPage();
                    })
                    .catch((error) => {
                        console.log("error", error);
                    });
            })
            .catch((error) => {
                console.log("error", error);
            });
    }
}
const studentDeleteStudentEvent = (id) => {
    StudentEventServices.getAllStudentEvents()
        .then((res) => {
            specificStudentEvents.value = res.data;
            if (specificStudentEvents.value) {
                const eventToDelete = specificStudentEvents.value.find(studentEvent => studentEvent.eventId === id && studentEvent.studentId === userStudentId.value);
                if (eventToDelete) {
                    const calendarEventId = eventToDelete.calendar_id;
                    StudentEventServices.deleteStudentEvent(eventToDelete.id)
                        .then(async (res) => {
                            console.log(calendarEventId);
                            if (calendarEventId) {
                                await deleteCalendarEvent(calendarEventId);
                            }
                            reloadPage();
                        })
                        .catch((error) => {
                            console.log("error", error);
                        });
                }
            }
        })

}

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'formatted_date', title: 'Date' },
    { key: 'formatted_time', title: 'Time' },
    { key: 'location', title: 'Location' },
    { key: 'event_type', title: 'Tags', sortable: false },
    { key: 'point_value', title: 'Points' }
]);

const filterOptions = ref(['All', 'Club', 'Extra Curricular', 'Career Fair', 'Mentoring', 'Career Services', 'Lunch and Learn', 'Galup Strengths Class', 'Volunteer']);
const eventTypes = ['Club', 'Extra Curricular', 'Career Fair', 'Mentoring', 'Career Services', 'Lunch and Learn', 'Galup Strengths Class', 'Volunteer'];
const statusOptions = ['Scheduled', 'In Progress', 'Completed', 'Finished']
const attendanceTypes = ['In Person', 'Online']

const labels = {
    description: "Description",
    type: "Type",
    date: "Date",
    start: "Start Time",
    end: "End Time",
    location: "Location",
    attendance: "Attendance Type",
    custom: "Custom Event?",
    status: "Status",
    points: "Point Value",
    verification: "Verification Type",
};

const eventTypeColors = {
    'club': '#F9C634',
    'extra_curricular': '#F68D76',
    'career_fair': '#708E9A',
    'mentoring': '#118ACB',
    'career_services': '#F04E3E',
    'lunch_and_learn': '#004761',
    'galup_strengths_class': '#27575A'
};

const getEventColor = (eventType) => {
    const color = eventTypeColors[eventType?.toLowerCase()] || '#F9C634';
    return {
        backgroundColor: color,
        color: 'white'
    };
};

const getEventDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate.getTime() - startDate.getTime();
    return duration / 60000;
};

const filteredEvents = computed(() => {
    const eventsList = viewPersonalCalendar.value ? studentEvents.value : events.value;

    if (selectedFilter.value === 'All') {
        return eventsList.map(event => ({
            ...event,
            id: event.id,
            formatted_date: formatDate(event.start_date_time || event.date),
            formatted_time: formatTime(event.start_date_time)
        }));
    }

    if (selectedFilter.value === 'Career Prep') {
        selectedFilter.value = 'career_prep'
    }

    if (selectedFilter.value === 'Extra Curricular') {
        selectedFilter.value = 'extra_curricular'
    }

    if (selectedFilter.value === 'Career Fair') {
        selectedFilter.value = 'career_fair'
    }

    if (selectedFilter.value === 'Career Services') {
        selectedFilter.value = 'career_services'
    }

    if (selectedFilter.value === 'Lunch and Learn') {
        selectedFilter.value = 'lunch_and_learn'
    }

    if (selectedFilter.value === 'Galup Strengths Class') {
        selectedFilter.value = 'galup_strengths_class'
    }

    return eventsList.filter(event => {
        return event.category === selectedFilter.value.toLowerCase();
    }).map(event => ({
        ...event,
        id: event.id,
        formatted_date: formatDate(event.start_date_time || event.date),
        formatted_time: formatTime(event.start_date_time)
    }));
});

const calendarControls = createCalendarControlsPlugin();
const eventModal = createEventModalPlugin();

const calendarApp = shallowRef(null);
const calendarFormattedEvents = ref([]);

const initializeCalendar = (events) => {
    const today = new Date();
    const config = {
        selectedDate: today.toISOString().split('T')[0],
        locale: 'en-US',
        views: [viewMonthAgenda, viewMonthGrid, viewWeek, viewDay],
        defaultView: viewWeek.name,
        dayBoundaries: {
            start: '06:00',
            end: '21:00',
        },
        firstDayOfWeek: 0,
        plugins: [
            calendarControls,
            eventModal
        ],
        events: events,
        monthGridOptions: {
            nEventsPerDay: 6,
        },
        weekOptions: {
            gridHeight: screen.height * .5,
        }
    };

    calendarApp.value = createCalendar(config);

    nextTick(() => {
        calendarControls.setView(viewWeek.name);
        calendarControls.setDate(today);
    });
};

watch(calendarFormattedEvents, (newEvents) => {
    if (calendarApp.value && newEvents && newEvents.length > 0) {
        nextTick(() => {
            try {
                calendarApp.value.events = [...newEvents];
            } catch (error) {
                console.error('Error setting events:', error);
            }
        });
    }
}, { deep: true });

const getAllEvents = () => {
    return EventServices.getAllEvents()
        .then((res) => {
            events.value = res.data;
            const formattedEvents = events.value.map(event => {
                const startDate = event.start_date_time ? new Date(event.start_date_time) : new Date(event.date);
                const endDate = event.end_date_time ? new Date(event.end_date_time) : new Date(startDate.getTime() + 60 * 60 * 1000);

                const formatDateTime = (date) => {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                };

                const isStudentRegistered = studentEvents.value.some(se => se.studentEvent[0].eventId === event.id);
                const isStudentRecommended = recommendedEvents.value.some(recommendedEvent => recommendedEvent.id === event.id);

                return {
                    id: event.id,
                    title: event.name,
                    start: formatDateTime(startDate),
                    end: formatDateTime(endDate),
                    description: event.description || '',
                    location: event.location || '',
                    type: event.event_type,
                    isRecommended: isStudentRecommended,
                    isRegistered: isStudentRegistered,
                };
            });

            if (!viewPersonalCalendar.value) {
                calendarFormattedEvents.value = formattedEvents;
                initializeCalendar(calendarFormattedEvents.value);
            }

            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
};

const getAllStudentEvents = () => {
    return StudentEventServices.getAllEventsByStudent(userStudentId.value)
        .then((res) => {
            studentEvents.value = res.data;
            const formattedEvents = studentEvents.value.map(event => {
                const startDate = event.start_date_time ? new Date(event.start_date_time) : new Date(event.date);
                const endDate = event.end_date_time ? new Date(event.end_date_time) : new Date(startDate.getTime() + 60 * 60 * 1000);

                const formatDateTime = (date) => {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                };

                const isStudentRecommended = recommendedEvents.value.some(recommendedEvent => recommendedEvent.id === event.studentEvent[0].eventId);

                return {
                    id: event.id,
                    title: event.name,
                    start: formatDateTime(startDate),
                    end: formatDateTime(endDate),
                    description: event.description || '',
                    location: event.location || '',
                    type: event.event_type,
                    isRecommended: isStudentRecommended,
                    isRegistered: true,
                };
            });

            if (viewPersonalCalendar.value) {
                calendarFormattedEvents.value = formattedEvents;
                initializeCalendar(calendarFormattedEvents.value);
            }

            message.value = '';
        })
        .catch((error) => {
            console.log("error", error);
        });
}

const getAllStudentRecommendedEvents = () => {
    return StudentServices.getRecommendedEvents(userStudentId.value)
        .then((res) => {
            recommendedEvents.value = res.data;
            const formattedEvents = recommendedEvents.value.map(event => {
                const startDate = event.start_date_time ? new Date(event.start_date_time) : new Date(event.date);
                const endDate = event.end_date_time ? new Date(event.end_date_time) : new Date(startDate.getTime() + 60 * 60 * 1000);

                const formatDateTime = (date) => {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                };

                return {
                    id: event.id,
                    title: event.name,
                    start: formatDateTime(startDate),
                    end: formatDateTime(endDate),
                    description: event.description || '',
                    location: event.location || '',
                    type: event.event_type
                };
            });

            message.value = '';
        })
        .catch((error) => {
            console.log("error", error);
        });
}

onMounted(async () => {
    console.log(window.location.origin)
    user.value = Utils.getStore("user");
    await getCurrentUser();

    await getAllStudentRecommendedEvents();
    await getAllStudentEvents();

    if (!viewPersonalCalendar.value) {
        await getAllEvents();
    }

});

const getCurrentUser = () => {
    return UserServices.getUser(user.value.userId)
        .then((res) => {
            if (res.data.studentId) {
                userStudentId.value = res.data.studentId;
            }
            else {
                console.log("Student id not found")
            }

            if (!userStudentId.value) {
                return;
            } else {

            }
        })
        .catch((error) => {
            console.log("error", error);
        });
}

const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
        if (dateTimeStr.includes('T')) {
            const date = parseISO(dateTimeStr);
            return format(date, 'MM-dd-yyyy');
        }
        const date = parseISO(dateTimeStr);
        return format(date, 'MM-dd-yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateTimeStr;
    }
};

const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
        if (dateTimeStr.includes('T')) {
            const date = parseISO(dateTimeStr);
            return format(date, 'HH:mm');
        }
        return dateTimeStr;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '';
    }
};

const formatEventTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
        const date = new Date(dateTimeStr);
        return format(date, 'h:mm a');
    } catch (error) {
        console.error('Error formatting event time:', error);
        return '';
    }
};

const editEventPopup = (task) => {
    EventServices.getEvent(task.id)
        .then((res) => {
            eventToEdit.value = res.data;
            showEventDetails.value = true;
            eventEdit.value = true;
            eventAdd.value = false;

            eventId.value = eventToEdit.value.id;
            isStudentRegistered.value = eventToEdit.value.isRegistered;
            eventName.value = eventToEdit.value.name;
            eventDescription.value = eventToEdit.value.description;
            eventType.value = capitalize(eventToEdit.value.event_type);

            if (eventToEdit.value.start_date_time) {
                eventStartDate.value = eventToEdit.value.start_date_time.split('T')[0];
            } else if (eventToEdit.value.date) {
                try {
                    const dateTime = parseISO(eventToEdit.value.date);
                    eventStartDate.value = format(dateTime, 'yyyy-MM-dd');
                } catch (error) {
                    eventStartDate.value = eventToEdit.value.date;
                }
            }

            if (eventToEdit.value.end_date_time) {
                eventEndDate.value = eventToEdit.value.end_date_time.split('T')[0];
            } else if (eventToEdit.value.date) {
                try {
                    const dateTime = parseISO(eventToEdit.value.date);
                    eventEndDate.value = format(dateTime, 'yyyy-MM-dd');
                } catch (error) {
                    eventEndDate.value = eventToEdit.value.date;
                }
            }

            if (eventToEdit.value.start_date_time) {
                const startDateTime = parseISO(eventToEdit.value.start_date_time);
                eventStartTime.value = format(startDateTime, 'HH:mm');
            }
            if (eventToEdit.value.end_date_time) {
                const endDateTime = parseISO(eventToEdit.value.end_date_time);
                eventEndTime.value = format(endDateTime, 'HH:mm');
            }

            eventLocation.value = eventToEdit.value.location;
            eventAttendanceType.value = eventToEdit.value.attendance_type;
            eventCustomEvent.value = eventToEdit.value.custom;
            eventStatus.value = eventToEdit.value.status;
            eventPointValue.value = eventToEdit.value.point_value;
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });

};

const editEvent = () => {
    if (eventType.value === 'Career Prep') {
        eventType.value = 'career_prep'
    }

    if (eventScheduleType.value === 'One Time') {
        eventScheduleType.value = 'one_time'
    }

    if (eventScheduleType.value === 'Special Event') {
        eventScheduleType.value = 'special_event'
    }

    if (eventScheduleType.value === 'Every Semester') {
        eventScheduleType.value = 'every_semester'
    }

    if (eventType.value === 'Extra Curricular') {
        eventType.value = 'extra_curricular'
    }

    if (eventType.value === 'Career Fair') {
        eventType.value = 'career_fair'
    }

    if (eventType.value === 'Career Services') {
        eventType.value = 'career_services'
    }

    if (eventType.value === 'Lunch and Learn') {
        eventType.value = 'lunch_and_learn'
    }

    if (eventType.value === 'Galup Strengths Class') {
        eventType.value = 'galup_strengths_class'
    }

    if (eventStatus.value === 'In Progress') {
        eventStatus.value = 'in_progress'
    }

    if (eventAttendanceType.value === 'In Person') {
        eventAttendanceType.value = 'in_person'
    }


    const startDate = parseISO(eventStartDate.value);
    const endDate = parseISO(eventEndDate.value);
    const [startHours, startMinutes] = eventStartTime.value.split(':');
    const [endHours, endMinutes] = eventEndTime.value.split(':');

    const startDateTime = set(startDate, {
        hours: parseInt(startHours),
        minutes: parseInt(startMinutes),
        seconds: 0
    });

    const endDateTime = set(endDate, {
        hours: parseInt(endHours),
        minutes: parseInt(endMinutes),
        seconds: 0
    });

    const updatedEvent = {
        name: eventName.value,
        description: eventDescription.value,
        event_type: eventType.value.toLowerCase(),
        date: startDateTime.toISOString(),
        start_date_time: startDateTime.toISOString(),
        end_date_time: endDateTime.toISOString(),
        location: eventLocation.value,
        attendance_type: eventAttendanceType.value,
        custom: eventCustomEvent.value,
        status: eventStatus.value,
        point_value: eventPointValue.value
    };

    EventServices.updateEvent(eventToEdit.value.id, updatedEvent)
        .then((response) => {
            showEventDetails.value = false;
            getAllEvents();
        })
        .catch((e) => {
            console.log(e.value)
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};

const requestEventPopup = () => {
    errorMessage.value = "";
    hasError.value = false;
    showEventDetails.value = true;
    eventAdd.value = true;
    eventEdit.value = false;
    eventToEdit.value = null;

    eventName.value = null;
    eventDescription.value = null;
    eventType.value = "custom";
    eventStartDate.value = null;
    eventEndDate.value = null;
    eventStartTime.value = null;
    eventEndTime.value = null;
    eventLocation.value = null;
    eventAttendanceType.value = null;
    eventCustomEvent.value = false;
    eventStatus.value = "";
    eventPointValue.value = "0";
};

const requestEvent = () => {
    hasError.value = false;
    errorMessage.value = "";

    // Check for required fields
    if (eventName.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventDescription.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventStartDate.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventEndDate.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventStartTime.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventEndTime.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventLocation.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }
    if (eventAttendanceType.value == null) {
        errorMessage.value = "* Required";
        hasError.value = true;
    }

    //Database name setting
    if (eventType.value === 'Career Prep') {
        eventType.value = 'career_prep'
    }

    if (eventScheduleType.value === 'One Time') {
        eventScheduleType.value = 'one_time'
    }

    if (eventScheduleType.value === 'Special Event') {
        eventScheduleType.value = 'special_event'
    }

    if (eventScheduleType.value === 'Every Semester') {
        eventScheduleType.value = 'every_semester'
    }

    if (eventType.value === 'Extra Curricular') {
        eventType.value = 'extra_curricular'
    }

    if (eventType.value === 'Career Fair') {
        eventType.value = 'career_fair'
    }

    if (eventType.value === 'Career Services') {
        eventType.value = 'career_services'
    }

    if (eventType.value === 'Lunch and Learn') {
        eventType.value = 'lunch_and_learn'
    }

    if (eventType.value === 'Galup Strengths Class') {
        eventType.value = 'galup_strengths_class'
    }

    if (eventStatus.value === 'In Progress') {
        eventStatus.value = 'in_progress'
    }

    if (eventAttendanceType.value === 'In Person') {
        eventAttendanceType.value = 'in_person'
    }


    const startDate = parseISO(eventStartDate.value);
    const endDate = parseISO(eventEndDate.value);
    const [startHours, startMinutes] = eventStartTime.value.split(':');
    const [endHours, endMinutes] = eventEndTime.value.split(':');

    const startDateTime = set(startDate, {
        hours: parseInt(startHours),
        minutes: parseInt(startMinutes),
        seconds: 0
    });

    const endDateTime = set(endDate, {
        hours: parseInt(endHours),
        minutes: parseInt(endMinutes),
        seconds: 0
    });

    const newEvent = {
        name: eventName.value,
        description: eventDescription.value,
        event_type: eventType.value.toLowerCase(),
        date: startDateTime.toISOString(),
        start_date_time: startDateTime.toISOString(),
        end_date_time: endDateTime.toISOString(),
        location: eventLocation.value,
        attendance_type: eventAttendanceType.value.toLowerCase(),
        custom: eventCustomEvent.value,
        status: "in_progress",
        point_value: eventPointValue.value,
    };

    EventServices.createEvent(newEvent).then((response) => {
        showEventDetails.value = false;
        getAllEvents();

        //Snackbar success
        snackbarMessage.value = "Event requested successfully!";
        showSnackbar.value = true;
    })
        .catch((e) => {
            console.log(e.response.data)
            message.value = e.response.data.message;
            deleteError.value = true;
        });
}

const deleteEventConfirmation = (task) => {
    EventServices.getEvent(task.id)
        .then((res) => {
            typeToDelete.value = res.data;
            showDeleteItem.value = true
            showEventDetails.value = false;
        })
        .catch((e) => {
            console.log(e.response.data)
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};

const deleteEvent = async () => {
    try {
        await EventServices.deleteEvent(typeToDelete.value.id);
        events.value = events.value.filter(event => event.id !== typeToDelete.value.id);

        // if (calendarApp.value) {
        //   calendarFormattedEvents.value = events.value.map(formatEventForCalendar);
        //   calendarApp.value.events = calendarFormattedEvents.value;
        // }

        reloadPage() // TODO: fix later to dynamically refresh calendar events - above code is a WIP

        showDeleteItem.value = false;
        typeToDelete.value = null;
    } catch (error) {
        console.error('Error deleting event:', error);
        deleteError.value = true;
    }
};

const deleteSelectedEvents = async (selected) => {
    if (selected.length > 0) {
        try {
            const deletePromises = selected.map(event => EventServices.deleteEvent(event.id));
            await Promise.all(deletePromises);

            const deletedIds = selected.map(event => event.id);
            events.value = events.value.filter(event => !deletedIds.includes(event.id));

            //   if (calendarApp.value) {
            //     calendarFormattedEvents.value = events.value.map(formatEventForCalendar);
            //     calendarApp.value.events = calendarFormattedEvents.value;
            //   }

            reloadPage() // TODO: fix later to dynamically refresh calendar events - above code is a WIP
            selected.length = 0;

        } catch (error) {
            console.error('Error deleting selected events:', error);
            deleteError.value = true;
        }
    } else {
        console.log("No events selected.");
    }
};

const reloadPage = () => {
    localStorage.setItem('showCalendarView', showCalendarView.value)
    localStorage.setItem('viewPersonalCalendar', viewPersonalCalendar.value)
    location.reload()
}

watch(calendarFormattedEvents, (newEvents) => {
    if (calendarApp.value) {
        calendarApp.value.events = newEvents.map(event => ({
            ...event,
            start: new Date(event.start).toISOString().split('T')[0],
            end: new Date(event.end).toISOString().split('T')[0]
        }));
    }
}, { deep: true });

const closeModal = () => {
    eventModal.close();
}

const eventStyles = {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '4px',
    padding: '0 4px',
}

const eventModalStyles = {
    boxShadow: '0 0 2em #123',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '4px',
    padding: '0 4px',
}

function capitalize(s) {
    return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

function updateEndDate() {
    if (eventEndDate.value < eventStartDate.value) {
        eventEndDate.value = eventStartDate.value;
    }
}
</script>