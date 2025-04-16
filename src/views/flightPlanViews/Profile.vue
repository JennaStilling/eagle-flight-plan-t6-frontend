<template>
  <div class="profile-info">
    <!-- Add action buttons at the top-right corner -->
    <div class="profile-actions">
      <button @click="toggleUpdateModal()">Edit Profile</button>
      <button @click="settings()">Settings</button>
    </div>

    <div class="profile-details">
      <div class="image-container" @click="toggleUpdateModal()">
        <img v-if="!hasImage" :src="blankImage">
        <img v-if="hasImage" :src="userInfo.image">
      </div>

      <div class="profile-text">
        <div v-if="userInfo" class="profile-name">{{ userInfo.fName }} {{ userInfo.lName }}</div>
        <div v-if="userInfo" class="profile-email">{{ userInfo.email }}</div>

        <!-- Role Title depending on homepage -->
        <div v-if="homeStore.getCurrentRole === UserRoles.ADMIN" class="profile-role">Admin</div>
        <div v-if="homeStore.getCurrentRole === UserRoles.PROFESSOR" class="profile-role">Professor</div>
        <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT && student" class="student-points">Current Points: {{
          student.points }} | Total Points: {{ student.total_points }}</div>

        <!-- Display Student Majors -->
        <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT && studentMajors.length > 0" class="student-majors" style="font-weight: 700;">
          Major{{ studentMajors.length > 1 ? 's' : '' }}:
            <span v-if="studentMajors[0]" class="major-name" style="font-weight: 500;">{{ studentMajors[0].name }}</span>
            <span v-if="studentMajors.length > 1">
            <span class="major-separator">|</span>
            <span class="major-name" style="font-weight: 500;">{{ studentMajors[1].name }}</span>
            <span v-if="studentMajors.length > 2" class="more-majors" style="font-weight: 500;">(+{{ studentMajors.length - 2 }} more)</span>
            </span>
          <span class="edit-majors" @click="editStudentMajors">Edit</span>
        </div>

        <!-- Display Add Major option if student doesn't have an major yet-->
        <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT && studentMajors.length === 0" class="student-majors" style="font-weight: 700;">
          Major: <span class="major-name" style="font-weight: 500; font-style: italic;">None selected</span>
          <span class="edit-majors" @click="editStudentMajors">Add</span>
        </div>
      </div>
    </div>
  </div>

  <!-- If Student, display badges -->
  <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT" class="badge-container">
    <div class="badge-header">
      Your Badges
      <span class="view-all" @click="goToStudentBadges">View All</span>
    </div>
    <div class="badge-buffer"></div>
    <!-- For loop displaying students badges here -->
    <div class="badge-display" v-if="studentBadges">
      <div v-for="(badge, index) in badges" :key="index">
        <div class="badge-item">
          <img :src="badge.image" :alt="badge.name" class="badge-image">
          <p class="badge-name">{{ badge.name }}</p>
          <p class="badge-date">{{ formatDate(studentBadges[index].date_acquired) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Clifton Strengths Display -->
  <div v-if="homeStore.getCurrentRole === UserRoles.STUDENT" class="strengths-container">
    <div class="strengths-header">
      Your Clifton Strengths
      <span class="view-all" @click="goToStudentStrengths">
        {{ strengthsArray.length > 0 ? 'Edit' : 'Add' }}
      </span>
    </div>
    <div class="strengths-buffer"></div>

    <div class="strengths-display" v-if="strengthsArray.length > 0">
      <div v-for="(strength, index) in strengthsArray" :key="index" class="strength-item"
        @click="showStrengthDescription(strength)">
        <div class="strength-icon" :class="`category-${strength.category}`">
          {{ strength.name.charAt(0) }}
        </div>
        <p class="strength-name">{{ strength.name }}</p>
        <p class="strength-category">{{ formatCategory(strength.category) }}</p>
      </div>
    </div>

    <div v-else class="no-strengths">
      No Clifton Strengths found.
    </div>
  </div>


  <!-- Update Profile Modal -->
  <div v-if="showProfileUpdate" class="modal">
    <div class="modal-content">
      <!-- Close Button -->
      <button class="close-btn" @click="toggleUpdateModal()">&times;</button>

      <!-- Left Column: Profile Image -->
      <div class="modal-left">
        <div class="modal-image-container" @click="triggerFileInput">
          <input type="file" ref="fileInput" style="display: none" @change="fileUpload($event)" />
          <img :src="userImage || blankImage" alt="Profile Image" />
        </div>
      </div>

      <!-- Right Column: Form Fields -->
      <div class="modal-right">
        <h2 class="form-title">Edit Profile</h2>

        <div class="name-input-wrapper">
          <label class="input-label" for="name-input">First &amp; Last Name</label>
          <div class="name-input-container">
            <input type="text" class="name-input" v-model="userFirstName" placeholder="First Name" />
            <input type="text" class="name-input" v-model="userLastName" placeholder="Last Name" />
          </div>
        </div>

        <div class="form-row">
          <label for="phone-number">Phone Number</label>
          <input id="phone-number" type="text" class="input-field" v-model="userPhoneNumber" />
        </div>

        <div class="form-row">
          <label for="prefix">Prefix</label>
          <v-select id="prefix" v-model="userPrefix" :items="prefixOptions"></v-select>
        </div>

        <div class="btn-container">
          <button class="cancel-btn" @click="toggleUpdateModal()">Cancel</button>
          <button class="save-btn" @click="updateUserInfo()">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Clifton Strengths Edit Modal -->
  <div v-if="showStrengthsModal" class="cs-modal" @click="showStrengthsModal = false"
    @click.self="showStrengthsModal = false">
    <div class="cs-modal-content" @click.stop>
      <span @click="showStrengthsModal = false" class="csd-close">&times;</span>
      <h2 class="cs-title">Edit Your Clifton Strengths</h2>
      <p class="cs-description">Select up to 5 strengths that represent you best.</p>

      <!-- Selected Strengths Section -->
      <div class="cs-selected-section">
        <h3>Your Selected Strengths ({{ selectedStrengths.length }}/5)</h3>
        <div class="cs-selected-container">
          <div v-for="strength in selectedStrengths" :key="strength.id" class="cs-selected-item">
            <div class="cs-strength-badge" :class="`category-${strength.category}`">
              {{ strength.name.charAt(0) }}
            </div>
            <div class="cs-strength-info">
              <div class="cs-strength-name">{{ strength.name }}</div>
              <div class="cs-strength-category">{{ formatCategory(strength.category) }}</div>
            </div>
            <button class="cs-remove-btn" @click="toggleStrength(strength)">&times;</button>
          </div>
          <div v-if="selectedStrengths.length === 0" class="cs-no-selected">
            No strengths selected yet. Choose from the list below.
          </div>
        </div>
      </div>

      <!-- Available Strengths Section -->
      <div class="cs-available-section">
        <h3>Available Strengths</h3>
        <input type="text" v-model="searchQuery" placeholder="Search by name or category" class="cs-search" />
        <div class="cs-available-container">
          <div v-for="strength in filteredStrengths" :key="strength.id" @click="toggleStrength(strength)"
            class="cs-available-item" :class="{ 'cs-selected': isStrengthSelected(strength.id) }">
            <div class="cs-strength-badge" :class="`category-${strength.category}`">
              {{ strength.name.charAt(0) }}
            </div>
            <div class="cs-strength-info">
              <div class="cs-strength-name">{{ strength.name }}</div>
              <div class="cs-strength-category">{{ formatCategory(strength.category) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="cs-footer">
        <button class="cs-save-btn" @click="saveStrengths">Save Changes</button>
        <button class="cs-cancel-btn" @click="showStrengthsModal = false">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Clifton Strength Description Modal -->
  <div v-if="showStrengthDescriptionModal" class="csd-modal" @click="showStrengthDescriptionModal = false">
    <div class="csd-modal-content" @click.stop>
      <span @click="showStrengthDescriptionModal = false" class="csd-close">&times;</span>

      <div v-if="selectedStrengthForDescription" class="csd-content">
        <div class="csd-header">
          <div class="csd-strength-badge" :class="`category-${selectedStrengthForDescription.category}`">
            {{ selectedStrengthForDescription.name.charAt(0) }}
          </div>
          <div class="csd-title-area">
            <h2 class="csd-title">{{ selectedStrengthForDescription.name }}</h2>
            <p class="csd-category">{{ formatCategory(selectedStrengthForDescription.category) }}</p>
          </div>
        </div>

        <div class="csd-description">
          <p>{{ selectedStrengthForDescription.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Student Majors Edit Modal -->
  <div v-if="showMajorsModal" class="major-modal" @click.self="showMajorsModal = false">
    <div class="major-modal-content" @click.stop>
      <span @click="showMajorsModal = false" class="major-close">&times;</span>
      <h2 class="major-title">Edit Your Majors</h2>
      <p class="major-description">Select your major(s)</p>

      <!-- Selected Majors Section -->
      <div class="major-selected-section">
        <h3>Your Selected Majors ({{ selectedMajors.length }})</h3>
        <div class="major-selected-container">
          <div v-for="major in selectedMajors" :key="major.id" class="major-selected-item">
            <div class="major-badge">
              {{ major.name.charAt(0) }}
            </div>
            <div class="major-info">
              <div class="major-name">{{ major.name }}</div>
              <div class="major-department">{{ major.department || 'No department' }}</div>
            </div>
            <button class="major-remove-btn" @click="toggleMajor(major)">&times;</button>
          </div>
          <div v-if="selectedMajors.length === 0" class="major-no-selected">
            No majors selected yet. Choose from the list below.
          </div>
        </div>
      </div>

      <!-- Available Majors Section -->
      <div class="major-available-section">
        <h3>Available Majors</h3>
        <input type="text" v-model="majorSearchQuery" placeholder="Search by name or department" class="major-search" />
        <div class="major-available-container">
          <div v-for="major in filteredMajors" :key="major.id" @click="toggleMajor(major)" class="major-available-item"
            :class="{ 'major-selected': isMajorSelected(major.id) }">
            <div class="major-badge">
              {{ major.name.charAt(0) }}
            </div>
            <div class="major-info">
              <div class="major-name">{{ major.name }}</div>
              <div class="major-department">{{ major.department || 'No department' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="major-footer">
        <button class="major-save-btn" @click="saveMajors">Save Changes</button>
        <button class="major-cancel-btn" @click="showMajorsModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useHomePageStore, UserRoles, HomePages } from '@/store/homePageStore';
import { useRouter } from "vue-router";
import blankImage from "@/assets/blankProfile.jpg";
import Utils from "@/config/utils";
import userServices from "@/services/resumeBuilderServices/userServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import studentBadgeServices from "@/services/flightPlanServices/studentBadgeServices";
import badgeServices from "@/services/flightPlanServices/badgeServices";
import studentCliftonStrengthServices from "@/services/flightPlanServices/studentCliftonStrengthServices";
import cliftonStrengthServices from "@/services/flightPlanServices/cliftonStrengthServices";
import studentMajorServices from "@/services/flightPlanServices/studentMajorServices";
import majorServices from "@/services/flightPlanServices/majorServices";
import "@/assets/generic-stylesheet.css";

const user = ref(null);
const router = useRouter();
const userInfo = ref(null);
const hasImage = ref(false);
const homeStore = useHomePageStore();
const initials = ref("");
const name = ref("");

// Update Profile Variables
const showProfileUpdate = ref(false);
const userFirstName = ref("");
const userLastName = ref("");
const userPhoneNumber = ref("");
const userPrefix = ref("");
const userImage = ref(null);
const userImageType = ref(null);
const prefixOptions = ['Mr. ', 'Mrs. ', 'Ms. ', 'Professor', 'Dr. '];

// Student Related Variables
const student = ref(null);
const studentBadges = ref(null);
const studentMajors = ref([]);
const badges = ref([]);
const majors = ref([]);
const strengthsArray = ref([]);
const showStrengthsModal = ref(false);
const allCliftonStrengths = ref([]);
const selectedStrengths = ref([]);
const searchQuery = ref('');
const showStrengthDescriptionModal = ref(false);
const selectedStrengthForDescription = ref(null);
const showMajorsModal = ref(false);
const selectedMajors = ref([]);
const majorSearchQuery = ref('');


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

  getUser();
  getAllMajors();
});

const getUser = () => {
  userServices.getUser(user.value.userId)
    .then((res) => {
      userInfo.value = res.data;
      if (userInfo.value.image === null) hasImage.value = false;
      else hasImage.value = true;

      userFirstName.value = userInfo.value.fName;
      userLastName.value = userInfo.value.lName;
      userPhoneNumber.value = userInfo.value.phone_number;
      userPrefix.value = userInfo.value.prefix;
      userImage.value = userInfo.value.image;
      userImageType.value = userInfo.value.image_type;

      if (homeStore.getCurrentRole === UserRoles.STUDENT) {
        // Get Student
        getStudent();

        //console.log("Student ID: " + userInfo.value.studentId);
        getCliftonStrengths(userInfo.value.studentId);
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
      // Get student's major
      getStudentMajor(student.value.id);
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

const getCliftonStrengths = (studentId) => {
  //console.log("Fetching Clifton Strengths for student ID:", studentId);

  // Step 1: Fetch all Clifton Strengths
  cliftonStrengthServices
    .getAllCliftonStrengths()
    .then((cliftonStrengthsRes) => {
      const cliftonStrengths = cliftonStrengthsRes.data;
      //console.log("Clifton Strengths:", cliftonStrengths);

      // Step 2: Fetch all Student Clifton Strengths for this student
      studentCliftonStrengthServices
        .getAllSystemStudentCliftonStrengths()
        .then((studentStrengthsRes) => {
          // Filter to get only this student's strengths
          const studentStrengths = studentStrengthsRes.data.filter(
            (strength) => strength.studentId == studentId // Use == for type coercion
          );

          //console.log("Student Clifton Strengths for student " + studentId + ":", studentStrengths);

          // Step 3: Match Clifton Strengths with Student Clifton Strengths
          strengthsArray.value = cliftonStrengths
            .filter((cliftonStrength) => {
              // Check if there's a matching studentCliftonStrength
              return studentStrengths.some(
                (studentStrength) =>
                  studentStrength.cliftonStrengthId == cliftonStrength.id
              );
            })
            .slice(0, 5) // Limit to the first 5 strengths
            .map((cliftonStrength) => ({
              id: cliftonStrength.id,
              name: cliftonStrength.name,
              description: cliftonStrength.description,
              category: cliftonStrength.category,
            }));

          // Log the final strengths array
          //console.log("Strengths Array (limited to 5):", strengthsArray.value);

          if (strengthsArray.value.length === 0) {
            console.warn("No strengths found for student ID " + studentId);

            // Debug logs for troubleshooting
            console.log("Student Strength IDs:", studentStrengths.map((s) => s.cliftonStrengthId));
            console.log("Clifton Strength IDs:", cliftonStrengths.map((s) => s.id));
          }
        })
        .catch((error) => {
          console.error("Error fetching Student Clifton Strengths:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching Clifton Strengths:", error);
    });
};

const toggleStrength = (strength) => {
  const index = selectedStrengths.value.findIndex(s => s.id === strength.id);

  if (index >= 0) {
    // Remove strength if already selected
    selectedStrengths.value.splice(index, 1);
  } else if (selectedStrengths.value.length < 5) {
    // Add strength if less than 5 are selected
    selectedStrengths.value.push(strength);
  } else {
    // Alert user they can only select 5
    alert("You can only select 5 Clifton Strengths. Please remove one before adding another.");
  }
};

const isStrengthSelected = (strengthId) => {
  return selectedStrengths.value.some(s => s.id === strengthId);
};

const showStrengthDescription = (strength) => {
  selectedStrengthForDescription.value = strength;
  showStrengthDescriptionModal.value = true;
};

const saveStrengths = () => {
  // Get student ID
  const studentId = userInfo.value.studentId;

  // First, fetch current student strengths
  studentCliftonStrengthServices.getAllSystemStudentCliftonStrengths()
    .then((studentStrengthsRes) => {
      // Get current student strength records
      const currentStrengths = studentStrengthsRes.data.filter(
        (strength) => strength.studentId == studentId
      );

      // Delete all current strengths
      const deletePromises = currentStrengths.map(strength =>
        studentCliftonStrengthServices.deleteSystemStudentCliftonStrength(strength.id)
      );

      // After all deletes complete, add new strengths
      Promise.all(deletePromises)
        .then(() => {
          // Create new student strengths for each selected strength
          const createPromises = selectedStrengths.value.map(strength => {
            const newStrength = {
              studentId: studentId,
              cliftonStrengthId: strength.id
            };
            return studentCliftonStrengthServices.createSystemStudentCliftonStrength(newStrength);
          });

          // After all creations complete, refresh the strengths list
          Promise.all(createPromises)
            .then(() => {
              // Update the displayed strengths
              strengthsArray.value = [...selectedStrengths.value];
              showStrengthsModal.value = false;
            })
            .catch(error => {
              console.error("Error creating new strengths:", error);
            });
        })
        .catch(error => {
          console.error("Error deleting current strengths:", error);
        });
    })
    .catch(error => {
      console.error("Error fetching current student strengths:", error);
    });
};

const filteredStrengths = computed(() => {
  if (!searchQuery.value) return allCliftonStrengths.value;

  const query = searchQuery.value.toLowerCase();
  return allCliftonStrengths.value.filter(strength =>
    strength.name.toLowerCase().includes(query) ||
    formatCategory(strength.category).toLowerCase().includes(query)
  );
});

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

const formatCategory = (category) => {
  // Convert snake_case to Title Case with spaces
  if (!category) return "Uncategorized";

  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const goToStudentStrengths = () => {
  showStrengthsModal.value = true;

  // Copy current strengths to the selected array
  selectedStrengths.value = [...strengthsArray.value];

  // Fetch all available strengths if not already loaded
  if (allCliftonStrengths.value.length === 0) {
    cliftonStrengthServices.getAllCliftonStrengths()
      .then((res) => {
        allCliftonStrengths.value = res.data;
      })
      .catch((error) => {
        console.error("Error fetching all Clifton Strengths:", error);
      });
  }
};

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


const goToStudentBadges = () => {
  router.push({ path: '/flightPlan/student-badges' });
};

const toggleUpdateModal = () => {
  console.log("Toggling update modal");
  showProfileUpdate.value = !showProfileUpdate.value;
}

const updateUserInfo = () => {
  toggleUpdateModal();

  const updateUser = {
    fName: userFirstName.value,
    lName: userLastName.value,
    email: userInfo.value.email, // Does not change
    phone_number: userPhoneNumber.value,
    prefix: userPrefix.value,
    image: userImage.value ? userImage.value.split(',')[1] : null,
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

const getAllMajors = () => {
  majorServices.getAllMajors()
    .then((res) => {
      // Filter out any major with name 'All'
      majors.value = res.data.filter(major => major.name !== 'All');
      //console.log("All Available Majors (excluding 'All'):", majors.value);
    })
    .catch((error) => {
      console.error("Error fetching all majors:", error);
    });
};

const getStudentMajor = (studentId) => {
  // Step 1: Get all majors for this student
  studentMajorServices.getAllStudentMajors(studentId)
    .then((studentMajorRes) => {
      if (studentMajorRes.data && studentMajorRes.data.length > 0) {
        // Process all majors
        const majorPromises = studentMajorRes.data.map(studentMajor => {
          return majorServices.getMajor(studentMajor.majorId)
            .then(majorRes => {
              return {
                id: majorRes.data.id,
                name: majorRes.data.name,
                department: majorRes.data.department
              };
            });
        });

        Promise.all(majorPromises)
          .then(majors => {
            studentMajors.value = majors;
            //console.log("Student Majors:", studentMajors.value);
          })
          .catch(error => {
            console.error("Error fetching major details:", error);
          });
      } else {
        console.log("No majors found for student ID:", studentId);
        studentMajors.value = [];
      }
    })
    .catch((error) => {
      console.error("Error fetching student majors:", error);
    });
};

// Computed property to filter majors based on search query
const filteredMajors = computed(() => {
  if (!majorSearchQuery.value) return majors.value;

  const query = majorSearchQuery.value.toLowerCase();
  return majors.value.filter(major =>
    major.name.toLowerCase().includes(query) ||
    (major.department && major.department.toLowerCase().includes(query))
  );
});

// Function to open the majors modal
const editStudentMajors = () => {
  // Copy current majors to the selected array
  console.log("Editing student majors");
  selectedMajors.value = [...studentMajors.value];
  showMajorsModal.value = true;
};

// Check if a major is selected
const isMajorSelected = (majorId) => {
  return selectedMajors.value.some(m => m.id === majorId);
};

// Toggle selection of a major
const toggleMajor = (major) => {
  const index = selectedMajors.value.findIndex(m => m.id === major.id);

  if (index >= 0) {
    // Remove major if already selected
    selectedMajors.value.splice(index, 1);
  } else {
    // Add major if not already selected
    selectedMajors.value.push(major);
  }
};

// Save the selected majors
const saveMajors = () => {
  // Get student ID
  const studentId = student.value.id;

  // First, fetch current student majors to know what to delete
  studentMajorServices.getAllStudentMajors(studentId)
    .then((studentMajorsRes) => {
      const currentMajors = studentMajorsRes.data;

      // Delete all current major associations
      const deletePromises = currentMajors.map(studentMajor =>
        studentMajorServices.deleteSystemStudentMajor(studentMajor.id)
      );

      // After all deletes complete, add new majors
      Promise.all(deletePromises)
        .then(() => {
          // Create new student-major associations for each selected major
          const createPromises = selectedMajors.value.map(major => {
            const newMajor = {
              studentId: studentId,
              majorId: major.id
            };
            return studentMajorServices.createSystemStudentMajor(newMajor);
          });

          // After all creations complete, refresh the majors list
          Promise.all(createPromises)
            .then(() => {
              // Update the displayed majors
              studentMajors.value = [...selectedMajors.value];
              showMajorsModal.value = false;
            })
            .catch(error => {
              console.error("Error creating new major associations:", error);
            });
        })
        .catch(error => {
          console.error("Error deleting current major associations:", error);
        });
    })
    .catch(error => {
      console.error("Error fetching current student majors:", error);
    });
};

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
  padding: 40px 60px 30px 60px;
  display: flex;
  justify-content: flex-start;
  background: linear-gradient(to bottom, #f9f9f9, #ffffff);
  border-radius: 15px;
  margin-bottom: 20px;
  position: relative;
}

.profile-actions {
  position: absolute;
  top: 20px;
  right: 30px;
  display: flex;
  gap: 15px;
  z-index: 5;
}

.profile-actions button {
  border-radius: 8px;
  background: rgba(94, 196, 182, 0.9);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  color: #FFF;
  text-align: center;
  font-family: Poppins, sans-serif;
  transition: all 0.3s ease;
}

.profile-actions button:hover {
  background: #4db1a3;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.profile-actions button:active {
  transform: translateY(0);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-details {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 40px;
}

.image-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 4px solid white;
  overflow: hidden;
}

.image-container::after {
  content: "Edit Profile";
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(94, 196, 182, 0.7);
  color: white;
  font-size: 20px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover::after {
  opacity: 1;
}

.image-container:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Modal Image Container */
.modal-image-container {
  width: 230px;
  height: 230px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 4px solid white;
  position: relative;
  top: -35px;
  left: -5px;
  overflow: hidden;
}

.modal-image-container:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.modal-image-container::after {
  content: "Upload Image";
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(94, 196, 182, 0.7);
  color: white;
  font-size: 20px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-image-container:hover::after {
  opacity: 1;
}

.modal-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 10px;
}

.profile-name {
  color: #202020;
  font-family: Poppins, sans-serif;
  font-size: 48px;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-bottom: 5px;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.8);
}

.profile-email {
  color: #555;
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 15px;
  letter-spacing: 0.2px;
}

.profile-role {
  color: #5EC4B6;
  font-family: Poppins, sans-serif;
  font-size: 28px;
  font-style: italic;
  font-weight: 500;
  line-height: normal;
  margin-bottom: 15px;
}

.student-points {
  color: #333;
  font-family: Poppins, sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: normal;
  margin-bottom: 12px;
  padding: 10px 15px;
  background-color: rgba(154, 179, 182, 0.1);
  border-radius: 8px;
  display: inline-block;
}

.student-majors {
  color: #333;
  font-family: Poppins, sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.major-name {
  font-weight: 400;
  margin-left: 5px;
  color: #000000;
}

.major-separator {
  margin: 0 8px;
  color: #000000;
}

.more-majors {
  margin-left: 5px;
  color: #777;
  font-size: 15px;
}

.edit-majors {
  margin-left: 10px;
  color: #811429;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  border-bottom: 1px dotted #811429;
  padding-bottom: 2px;
}

.edit-majors:hover {
  color: #af0326;
  border-bottom: 1px solid #af0326;
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
  color: #FAFAFA;
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
  justify-content: flex-start;
  align-items: flex-start;
  padding: 120px 20px 20px 40px
    /* left */
  ;
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

.badge-name,
.badge-date {
  margin: 5px 0;
  font-size: 14px;
}

.view-all {
  margin-left: 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  padding: 5px 10px;
  border: 1px solid #ffffff;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.view-all:hover {
  background-color: #ffffff;
  color: #5EC4B6;
  border-color: #5EC4B6;
}

/* Clifton Strengths Display */
.strengths-container {
  position: relative;
  margin: 40px 60px 50px 60px;
  max-width: calc(100% - 120px);
  height: 100%;
  min-width: 950px;
  min-height: 250px;
  flex-shrink: 0;
  border-radius: 33px;
  background: #FAFAFA;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.strengths-header {
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
  color: #FAFAFA;
  font-family: Poppins;
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.strengths-buffer {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  height: 40px;
  background: #5EC4B6;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  z-index: 1;
}

.strengths-display {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 120px 20px 40px 40px;
  width: 100%;
  box-sizing: border-box;
}

.strength-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 150px;
  flex-shrink: 0;
}

.strength-icon {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.strength-name {
  margin: 10px 0 5px 0;
  font-size: 16px;
  font-weight: bold;
}

.strength-category {
  margin: 0;
  font-size: 14px;
  font-style: italic;
  color: #555;
}

.no-strengths {
  padding: 120px 20px 20px 40px;
  font-size: 18px;
  color: #777;
}

/* Category colors */
.category-executing {
  background-color: #7A5DC7;
}

.category-influencing {
  background-color: #FFA534;
}

.category-relationship_building {
  background-color: #4ECDC4;
}

.category-strategic_thinking {
  background-color: #5dc770;
}

.category-all {
  background-color: #555555;
}

/* Clifton Strengths Modal - unique class names with cs- prefix */
.cs-modal {
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

.cs-modal-content {
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.cs-title {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  color: #333;
  margin-top: 0;
  text-align: center;
}

.cs-description {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.cs-selected-section,
.cs-available-section {
  margin-bottom: 25px;
}

.cs-selected-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.cs-selected-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 15px;
  position: relative;
}

.cs-no-selected {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
  color: #777;
  font-style: italic;
}

.cs-strength-badge {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.cs-strength-info {
  flex-grow: 1;
}

.cs-strength-name {
  font-weight: bold;
  font-size: 16px;
}

.cs-strength-category {
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.cs-remove-btn {
  background: none;
  color: #ff6b6b;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  line-height: 1;
}

.cs-remove-btn:hover {
  background-color: #ff6b6b;
  border-radius: 50%;
  color: white;
}

.cs-search {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 15px;
}

.cs-available-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.cs-available-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cs-available-item:hover {
  background: #f0f0f0;
}

.cs-available-item.cs-selected {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.cs-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.cs-save-btn,
.cs-cancel-btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cs-save-btn {
  background: #5EC4B6;
  color: white;
  border: none;
}

.cs-save-btn:hover {
  background: #4eb1a3;
}

.cs-cancel-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cs-cancel-btn:hover {
  background: #e8e8e8;
}

/* Clifton Strength Description Modal */
.csd-modal {
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

.csd-modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.csd-close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.csd-close:hover {
  background-color: #333;
  border-radius: 50%;
  color: white;
}

.csd-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.csd-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.csd-strength-badge {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-size: 28px;
  font-weight: bold;
  flex-shrink: 0;
}

.csd-title-area {
  flex-grow: 1;
}

.csd-title {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  margin: 0 0 5px 0;
}

.csd-category {
  font-size: 16px;
  color: #666;
  font-style: italic;
  margin: 0;
}

.csd-description {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.strength-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.strength-item:hover {
  transform: translateY(-3px);
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 24px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 800px;
  min-height: fit-content;
  overflow: hidden;
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #5EC4B6;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  z-index: 5;
}

.close-btn {
  position: absolute;
  top: 7px;
  right: 15px;
  background: none;
  border: none;
  font-size: 44px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #e0e0e0;
}

.form-title {
  font-size: 34px;
  font-weight: 500;
  margin-bottom: 20px;
  color: white;
  text-align: left;
  position: absolute;
  top: 15px;
  left: 30px;
  margin-top: 5px;
  z-index: 10;
}

.name-input-container {
  display: flex;
  gap: 15px;
}

.name-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  height: 38px;
}

.name-input-wrapper {
  margin-top: 80px;
  margin-bottom: 20px;
}

.modal-right {
  padding-top: 30px;
}

.form-row {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.form-row,
.name-input label {
  display: block;
  width: 100%;
  text-align: left;
  font-size: 14px;
  color: #555;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  height: 38px;
  background: #fff;
}

.btn-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.save-btn {
  padding: 10px 20px;
  background-color: #5EC4B6;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: #4db1a3;
}


@media (max-width: 600px) {
  .modal-content {
    flex-direction: column;
    max-width: 95vw;
  }

  .modal-left {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding: 20px 0;
  }

  .modal-right {
    flex: 1;
    padding: 60px 30px 30px 30px;
    display: flex;
    flex-direction: column;
  }

  .btn-container {
    justify-content: center;
  }
}

/* Student Majors Modal */
.major-modal {
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

.major-modal-content {
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.major-close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.major-close:hover {
  background-color: #333;
  border-radius: 50%;
  color: white;
}

.major-title {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  color: #333;
  margin-top: 0;
  text-align: center;
}

.major-description {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.major-selected-section,
.major-available-section {
  margin-bottom: 25px;
}

.major-selected-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.major-selected-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 15px;
  position: relative;
}

.major-no-selected {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
  color: #777;
  font-style: italic;
}

.major-badge {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
  background-color: #5EC4B6;
}

.major-info {
  flex-grow: 1;
}

.major-name {
  font-weight: bold;
  font-size: 16px;
}

.major-department {
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.major-remove-btn {
  background: none;
  color: #ff6b6b;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  line-height: 1;
  border: none;
}

.major-remove-btn:hover {
  background-color: #ff6b6b;
  border-radius: 50%;
  color: white;
}

.major-search {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 15px;
}

.major-available-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.major-available-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.major-available-item:hover {
  background: #f0f0f0;
}

.major-available-item.major-selected {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.major-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.major-save-btn,
.major-cancel-btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.major-save-btn {
  background: #5EC4B6;
  color: white;
  border: none;
}

.major-save-btn:hover {
  background: #4eb1a3;
}

.major-cancel-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.major-cancel-btn:hover {
  background: #e8e8e8;
}
</style>