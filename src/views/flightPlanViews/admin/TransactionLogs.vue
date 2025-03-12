<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">Transactions</h1>
            <div class="search-filter-button-group">
                <!-- Search Bar -->
                <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
                class="search-bar">
                    <template v-slot:prepend-inner>
                        <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                    </template>
                </v-text-field>

                <!-- Filter by Award -->
                
                <v-autocomplete
                  v-model="selectedAwardFilter"
                  :items="filteredAwardOptions"
                  label="Filter By Award"
                  variant="solo-filled"
                  density="compact"
                  hide-details
                  class="filter-menu"
                  clearable
                  :menu-props="{ auto: true }"
                ></v-autocomplete>
                

                <!-- Filter by Approver -->
                <v-autocomplete
                  v-model="selectedApproverFilter"
                  :items="filteredApproverOptions"
                  label="Filter By Approver"
                  variant="solo-filled"
                  density="compact"
                  hide-details
                  class="filter-menu"
                  clearable
                  :menu-props="{ auto: true }"
                ></v-autocomplete>

                <!-- Filter by Student -->
                <v-autocomplete
                  v-model="selectedStudentFilter"
                  :items="filteredStudentOptions"
                  label="Filter By Student"
                  variant="solo-filled"
                  density="compact"
                  hide-details
                  class="filter-menu"
                  clearable
                  :menu-props="{ auto: true }"
                ></v-autocomplete>

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="redeemAwardPopup()">
                    Redeem Award
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredTransactions" :search="search" v-model:selectable="selected" show-select>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editTransaction(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <!-- Should not delete unless you are viewing the details, should I remove? Or maybe display the information and confirm deletion?-->
                <v-btn variant="plain" size="small" @click="deleteTaskConfirmation(item)">
                    <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import { VSelect } from 'vuetify/components';

import studentServices from '@/services/resumeBuilderServices/studentServices';
import userServices from '@/services/resumeBuilderServices/userServices';
import awardServices from '@/services/flightPlanServices/awardServices';
import transactionServices from '@/services/flightPlanServices/transactionServices';
import userRoleServices from '@/services/resumeBuilderServices/userRoleServices';
import userRolePermissionServices from '@/services/flightPlanServices/userRolePermissionServices';
import permissionServices from '@/services/flightPlanServices/permissionServices';

const headers = ref([
  { align: 'start', key: 'student', title: 'Student' },
  { key: 'approver', title: 'Approved By' },
  { key: 'shopItem', title: 'Item Purchased' },
  { key: 'dateApproved', title: 'Date' },
  { key: 'pointsSpent', title: 'Points Spent' },
  { key: 'actions', title: '', sortable: false }
]);

// Stores all transactions
const transactionList = ref([]);

const transactions = ref(null);
const search = ref('');
const selected = ref([]);

// Filter Variables
const filterAwardOptions = ref([]);
const filterApproverOptions = ref([]);
const filterStudentOptions = ref([]);
const selectedAwardFilter = ref(null);
const selectedApproverFilter = ref(null);
const selectedStudentFilter = ref(null);
const awardSearch = ref('');
const approverSearch = ref('');
const studentSearch = ref('');

const awards = ref(null);
const users = ref(null);
const usersAndPermissions = ref(null);

const filteredAwardOptions = computed(() => {
  if (!awardSearch.value) return filterAwardOptions.value; // Show all if no input
  return filterAwardOptions.value.filter((award) =>
    award.toLowerCase().includes(awardSearch.value.toLowerCase())
  );
});

const filteredApproverOptions = computed(() => {
  if (!approverSearch.value) return filterApproverOptions.value; // Show all if no input
  return filterApproverOptions.value.filter((award) =>
    award.toLowerCase().includes(approverSearch.value.toLowerCase())
  );
});

