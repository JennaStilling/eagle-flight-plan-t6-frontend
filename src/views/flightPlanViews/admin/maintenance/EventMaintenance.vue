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
                            <v-textarea v-model="eventDescription" rows="3" variant="outlined" density="compact"
                                auto-grow></v-textarea>
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


                    <!-- Clifton Strengths -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.clifton_strengths }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-row align="center" justify="start">
                                <v-col v-for="(selection, i) in strengthSelections" :key="selection.name"
                                    class="py-1 pe-0" cols="auto">
                                    <v-chip :disabled="strengthLoading" closable class="ma-1" color="primary" rounded="lg"
                                        @click:close="eventCliftonStrengths.cliftonStrengthsToAdd.splice(i, 1)">

                                        {{ selection.name }}
                                    </v-chip>
                                </v-col>

                                <v-col cols="12">
                                    <v-menu v-model="strengthMenu" close-on-content-click>
                                        <template v-slot:activator="{ props }">
                                            <v-text-field ref="searchField" v-model="strengthSearch" label="Search"
                                                hide-details single-line variant="solo" density="compact"
                                                v-bind="props">
                                            </v-text-field>
                                        </template>

                                        <v-list style="max-height: 300px; overflow-y: auto;">
                                            <template v-for="cliftonStrengths in strengthsList">
                                                <v-list-item
                                                    v-if="!eventCliftonStrengths.cliftonStrengthsToAdd.includes(cliftonStrengths)"
                                                    :key="cliftonStrengths.id" :disabled="strengthLoading"
                                                    @click="eventCliftonStrengths.cliftonStrengthsToAdd.push(cliftonStrengths)">
                                                    <template v-slot:prepend>
                                                    </template>

                                                    <v-list-item-title v-text="cliftonStrengths.name">
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </template>
                                        </v-list>
                                    </v-menu>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>


                    <!-- Majors -->
                    <v-row class="form-row">
                        <v-col cols="5" class="label-column">
                            <label>{{ labels.majors }}</label>
                        </v-col>

                        <v-col cols="7">
                            <v-row align="center" justify="start">
                                <v-col v-for="(selection, i) in majorSelections" :key="selection.name"
                                    class="py-1 pe-0" cols="auto">
                                    <v-chip :disabled="majorLoading" closable class="ma-1" color="primary" rounded="lg"
                                        @click:close="eventMajors.majorsToAdd.splice(i, 1)">

                                        {{ selection.name }}
                                    </v-chip>
                                </v-col>

                                <v-col cols="12">
                                    <v-menu v-model="majorMenu" close-on-content-click>
                                        <template v-slot:activator="{ props }">
                                            <v-text-field ref="searchField" v-model="majorSearch" label="Search"
                                                hide-details single-line variant="solo" density="compact"
                                                v-bind="props">
                                            </v-text-field>
                                        </template>

                                        <v-list style="max-height: 300px; overflow-y: auto;">
                                            <template v-for="majors in majorsList">
                                                <v-list-item
                                                    v-if="!eventMajors.majorsToAdd.includes(majors)"
                                                    :key="majors.id" :disabled="majorLoading"
                                                    @click="eventMajors.majorsToAdd.push(majors)">
                                                    <template v-slot:prepend>
                                                    </template>

                                                    <v-list-item-title v-text="majors.name">
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </template>
                                        </v-list>
                                    </v-menu>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>



                <div class="d-flex justify-center pa-4">
                    <v-btn color="#708E9A" variant="flat"
                        @click="showEventDetails = false; showStudentNamesList = true;">
                        View Attendees
                    </v-btn>
                </div>

                <v-divider></v-divider>

                <v-card-actions class="popup-actions">
                    <v-spacer></v-spacer>
                    <v-btn v-if="eventEdit" color="#F04E3E" variant="flat"
                        @click="deleteEventConfirmation(eventToEdit)">Delete</v-btn>
                    <v-btn color="#708E9A" variant="flat" @click="showEventDetails = false">Cancel</v-btn>
                    <v-btn color="#5EC4B6" variant="flat" style="color: white;"
                        @click="eventEdit ? editEvent() : addEvent()">Save</v-btn>
                </v-card-actions>
            </v-card>
        </div>

        <div v-if="showStudentNamesList" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Registered Students</h3>
                </div>
                <div class="search-container">
                    <v-text-field v-model="studentSearchResult" label="Search" variant="outlined" density="compact"
                        hide-details class="search-field">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>
                </div>
                <div class="modal-body" style="max-height: 60vh; overflow-y: auto; width: 100%; padding-right: 0;">
                    <v-list class="w-100">
                        <v-list-item v-for="(name, index) in filteredStudentList" :key="index">
                            <v-list-item-title>{{ name }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <div v-if="filteredStudentList.length === 0" class="text-center pa-4">
                        {{ studentSearchResult ? 'No matching students found' : 'No students registered for this event'
                        }}
                    </div>
                </div>
                <v-divider></v-divider>
                <v-card-actions class="popup-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="#708E9A" variant="flat"
                        @click="showStudentNamesList = false; showEventDetails = true;">Close</v-btn>
                </v-card-actions>
            </div>
        </div>
    </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
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
import StudentEventServices from '@/services/flightPlanServices/studentEventServices';
import UserServices from '@/services/resumeBuilderServices/userServices'
import CliftonStrengthServices  from "@/services/flightPlanServices/cliftonStrengthServices";
import MajorServices from "@/services/flightPlanServices/majorServices";
import EventMajorsServices from "@/services/flightPlanServices/eventMajorsServices";
import EventCliftonStrengthServices from "@/services/flightPlanServices/eventCliftonStrengthServices";
import { Icon } from "@iconify/vue";
import { format, parseISO, set } from 'date-fns';

const search = ref('');
const strengthSearch = ref('')
const majorSearch = ref ('')

const events = ref([]);
const message = ref('');
const selected = ref([]);
const showEventDetails = ref(false);
const showDeleteItem = ref(false);
const showStudentNamesList = ref(false);
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

const eventAttendees = ref("")
const studentNameList = ref([])
const attendeeMap = ref([])

const studentSearchResult = ref('');

const majorsList = ref([]);
const strengthsList = ref([]);

const strengthLoading = ref(false)
const majorLoading = ref(false)

const strengthMenu = ref(false);
const majorMenu = ref(false);

const eventCliftonStrengths = ref({
    cliftonStrengthsToAdd: [],
})
const strengthSelections = computed(() => {
    const strengthSelections = []
    for (const selection of eventCliftonStrengths.value.cliftonStrengthsToAdd) {
        strengthSelections.push(selection)
    }
    return strengthSelections
})

const eventMajors = ref({
    majorsToAdd: [],
})
const majorSelections = computed(() => {
    const majorSelections = []
    for (const selection of eventMajors.value.majorsToAdd) {
        majorSelections.push(selection)
    }
    return majorSelections
})

const filteredStudentList = computed(() => {
    if (!studentSearchResult.value) return studentNameList.value;
    return studentNameList.value.filter(name => 
        name.toLowerCase().includes(studentSearchResult.value.toLowerCase())
    );
});

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
    { key: 'eventAttendees', title: '# Registered', sortable: false },
    { key: 'actions', title: '', sortable: false },
]);

