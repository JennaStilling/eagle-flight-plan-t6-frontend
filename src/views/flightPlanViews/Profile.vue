<template>
    <div class="profile-info">
      <div class="profile-details">
        <div class="image-container">
            <img v-if="!hasImage" :src="blankImage">
            <img v-if="hasImage" :src="userInfo.image">
        </div>

        <div class="profile-text">
          <div v-if="userInfo" class="profile-name">{{ userInfo.fName }} {{ userInfo.lName }}</div>
          <div v-if="userInfo" class="profile-email">{{ userInfo.email }}</div>
          <!-- Role Title depending on homepage -->
          <div v-if="homeStore.getCurrentRole === UserRoles.ADMIN" class="profile-role">Admin</div>
          <div v-if="homeStore.getCurrentRole === UserRoles.PROFESSOR" class="profile-role">Professor</div>
          <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT && student" class="student-points">Current Points: {{ student.points }} | Total Points: {{ student.total_points }}</div>
          <!-- If Student, Display points -->

          <div class="btn-container">
            <button @click="toggleUpdateModal()">Edit Profile</button>
            <button @click="settings()">Settings</button>
          </div>
        </div>
      </div>
    </div>

    <!-- If Student, display badges -->
    <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT" class="badge-container">
      <div class="badge-header">
        Your Badges
      </div>
      <div class="badge-buffer"></div>
      <!-- For loop displaying students badges here -->
      <div class="badge-display" v-if="studentBadges">
        <div v-for="(badge, index) in badges" :key="index">
          <div class="badge-item">
            <div class="badge-image">
              <img :src="badge.image" :alt="badge.name">
            </div>
            <p class="badge-name">{{ badge.name }}</p>
            <p class="badge-date">{{ formatDate(studentBadges[index].date_acquired) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Profile Modal -->
    <div v-if="showProfileUpdate" class="modal">
      <div class="modal-content">
        <span @click="toggleUpdateModal()" class="close">&times;</span>
        <br>

        <div class="popup-header">
          <div class="update-image-container" @click="triggerFileInput">
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="fileUpload($event)"
            />
            <div v-if="userImage" class="image-preview">
              <img :src="userImage" alt="Uploaded Image" />
            </div>
            <div v-else class="image-preview">
              <img :src="blankImage">
            </div>
          </div>

          <input 
            type="text"
            class="name-input"
            v-model="userName"
          />
        </div>

        <div class="popup-content">
          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.phoneNumber }}</label>
            </v-col>
            <v-col>
              <textarea 
                class="input-field" 
                v-model="userPhoneNumber" 
                rows="2">
              </textarea>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.prefix }}</label>
            </v-col>
            <v-col>
              <textarea 
                class="input-field" 
                v-model="userPrefix" 
                rows="2">
              </textarea>
            </v-col>
          </v-row>
        </div>
        
        <div class="btn-container">
          <button class="save-btn" @click="updateUserInfo()">Save</button>
          <button class="cancel-btn" @click="toggleUpdateModal()">Cancel</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useHomePageStore, UserRoles, HomePages } from '@/store/homePageStore';
import { useRouter } from "vue-router";
import blankImage from "@/assets/blankProfile.jpg";
import Utils from "@/config/utils";
import userServices from "@/services/resumeBuilderServices/userServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import studentBadgeServices from "@/services/flightPlanServices/studentBadgeServices";
import badgeServices from "@/services/flightPlanServices/badgeServices";

const user = ref(null);
const router = useRouter();
const userInfo = ref(null);
const hasImage = ref(false);
const homeStore = useHomePageStore();
const initials = ref("");
const name = ref("");

// Update Profile Variables
const showProfileUpdate = ref(false);
const userName = ref("");
const userPhoneNumber = ref("");
const userPrefix = ref("");
const userImage = ref(null);
const userImageType = ref(null);

// Student Related Variables
const student = ref(null);
const studentBadges = ref(null);
const badges = ref([]);

const labels = {
  phoneNumber: "Phone Number",
  prefix: "Prefix"
};

onMounted(() => {
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }

  // Get User Information
  getUser();
});

const getUser = () => {
    userServices.getUser(user.value.userId)
        .then((res) => {
            userInfo.value = res.data;
            if (userInfo.value.image === null) hasImage.value = false;
            else hasImage.value = true;
            
            userName.value = userInfo.value.fName + " " + userInfo.value.lName;
            userPhoneNumber.value = userInfo.value.phone_number;
            userPrefix.value = userInfo.value.prefix;
            userImage.value = userInfo.value.image;
            userImageType.value = userInfo.value.image_type;

            if (homeStore.getCurrentRole === UserRoles.STUDENT) {
              // Get Student
              getStudent();
            }
        })
        .catch((error) => {
            console.log("Error: " + error)
        })
}

