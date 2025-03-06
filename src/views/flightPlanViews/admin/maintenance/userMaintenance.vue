<template>
  <div class="modified-width">

    <div class="title-row">
      <h1 class="table-title">Manage Users</h1>
      <div class="search-filter-button-group">
        <v-text-field v-model="search" label="Search for User" variant="solo" hide-details single-line density="compact"
          class="search-bar">
          <template v-slot:prepend-inner>
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </template>
        </v-text-field>

        <v-select v-model="filterType" :items="filterOptions" label="Filter by User Type" variant="solo" hide-details
          density="compact" class="filter-menu"></v-select>

        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addUser()">
          Add User
        </v-btn>
      </div>
    </div>

    <v-card class="stuff">
      <div class="user-previews" v-if="!loadingUserRoles && !loadingUsers && !loadingRoles">
        <UserPreview v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        :userRoles="userRoles.filter((userRole) => userRole.userId === user.id)"
        :roles="roles"
        @save-user="handleSaveUser"
        @delete-user="handleDeleteUser"
        />
      </div>
    </v-card>
    <v-card class="pager">
      <h3>Page 1 of 1</h3>

    </v-card>
  </div>

  <div class="modified-width">
    <v-card title="Edit Users">
      <v-row>
        <v-col cols="5">
          <v-text-field v-model="search" label="Search for User" variant="solo" hide-details single-line>
            <template v-slot:prepend-inner>
              <Icon icon="material-symbols:search-rounded" width="24" height="24" />
            </template>
          </v-text-field>

        </v-col>

        <v-col cols="5">
          <v-select v-model="filterType" :items="filterOptions" label="Filter by User Type" outlined hide-details
            variant="solo">
          </v-select>
        </v-col>
        <v-col cols="2">
          <v-btn>
            Add Student
          </v-btn>
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


  <v-overlay v-model="addingUser" class="align-center justify-center">
    <v-card class="add-user">
      <div class="scroll">
        <v-sheet class="mx-auto" width="300">

          <v-form ref="form">
            <div>
              <v-select v-model="data.prefix" :items="data.prefixes" label="Prefix" required variant="solo"></v-select>
              <v-text-field v-model="data.firstName" :counter="10" label="First Name" required
                variant="solo"></v-text-field>
              <v-text-field v-model="data.lastName" :counter="10" label="Last Name" required
                variant="solo"></v-text-field>
              <v-text-field v-model="data.email" :counter="10" label="Email" required variant="solo"></v-text-field>
              <v-text-field v-model="data.phoneNumeber" :counter="10" label="Phone Number" required
                variant="solo"></v-text-field>
            </div>
            <div>
              <v-text-field v-model="data.studentId" :counter="10" label="StudentID" required
                variant="solo"></v-text-field>
              <v-text-field v-model="data.class" :counter="10" label="Class" required variant="solo"></v-text-field>
              <v-select v-model="data.select" :items="data.items" label="Graduation Date" required
                variant="solo"></v-select>
              <v-text-field v-model="data.points" label="Points Earned" required variant="solo"></v-text-field>
            </div>
            <div class="d-flex flex-row">
              <v-btn class="button" variant="elevated" color="#5EC4B6" @click="">
                Save
              </v-btn>
              <v-btn class="button" variant="elevated" color="#D9D9D9" @click="">
                Cancel
              </v-btn>
              <v-btn class="button" variant="elevated" color="#F04E3E" @click="">
                Delete
              </v-btn>
            </div>
          </v-form>
        </v-sheet>
      </div>
    </v-card>
  </v-overlay>
</template>

<script setup>
import "@/assets/dark-mode.css";
import { ref, computed, onMounted } from "vue";

// Services Files
import UserServices from "@/services/resumeBuilderServices/userServices";
import RoleServices from "@/services/resumeBuilderServices/roleServices";
import RolePermissionServices from "@/services/flightPlanServices/rolePermissionServices";
import UserRolePermissionServices from "@/services/flightPlanServices/userRolePermissionServices";
import UserRoleServices from "@/services/resumeBuilderServices/userRoleServices";

// Components 
import UserPreview from '@/components/flightPlanComponents/adminPages/UserPreview.vue';

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

const hasReviewerAccess = ref(false);

const loadingUserRoles = ref(true);
const loadingUsers = ref(true);
const loadingRoles = ref(true);

const addingUser = ref(false);

const data = ({
  prefix: null,
  prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
  firstName: '',
  lastName: '',
  email: '',
  phoneNumeber: '',
  nameRules: [
    v => !!v || 'Name is required',
    v => (v && v.length <= 10) || 'Name must be 10 characters or less',
  ],
  studentId: '',
  select: null,
  items: [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
  ],
  checkbox: false,
})

onMounted(() => {
  user.value = Utils.getStore("user");
  refresh();
});

const refresh = () => {
  getUsers();
  getAllRoles();
  getAllUserRoles();
}

const handleSaveUser = async ({ user, roles }) => {
  console.log(user);
  console.log(roles);
};

const handleDeleteUser = async (userId) => {
  console.log(userId);
};

const addUser = () => {
  addingUser.value = true;
}


const getAllRoles = () => {
  RoleServices.getAllRoles()
    .then((res) => {
      roles.value = res.data;
      message.value = "";
      loadingRoles.value = false;
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
      loadingUserRoles.value = false;
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
      loadingUsers.value = false;
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
      refresh();
    })
};

const removeRole = (userId, roleName) => {
  const specificRoleId = roles.value.find((role) => role.role_type === roleName).id;
  const userRoleId = userRoles.value.find((userRole) => userRole.userId === userId && userRole.roleId === specificRoleId).id;

  UserRoleServices.deleteUserRole(userId, userRoleId)
    .then(() => {
    })
    .catch((err) => console.error(err))
    .finally(() => {
      refresh();
    })
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

.user-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(23vw, 1fr));
  gap: 20px;
  grid-auto-flow: dense;
  margin: 20px;
}

.stuff {
  background-color: rgb(255, 255, 255);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  margin: 20px;
  border-radius: 20px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  grid-auto-flow: dense;
}

.pager {
  margin: 20px;
  padding: 10px;
}

.card-outlines {

  background-color: rgb(255, 255, 255);

  width: 100%;
  /* Set width to resemble a piece of paper */
  height: 100;
  /* Set height */
  padding: 10px;
  /* Padding inside the box */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */
  margin-bottom: 10px;
  /* Space below the shortcut area */
  border-radius: 20px;
  cursor: pointer;
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

.add-user {

  background-color: rgb(255, 255, 255);

  width: 70vw;
  /* Set width to resemble a piece of paper */
  height: 70vh;
  /* Set height */
  padding: 10px;
  /* Padding inside the box */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */
  margin-bottom: 10px;
  /* Space below the shortcut area */
  border-radius: 20px;
  cursor: pointer;
}

.scroll {
  overflow-y: auto;
  max-height: 100%;
}
</style>