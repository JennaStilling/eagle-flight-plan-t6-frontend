<template>
    <div>
        <v-card flat>
            <!-- Title, includes search, add, and mass deletion function -->
            <div class="title-row">
                <h1 class="table-title">Shop Items</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>

                    <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Cost"
                        variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>

                    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addItemPopup()">
                        Add Item
                    </v-btn>
                    <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedItemsConfirmation(selected)">
                        Delete Selected Items
                    </v-btn>
                </div>
            </div>

            <!-- List of all items -->
            <v-data-table :headers="headers" :items="filteredItems" :search="search" v-model="selected"
                show-select>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn variant="plain" size="small" @click="editItemPopup(item)">
                        <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                    </v-btn>
                    <v-btn variant="plain" size="small" @click="deleteItemConfirmation(item)">
                        <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <!-- Delete Selected Items -->
        <div v-if="showSelectedDeleteItem" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span @click="showSelectedDeleteItem = false" class="close">&times;</span>
                    <p v-if="!deleteError">
                        Do you want to Selected Items? <br />
                    </p>
                    <p v-if="deleteError">
                        Error deleting Selected Items<br />
                    </p>
                </div>
                <div class="modal-body">
                    <v-btn v-if="!deleteError" color="#708E9A" @click="showSelectedDeleteItem = false">CANCEL</v-btn>
                    <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteSelectedItems(selectedItemsToDelete)">DELETE</v-btn>
                    <v-btn v-if="deleteError" @click="
                        deleteError = false;
                        showSelectedDeleteItem = false;
                    ">CLOSE</v-btn>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <div v-if="showDeleteItem" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span @click="showDeleteItem = false" class="close">&times;</span>
                    <p v-if="!deleteError">
                        Do you want to DELETE <br />
                        {{ itemToDelete.name }}?
                    </p>
                    <p v-if="deleteError">
                        Error deleting<br />{{ itemToDelete.name }}.
                    </p>
                </div>
                <div class="modal-body">
                    <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
                    <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteItem(item)">DELETE</v-btn>
                    <v-btn v-if="deleteError" @click="
                        deleteError = false;
                        showDeleteItem = false;
                    ">CLOSE</v-btn>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Shop Item Modal -->
    <div v-if="showItemDetails" class="modal edit-form-body">
    <v-card class="edit-popup mx-auto">
      <v-card-title class="popup-header">
        <!-- Image Handling -->
        <v-container class="image-container" @click="triggerFileInput">
            <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="fileUpload($event)"
            />
            <div v-if="itemImage" class="image-preview">
                <img :src="itemImage" alt="Uploaded Image" />
            </div>
        </v-container>
        <v-text-field v-model="itemName"><Icon icon="material-symbols:edit-outline" width="24" height="24" /></v-text-field>

      </v-card-title>

      <v-divider></v-divider>
      
      <v-container class="popup-content">
        <!-- Description-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.description }}</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="itemDescription" rows="2" variant="outlined" density="compact"></v-textarea>
          </v-col>
        </v-row>

        <!-- Cost -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.cost }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="itemCost" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Redemption Type -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.redemptionType }}</label>
          </v-col>

          <v-col cols="7">
              <v-select v-model="itemRedemptionType" :items="redemptionOptions" variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>
          </v-col>
        </v-row>

        <!-- Redemption Info -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.redemptionInfo }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="itemRedemptionInfo" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="popup-actions">
        <v-spacer></v-spacer>
        <v-btn v-if="itemEdit" color="red" variant="outlined" @click="deleteItemConfirmation(itemToEdit)">Delete</v-btn>
        <v-btn color="grey" variant="outlined" @click="showItemDetails = false">Cancel</v-btn>
        <v-btn color="green" variant="flat" @click="itemEdit ? editItem() : addItem()">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import awardServices from '@/services/flightPlanServices/awardServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const items = ref([]);
const message = ref('');
const selected = ref([]);
const showItemDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');
const selectedItemsToDelete = ref(null);
const showSelectedDeleteItem = ref(false);

const itemToEdit = ref(null);
const itemToDelete = ref(null);
const itemEdit = ref(false);
const itemAdd = ref(false);

const itemName = ref(null);
const itemDescription = ref(null);
const itemCost = ref(null);
const itemRedemptionType = ref(null);
const itemRedemptionInfo = ref(null);
const itemImage = ref(null); // Suppose to hold the image, we'll see how I do this later
const imageBase64 = ref(null);

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'cost', title: 'Cost' },
    { key: 'redemption_info', title: 'Redemption Info' },
    { key: 'actions', title: '', sortable: false }
]);

const labels = {
  description: "Description",
  cost: "Cost",
  redemptionType: "Redemption Type",
  redemptionInfo: "Redemption Info"
};

const filterOptions = ref(['All', 'Less than 200', '200 - 400', '400 - 600', '600 - 800', '800 - 1000', 'More than 1000']);
const redemptionOptions = ['In Person', 'Online'];

