<template>
  <div>
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
        <AddUser :roles="roles" :cliftonStrengths="cliftonStrengths" @add-user="handleAddUser" />
      </div>
    </div>

    <v-card class="stuff">
      <v-data-iterator :items="filteredUsers" :items-per-page="9" v-if="!loading">
        <template v-slot:default="{ items }">
          <v-container class="pa-5" fluid>
            <v-row dense>
              <v-col v-for="user in items" :key="user.id" cols="auto" md="4" W>
                <UserPreview :key="user.id" :user="user.raw" :userRoles="getUserRoles(user.raw.id)" :roles="roles"
                  :student="getStudent(user.raw.studentId)" :cliftonStrengths="cliftonStrengths"
                  :studentCliftonStrengths="getStudentCliftonStrengths(user.raw.studentId)" @save-user="handleSaveUser"
                  @delete-user="handleDeleteUser" />
              </v-col>
            </v-row>
          </v-container>
        </template>

        <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
          <div class="d-flex align-center justify-center pa-4">
            <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded
              @click="prevPage">
              < </v-btn>

                <div class="mx-2 text-caption">
                  Page {{ page }} of {{ pageCount }}
                </div>

                <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right" variant="tonal"
                  rounded @click="nextPage"> > </v-btn>
          </div>
        </template>
      </v-data-iterator>
    </v-card>
  </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import "@/assets/dark-mode.css";
import { ref, computed, onMounted } from "vue";

// Services Files
import UserServices from "@/services/resumeBuilderServices/userServices";
import StudentServices from "@/services/resumeBuilderServices/studentServices";
import RoleServices from "@/services/resumeBuilderServices/roleServices";
import RolePermissionServices from "@/services/flightPlanServices/rolePermissionServices";
import UserRolePermissionServices from "@/services/flightPlanServices/userRolePermissionServices";
import CliftonStrengthServices from "@/services/flightPlanServices/cliftonStrengthServices";
import StudentCliftonStrengthServices from "@/services/flightPlanServices/studentCliftonStrengthServices";
import UserRoleServices from "@/services/resumeBuilderServices/userRoleServices";

// Components 
import UserPreview from '@/components/flightPlanComponents/adminPages/UserPreview.vue';
import AddUser from '@/components/flightPlanComponents/adminPages/AddUser.vue';

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

const students = ref([]);

const cliftonStrengths = ref([]);
const studentCliftonStrengths = ref([]);

const loading = computed(() => {
  return Object.values(loadingData.value).some(value => value);
});

const loadingData = ref({
  users: true,
  userRoles: true,
  roles: true,
  students: true,
  cliftonStrengths: true,
  studentCliftonStrengths: true,
});

onMounted(() => {
  user.value = Utils.getStore("user");
  getAllRoles();
  getAllCliftonStrengths();
  refresh();
});

const refresh = () => {
  getAllUsers();
  getAllUserRoles();
  getAllStudentCliftonStrengths();
  getAllStudents();
}

const getUserRoles = (userId) => {
  return userRoles.value.filter((userRole) => userRole.userId === userId);
}

const getStudentCliftonStrengths = (studentId) => {
  return studentCliftonStrengths.value.filter((studentCliftonStrength) => studentCliftonStrength.studentId === studentId);
}

const getStudent = (studentId) => {
  return students.value.find((student) => student.id === studentId);
}

const handleAddUser = async ({ user: userData, student: studentData, cliftonStrengths, newRoles }) => {
  if (studentData) {
    addStudent(studentData)
      .then((newStudent) => {
        userData.studentId = newStudent.id;
        addUser(userData)
          .then((newUser) => {
            addRoles(newUser, newRoles);
          })

        addCliftonStrengths(newStudent, cliftonStrengths);
      })
  }
  else {
    addUser(userData)
      .then((response) => {
        addRoles(response, newRoles);
      })
  }
}

const handleSaveUser = async ({ user: userData, student: studentData, cliftonStrengths, newRoles }) => {
  updateUserRoles(userData, newRoles);

  if (newRoles.find((role) => role === "student" && !userData.studentId)) {
    addStudent(studentData)
      .then(((newStudent) => {
        userData.studentId = newStudent.id;
        updateUser(userData);
        updateCliftonStrengths(newStudent.id, cliftonStrengths);
      }))
  }
  else if (newRoles.find((role) => role === "student" && userData.studentId)) {
    updateStudent(studentData);
    updateUser(userData);
    updateCliftonStrengths(userData.studentId, cliftonStrengths);
  }
};

const handleDeleteUser = async (user) => {
  if (user.studentId) {
    deleteStudent(user.studentId).then(() => {
      deleteUser(user.id);
    })
  }
  else {
    deleteUser(user.id);
  }
};

const getAllRoles = () => {
  loadingData.value.roles = true;
  RoleServices.getAllRoles()
    .then((res) => {
      roles.value = res.data;
      message.value = "";
      loadingData.value.roles = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    })
};

