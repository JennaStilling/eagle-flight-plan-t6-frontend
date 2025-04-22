<template>
  <div class="sign-in-container">
    <v-card class="sign-in-card mx-auto my-8 pa-6" max-width="500">
      <h2 class="text-center mb-4">Event Sign-In</h2>
      
      <div v-if="event" class="mb-4">
        <h3 class="text-h5 mb-2">{{ event ? event.name : 'Loading event...' }}</h3>
        <p v-if="event.location" class="text-body-1 mb-1">Location: {{ event.location }}</p>
      </div>
      
      <v-divider class="mb-4"></v-divider>
      
      <v-text-field
        v-model="email"
        label="Email"
        outlined
        :disabled="displayUserInformation">
      </v-text-field>
      
      <div class="d-flex justify-center mt-4" v-if="!displayUserInformation">
        <v-btn 
        style="color: white"
          @click="signInToEvent" 
          color="#5EC4B6"
          block>
          Sign In
        </v-btn>
      </div>
      
      <div v-if="displayUserInformation" class="mt-4">
        <p class="text-subtitle-1 mb-3">Please enter the following information to complete your account:</p>
        
        <v-text-field
          v-model="fName"
          label="First Name"
          outlined
          class="mb-2">
        </v-text-field>
        
        <v-text-field
          v-model="lName"
          label="Last Name"
          outlined
          class="mb-2">
        </v-text-field>
        
        <v-text-field
          v-model="studentId"
          label="Student ID Number"
          outlined
          class="mb-4">
        </v-text-field>
        
        <v-btn 
          @click="createUser" 
          style="color: white"
          color="#5EC4B6"
          block>
          Create Account
        </v-btn>
      </div>

      <div v-if="signInSuccess" class="mt-4">
        <p class="text-subtitle-1 mb-3">{{ confirmationStatus }}</p>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import EventServices from '@/services/flightPlanServices/eventServices.js'
import StudentEventServices from '@/services/flightPlanServices/studentEventServices.js'
import StudentServices from '@/services/resumeBuilderServices/studentServices.js'
import UserServices from '@/services/resumeBuilderServices/userServices.js'
import UserRolePermissionServices from '@/services/flightPlanServices/userRolePermissionServices.js'
import UserRoleServices from '@/services/resumeBuilderServices/userRoleServices.js'

const route = useRoute()
const eventId = route.query.eventId;
const email = ref("")
const displayUserInformation = ref(false);
const event = ref(null)

const fName = ref("")
const lName = ref("")
const studentId = ref("")

const signInSuccess = ref(false);
const confirmationStatus = ref("")
const studentUser = ref([])

onMounted (() => {
    console.log(eventId)
    EventServices.getEvent(eventId).then((response) => {
        console.log(response.data)
        event.value = response.data
    }).catch((error) => {
        console.error(error)
    })
})

const signInToEvent = () => {
    confirmationStatus.value = ""
    if (email.value) {
       UserServices.getAllUsers()
       .then((res) => {
           const user = res.data.find(user => user.email === email.value);
           if (user) {
               UserServices.getAllStudentUsers(user.id)
               .then((res) => {
                console.log(res.data)
                  studentUser.value = {
                    userId: user.id,
                    studentId: res.data[0].id
                  }
                  console.log(studentUser.value)
                  signInSuccess.value = true;
                  addStudentEvent()
                  confirmationStatus.value = "You are now signed in! You may close this page.";
               })

           } else {
               confirmationStatus.value = ""
               displayUserInformation.value = true;
           }
       })
       .catch((err) => {
           console.error(err);
       });
    } else {
        alert("Please enter an email address");
    }
}

const createUser = () => {
  const newStudent = {
        student_issued_id: studentId.value,
        points: 0,
        total_points: 0
    }
    StudentServices.createStudent(newStudent)
      .then((res) => {
          const newUser = {
              fName: fName.value,
              lName: lName.value,
              email: email.value,
              studentId: res.data.id,
          }
          UserServices.createUser(newUser)
              .then((res) => {
                  const userId = res.data.id;
                  UserRoleServices.createUserRole(userId, {roleId: 2,})
                    .then((res) => {
                        UserRolePermissionServices.createUserRolePermission({
                            userRoleId: res.data.id,
                            permissionId: 8,
                            })
                            .then((res) => {
                                studentUser.value = {
                                  userId: userId,
                                  studentId: newUser.studentId
                                }
                                addStudentEvent();
                                signInSuccess.value = true;
                                confirmationStatus.value = "You are now signed in! You may close this page.";
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
          })
        .catch((err) => {
            console.log(err);
        });
}

const addStudentEvent = () => {
  const studentEvent = {
    eventId: event.value.id,
    studentId: studentUser.value.studentId,
    verification_status: "in_progress",
    attendance_status: "attended"
  }
  
  StudentEventServices.getAllEventsByStudent(studentEvent.studentId)
  .then((res) => {
    const event = res.data.find(e => 
      e.studentEvent[0].eventId === studentEvent.eventId
    );
    
    if (!event) {
      StudentEventServices.createStudentEvent(studentEvent)
          .catch((err) => {
            console.error(err);
        });
    } else {
      StudentEventServices.updateStudentEvent(event.id, studentEvent)
        .catch((err) => {
          console.error(err);
        });
    }
  })
  .catch((err) => {
    console.error(err);
  });
}
</script>

<style scoped>
.sign-in-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sign-in-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>