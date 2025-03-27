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

                    <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Type"
                        variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>

                    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addEventPopup()">
                        Add Events
                    </v-btn>
                    <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedEvents(selected)">
                        Delete Selected Events
                    </v-btn>

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
                            </div>
                            <div class="event-time">{{ formatEventTime(calendarEvent.start) }} - {{
                                formatEventTime(calendarEvent.end)
                            }}</div>
                            <div v-if="calendarEvent.location" class="event-location">{{ calendarEvent.location }}</div>
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
                                    <v-btn variant="plain" size="x-small" density="compact"
                                        @click.stop="editEventPopup(calendarEvent)">
                                        <Icon icon="material-symbols:edit-outline" width="16" height="16" />
                                    </v-btn>
                                    <v-btn variant="plain" size="x-small" density="compact"
                                        @click.stop="deleteEventConfirmation(calendarEvent)">
                                        <Icon icon="material-symbols:delete-outline" width="16" height="16" />
                                    </v-btn>
                                </div>
                                <div class="event-time">{{ formatEventTime(calendarEvent.start) }} - {{
                                    formatEventTime(calendarEvent.end)
                                }}</div>
                                <div v-if="calendarEvent.location" class="event-location">{{ calendarEvent.location }}
                                </div>
                            </div>
                            <button @click="closeModal"></button>
                        </div>
                    </template>
                </ScheduleXCalendar>
            </div>
        </div>

        <div v-if="!showCalendarView">
            <v-data-table :headers="headers" :items="filteredEvents" :search="search" v-model:selectable="selected"
                show-select>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn variant="plain" size="small" @click="editEventPopup(item)">
                        <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                    </v-btn>
                    <v-btn variant="plain" size="small" @click="deleteEventConfirmation(item)">
                        <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                    </v-btn>
                </template>
            </v-data-table>
        </div>

        <div v-if="showDeleteItem" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span @click="showDeleteItem = false" class="close">&times;</span>
                    <p v-if="!deleteError">
                        Do you want to DELETE <br />
                        {{ typeToDelete.name }}?
                    </p>
                    <p v-if="deleteError">
                        Error deleting<br />{{ typeToDelete.name }}.
                    </p>
                </div>
                <div class="modal-body">
                    <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
                    <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteEvent()">DELETE</v-btn>
                    <v-btn v-if="deleteError" @click="deleteError = false; showDeleteItem = false;">CLOSE</v-btn>
                </div>
            </div>
        </div>

        <div v-if="showEventDetails" class="modal edit-form-body">
            <v-card class="edit-popup mx-auto">
                <v-card-title class="popup-header">
                    <v-text-field v-model="eventName" variant="outlined" density="compact" hide-details>
                        <template v-slot:append-inner>
                            <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                        </template>
                    </v-text-field>
                </v-card-title>

                <v-container>
                    <!-- Description-->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.description }}</label>
                        </v-col>
                        <v-col cols="7">
                            <v-textarea v-model="eventDescription" rows="3" variant="outlined"
                                density="compact" auto-grow></v-textarea>
                        </v-col>
                    </v-row>

                    <!-- Type-->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.type }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventType" :items="eventTypes" variant="solo-filled" density="compact"
                                hide-details class="filter-menu"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Start Date -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>Start Date</label>
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="eventStartDate" type="date" variant="outlined" density="compact"
                                hide-details @update:model-value="updateEndDate"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- End Date -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>End Date</label>
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="eventEndDate" type="date" variant="outlined" density="compact"
                                hide-details :min="eventStartDate"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Start Time -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>Start Time</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventStartTime" type="time" variant="outlined" density="compact"
                                hide-details></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- End Time  -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>End Time</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventEndTime" type="time" variant="outlined" density="compact"
                                hide-details></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Location  -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.location }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventLocation" variant="outlined" density="compact"
                                hide-details></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Attendance Type -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.attendance }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventAttendanceType" :items="attendanceTypes" variant="solo-filled"
                                density="compact" hide-details class="filter-menu"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Custom Event -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.custom }}</label>
                        </v-col>
                        <v-col cols="7">
                            <v-checkbox v-model="eventCustomEvent" hide-details></v-checkbox>
                        </v-col>
                    </v-row>

                    <!-- Status - -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.status }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-select v-model="eventStatus" :items="statusOptions" variant="solo-filled"
                                density="compact" hide-details class="filter-menu"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Point Value -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.points }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-text-field v-model="eventPointValue" variant="outlined" density="compact"
                                hide-details></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>

                <v-divider></v-divider>

                <v-card-actions class="popup-actions">
                    <v-spacer></v-spacer>
                    <v-btn v-if="eventEdit" color="#F04E3E" variant="flat" fix-jfs-maintenance-page-delete-while-editing
                        @click="deleteEventConfirmation(eventToEdit)">Delete</v-btn>
                    <v-btn color="#708E9A" variant="flat" @click="showEventDetails = false">Cancel</v-btn>
                    <v-btn color="#5EC4B6" variant="flat" style="color: white;"
                        @click="eventEdit ? editEvent() : addEvent()">Save</v-btn>

                </v-card-actions>
            </v-card>
        </div>
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

import { ref, computed, shallowRef, onMounted, watch, nextTick } from 'vue';
import EventServices from '@/services/flightPlanServices/eventServices';
import { Icon } from "@iconify/vue";
import { format, parseISO, set } from 'date-fns';

const search = ref('');
const events = ref([]);
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
const eventPointValue = ref("")

