<template>
    <div>
        <v-card flat>
            <div class="title-row">
                <h1 class="table-title">Event Approvals</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>
                </div>
            </div>
        </v-card>
        <v-data-table :headers="headers" :items="filteredEvents" :search="search" v-model:selectable="selected"
            show-select @click:row="(event, { item }) => getStudentAttendees(item)">
        </v-data-table>

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
                        <v-list-item class="header-row">
                            <v-list-item-title class="font-weight-bold">Student Name</v-list-item-title>
                            <template v-slot:append>
                                <div class="font-weight-bold pr-8">Attended?</div>
                            </template>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item v-for="(student, index) in filteredStudentList" :key="index">
                            <v-list-item-title>{{ student.name }}</v-list-item-title>
                            <template v-slot:append>
                                <v-switch
                                    :model-value="student.isToggled"
                                    color="#708E9A"
                                    hide-details
                                    density="compact"
                                    class="ma-0 pa-0"
                                    @update:model-value="toggleStudent(student.name)"
                                ></v-switch>
                            </template>
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
import { ref, computed, shallowRef, onMounted, watch, nextTick } from 'vue';
import EventServices from '@/services/flightPlanServices/eventServices';
import StudentEventServices from '@/services/flightPlanServices/studentEventServices';
import UserServices from '@/services/resumeBuilderServices/userServices'
import { Icon } from "@iconify/vue";
import { format, parseISO, set } from 'date-fns';

const search = ref('');
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
const studentToggles = ref({}) // Add this to track toggle states

const studentSearchResult = ref('');

const filteredStudentList = computed(() => {
    if (!studentSearchResult.value) return studentNameList.value.map(student => ({
        name: student,
        isToggled: studentToggles.value[student] || false
    }));
    return studentNameList.value
        .filter(name => name.toLowerCase().includes(studentSearchResult.value.toLowerCase()))
        .map(student => ({
            name: student,
            isToggled: studentToggles.value[student] || false
        }));
});

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'formatted_date', title: 'Date' },
    { key: 'formatted_time', title: 'Time' },
    { key: 'location', title: 'Location' },
    { key: 'eventAttendees', title: '# Registered', sortable: false },
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

const showStudentNamesListPopup = async (event) => {
    await getStudentAttendees(event);
    showStudentNamesList.value = true;
} 

const getStudentAttendees = (event) => {
    StudentEventServices.getAllStudentsByEvent(event.id)
        .then((res) => {
            const students = res.data;
            studentNameList.value = []
            console.log("Here")
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
            showStudentNamesList.value = true;
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        })
}

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

const toggleStudent = (studentName) => {
    const student = filteredStudentList.value.find(s => s.name === studentName);
    if (student) {
        student.isToggled = !student.isToggled;
        studentToggles.value[studentName] = student.isToggled;
    }
};
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

.modal-body {
    box-sizing: border-box;
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

.header-row {
    background-color: #f5f5f5;
    pointer-events: none;
}
</style>