const filterOptions = ref(['All']);
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
    clifton_strengths: "Clifton Strengths",
    majors: "Majors"
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

const filteredEvents = computed(() => {
    if (selectedFilter.value === 'All') {
        return events.value.map(event => ({
            ...event,
            formatted_date: formatDate(event.start_date_time || event.date),
            formatted_time: formatTime(event.start_date_time),
            eventAttendees: attendeeMap.value.find(a => a.id === event.id)?.attendees || 0
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
        formatted_time: formatTime(event.start_date_time),
        eventAttendees: attendeeMap.value.find(a => a.id === event.id)?.attendees || 0

    }));
});

const calendarControls = createCalendarControlsPlugin();
const eventModal = createEventModalPlugin();

const calendarApp = shallowRef(null);
const calendarFormattedEvents = ref([]);

const getNumberAttendees = () => {
    events.value.forEach(event => {
        StudentEventServices.getAllStudentsByEvent(event.id)
            .then((res) => {
                const index = attendeeMap.value.findIndex(a => a.id === event.id);
                if (index >= 0) {
                    attendeeMap.value[index].attendees = res.data.length;
                } else {
                    attendeeMap.value.push({
                        id: event.id,
                        attendees: res.data.length
                    });
                }
            })
            .catch((err) => {
                console.error(err);
            });
    });
}

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
    await getNumberAttendees();
    await getAllMajors();
    await getAllStrengths();
});

const getAllMajors = () => {
    MajorServices.getAllMajors()
    .then((res) => {
        console.log(res.data);
        majorsList.value = res.data;
    })
    .catch((err) => {
        message.value = `Error: ${err.code}: ${err.message}`;
        console.error(err);
    });
}

const getAllStrengths = () => {
    CliftonStrengthServices.getAllCliftonStrengths()
    .then((res) => {
        console.log(res.data);
        strengthsList.value = res.data;
    })
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

const editEventPopup = async (task) => {
    eventCliftonStrengths.value = []
    eventCliftonStrengths.value = {
        cliftonStrengthsToAdd: []
    }
    strengthSelections.value = []
    eventMajors.value = {
        majorsToAdd: []
    }

    strengthLoading.value = false
    majorLoading.value = false
    strengthMenu.value = false
    majorMenu.value = false

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
            
            StudentEventServices.getAllStudentsByEvent(eventToEdit.value.id)
            .then((res) => {
                const students = res.data;
                studentNameList.value = []
                console.log(students)
                students.forEach(async student => {
                    UserServices.getAllStudentUsers(student.id)
                        .then((res) => {
                            studentNameList.value.push(res.data[0].prefix + " " + res.data[0].fName + " " + res.data[0].lName)
                        })
                        .catch((err) => {
                            message.value = `Error: ${err.code}: ${err.message}`;
                            console.error(err);
                        })
                });
            })
            .catch((err) => {
                message.value = `Error: ${err.code}: ${err.message}`;
                console.error(err);
            })
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

    eventCliftonStrengths.value = {
        cliftonStrengthsToAdd: []
    }
    strengthSelections.value = []
    eventMajors.value = {
        majorsToAdd: []
    }
    majorSelections.value = []

    strengthLoading.value = false
    majorLoading.value = false
    strengthMenu.value = false
    majorMenu.value = false
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
/* Ask Jenna abt this, since it's not used anywhere*/
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

.modal-body {
    box-sizing: border-box;
    text-align: center;
    gap: 8px;
}

.modal-body .v-list {
    padding: 0;
}

.search-field {
    margin-bottom: 8px;
}

.search-container {
    padding: 16px 24px;
    width: 100%;
    box-sizing: border-box;
}

.search-field {
    width: 100%;
}
</style>