<template>
    <div v-if="showEventDetails" class="modal edit-form-body">
        <v-card class="edit-popup mx-auto">
            <v-card-title class="popup-header">
                <v-text-field v-model="eventName" variant="outlined" density="compact" hide-details
                    :disabled="!eventAdd">
                </v-text-field>
            </v-card-title>

            <v-container>
                <!-- Description-->
                <v-row class="form-row">
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
                        <v-select v-model="eventStatus" :items="statusOptions" variant="solo-filled" density="compact"
                            hide-details class="filter-menu" disabled></v-select>
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
                <v-btn v-if="viewPersonalCalendar" @click="studentDeleteStudentEvent(eventId), showEventDetails = false"
                    color="#708E9A" variant="flat">Unregister</v-btn>
                <v-btn v-if="!viewPersonalCalendar && eventEdit"
                    @click="studentSignUpForEvent(eventId), showEventDetails = false" color="#5EC4B6" variant="flat"
                    style="color: white;">Register</v-btn>
                <v-btn v-if="eventAdd" @click="requestEvent(), showEventDetails = false" color="#5EC4B6" variant="flat"
                    style="color: white;">Request</v-btn>
                <v-btn color="#708E9A" variant="flat" @click="showEventDetails = false">Close</v-btn>

            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, watch, onMounted } from "vue";


</script>