// !!!!!!!!!!!!!!!!!Gonna have to change this
const filteredItems = computed(() => {
    if (selectedFilter.value === 'All') {
        return items.value;
    }
    else if (selectedFilter.value === 'Less than 200') {
        return items.value.filter(item => item.cost <= 200);
    }
    else if (selectedFilter.value === 'More than 1000') {
        return items.value.filter(item => item.cost >= 1000);
    }
    else {
        const [min, max] = selectedFilter.value.split(' - ').map(Number);
        return items.value.filter(item => item.cost >= min && item.cost < max);
    }
});

onMounted(() => {
    getAllAwards();
});

const getAllAwards = () => {
    awardServices.getAllAwards()
        .then((res) => {
            items.value = res.data;
            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
}

// Propagates the modal when the user selects to edit an item
const editItemPopup = (item) => {
  itemToEdit.value = item;
  showItemDetails.value = true;
  itemEdit.value = true;
  itemAdd.value = false;

  itemName.value = itemToEdit.value.name;
  itemDescription.value = itemToEdit.value.description;
  itemCost.value = itemToEdit.value.cost;
  if (itemToEdit.value.redemption_type === 'in_person') itemRedemptionType.value = 'In Person';
  if (itemToEdit.value.redemption_type === 'online') itemRedemptionType.value = 'Online';
  itemRedemptionInfo.value = itemToEdit.value.redemption_info;
  // Converting base64 into an image, so far, the only image format allowed is png
  itemImage.value = `data:image/png;base64,${itemToEdit.value.image}`;
};

// Work in here
const editItem = () => {
    if (itemRedemptionType.value === 'In Person') itemRedemptionType.value = 'in_person';
    else if (itemRedemptionType.value === 'Online') itemRedemptionType.value = 'online';

    const editItem = {
        name: itemName.value,
        description: itemDescription.value,
        cost: itemCost.value,
        redemption_type: itemRedemptionType.value,
        redemption_info: itemRedemptionInfo.value,
        image: itemImage.value.split(',')[1] // Removes header before passing it to the backend
    }

    awardServices.updateAward(itemToEdit.value.id, editItem)
        .then((res) => {
            console.log("Award Updated Successfully: " + res.data);
            showItemDetails.value = false;
            getAllAwards();
        })
        .catch((error) => {
            console.log("Error: " + error);
        })
};

// Resets the modal on opening
const addItemPopup = () => {
  showItemDetails.value = true;
  itemAdd.value = true;
  itemEdit.value = false;
  itemToEdit.value = null;

  itemImage.value = null;
  imageBase64.value = null;
  itemName.value = null;
  itemDescription.value = null;
  itemCost.value = null;
  itemRedemptionType.value = null;
  itemRedemptionInfo.value = null;
};

// Adds the item to the backend
const addItem = () => {
    if (itemRedemptionType.value === 'In Person') itemRedemptionType.value = 'in_person';
    else if (itemRedemptionType.value === 'Online') itemRedemptionType.value = 'online';

    const newItem = {
        name: itemName.value,
        description: itemDescription.value,
        cost: itemCost.value,
        redemption_type: itemRedemptionType.value,
        redemption_info: itemRedemptionInfo.value,
        image: itemImage.value.split(',')[1] // Removes header before passing it to the backend
    }

    awardServices.createAward(newItem)
        .then((res) => {
            showItemDetails.value = false;
            console.log("Award added successfully: " + res.data);
            getAllAwards();
        })
        .catch((error) => {
            console.log("Error: " + error);
        })
};

const deleteItemConfirmation = (item) => {
    showItemDetails.value = false;
    itemToDelete.value = item;
    showDeleteItem.value = true
    console.log('Delete item:', itemToDelete.value.name);
};

const deleteItem = () => {
    awardServices.deleteAward(itemToDelete.value.id)
        .then(() => {
            showDeleteItem.value = false;
            items.value = items.value.filter((allItems) => allItems.id !== itemToDelete.value.id);
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};

const deleteSelectedItemsConfirmation = (selected) => {
    showSelectedDeleteItem.value = true;
    selectedItemsToDelete.value = selected;
}

const deleteSelectedItems = (selected) => {
    if (selected.length > 0) {
        console.log("Deleting selected items: ", selected);
        selected.forEach(item => {
            awardServices.deleteAward(item)
                .then(() => {
                    showSelectedDeleteItem.value = false;
                    getAllAwards();
                    items.value = items.value.filter((allItems) => allItems.id !== item.id);
                })
                .catch((e) => {
                    message.value = e.response.data.message;
                    deleteError.value = true;
                });
        });
    } else {
        console.log("No items selected.");
    }
};

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
            itemImage.value = base64String; // Preview
        };
    }
};

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

.label-column p {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 12px;
  color: #555;
}

.popup-header {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.popup-actions {
  padding: 12px;
  display: flex;
  justify-content: flex-end;
}

.edit-popup {
  max-width: 550px;
  /* Increased width */
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px;
}

.popup-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.label-column {
  white-space: nowrap;
  /* Prevents labels from wrapping */
  text-align: right;
  /* Aligns labels to the right */
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

.v-text-field,
.v-textarea {
  width: 100%;
  /* Ensures input fields take up full width */
}

.image-container {
    width: 200px;
    height: 200px;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    background: rgba(32, 32, 32, 0.15);
    border-radius: 90px;
}
</style>