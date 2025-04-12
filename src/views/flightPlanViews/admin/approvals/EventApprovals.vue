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
                    <input type="file" accept=".csv" @change="handleFileUpload" />
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
                                <v-switch v-model="student.didAttend" color="#708E9A" hide-details density="compact"
                                    class="ma-0 pa-0"></v-switch>
                            </template>
                        </v-list-item>
                    </v-list>
                    <div v-if="filteredStudentList.length === 0" class="text-center pa-4">
                        {{ studentSearchResult ? 'No matching students found' : 'No students requesting approval'
                        }}
                    </div>
                </div>
                <v-divider></v-divider>
                <v-card-actions class="popup-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="#708E9A" variant="flat"
                        @click="showStudentNamesList = false; showEventDetails = true;">Close</v-btn>
                    <v-btn color="#5EC4B6" style="color: white" variant="flat"
                        @click="showStudentNamesList = false; showEventDetails = true; saveAttendanceDetails();">Save</v-btn>

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
import StudentServices from '@/services/resumeBuilderServices/studentServices'
import UserRolePermissionServices from '@/services/flightPlanServices/userRolePermissionServices';
import { Icon } from "@iconify/vue";
import { format, parseISO, set } from 'date-fns';
import studentServices from '@/services/resumeBuilderServices/studentServices';
import Papa from 'papaparse'

const jsonData = ref([])
const formattedData = ref([])
const search = ref('');
const events = ref([]);
const message = ref('');
const selected = ref([]);
const showEventDetails = ref(false);
const showStudentNamesList = ref(false);
const selectedFilter = ref('All');

const currentDate = ref([])

const eventStartDate = ref("")
const eventEndDate = ref("")
const selectedEvent = ref(null);

const studentNameList = ref([{
    studentId: null,
    name: null,
    didAttend: false,
    eventId: null,
    studentSchoolId: null,
    pointValue: 0
}])
const attendeeMap = ref([])
const studentToggles = ref({})

const studentSearchResult = ref('');

const filteredStudentList = computed(() => {
    if (!studentSearchResult.value) return studentNameList.value;
    return studentNameList.value
        .filter(student => student.name.toLowerCase().includes(studentSearchResult.value.toLowerCase()));
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

const handleFileUpload = (event) => {
    StudentServices.getAllStudents()
        .then((res) => {
            const studentList = res.data;
            console.log(studentList)



            const file = event.target.files[0]
            if (file) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        jsonData.value = results.data
                        console.log(jsonData.value)
                        jsonData.value.forEach(student => {
                            const existingStudent = studentNameList.value.find(existingStudent => existingStudent.studentSchoolId === student.Username);
                            if (existingStudent)
                                studentNameList.value.push({
                                    studentId: null,
                                    name: student["First Name"] + " " + student["Last Name"],
                                    didAttend: student["Checked In"] !== "",
                                    eventId: event.id,
                                    studentSchoolId: student.Username,
                                    pointValue: event.point_value
                                })
                            else {
                                const newStudent = {
                                    student_issued_id: student["Username"],
                                    points: 0,
                                    total_points: 0
                                }
                                StudentServices.createStudent(newStudent)
                                    .then((res) => {
                                        const newUser = {
                                            fName: student["First Name"],
                                            lName: student["Last Name"],
                                            email: student["Email Address"],
                                            studentId: res.data.id,
                                        }
                                        UserServices.createUser(newUser)
                                            .then((res) => {
                                                const userId = res.data.id;
                                                // TODO - add permissions
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                            });
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                    });
                            }
                        })
                    }
                })
            }
        })
        .catch((err) => {
            console.error(err);
        });
}
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
                        attendees: res.data.length,
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
            events.value = res.data.filter(event => new Date(event.date) <= new Date(currentDate.value));

        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
};

onMounted(async () => {
    currentDate.value = new Date().toJSON().slice(0, 24);
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
    selectedEvent.value = event;
    StudentEventServices.getAllStudentsByEvent(event.id)
        .then((res) => {
            const students = res.data.filter((student) => student.studentEvent[0].verification_status === 'in_progress');
            studentNameList.value = []

            students.forEach(async student => {
                UserServices.getAllStudentUsers(student.id)
                    .then((res) => {
                        console.log(event)
                        studentNameList.value.push({
                            studentId: student.id,
                            name: res.data[0].prefix + " " + res.data[0].fName + " " + res.data[0].lName,
                            didAttend: student.studentEvent[0].attendance_status === 'attended' ? true : false,
                            eventId: student.studentEvent[0].id,
                            studentSchoolId: student.student_issued_id,
                            pointValue: event.point_value
                        });
                    })
                    .catch((err) => {
                        message.value = `Error: ${err.code}: ${err.message}`;
                        console.error(err);
                    })
            }
            );
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

const saveAttendanceDetails = () => {
    console.log("Printing now")
    console.log(filteredStudentList.value)
    filteredStudentList.value.forEach(student => {
        const newData = {
            attendance_status: student.didAttend ? "attended" : "did_not_attend",
            verification_status: student.didAttend ? "approved" : "denied"
        }
        StudentEventServices.updateStudentEvent(student.eventId, newData)
            .then((res) => {
                if (newData.verification_status !== 'denied' && newData.attendance_status !== 'did_not_attend') {
                    studentServices.getStudent(student.studentId)
                        .then((res) => {
                            console.log(res.data.points)
                            console.log(res.data.total_points)
                            console.log(student.pointValue)
                            const newCurrentPointValue = res.data.points + student.pointValue;
                            const newTotalPoints = res.data.total_points + student.pointValue;
                            const newStudentData = {
                                points: newCurrentPointValue,
                                total_points: newTotalPoints
                            }
                            console.log(newStudentData)
                            studentServices.updateStudent(student.studentId, newStudentData)
                                .then((res) => {
                                    console.log(res.data)
                                })
                                .catch((err) => {
                                    message.value = `Error: ${err.code}: ${err.message}`;
                                    console.error(err);
                                })
                        })
                        .catch((err) => {
                            message.value = `Error: ${err.code}: ${err.message}`;
                            console.error(err);
                        })

                }
            }
            )
    });
}

const toggleStudent = (studentName) => {
    const student = studentNameList.value.find(s => s.name === studentName);
    if (student) {
        student.didAttend = !student.didAttend;
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