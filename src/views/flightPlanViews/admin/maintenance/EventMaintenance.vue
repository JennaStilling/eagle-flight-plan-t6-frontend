<!-- <script setup>
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  viewMonthAgenda,
  viewMonthGrid,
  viewWeek
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import {createDragAndDropPlugin} from "@schedule-x/drag-and-drop";
import {createScrollControllerPlugin} from "@schedule-x/scroll-controller";
import {createEventRecurrencePlugin, createEventsServicePlugin} from "@schedule-x/event-recurrence";
import {createEventModalPlugin} from "@schedule-x/event-modal";

import {ref, shallowRef} from "vue";
import {createCalendarControlsPlugin} from "@schedule-x/calendar-controls";

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
    end: '18:00',
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

</script>

<template>
  <div>
    <ScheduleXCalendar
        :calendar-app="calendarApp"
    >
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
</template>

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
</style> -->

<template>
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

              <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category"
                  variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>

              <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addEventPopup()">
                  Add Events
              </v-btn>
              <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedEvents(selected)">
                  Delete Selected Events
              </v-btn>

              <v-btn variant="plain" size="small" @click="editEventPopup(item)">
                  <Icon icon="material-symbols:calendar-month-outline" width="24" height="24" />
              </v-btn>
              <v-btn variant="plain" size="small" @click="deleteEventConfirmatoin(item)">
                  <Icon icon="material-symbols:format-list-bulleted" width="24" height="24" />
              </v-btn>
          </div>
      </div>

      <v-data-table :headers="headers" :items="filteredEvents" :search="search" v-model:selectable="selected"
          show-select>
          <template v-slot:[`item.actions`]="{ item }">
              <v-btn variant="plain" size="small" @click="editEventPopup(item)">
                  <Icon icon="material-symbols:edit-outline" width="24" height="24" />
              </v-btn>
              <v-btn variant="plain" size="small" @click="deleteEventConfirmatoin(item)">
                  <Icon icon="material-symbols:delete-outline" width="24" height="24" />
              </v-btn>
          </template>
      </v-data-table>
  </v-card>

  <div v-if="showDeleteItem" class="modal">
      <div class="modal-content">
          <div class="modal-header">
              <span @click="showDeleteItem = false" class="close">&times;</span>
              <p v-if="!deleteError">
                  Do you want to DELETE <br />
                  {{ categoryToDelete.name }}?
              </p>
              <p v-if="deleteError">
                  Error deleting<br />{{ categoryToDelete.name }}.
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
          <!-- Category-->
          <v-container class="popup-content">
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.category }}</label>
                  </v-col>

                  <v-col cols="7">
                      <v-select v-model="eventCategory" :items="categoryOptions" variant="solo-filled" density="compact"
                          hide-details class="filter-menu"></v-select>
                  </v-col>
              </v-row>

              <!-- Verification Type-->
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.verification }}</label>
                  </v-col>

                  <v-col cols="7">
                      <v-select v-model="eventVerificationType" :items="typeOptions" variant="solo-filled"
                          density="compact" hide-details class="filter-menu"></v-select>
                  </v-col>
              </v-row>

              <!-- Reflection Required-->
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.reflection }}</label>
                  </v-col>
                  <v-col cols="7">
                      <v-switch v-model="isRequired" hide-details></v-switch>
                  </v-col>
              </v-row>

              <!-- Frequency-->
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.schedule }}</label>
                  </v-col>

                  <v-col cols="7">
                      <v-select v-model="eventScheduleType" :items="frequencyOptions" variant="solo-filled"
                          density="compact" hide-details class="filter-menu"></v-select>
                  </v-col>
              </v-row>

              <!-- Description-->
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.description }}</label>
                  </v-col>
                  <v-col cols="7">
                      <v-textarea v-model="eventDescription" rows="3" variant="outlined" density="compact"></v-textarea>
                  </v-col>
              </v-row>

              <!-- Rationale-->
              <v-row class="form-row">
                  <v-col cols="5" class="label-column">
                      <label>{{ labels.rationale }}</label>
                  </v-col>

                  <v-col cols="7">
                      <v-textarea v-model="eventRationale" rows="3" variant="outlined" density="compact"
                          hide-details></v-textarea>
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
import { ref, computed, onMounted } from 'vue';
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
const categoryToDelete = ref(null);
const eventEdit = ref(false);
const eventAdd = ref(false);

