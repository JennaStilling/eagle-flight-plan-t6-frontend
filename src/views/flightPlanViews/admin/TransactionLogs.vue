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

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addTransactionPopup()">
                    Redeem Award
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredTransactions" :search="search" style="padding: 25px">
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editTransactionPopup(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <!-- Should not delete unless you are viewing the details, should I remove? Or maybe display the information and confirm deletion?-->
                <v-btn variant="plain" size="small" @click="toggleRefundModal(item)">
                    <Icon icon="mdi:cash-refund" width="24" height="24" />
                </v-btn>
            </template>
        </v-data-table>
    </v-card>

    <!-- Redeeming Points Modal -->
    <div v-if="showRedeemPoints" class="modal">
      <div class="modal-content">
        <span @click="toggleRedeemPointsModal()" class="close">&times;</span>
        <br>

        <div class="popup-header">
          <div v-if="transactionAdd" class="transaction-title">Redeem an Award</div>
          <div v-if="transactionEdit" class="transaction-title">Update the Transaction</div>
        </div>

        <div style="color: red">{{ message }}</div>

        <div class="popup-content">
          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.studentId }}</label>
            </v-col>
            <v-col>
              <textarea v-model="studentSchoolId" class="input-field"></textarea>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.student }}</label>
            </v-col>
            <v-col>
              <div 
                class="input-field"
                rows="2"
                style="margin-bottom: 7px">
                {{ getStudentUser(selectedStudent[0]) }}
              </div>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.item }}</label>
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="award"
                :items="awardOptions"
                class="dropdown-input-field"
                placeholder="Select an Award"
                variant="solo-filled"
                density="compact"
                hide-details
                flat
                bg-color="transparent"
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.points }}</label>
            </v-col>
            <v-col>
              <div 
                class="input-field"
                rows="2"
                style="margin-bottom: 7px">
                {{ selectedAward[0]?.cost }}
              </div>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.approvedBy }}</label>
            </v-col>
            <v-col>
              <div 
                class="input-field"
                rows="2"
                style="margin-bottom: 7px">
                {{ name }}
              </div>
            </v-col>
          </v-row>

          <v-row class="form-row">
            <v-col class="label-column">
              <label class="label-description">{{ labels.dateApproved }}</label>
            </v-col>
            <v-col>
              <div 
                class="input-field"
                rows="2"
                style="margin-bottom: 7px">
                {{ formatDate(dateApproved) }}
              </div>
            </v-col>
          </v-row>

        </div>
        
        <div class="btn-container">
          <button v-if="transactionAdd" class="add-btn" @click="addTransaction()">Add</button>
          <button v-if="transactionEdit" class="add-btn" @click="editTransaction()">Save</button>
          <button class="cancel-btn" @click="toggleRedeemPointsModal()">Cancel</button>
          <button v-if="transactionEdit" class="delete-btn" @click="toggleRefundModal(transactionToEdit)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Refund/Delete Modal -->
    <div v-if="showRefundTransaction" class="modal">
      <div class="modal-content" style="padding: 50px">
        <div class="modal-header" style="margin-bottom: 10px;">
          <span @click="showRefundTransaction = false" class="close">&times;</span>
          <p v-if="!refundError">
            Do you want to REFUND <br />
            {{ transactionToRefund.student }}'s order?
          </p>
          <p v-if="refundError">
            Error refunding<br />{{ transactionToRefund.student }}'s order.
          </p>
        </div>
        <div class="btn-container">
          <v-btn v-if="!refundError" color="#708E9A" @click="showRefundTransaction = false">CANCEL</v-btn>
          <v-btn v-if="!refundError" color="#F04E3E" class="error" @click="refundTransaction()">REFUND</v-btn>
          <v-btn v-if="refundError" @click="
            refundError = false;
            showRefundTransaction = false;
          ">CLOSE</v-btn>
        </div>
      </div>
    </div>
    <v-snackbar v-model="showSnackbar" timeout="5000" color="success" style="color: white">
      {{ snackbarMessage }}
    </v-snackbar>
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
import "@/assets/generic-stylesheet.css";