const getAllUserRoles = () => {
  loadingData.value.userRoles = true;
  UserRoleServices.getEveryUserRole()
    .then((res) => {
      userRoles.value = res.data;
      message.value = "";
      loadingData.value.userRoles = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const getAllCliftonStrengths = () => {
  loadingData.value.cliftonStrengths = true;
  CliftonStrengthServices.getAllCliftonStrengths()
    .then((res) => {
      cliftonStrengths.value = res.data;
      message.value = "";
      loadingData.value.cliftonStrengths = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
}

const getAllStudentCliftonStrengths = () => {
  loadingData.value.studentCliftonStrengths = true;
  StudentCliftonStrengthServices.getAllSystemStudentCliftonStrengths()
    .then((res) => {
      studentCliftonStrengths.value = res.data;
      message.value = "";
      loadingData.value.studentCliftonStrengths = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
}

const getAllUsers = () => {
  loadingData.value.users = true;
  UserServices.getAllUsers()
    .then((res) => {
      users.value = res.data;
      message.value = "";
      orderUsers("asc");
      loadingData.value.users = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
};

const getAllStudents = () => {
  loadingData.value.students = true;
  StudentServices.getAllStudents()
    .then((res) => {
      students.value = res.data;
      message.value = "";
      loadingData.value.students = false;
    })
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    });
}

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
    .catch((err) => console.error(err))
    .finally(() => {
      refresh();
    })
};

const addStudentCliftonStrength = (studentId, cliftonStrength) => {
  let data = {
    studentId: studentId,
    cliftonStrengthId: cliftonStrength.id
  }
  StudentCliftonStrengthServices.createSystemStudentCliftonStrength(data)
    .catch((err) => {
      message.value = "Error: " + err.code + ":" + err.message;
      console.log(err);
    })
    .finally(() => {
      refresh();
    })
}

const removeStudentCliftonStrength = (studentId, cliftonStrength) => {

  StudentCliftonStrengthServices.deleteStudentCliftonStrengthTwoIds(studentId, cliftonStrength.id)
    .catch((err) => console.error(err))
    .finally(() => {
      refresh();
    })
}

const addUser = async (user) => {
  return UserServices.createUser(user)
    .then((response) => {
      return response.data;
    }).catch((e) => {
      message.value = e.response.data.message;
    })
    .finally(() => {
      refresh();
    })
}

const addStudent = async (student) => {
  return StudentServices.createStudent(student)
    .then((response) => {
      return response.data;
    }).catch((e) => {
      message.value = e.response.data.message;
    })
    .finally(() => {
      refresh();
    })
}

const addRoles = async (user, newRoles) => {
  newRoles.forEach((role) => {
    addRole(user.id, role);
  })
}

const updateUserRoles = (user, newRoles) => {
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
}

const addCliftonStrengths = async (student, cliftonStrengths) => {
  cliftonStrengths.forEach((cliftonStrength) => {
    addStudentCliftonStrength(student.id, cliftonStrength);
  })
}

const updateCliftonStrengths = (studentId, newCliftonStrengths) => {
  const specificStudentStudentCliftonStrengths = studentCliftonStrengths.value.filter((studentCliftonStrength) => studentCliftonStrength.studentId === studentId);
  const specificStudentCliftonStrengths = specificStudentStudentCliftonStrengths.map((studentCliftonStrength) => cliftonStrengths.value.find((cliftonStrength) => cliftonStrength.id === studentCliftonStrength.cliftonStrengthId));

  newCliftonStrengths.forEach((cliftonStrength) => {
    if (!specificStudentCliftonStrengths.includes(cliftonStrength)) {
      addStudentCliftonStrength(studentId, cliftonStrength);
    }
  })

  specificStudentCliftonStrengths.forEach((cliftonStrength) => {
    if (!newCliftonStrengths.includes(cliftonStrength)) {
      removeStudentCliftonStrength(studentId, cliftonStrength);
    }
  })
}

const updateStudent = (studentData) => {
  StudentServices.updateStudent(studentData.id, studentData)
    .catch((e) => {
      message.value = e.response.data.message;
    })
    .finally(() => {
      refresh();
    })
}

const updateUser = (userData) => {
  UserServices.updateUser(userData.id, userData)
    .catch((e) => {
      message.value = e.response.data.message;
    })
    .finally(() => {
      refresh();
    })
}

const deleteUser = async (userId) => {
  return UserServices.deleteUser(userId)
    .catch((e) => {
      message.value = e.response.data.message;
    })
    .finally(() => {
      refresh();
    })
}

const deleteStudent = async (studentId) => {
  return StudentServices.deleteStudent(studentId)
    .catch((e) => {
      message.value = e.reponse.data.message;
    })
    .finally(() => {
      refresh();
    })
}
</script>

<style scoped>
.modified-width {
  height: 100vh;
  margin: 0 auto;
  padding-top: 15px;
  overflow-y: auto;
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