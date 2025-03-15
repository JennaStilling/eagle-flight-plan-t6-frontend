<template>
  <v-card flat>
    <div class="title-row">
      <h1 class="table-title">Events</h1>
      <div class="search-filter-button-group">
        <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
          class="search-bar">
          <template v-slot:prepend-inner>
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </template>
        </v-text-field>

        <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Type" variant="solo-filled"
          density="compact" hide-details class="filter-menu"></v-select>

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

    <div>
      <ScheduleXCalendar :calendar-app="calendarApp">
        <template #dateGridEvent="{ calendarEvent }">
          <div :style="eventStyles">
            {{ calendarEvent.title }}
            this is the date grid event template area
          </div>
        </template>

        <template #timeGridEvent="{ calendarEvent }">
          <div :style="eventStyles">
            {{ calendarEvent.title }}
            this is the time grid event template area
          </div>
        </template>

        <template #monthGridEvent="{ calendarEvent }">
          <div :style="eventStyles">
            {{ calendarEvent.title }}
            this is the month grid event template area
          </div>
        </template>

        <template #eventModal="{ calendarEvent }">
          <div :style="eventModalStyles">
            {{ calendarEvent.title }}
            this is the event modal template area
            <button @click="closeModal"></button>
          </div>
        </template>
      </ScheduleXCalendar>
    </div>
  </div>

  <div v-else>
    <v-data-table :headers="headers" :items="filteredEvents" :search="search" v-model:selectable="selected" show-select>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn variant="plain" size="small" @click="editEventPopup(item)">
          <Icon icon="material-symbols:edit-outline" width="24" height="24" />
        </v-btn>
        <v-btn variant="plain" size="small" @click="deleteEventConfirmatoin(item)">
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
        <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteEvent(task)">DELETE</v-btn>
        <v-btn v-if="deleteError" @click="
          deleteError = false;
        showDeleteItem = false;
        ">CLOSE</v-btn>
      </div>
    </div>
  </div>

  <div v-if="showEventDetails" class="modal edit-form-body">
    <v-card class="edit-popup mx-auto">
      <v-card-title class="popup-header">
        <v-text-field v-model="eventName">
          <Icon icon="material-symbols:edit-outline" width="24" height="24" />
        </v-text-field>

      </v-card-title>

      <v-divider></v-divider>
      <v-container class="popup-content">
        <!-- Description-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.description }}</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="eventDescription" rows="3" variant="outlined" density="compact"></v-textarea>
          </v-col>
        </v-row>

        <!-- Type-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.type }}</label>
          </v-col>

          <v-col cols="7">
            <v-select v-model="eventType" :items="eventTypes" variant="solo-filled" density="compact" hide-details
              class="filter-menu"></v-select>
          </v-col>
        </v-row>

        <!-- Date -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.date }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="eventDate" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Start Time -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.start }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="eventStartTime" type="time" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- End Time  -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.end }}</label>
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
            <v-text-field v-model="eventLocation" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Attendance Type -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.attendance }}</label>
          </v-col>

          <v-col cols="7">
            <v-select v-model="eventAttendanceType" :items="attendanceTypes" variant="solo-filled" density="compact"
              hide-details class="filter-menu"></v-select>
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
            <v-select v-model="eventStatus" :items="statusOptions" variant="solo-filled" density="compact" hide-details
              class="filter-menu"></v-select>
          </v-col>
        </v-row>

        <!-- Point Value -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.points }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="eventPointValue" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="popup-actions">
        <v-spacer></v-spacer>
        <v-btn v-if="eventEdit" color="#F04E3E" variant="flat">Delete</v-btn>
        <v-btn color="#708E9A" variant="flat" @click="showEventDetails = false">Cancel</v-btn>
        <v-btn color="#5EC4B6" variant="flat" style="color: white;"
          @click="eventEdit ? editEvent() : addEvent()">Save</v-btn>

      </v-card-actions>
    </v-card>
  </div>

</template>

<script setup>

import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  viewMonthAgenda,
  viewMonthGrid,
  viewWeek
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createScrollControllerPlugin } from "@schedule-x/scroll-controller";
import { createEventRecurrencePlugin, createEventsServicePlugin } from "@schedule-x/event-recurrence";
import { createEventModalPlugin } from "@schedule-x/event-modal";