const user = ref(null);
const name = ref(null);

const headers = ref([
  { align: 'start', key: 'student', title: 'Student' },
  { key: 'approver', title: 'Approved By' },
  { key: 'shopItem', title: 'Item Purchased' },
  { key: 'dateApproved', title: 'Date' },
  { key: 'pointsSpent', title: 'Points Spent' },
  { key: 'actions', title: '', sortable: false }
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

const showSnackbar = ref(false);
const snackbarMessage = ref("");

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

// Combines the dropdown selections and text search to display only a list of Transactions that match all criteria
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

onMounted(() => {
  user.value = Utils.getStore("user");
  if (user.value) {
    name.value = user.value.fName + " " + user.value.lName;
  }

  // Get Transactions
  getTransactions();

  // Get All Awards
  getAllAwards();

  // Gets permissions to create an admin and student list for adding/editing a transaction
  getAllPermissions();

  // Gets the student objects and store it into an array
  getAllStudents();
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

// Gets the permissions of each user in the database and adds them to an approver and student list depending of their permissions
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

    // Creates a list without the all for the add/edit modal
    studentOptions.value = [...filterStudentOptions.value];

    filterStudentOptions.value.unshift('All');
  } catch (error) {
    console.log("Error:", error);
  }
}

// Returns only the user's name and their permissions
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

const getAllStudents = () => {
  studentServices.getAllStudents()
    .then((res) => {
      students.value = res.data;
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getStudentUser = (student) => {
  if (!student) return;
  const studentUser = users.value.filter(item => item.studentId === student.id);
  return studentUser[0].fName + " " + studentUser[0].lName;
}

const toggleRedeemPointsModal = () => {
  showRedeemPoints.value = !showRedeemPoints.value;
}

// Add functionality
const addTransactionPopup = () => {
  toggleRedeemPointsModal();
  transactionAdd.value = true;
  transactionEdit.value = false;
  transactionToEdit.value = null;
  
  message.value = "";
  studentSchoolId.value = null;
  award.value = null;
  dateApproved.value = new Date();
}

const addTransaction = () => {
  // Check if student Id exists
  if(selectedStudent.value.length < 1) {
    message.value = `The student with ID: ${studentSchoolId.value} does not exist`;
    return;
  }

  const student = selectedStudent.value[0];
  const shopItem = selectedAward.value[0];

  // Check to see if selected student has enough points
  if(student.points < shopItem.cost) {
    message.value = `The student is ${shopItem.cost - student.points} short of buying ${award.value}`
    return;
  }

  // Create transaction
  const newTransaction = {
    points_spent: shopItem.cost,
    date_approved: dateApproved.value
  }

  transactionServices.createTransaction(user.value.userId, student.id, shopItem.id, newTransaction)
    .then((res) => {
      console.log("Transaction created successfully");
      console.log(res.data);
      snackbarMessage.value = "Transaction created successfully";
      showSnackbar.value = true;
      getTransactions();
      toggleRedeemPointsModal();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })

  // Update student points count
  student.points -= shopItem.cost;
  studentServices.updateStudent(student.id, student)
    .then((res) => {
      console.log("Student's Points updated Succesffuly");
      console.log(res.data);
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

// Edit functionality
const editTransactionPopup = (transaction) => {
  toggleRedeemPointsModal();
  transactionAdd.value = false;
  transactionEdit.value = true;
  transactionToEdit.value = transaction;

  message.value = "";
  studentSchoolId.value = transactionToEdit.value.studentSchoolId;
  priorStudent.value = selectedStudent.value[0];
  award.value = transactionToEdit.value.shopItem;
  priorAward.value = selectedAward.value[0];
}

// I question the necessity of editing a transaction
const editTransaction = () => {
  // Have to check if the new student school ID (if there is one) is valid
  if(selectedStudent.value.length < 1) {
    message.value = `The student with ID: ${studentSchoolId.value} does not exist`;
    return;
  }

  const student = selectedStudent.value[0];
  const shopItem = selectedAward.value[0];

  // Checks if the student has enough points for the selected award
  if (priorStudent.value.student_issued_id === studentSchoolId.value) {
    // Since it is the same student, check new award cost - (student's current points + previous award costs)
    if (student.points + priorAward.value.cost < shopItem.cost) {
      message.value = `The student is ${shopItem.cost - (student.points + priorAward.value.cost)} short of buying ${award.value}`
      return;
    }
    
    // If they have enough calculate the students new current points for the difference when the award is updated
    student.points += priorAward.value.cost;
  }
  else {
    // Since it is a different student, there is no need to consider the students total with the previous award, but the previous student still needs their refund
    if(student.points < shopItem.cost) {
      message.value = `The student is ${shopItem.cost - student.points} short of buying ${award.value}`
      return;
    }

    // If the new student has enough, then the transaction will update and the previous student needs their refund
    priorStudent.value.points += priorAward.value.cost;

    studentServices.updateStudent(priorStudent.value.id, priorStudent.value)
      .then((res) => {
        console.log("Prior Student, " + priorStudent.value.student_issued_id + ", has received their refund ");
        console.log(res.data);
      })
      .catch((error) => {
        console.log("Error: " + error);
      });
  }

  const editTransaction = {
    points_spent: shopItem.cost,
    date_approved: dateApproved.value,
    userId: user.value.userId,
    studentId: student.id,
    awardId: shopItem.id
  }

  // Update Transaction
  console.log(transactionToEdit.value);
  transactionServices.updateSystemTransaction(transactionToEdit.value.transactionId, editTransaction)
    .then((res) => {
      console.log("Updated Transaction Successfully");
      console.log(res.data);
      snackbarMessage.value = "Transaction updated successfully";
      showSnackbar.value = true;
      toggleRedeemPointsModal();
      getTransactions();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })

  // Update students new current points
  student.points -= shopItem.cost;
  studentServices.updateStudent(student.id, student)
    .then((res) => {
      console.log("Student's points updated succesfully");
      console.log(res.data);
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

// Delete/Refund functionality
const toggleRefundModal = (transaction) => {
  transactionToRefund.value = transaction;
  showRefundTransaction.value = !showRefundTransaction.value;
  showRedeemPoints.value = false;
  transactionAdd.value = false;
  transactionEdit.value = false;
}

// Refund the students points and delete the task
const refundTransaction = () => {
  studentSchoolId.value = transactionToRefund.value.studentSchoolId;
  const student = selectedStudent.value[0]
  student.points += transactionToRefund.value.pointsSpent;

  studentServices.updateStudent(student.id, student)
    .then((res) => {
      console.log("Successfully Refunded Student");
      console.log(res.data)
    })
    .catch((error) => {
      console.log("Error: " + error);
    });

  transactionServices.deleteSystemTransaction(transactionToRefund.value.transactionId)
    .then((res) => {
      console.log("Successfully removed transaction");
      console.log(res.data);
      snackbarMessage.value = "Transaction successfully refunded";
      showSnackbar.value = true;
      showRefundTransaction.value = false;
      getTransactions();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

</script>

<style scope>
/* Redeem points modal */
.modal { /* Same as in Profile.vue*/
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

.modal-content { /* Same as in Profile.vue*/
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

.popup-content {
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.dropdown-input-field {
  width: 70%;
  min-width: 400px;
  height: 42px !important; 
  border-radius: 10px;
  margin: 0px 0px 7px 0px;
  background: rgba(32, 32, 32, 0.15) !important; 
  border-radius: 10px !important; 
}

.input-field {
  font-family: 'Poppins', sans-serif;
}

.add-btn {
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

.delete-btn {
  width: 160px;
  height: 60px;
  border-radius: 10px;
  background: #F04E3E;
  /* Typography */
  color: #FFF;
  text-align: center;
  font-family: Poppins;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>