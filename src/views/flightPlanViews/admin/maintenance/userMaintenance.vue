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
        :userRoles="getUserRoles(user.id)"
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

const message = ref("");

const search = ref("");

const filterOptions = ["All", "Admins", "Students", "Reviewers", "Student Workers", "Professors"];
const filterType = ref("All");

const roles = ref([]);
const userRoles = ref([]);

const loadingUserRoles = ref(true);
const loadingUsers = ref(true);
const loadingRoles = ref(true);

const addingUser = ref(false);

onMounted(() => {
  user.value = Utils.getStore("user");
  refresh();
});

const refresh = () => {
  getUsers();
  getAllRoles();
  getAllUserRoles();
}

const getUserRoles = (userId) => {
  return userRoles.value.filter((userRole) => userRole.userId === userId);
}

const handleSaveUser = async ({ user, newRoles }) => {
  const specificUserUserRoles = userRoles.value.filter((userRole) => userRole.userId === user.id);
  const specificUserRoles = specificUserUserRoles.map((userRole) => roles.value.find((role) => role.id === userRole.roleId).role_type);

  newRoles.forEach((role) => {
    if (!specificUserRoles.includes(role)) {
      addRole(user.id, role);
    }
  })

  specificUserRoles.forEach((role) => {
    if (!newRoles.includes(role)) {
      removeRole(user.id, role);
    }
  })
};

const handleDeleteUser = async (userId) => {
  console.log(userId);
};

const addUser = () => {
  addingUser.value = true;
};

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
};

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

const orderUsers = (val) => {
  users.value.sort((a, b) => {
    return val === "asc"
      ? a.lName.localeCompare(b.lName)
      : b.lName.localeCompare(a.lName);
  });
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