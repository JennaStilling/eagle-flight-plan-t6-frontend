<script setup>
import "@/assets/dark-mode.css";
import { ref, computed, onMounted } from "vue";
import UserServices from "@/services/resumeBuilderServices/userServices";
import StudentServices from "@/services/resumeBuilderServices/studentServices";
import AdminRoleServices from "@/services/resumeBuilderServices/adminRoleServices";
import ReviewerRoleServices from "@/services/resumeBuilderServices/reviewerRoleServices";
import RoleServices from "@/services/resumeBuilderServices/roleServices";
import { useRouter } from "vue-router";
import Utils from "@/config/utils.js";
import { Icon } from "@iconify/vue";

const users = ref([]);
const user = ref(null);
const specificUser = ref(null);

const showDeleteItem = ref(false);
const deleteError = ref(false);
const message = ref("");

const showUserInfo = ref(false);

const search = ref("");

const students = ref([]);
const reviewers = ref([]);
const admins = ref([]);

const filterOptions = ["All", "Admins", "Students", "Reviewers"];
const filterType = ref("All");
const headers = [
  { text: "Name", value: "name", align: "start" },
  { text: "Email", value: "email", align: "start" },
  { text: "Is Student?", value: "isStudent", align: "start" },
  { text: "Is Reviewer?", value: "isReviewer", align: "start" },
  { text: "Is Admin?", value: "isAdmin", align: "start" },
  
];

const roles = ref([]);
const userRoles = ref([]);
const userSpecificRoles = ref("");
const router = useRouter();

const studentId = ref("");
const adminId = ref("");
const reviewerId = ref("");

const selectedStudentId = ref("");
const selectedAdminId = ref("");
const selectedReviewerId = ref("");
const hasReviewerAccess = ref(false);

onMounted(() => {
  user.value = Utils.getStore("user");
  console.log(user.value);
  getAllStudents();
  getAllReviewers();
  getAllAdmins();
  getUsers();
  //getUserRoles();
});

const getUserRoles = () => {
  UserServices.getUser(user.value.userId)
    .then((res) => {
      user.value = res.data;
      console.log("ID: " + user.value.id);
      console.log("Student ID: " + user.value.studentId);
      console.log("Admin ID: " + user.value.adminId);
      console.log("Reviewer ID: " + user.value.reviewerId);

      studentId.value = user.value.studentId;
      adminId.value = user.value.adminId;
      reviewerId.value = user.value.reviewerId;

      if (
        studentId.value != null &&
        adminId.value == null &&
        reviewerId.value == null
      )
        router.push({ name: "studentHome" });
      else if (
        (adminId.value != null &&
          studentId.value == null &&
          reviewerId.value == null) ||
        (studentId.value != null &&
          reviewerId.value != null &&
          adminId.value != null) ||
        (studentId.value != null &&
          adminId.value != null &&
          reviewerId.value == null) ||
        (reviewerId.value != null &&
          adminId.value != null &&
          studentId.value == null)
      )
        router.push({ name: "adminHome" });
      else if (
        reviewerId.value != null &&
        adminId.value == null &&
        studentId.value == null
      )
        router.push({ name: "reviewerHome" });
      else console.log("User has not been assigned a role");
    })
    .catch((error) => {
      console.log("error", error);
    });
};