import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";

import { ref, computed, shallowRef, onMounted } from 'vue';
import EventServices from '@/services/flightPlanServices/eventServices';
import { Icon } from "@iconify/vue";
import { format, parseISO } from 'date-fns';

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
const eventRationale = ref("");
const eventDescription = ref("");
const eventVerificationType = ref("")
const eventDate = ref("")
const eventStartTime = ref("")
const eventEndTime = ref("")
const eventLocation = ref("")
const eventAttendanceType = ref("")
const eventCustomEvent = ref(false)
const eventStatus = ref("")
const eventPointValue = ref("")
const dateMenu = ref(false)
const startTimeMenu = ref(false);
const endTimeMenu = ref(false);

const formattedDate = computed(() => {
  if (!eventDate.value) return '';
  return formatDate(eventDate.value);
});

const formattedStartTime = computed(() => {
  if (!eventStartTime.value) return '';
  return formatTime(eventStartTime.value);
});

const formattedEndTime = computed(() => {
  if (!eventEndTime.value) return '';
  return formatTime(eventEndTime.value);
});

const showCalendarView = ref(true);

const toggleCalendarView = computed(() => {
  showCalendarView.value = true;
})

const toggleListView = computed(() => {
  showCalendarView.value = false;
})

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
//('club','extra_curricular','career_fair','mentoring','career_services','lunch_and_learn','galup_strengths_class'
const typeOptions = ['Automatic', 'Manual']
const frequencyOptions = ['One Time', 'Every Semester', 'Special Event']
const statusOptions = ['Scheduled', 'In Progress', 'Completed', 'Finished']
// 'scheduled','in_progress','completed','finished'
const attendanceTypes = ['In Person', 'Online']
// 'in_person', 'online'

const isRequired = ref(false);

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

onMounted(() => {
  showCalendarView.value = false;
  getAllEvents();
});