const showCalendarView = ref(localStorage.getItem('showCalendarView') === 'false' ? false : true);

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

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'formatted_date', title: 'Date' },
    { key: 'formatted_time', title: 'Time' },
    { key: 'location', title: 'Location' },
    { key: 'event_type', title: 'Tags', sortable: false },
    { key: 'actions', title: '', sortable: false },
]);

const filterOptions = ref(['All']);
const eventTypes = ['Club', 'Extra Curricular', 'Career Fair', 'Mentoring', 'Career Services', 'Lunch and Learn', 'Galup Strengths Class'];
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
    const darkColors = ['#27575A', '#004761'];
    return {
        backgroundColor: color,
        color: darkColors.includes(color) ? '#2C3E50' : 'white'
    };
};

const filteredEvents = computed(() => {
    if (selectedFilter.value === 'All') {
        return events.value.map(event => ({
            ...event,
            formatted_date: formatDate(event.start_date_time || event.date),
            formatted_time: formatTime(event.start_date_time)
        }));
    }

    if (selectedFilter.value === 'Career Prep') {
        selectedFilter.value = 'career_prep'
    }

    return events.value.filter(event => {
        return event.type === selectedFilter.value.toLowerCase();
    }).map(event => ({
        ...event,
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

            calendarFormattedEvents.value = formattedEvents;

            if (!calendarApp.value) {
                initializeCalendar(formattedEvents);
            }

            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
};

onMounted(async () => {
    await getAllEvents();
});

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

const formatEventForCalendar = (event) => {
    const startDate = new Date(event.date);
    const endDate = new Date(new Date(event.date).getTime() + 60 * 60 * 1000);
    return {
        id: event.id,
        title: event.name,
        start: startDate.toISOString().split('T')[0],
        time: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
        end: endDate.toISOString().split('T')[0],
        description: event.description,
        type: event.type
    };
};

const editEventPopup = (task) => {
    EventServices.getEvent(task.id)
        .then((res) => {
            eventToEdit.value = res.data;
            showEventDetails.value = true;
            eventEdit.value = true;
            eventAdd.value = false;

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

const addEventPopup = () => {
    showEventDetails.value = true;
    eventAdd.value = true;
    eventEdit.value = false;
    eventToEdit.value = null;

    eventName.value = "";
    eventDescription.value = "";
    eventType.value = "";
    eventStartDate.value = "";
    eventEndDate.value = "";
    eventStartTime.value = "";
    eventEndTime.value = "";
    eventLocation.value = "";
    eventAttendanceType.value = "";
    eventCustomEvent.value = false;
    eventStatus.value = "";
    eventPointValue.value = "";
};

const addEvent = () => {
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
        status: eventStatus.value.toLowerCase(),
        point_value: eventPointValue.value
    };

    EventServices.createEvent(newEvent).then((response) => {
        showEventDetails.value = false;
        getAllEvents();
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

<style>
.sx-calendar-container {
    height: 100%;
    width: 100%;
    margin: 20px 0;
    padding: 0 20px;
}

.event-item {
    height: 100%;
    width: 100%;
    padding: 4px 8px;
    background-color: #5EC4B6;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 60px;
    overflow: hidden;
}

.event-item .event-title {
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.event-item .event-time {
    font-size: 12px;
    opacity: 0.9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.event-item .event-location {
    font-size: 12px;
    opacity: 0.8;
    margin-top: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.event-actions {
    display: none;
    gap: 2px;
}

.event-item:hover .event-actions {
    display: flex;
}

.event-actions .v-btn {
    min-width: 24px;
    width: 24px;
    height: 24px;
    padding: 0;
}

.event-item .event-title {
    flex: 1;
    margin-right: 8px;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
}

.table-title {
    font-family: 'Poppins', sans-serif !important;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
}

.search-filter-button-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    justify-content: flex-start;
}

.search-bar {
    width: 250px;
    min-width: 180px;
    max-width: 300px;
    flex-shrink: 1;
}

.filter-menu {
    width: 180px;
    min-width: 150px;
    max-width: 200px;
}

.button {
    width: auto;
    color: white !important;
    white-space: nowrap;
}

.button-white-text {
    color: white !important;
}

.label-column p {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 12px;
    color: #555;
}

.popup-header {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
}

.popup-actions {
    padding: 12px;
    display: flex;
    justify-content: flex-end;
}

.edit-popup {
    max-width: 550px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 16px;
}

.popup-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 16px;
}

.form-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.label-column {
    white-space: nowrap;
    text-align: right;
    font-weight: 500;
    font-size: 14px;
    color: #555;
}

.v-text-field,
.v-textarea {
    width: 100%;
}

.v-card-text {
    padding: 20px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-content {
    padding: 20px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal {
    position: fixed;
    z-index: 999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fefefe;
    padding: 20px;
    border-radius: 4px;
    width: 80%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    margin-bottom: 20px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.v-dialog {
    .v-card {
        padding: 20px;
        max-height: 80vh;
        overflow-y: auto;
    }
}

.edit-form-body {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.edit-popup {
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
}

.popup-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e0e0e0;
}

.form-row {
    margin-bottom: 16px;
}

.label-column {
    display: flex;
    align-items: center;
}

.popup-actions {
    padding: 16px 24px;
    gap: 8px;
}

.v-card-text {
    padding: 20px;
}

.v-container {
    padding: 24px;
}

.v-row {
    margin: 0 -12px;
}

.v-col {
    padding: 12px;
}
</style>