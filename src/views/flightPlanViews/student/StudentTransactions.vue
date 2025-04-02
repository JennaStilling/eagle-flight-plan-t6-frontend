<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">
                <img :src="ShopIcon" alt="Shop Icon" class="shop-icon" />
                Spending History</h1>
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
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredTransactions" :search="search" style="padding: 25px">
        </v-data-table>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import Utils from "@/config/utils";
import studentServices from '@/services/resumeBuilderServices/studentServices';
import userServices from '@/services/resumeBuilderServices/userServices';
import awardServices from '@/services/flightPlanServices/awardServices';
import transactionServices from '@/services/flightPlanServices/transactionServices';
import userRoleServices from '@/services/resumeBuilderServices/userRoleServices';
import userRolePermissionServices from '@/services/flightPlanServices/userRolePermissionServices';
import permissionServices from '@/services/flightPlanServices/permissionServices';
import ShopIcon from '@/assets/navigation/shoppingCart.png';

const user = ref(null);
const name = ref(null);

const headers = ref([
  { key: 'shopItem', title: 'Item Purchased' },
  { key: 'pointsSpent', title: 'Points Spent' },
  { key: 'dateApproved', title: 'Date' },
  { key: 'approver', title: 'Approved By' }
]);

const labels = {
  studentId: "Student ID",
  student: "Student",
  item: "Item",
  points: "Points",
  dateApproved: "Date Approved", 
  approvedBy: "Approved By"
};

// Stores all transactions
const transactionList = ref([]);
const transactions = ref(null);
const search = ref('');

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
const students = ref(null);
const studentId = ref([]);
const users = ref(null);
const usersAndPermissions = ref(null);

// Add Modal Variables
const message = ref("");
const showRedeemPoints = ref(false);
const studentSchoolId = ref(null);
const award = ref(null);
const dateApproved = ref(new Date());

const awardOptions = ref(null); // Modal award lists
const studentOptions = ref(null); // Modal student lists

const transactionAdd = ref(false);
const transactionEdit = ref(false);

// Edit Varaibles
const transactionToEdit = ref(null);
const priorStudent = ref(null);
const priorAward = ref(null);

// Refund/Delete Variables
const showRefundTransaction = ref(false);
const transactionToRefund = ref(null);
const refundError = ref(false);

// Displays a dropdown of awards that matches the users search
const filteredAwardOptions = computed(() => {
  if (!awardSearch.value) return filterAwardOptions.value;
  return filterAwardOptions.value.filter((award) =>
    award.toLowerCase().includes(awardSearch.value.toLowerCase())
  );
});

// Displays a dropdown of approvers that matches the users search
const filteredApproverOptions = computed(() => {
  if (!approverSearch.value) return filterApproverOptions.value;
  return filterApproverOptions.value.filter((award) =>
    award.toLowerCase().includes(approverSearch.value.toLowerCase())
  );
});

// Displays a dropdown of students that matches the users search
const filteredStudentOptions = computed(() => {
  if (!studentSearch.value) return filterStudentOptions.value;
  return filterStudentOptions.value.filter((award) =>
    award.toLowerCase().includes(studentSearch.value.toLowerCase())
  );
});

const filteredTransactions = computed(() => {
  return transactionList.value.filter(item => {
    const matchesSearch = !search.value || item.shopItem.toLowerCase().includes(search.value.toLowerCase()) 
                                        || item.approver.toLowerCase().includes(search.value.toLowerCase());
    const matchesAwardCategory = selectedAwardFilter.value === "All" || !selectedAwardFilter.value || item.shopItem === selectedAwardFilter.value;
    const matchesApproverCategory = selectedApproverFilter.value === "All" || !selectedApproverFilter.value || item.approver === selectedApproverFilter.value;
    return matchesSearch && matchesAwardCategory && matchesApproverCategory;
  });
});

// Computed Values for add/edit modal
// Gets the award object based on the selected dropdown menu in the add/edit modal
const selectedAward = computed(() => {
  return awards.value.filter(item => item.name === award.value);
})

// Gets the student object based on the student school ID entered
const selectedStudent = computed(() => {
  return students.value.filter(item => item.student_issued_id === studentSchoolId.value);
})

onMounted(async () => {
  user.value = Utils.getStore("user");
  if (user.value) {
    name.value = user.value.fName + " " + user.value.lName;
  }
  user.value = Utils.getStore("user");

  const userRes = await userServices.getAllStudentUsers(user.value.userId);
  studentId.value = userRes.data[0].studentId;
  console.log("Student ID: ", studentId.value);

  // Get Transactions
  getTransactions();

  // Get All Awards
  getAllAwards();
});

const getTransactions = () => {
  transactionServices.getAllTransactions()
    .then((res) => {
      transactions.value = res.data.filter(transaction => transaction.studentId === studentId.value); // Filter by matching studentId
      getTransactionDetails();
    })
    .catch((error) => {
      console.log("Error: " + error);
    });
};

const getTransactionDetails = async () => {
  const promises = transactions.value.map(transaction => retrieveData(transaction));
  transactionList.value = await Promise.all(promises);
}

// Creates the transaction data that is displayed in the list
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
      studentSchoolId: student.data.student_issued_id,
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
      awardOptions.value = awards.value.map((award => award.name));
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
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

textarea,  
.input-field {
  width: 70%;
  min-width: 400px;
  height: 42px !important; 
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

.transaction-title {
  font-family: 'Poppins', sans-serif; 
  font-size: 32px; 
  padding-left: 10px;
  height: 150px; 
  text-align: center;
  width: 100%;
  min-width: 400px;
  border-radius: 10px;
  background: rgba(32, 32, 32, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-row + .v-row {
    margin-top: 0px;
}

.v-col{
  padding: 0px 12px 0px 12px;
}

.form-row {
  display: flex;
  justify-content: flex-start;
  display: flex;
  align-items: center;
  margin-bottom: 0px;
}

.shop-icon {
  width: 29px;
  height: 29px;
  margin-right: 2px;
  vertical-align: middle;
}

.v-data-table {
  margin: 0 16px 16px 16px;
  user-select: none;
  width: 98%;
  box-shadow: 0 8px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>