const filteredStudentOptions = computed(() => {
  if (!studentSearch.value) return filterStudentOptions.value; // Show all if no input
  return filterStudentOptions.value.filter((award) =>
    award.toLowerCase().includes(studentSearch.value.toLowerCase())
  );
});

const filteredTransactions = computed(() => {
  return transactionList.value.filter(item => {
    const matchesSearch = !search.value || item.student.toLowerCase().includes(search.value.toLowerCase()) 
                                        || item.approver.toLowerCase().includes(search.value.toLowerCase()) 
                                        || item.shopItem.toLowerCase().includes(search.value.toLowerCase());
    const matchesAwardCategory = selectedAwardFilter.value === "All" || !selectedAwardFilter.value || item.shopItem === selectedAwardFilter.value;
    const matchesApproverCategory = selectedApproverFilter.value === "All" || !selectedApproverFilter.value || item.approver === selectedApproverFilter.value;
    const matchesStudentCategory = selectedStudentFilter.value === "All" || !selectedStudentFilter.value || item.student === selectedStudentFilter.value;
    return matchesSearch && matchesAwardCategory && matchesApproverCategory && matchesStudentCategory;
  })
})

onMounted(() => {
  // Get Transactions
  getTransactions();

  // Get All Awards
  getAllAwards();

  getAllPermissions();
});

const getTransactions = () => {
  transactionServices.getAllTransactions()
    .then((res) => {
      transactions.value = res.data;
      getTransactionDetails();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getTransactionDetails = async () => {
  const promises = transactions.value.map(transaction => retrieveData(transaction));
  transactionList.value = await Promise.all(promises);
}

const retrieveData = async (transaction) => {
  try {
    const student = await studentServices.getStudent(transaction.studentId);
    const studentUser = await userServices.getAllStudentUsers(student.data.id)

    const approver = await userServices.getUser(transaction.userId);
    
    const award = await awardServices.getAward(transaction.awardId);

    const studentName = studentUser.data[0].fName + " " + studentUser.data[0].lName;
    const approverName = approver.data.fName + " " + approver.data.lName;

    return {
      transactionId: transaction.id,
      student: studentName,
      approver: approverName,
      shopItem: award.data.name,
      dateApproved: formatDate(transaction.date_approved),
      pointsSpent: transaction.points_spent,
    }

  } catch (error) {
    console.log("Error:", error);
    return null; 
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

const getAllAwards = () => {
  awardServices.getAllAwards()
    .then((res) => {
      awards.value = res.data;
      filterAwardOptions.value = ['All', ...awards.value.map((award => award.name))];
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getAllPermissions = async () => {
  try {
    const res = await userServices.getAllUsers();
    users.value = res.data;

    const promises = users.value.map(user => getUsersPermissions(user));
    usersAndPermissions.value = await Promise.all(promises);
    
    filterApproverOptions.value = usersAndPermissions.value
      .filter(user => user.permissions.includes('shop_maintenance'))
      .map(user => user.name);

    filterApproverOptions.value.unshift('All');
      
    filterStudentOptions.value = usersAndPermissions.value
      .filter(user => user.permissions.includes('student_view'))
      .map(user => user.name);

    filterStudentOptions.value.unshift('All');
  } catch (error) {
    console.log("Error:", error);
  }
}

const getUsersPermissions = async (user) => {
  try {
    const userRole = await userRoleServices.getAllUserRoles(user.id);
    const userRolePermissions = await userRolePermissionServices.getAllPermissionsForUser(userRole.data[0].id);

    const permissionPromises = userRolePermissions.data.map(async (userRolePermission) => {
      const permission = await permissionServices.getPermission(userRolePermission.permissionId);
      return permission.data;
    });

    const permissions = (await Promise.all(permissionPromises)).map(permission => permission.type);

    return {
      name: user.fName + " " + user.lName,
      permissions: permissions
    }

  } catch (error) {
    console.log("Error:", error);
    return null; 
  }
}

</script>

<style scope>
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

</style>