const eventName = ref("");
const eventCategory = ref("");
const eventScheduleType = ref("");
const eventRationale = ref("");
const eventDescription = ref("");
const eventVerificationType = ref("")

const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = parseISO(dateTimeStr);
    return format(date, 'MM-dd-yyyy');
};

const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = parseISO(dateTimeStr);
    return format(date, 'hh:mm a');
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
const categoryOptions = ['Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer'];
const typeOptions = ['Automatic', 'Manual']
const frequencyOptions = ['One Time', 'Every Semester', 'Special Event']

const isRequired = ref(false);

const labels = {
  category: "Category",
  reflection: "Reflection Required?",
  schedule: "Frequency",
  description: "Description",
  rationale: "Rationale",
  verification: "Verification Type",
};

const filteredEvents = computed(() => {
  if (selectedFilter.value === 'All') {
      return events.value.map(event => ({
          ...event,
          formatted_date: formatDate(event.start_date_time),
          formatted_time: formatTime(event.start_date_time)
      }));
  }

  if (selectedFilter.value === 'Career Prep') {
      selectedFilter.value = 'career_prep'
  }

  return events.value.filter(event => {
      return event.category === selectedFilter.value.toLowerCase();
  }).map(event => ({
      ...event,
      formatted_date: formatDate(event.start_date_time),
      formatted_time: formatTime(event.start_date_time)
  }));
});

onMounted(() => {
  getAllEvents();
});

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
  eventVerificationType.value = capitalize(eventToEdit.value.type)
  eventCategory.value = capitalize(eventToEdit.value.category);
  eventRationale.value = eventToEdit.value.rationale;
  eventDescription.value = eventToEdit.value.description;
  isRequired.value = eventToEdit.value.reflection_required;
  eventName.value = eventToEdit.value.name;
  eventScheduleType.value = capitalize(eventToEdit.value.schedule_type);
};

function capitalize(s) {
  return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

const editEvent = () => {
  if (eventCategory.value === 'Career Prep') {
      eventCategory.value = 'career_prep'
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

  const updatedEvent = {
      category: eventCategory.value.toLowerCase(),
      type: eventVerificationType.value.toLowerCase(),
      req_reflection: isRequired.value,
      schedule_type: eventScheduleType.value.toLowerCase(),
      name: eventName.value,
      description: eventDescription.value,
      rational: eventRationale.value,
  };

  EventServices.updateEventType(eventToEdit.value.id, updatedEvent)
      .then((response) => {
          console.log("Task updated successfully:", response.data);
          showEventDetails.value = false;
          getAllEvents();
      })
      .catch((e) => {
          message.value = e.response.data.message;
          deleteError.value = true;
      });
};

const addEventPopup = () => {
  showEventDetails.value = true;
  eventAdd.value = true;
  eventEdit.value = false;
  eventToEdit.value = null;
  eventVerificationType.value = ""
  eventName.value = "";
  eventCategory.value = "";
  eventRationale.value = "";
  eventDescription.value = "";
  isRequired.value = false;
  eventScheduleType.value = "";
};

const addEvent = () => {
  if (eventCategory.value === 'Career Prep') {
      eventCategory.value = 'career_prep'
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

  const newEvent = {
      category: eventCategory.value.toLowerCase(),
      type: eventVerificationType.value.toLowerCase(),
      req_reflection: isRequired.value,
      schedule_type: eventScheduleType.value.toLowerCase(),
      name: eventName.value,
      description: eventDescription.value,
      rational: eventRationale.value,
  };

  console.log(newEvent)

  EventServices.createEventType(newEvent).then((response) => {
      showEventDetails.value = false;
      console.log("Task added successfully:", response.data);
      getAllEvents();
  })
      .catch((e) => {
          console.log(e)
          message.value = e.response.data.message;
          deleteError.value = true;
      });
}

const deleteEventConfirmatoin = (task) => {
  categoryToDelete.value = task;
  showDeleteItem.value = true
  console.log('Delete item:', categoryToDelete.value.name);
};

const deleteEvent = () => {
  EventServices.deleteEventType(categoryToDelete.value.id)
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
      console.log("Deleting selected category: ", selected);
      selected.forEach(category => {
          console.log("Deleting category: ", category.name);
          EventServices.deleteEventType(category.id)
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

</script>

<style>
/* @import "insert style sheet here later" */
</style>

<style scoped>
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