const getStudent = () => {
  studentServices.getStudent(userInfo.value.studentId)
    .then((res) => {
      student.value = res.data;
      // Get Badges
      getBadges();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getBadges = () => {
  studentBadgeServices.getAllStudentBadges(student.value.id)
    .then((res) => {
      studentBadges.value = res.data;
      getBadgeDetails(studentBadges.value);
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getBadgeDetails = (badgeArray) => {
  badgeArray.forEach(studentBadge => {
    badgeServices.getBadge(studentBadge.badgeId)
      .then((res) => {
        badges.value.push(res.data);
      })
      .catch((error) => {
        console.log("Error: " + error);
      })
  });
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

const settings = () => {
  router.push({ name: 'settings' });
}

// Update Functionality
const toggleUpdateModal = () => {
  showProfileUpdate.value = !showProfileUpdate.value;
}

const updateUserInfo = () => {
  toggleUpdateModal();

  const updateUser = {
    fName: userName.value.split(' ')[0],
    lName: userName.value.split(' ')[1],
    email: userInfo.value.email, // Does not change
    phone_number: userPhoneNumber.value,
    prefix: userPrefix.value,
    image: userImage.value.split(',')[1],
    image_type: userImageType.value
  }

  userServices.updateUser(userInfo.value.id, updateUser)
    .then((res) => {
      console.log("User updated successfully" + res);
      window.location.reload();
    })
    .catch((error) => {
      console.log("Error: " + error);
    });

  // If student, update student as well (Address and Grad date)
}

// Image Handling
const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.click();
};

const fileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Converts the file to Base64
        reader.onload = () => {
            const base64String = reader.result; 
            userImage.value = base64String; // Preview
            userImageType.value = file.type; // Saves the file type whenever the image changes
        };
    }
};
</script>

<style scoped>
.profile-info {
  padding: 30px 60px 20px 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(312px, 1fr));
  justify-content: start;
}

.profile-details {
  display: flex;
  align-items: center; 
  width: 100%;
  gap: 40px; 
}

.profile-text {
  display: flex;
  flex-direction: column; 
  justify-content: center; 
}

.profile-name {
  color: #000;
  font-family: Poppins;
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.profile-email {
  color: #000;
  font-family: Inter;
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 10px;
}

.profile-role {
  color: #202020;
  font-family: Poppins;
  font-size: 36px;
  font-style: italic;
  font-weight: 400;
  line-height: normal;
}

.student-points {
  color: #000;
  font-family: Poppins;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 10px
}

.btn-container {
  display: flex;
  gap: 20px; 
}

.profile-info button {
  flex-shrink: 0; 
  border-radius: 29px;
  background: #5EC4B6;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 10px 20px; 
  font-size: 18px;
  border: none;
  cursor: pointer;
  white-space: nowrap; 
  color: #FFF;
  text-align: center;
  font-family: Poppins;
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.image-container {
  width: 312px; 
  height: 312px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(32, 32, 32, 0.15);
  flex-shrink: 0; 
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Update Profile */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); 
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 90%; 
  width: fit-content; 
  height: fit-content; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update-image-container {
  position: relative; 
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  background: rgba(32, 32, 32, 0.15);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-preview img {
  position: absolute;
  top: 50%;  
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.popup-header {
  display: flex;
  text-align: center;
  width: 100%;
  gap: 16px;
  margin-bottom: 10px;
}

.popup-content {
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.form-row {
    display: flex;
    justify-content: flex-start;
}

.label-column {
  width: 150px;
  white-space: nowrap;
  text-align: right;
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

.label-description {
  color: #202020;
  text-align: right;
  font-family: Poppins;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

textarea,
.input-field {
  width: 70%;
  min-width: 400px;
  height: 42px; 
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(32, 32, 32, 0.15);
  font-size: 16px;
  color: #202020;
  padding: 8px 12px;
  transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border: none;
  outline: none;
  box-shadow: none;
  resize: none;
  text-align: left; 
}

.name-input {
  font-family: 'Poppins', sans-serif; 
  font-size: 32px; 
  padding-left: 10px;
  height: 150px; 
  text-align: left;
  width: 70%;
  min-width: 400px;
  border-radius: 10px;
  background: rgba(32, 32, 32, 0.15);
}

.input-field {
  font-family: 'Inter', sans-serif;
}

.v-row + .v-row {
    margin-top: 0px;
}

.v-col{
  padding: 0px 12px 0px 12px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 0px;
}

.save-btn {
  width: 160px;
  height: 60px;
  border-radius: 10px;
  background: #5EC4B6;

  /* Typography */
  color: #FFF;
  text-align: center;
  font-family: Poppins;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.cancel-btn {
  width: 160px;
  height: 60px;
  border-radius: 10px;
  background: rgba(32, 32, 32, 0.25);

  /* Typography */
  color: #FFF;
  text-align: center;
  font-family: Poppins;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

/* Badge Display */
.badge-container {
  position: relative;
  margin: 0px 60px 5px 60px;
  max-width: calc(100% - 120px);
  height: 100%;
  min-width: 950px;
  min-height: 350px;
  flex-shrink: 0;
  border-radius: 33px;
  background: #FAFAFA;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

  display: flex;
  flex-direction: column; 
  justify-content: center;
  align-items: center;
}

.badge-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px; 
  border-radius: 33px;
  background: #5EC4B6;
  z-index: 2; 

  display: flex;
  align-items: center;  
  justify-content: flex-start; 
  padding-left: 20px;

  /* Typography */
  color: #FAFAFA;
  font-family: Poppins;
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.badge-buffer {
  position: absolute;
  top: 40px; 
  left: 0;
  width: 100%;
  height: 40px; 
  background: #5EC4B6;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  z-index: 1; 
}

.badge-display {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-evenly;  /* Distribute items with equal space around them */
  align-items: flex-start;  /* Keep the items aligned to the top of the container */
  padding: 120px 20px 20px 20px;
  width: 100%;
  box-sizing: border-box;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 120px;
  height: 190px;
  flex-shrink: 0; 
}

.badge-image {
  width: 100px; 
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(32, 32, 32, 0.15);
}

.badge-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-name, .badge-date {
  margin: 5px 0;  
  font-size: 14px;
}
</style>