const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  try {
    // Handle ISO date string from API
    if (dateTimeStr.includes('T')) {
      const date = parseISO(dateTimeStr);
      return format(date, 'MM-dd-yyyy');
    }
    // Handle date picker string (YYYY-MM-DD)
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
    // Handle ISO date string from API
    if (dateTimeStr.includes('T')) {
      const date = parseISO(dateTimeStr);
      return format(date, 'HH:mm');
    }
    // Handle direct time input
    return dateTimeStr;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const formatTimeForInput = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  try {
    if (dateTimeStr.includes('T')) {
      // Handle ISO date string from API
      const date = parseISO(dateTimeStr);
      return format(date, 'HH:mm');
    }
    // Handle direct time input
    return dateTimeStr;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const getAllEvents = () => {
  EventServices.getAllEvents()
    .then((res) => {
      events.value = res.data;
      message.value = '';
    })
    .catch((err) => {
      message.value = `Error: ${err.code}: ${err.message}`;
      console.error(err);
    });
}

const editEventPopup = (task) => {
  eventToEdit.value = task;
  showEventDetails.value = true;
  eventEdit.value = true;
  eventAdd.value = false;

  eventName.value = eventToEdit.value.name;
  eventDescription.value = eventToEdit.value.description;
  eventType.value = capitalize(eventToEdit.value.event_type);

  // Extract date from start_date_time or date field
  if (eventToEdit.value.start_date_time) {
    // For start_date_time, extract just the date part (yyyy-MM-dd)
    eventDate.value = eventToEdit.value.start_date_time.split('T')[0];
  } else if (eventToEdit.value.date) {
    // For date field, try to parse and format if needed
    try {
      const dateTime = parseISO(eventToEdit.value.date);
      eventDate.value = format(dateTime, 'yyyy-MM-dd');
    } catch (error) {
      // If parsing fails, use the date as is (it might already be in yyyy-MM-dd format)
      eventDate.value = eventToEdit.value.date;
    }
  }

  // Extract time from start_date_time and end_date_time
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

  // Combine date and time for start_date_time and end_date_time
  const date = parseISO(eventDate.value);
  const [startHours, startMinutes] = eventStartTime.value.split(':');
  const [endHours, endMinutes] = eventEndTime.value.split(':');

  const startDateTime = new Date(date);
  startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

  const endDateTime = new Date(date);
  endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

  const updatedEvent = {
    name: eventName.value,
    description: eventDescription.value,
    event_type: eventType.value.toLowerCase(),
    date: eventDate.value,
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
      console.log("Event updated successfully:", response.data);
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
  eventDate.value = "";
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

  if(eventAttendanceType.value === 'In Person') {
    eventAttendanceType.value = 'in_person'
  }

  // Combine date and time for start_date_time and end_date_time
  const date = parseISO(eventDate.value);
  const [startHours, startMinutes] = eventStartTime.value.split(':');
  const [endHours, endMinutes] = eventEndTime.value.split(':');

  const startDateTime = new Date(date);
  startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

  const endDateTime = new Date(date);
  endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

  const newEvent = {
    name: eventName.value,
    description: eventDescription.value,
    event_type: eventType.value.toLowerCase(),
    date: eventDate.value,
    start_date_time: startDateTime.toISOString(),
    end_date_time: endDateTime.toISOString(),
    location: eventLocation.value,
    attendance_type: eventAttendanceType.value.toLowerCase(),
    custom: eventCustomEvent.value,
    status: eventStatus.value.toLowerCase(),
    point_value: eventPointValue.value
  };

  console.log(newEvent)

  EventServices.createEvent(newEvent).then((response) => {
    showEventDetails.value = false;
    console.log("Task added successfully:", response.data);
    getAllEvents();
  })
    .catch((e) => {
      console.log(e.response.data)
      message.value = e.response.data.message;
      deleteError.value = true;
    });
}

const deleteEventConfirmatoin = (task) => {
  typeToDelete.value = task;
  showDeleteItem.value = true
  console.log('Delete item:', typeToDelete.value.name);
};

const deleteEvent = () => {
  EventServices.deleteEvent(typeToDelete.value.id)
    .then((res) => {
      showDeleteItem.value = false;
      getAllEvents();
    })
    .catch((e) => {
      message.value = e.res.data.message;
      deleteError.value = true;
    });
};

const deleteSelectedEvents = (selected) => {
  if (selected.length > 0) {
    console.log("Deleting selected type: ", selected);
    selected.forEach(type => {
      console.log("Deleting type: ", type.name);
      EventServices.deleteEventType(type.id)
        .then((res) => {
          showDeleteItem.value = false;
          getAllEvents();
        })
        .catch((e) => {
          message.value = e.res.data.message;
          deleteError.value = true;
        });
    });
  } else {
    console.log("No tasks selected.");
  }
}

const eventsService = createEventsServicePlugin();
const calendarControls = createCalendarControlsPlugin();
const eventModal = createEventModalPlugin();

const calendarApp = shallowRef(createCalendar({
  selectedDate: '2024-06-28',
  locale: 'en-US',
  views: [viewMonthAgenda, viewMonthGrid, viewWeek],
  defaultView: viewWeek.name,
  dayBoundaries: {
    start: '06:00',
    end: '21:00',
  },
  firstDayOfWeek: 0,
  plugins: [
    eventModal,
    createDragAndDropPlugin(),
    createScrollControllerPlugin({
      initialScroll: '07:00'
    }),
    createEventRecurrencePlugin(),
    eventsService,
    calendarControls
  ],
  events: [
    {
      id: 1,
      start: '2024-06-28',
      end: '2024-06-28',
      title: 'hi',
      calendarId: 'work',
    },
    {
      id: 2,
      start: '2024-06-28 08:00',
      end: '2024-06-28 10:00',
      title: 'hi again',
      calendarId: 'work',
    },
  ],
  monthGridOptions: {
    nEventsPerDay: 6,
  },
  weekOptions: {
    gridHeight: screen.height * .5,
  },
  callbacks: {
    onClickDate(date) {
      calendarControls.setView(viewWeek.name);
      calendarControls.setDate(date);
    }
  }
}))

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

</script>

<style>
/* @import "insert style sheet here later" */
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
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
</style>