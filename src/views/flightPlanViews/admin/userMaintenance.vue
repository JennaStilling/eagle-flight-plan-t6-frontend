<template>
  <div class="modified-width">
    <v-card title="Edit Users">
      <v-row>
        <v-col cols="3">
          <p>test</p>

        </v-col>
        <v-col cols="3">
          <v-text-field v-model="search" label="Search for User" variant="outlined" hide-details single-line>
            <template v-slot:prepend-inner>
              <Icon icon="material-symbols:search-rounded" width="24" height="24" />
            </template>
          </v-text-field>

        </v-col>

        <v-col cols="3">
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
              <strong>Roles:</strong> {{ specificUserRoles }}
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

<script setup>
import "@/assets/dark-mode.css";
import { ref, computed, onMounted } from "vue";
import UserServices from "@/services/resumeBuilderServices/userServices";

import ReviewerRoleServices from "@/services/resumeBuilderServices/reviewerRoleServices";

import RoleServices from "@/services/resumeBuilderServices/roleServices";
import RolePermissionServices from "@/services/flightPlanServices/rolePermissionServices";
import UserRolePermissionServices from "@/services/flightPlanServices/userRolePermissionServices";
import UserRoleServices from "@/services/resumeBuilderServices/userRoleServices";

import { useRouter } from "vue-router";
import Utils from "@/config/utils.js";
import { Icon } from "@iconify/vue";

const users = ref([]);
const user = ref(null);

const showDeleteItem = ref(false);
const deleteError = ref(false);
const message = ref("");

const showUserInfo = ref(false);

const search = ref("");

const filterOptions = ["All", "Admins", "Students", "Reviewers", "Student Workers", "Professors"];
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
const specificUserRoles = ref("");
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
  getUsers();
  getAllRoles();
  getAllUserRoles();
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
        router.push({ name: "adminHomeRB" });
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

const getAllUserRoles = () => {
  UserRoleServices.getEveryUserRole()
    .then((res) => {
      userRoles.value = res.data;
      message.value = "";
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
}

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
  //await getUserRoles(item.id);
};

const filteredUsers = computed(() => {
  const searchTerm = search.value.toLowerCase();
  let filtered = users.value.filter((user) =>
    `${user.fName} ${user.lName}`.toLowerCase().includes(searchTerm)
  );

  if (filterType.value === "Students") {
    const reviewerRoleId = roles.value.find((role) => role.role_type === "student").id;
    filtered = filtered.filter((user) =>
      userRoles.value.some((userRole) => userRole.userId === user.id && userRole.roleId === reviewerRoleId)
    );
  } else if (filterType.value === "Reviewers") {
    const reviewerRoleId = roles.value.find((role) => role.role_type === "reviewer").id;
    filtered = filtered.filter((user) =>
      userRoles.value.some((userRole) => userRole.userId === user.id && userRole.roleId === reviewerRoleId)
    );
  } else if (filterType.value === "Admins") {
    const adminRoleId = roles.value.find((role) => role.role_type === "admin").id;
    filtered = filtered.filter((user) =>
      userRoles.value.some((userRole) => userRole.userId === user.id && userRole.roleId === adminRoleId)
    );
  }
  else if (filterType.value === "Student Workers") {
    const studentWorkerId = roles.value.find((role) => role.role_type === "student_worker").id;
    filtered = filtered.filter((user) =>
      userRoles.value.some((userRole) => userRole.userId === user.id && userRole.roleId === studentWorkerId)
    );
  }
  else if (filterType.value === "Professors") {
    const professorId = roles.value.find((role) => role.role_type === "professor").id;
    filtered = filtered.filter((user) =>
      userRoles.value.some((userRole) => userRole.userId === user.id && userRole.roleId === professorId)
    );
  }

  return filtered;
});

const determineReviewerStatus = (item) => {
  const reviewerId = roles.value.find((role) => role.role_type === "reviewer").id;
  hasReviewerAccess.value = userRoles.value.some((userRole) => userRole.userId === item.id && userRole.roleId === reviewerId)
};

const addReviewer = (userId) => {
  addRole(userId, "reviewer");
};

const removeReviewer = (userId) => {
  removeRole(userId, "reviewer");
};

const addRole = (userId, roleName) => {
  const specificRoleId = roles.value.find((role) => role.role_type === roleName).id;

  let data = {
    userId: userId,
    roleId: specificRoleId
  };

  UserRoleServices.createUserRole(userId, data)
    .then((res) => {
      const userRoleId = res.data.id;

      const reviewerRolePermissions = ref([]);
      RolePermissionServices.getAllRolePermissions()
        .then((res) => {
          reviewerRolePermissions.value = res.data.filter((rolePermission) => rolePermission.roleId === specificRoleId);

          reviewerRolePermissions.value.forEach((rolePermission) => {
            let data = {
              userRoleId: userRoleId,
              permissionId: rolePermission.permissionId
            };

            UserRolePermissionServices.createUserRolePermission(data)
              .catch((err) => {
                message.value = "Error: " + err.code + ":" + err.message;
                console.error(err)
              });
          })
        })
        .catch((err) => {
          message.value = "Error: " + err.code + ":" + err.message;
          console.log(err);
        })
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    })
    .finally(() => {
      getUsers();
      getAllUserRoles();
    })
};

const removeRole = (userId, roleName) => {
  const specificRoleId = roles.value.find((role) => role.role_type === roleName).id;
  const userRoleId = userRoles.value.find((userRole) => userRole.userId === userId && userRole.roleId === specificRoleId).id;

  UserRoleServices.deleteUserRole(userId, userRoleId)
    .then(() => {
      getUsers();
      getAllUserRoles();
    })
    .catch((err) => console.error(err));
};

const getSpecificUserRoles = (specificUserId) => {
  function formatString(str) {
    return str.replace(/_/g, ' ')
      .replace(/,(\s*)$/g, '')
      .replace(/,(\S)/g, ', $1')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  UserServices.getUser(specificUserId)
    .then((res) => {
      specificUserRoles.value = "";
      const specificUserRolesArray = ref([]);
      specificUserRolesArray.value = userRoles.value.filter((userRole) => userRole.userId === specificUserId);

      specificUserRolesArray.value.forEach((userRole) => {
        specificUserRoles.value = specificUserRoles.value.concat(roles.value.find((role) => role.id === userRole.roleId).role_type + ",");
      });
      specificUserRoles.value = formatString(specificUserRoles.value);
    });
};

const saveUserData = (userId) => {
  if (hasReviewerAccess.value) {
    addReviewer(userId);
  } else {
    removeReviewer(userId);
  }
};
</script>

<style scoped>
.modified-width {
  height: 100vh;
  margin: 0 auto;
  padding-top: 15px;
}
</style>