const getAllRoles = () => {
  RoleServices.getAllRoles()
    .then((res) => {
      roles.value = res.data;
      message.value = "";
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

getAllRoles();

const getUsers = () => {
  UserServices.getAllUsers()
    .then((res) => {
      users.value = res.data;
      message.value = "";
      orderUsers("asc");
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const deleteUser = (user) => {
  UserServices.deleteUser(user.id)
    .then(() => {
      showDeleteItem.value = false;
      users.value = users.value.filter((allUsers) => allUsers.id !== user.id);
    })
    .catch((e) => {
      message.value = e.response.data.message;
      deleteError.value = true;
    });
};

const orderUsers = (val) => {
  users.value.sort((a, b) => {
    return val === "asc"
      ? a.lName.localeCompare(b.lName)
      : b.lName.localeCompare(a.lName);
  });
};

const deleteDisplay = (item) => {
  user.value = item;
  showDeleteItem.value = true;
};

const userDataDisplay = async (item) => {
  user.value = item;
  showUserInfo.value = true;
  await getUserRoles(item.id);
};

const filteredUsers = computed(() => {
  const searchTerm = search.value.toLowerCase();
  let filtered = users.value.filter((user) =>
    `${user.fName} ${user.lName}`.toLowerCase().includes(searchTerm)
  );

  if (filterType.value === "Students") {
    filtered = filtered.filter((user) =>
      students.value.some((tempUser) => tempUser.id === user.studentId)
    );
  } else if (filterType.value === "Reviewers") {
    filtered = filtered.filter((user) =>
      reviewers.value.some((tempUser) => tempUser.id === user.reviewerId)
    );
  } else if (filterType.value === "Admins") {
    filtered = filtered.filter((user) =>
      admins.value.some((tempUser) => tempUser.id === user.adminId)
    );
  }

  return filtered;
});

const getAllStudents = () => {
  StudentServices.getAllStudents()
    .then((res) => {
      students.value = res.data;
      message.value = "";
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const addReviewer = (userId) => {
  ReviewerRoleServices.createReviewer()
    .then((res) => {
      const tempId = res.data.id;
      return UserServices.updateUser(userId, { reviewerId: tempId })
        .catch((err) => console.error(err));
    })
    .then(() => {
      getUsers();
      getAllReviewers();
    })
    .catch((err) => console.error(err));
};


const removeReviewer = (userId) => {
  UserServices.getUser(userId)
    .then((res) => {
      const tempId = res.data.reviewerId;
      return UserServices.updateUser(userId, { reviewerId: null })
        .then(() =>
          ReviewerRoleServices.deleteReviewer(tempId)
        )
        .catch((err) => console.error(err));
    })
    .then(() => {
      getUsers();
      getAllReviewers();
    })
    .catch((err) => console.error(err));
};


const getAllReviewers = () => {
  ReviewerRoleServices.getAllReviewers()
    .then((res) => {
      reviewers.value = res.data;
      message.value = "";
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const getAllAdmins = () => {
  AdminRoleServices.getAllAdmins()
    .then((res) => {
      admins.value = res.data;
      message.value = "";
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const getSpecificUserRoles = (specificUserId) => {
  UserServices.getUser(specificUserId).then((res) => {
    userSpecificRoles.value = "";
    specificUser.value = res.data;
    console.log("ID: " + specificUser.value.id);
    console.log("Student ID: " + specificUser.value.studentId);
    console.log("Admin ID: " + specificUser.value.adminId);
    console.log("Reviewer ID: " + specificUser.value.reviewerId);

    selectedStudentId.value = specificUser.value.studentId;
    selectedAdminId.value = specificUser.value.adminId;
    selectedReviewerId.value = specificUser.value.reviewerId;

    userRoles.value = [];

    if (selectedStudentId.value != null) {
      userRoles.value.push("Student");
    }

    if (selectedAdminId.value != null) {
      userRoles.value.push("Admin");
    }

    if (selectedReviewerId.value != null) {
      userRoles.value.push("Reviewer");
    }

    userRoles.value.forEach((val) => {
      console.log("Role: " + val);
    });

    userSpecificRoles.value = userRoles.value.join(", ");
  });
};

const saveUserData = (userId) => {
  if (hasReviewerAccess.value) {
    addReviewer(userId);
  } else {
    removeReviewer(userId);
  }
};

const determineReviewerStatus = (item) => {
  hasReviewerAccess.value = reviewers.value.some((val) => item.reviewerId === val.id);
};
</script>

<template>
  <div class="modified-width">
    <v-card title="Edit Users">
      <v-row>
        <v-col cols="6">
          <v-text-field v-model="search" label="Search for User" variant="outlined" hide-details single-line>
            <template v-slot:prepend-inner>
              <Icon icon="material-symbols:search-rounded" width="24" height="24" />
            </template>
          </v-text-field>

        </v-col>

        <v-col cols="6">
          <v-select v-model="filterType" :items="filterOptions" label="Filter by User Type" outlined hide-details>
          </v-select>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="filteredUsers" class="elevation-1" :items-per-page="filteredUsers.length"
        hide-default-footer>
        <template #item.name="{ item }">
          <span @click="
            userDataDisplay(item);
          determineReviewerStatus(item);
          getSpecificUserRoles(item.id);
          ">
            {{ item.fName + " " + item.lName }}
          </span>
        </template>
      </v-data-table>
    </v-card>
  </div>

  <div v-if="showUserInfo" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span @click="showUserInfo = false" class="close">&times;</span>
        <h3>User Data</h3>
      </div>

      <v-card class="mx-auto pa-4">
        <div class="modal-body">
          <v-row>
            <v-col cols="12">
              <strong>Name:</strong> {{ user.fName + " " + user.lName }}
            </v-col>
            <v-col cols="12">
              <strong>Email:</strong> {{ user.email }}
            </v-col>
            <v-col cols="12">
              <strong>Roles:</strong> {{ userSpecificRoles }}
            </v-col>
            <v-col cols="12">
              <v-checkbox v-model="hasReviewerAccess" label="Has Reviewer Access?"></v-checkbox>
            </v-col>
          </v-row>
        </div>

        <v-row class="justify-end pt-2 justify-right">
          <v-btn @click="
            showUserInfo = false;
          saveUserData(user.id);
          " color="#5EC4B6" class="me-2">Save</v-btn>
          <v-btn @click="(showUserInfo = false), (showDeleteItem = true)" color="#F04E3E" class="me-2">Delete</v-btn>
          <v-btn @click="showUserInfo = false" color="#708E9A">Close</v-btn>
        </v-row>
      </v-card>
    </div>
  </div>

  <div v-if="showDeleteItem" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span @click="showDeleteItem = false" class="close">&times;</span>
        <p v-if="!deleteError">
          Are you sure you want to delete this user?<br />
          {{ user.fName + " " + user.lName }}
        </p>
        <p v-if="deleteError">
          Error deleting<br />{{ user.fName + " " + user.lName }}.
        </p>
      </div>
      <div class="modal-body">
        <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteItem = false">No, cancel</v-btn>
        <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteUser(user)">Yes, delete</v-btn>
        <v-btn v-if="deleteError" @click="
          deleteError = false;
        showDeleteItem = false;
        ">Close</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modified-width {
  width: 70%;
  margin: 0 auto;
  padding-top: 15px;
}

.justify-right {
  padding-right: 10px;
}

.black-icon {
  color: black;
}
</style>
