<!-- TODO - Ask whoever coded this page if we could shrink the description section a little -->
<template>
  <v-card flat>
    <div class="title-row">
      <h1 class="table-title">Clifton Strengths</h1>
      <div class="search-filter-button-group">
        <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
          class="search-bar">
          <template v-slot:prepend-inner>
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </template>
        </v-text-field>

        <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category" variant="solo-filled"
          density="compact" hide-details class="filter-menu"></v-select>

        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addStrengthPopup()">
          Add Strength
        </v-btn>
        <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedStrengths(selected)">
          Delete Selected Strengths
        </v-btn>
      </div>
    </div>

    <v-data-table :headers="headers" :items="filteredStrengths" :search="search" v-model:selectable="selected"
      show-select>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn variant="plain" size="small" @click="editStrengthPopup(item)">
          <Icon icon="material-symbols:edit-outline" width="24" height="24" />
        </v-btn>
        <v-btn variant="plain" size="small" @click="deleteStrengthConfirmation(item)">
          <Icon icon="material-symbols:delete-outline" width="24" height="24" />
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <div v-if="showDeleteItem" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span @click="showDeleteItem = false" class="close">&times;</span>
        <p v-if="!deleteError">
          Do you want to DELETE <br />
          {{ strengthToDelete.name }}?
        </p>
        <p v-if="deleteError">
          Error deleting<br />{{ strengthToDelete.name }}.
        </p>
      </div>
      <div class="modal-body">
        <v-btn v-if="!deleteError" class="button" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
        <v-btn v-if="!deleteError" color="#F04E3E" class="error button" @click="deleteStrength(strength)">DELETE</v-btn>
        <v-btn v-if="deleteError" class="button" @click="
          deleteError = false;
        showDeleteItem = false;
        ">CLOSE</v-btn>
      </div>
    </div>
  </div>

  <div v-if="showStrengthDetails" class="modal edit-form-body">
    <v-card class="edit-popup mx-auto">
      <v-card-title class="popup-header">
        <v-text-field v-model="strengthName">
          <Icon icon="material-symbols:edit-outline" width="24" height="24" />
        </v-text-field>

      </v-card-title>

      <v-divider></v-divider>

      <!-- Category-->
      <v-container class="popup-content">
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.category }}</label>
          </v-col>

          <v-col cols="7">
            <v-select v-model="strengthCategory" :items="categoryOptions" variant="solo-filled" density="compact"
              hide-details class="filter-menu"></v-select>
          </v-col>
        </v-row>


        <!-- Description-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.description }}</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="strengthDescription" rows="12" auto-grow variant="outlined"
              density="compact"></v-textarea>
          </v-col>
        </v-row>

      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="popup-actions">
        <v-spacer></v-spacer>
        <v-btn v-if="strengthEdit" class="button" color="#F04E3E" variant="flat"
          @click="deleteStrengthConfirmation(strengthToEdit)">Delete</v-btn>
        <v-btn color=" #708E9A" class="button" variant="flat" @click="showStrengthDetails = false">Cancel</v-btn>
        <v-btn color="#5EC4B6" class="button" variant="flat"
          @click="strengthEdit ? editStrength() : addStrength()">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, computed, onMounted } from 'vue';
import CliftonStrengthServices from '@/services/flightPlanServices/cliftonStrengthServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const strengths = ref([]);
const message = ref('');
const selected = ref([]);
const showStrengthDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');

const strengthToEdit = ref(null);
const strengthToDelete = ref(null);
const strengthEdit = ref(false);
const strengthAdd = ref(false);

const strengthName = ref("");
const strengthCategory = ref("");
const strengthDescription = ref("");



const headers = ref([
  { align: 'start', key: 'name', title: 'Name' },
  { key: 'description', title: 'Description' },
  { key: 'category', title: 'Category' },
  { key: 'actions', title: '', sortable: false }
]);

const filterOptions = ['All', 'Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'];
const categoryOptions = ['Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'];

const labels = {
  category: "Category",
  description: "Description",
};

const filteredStrengths = computed(() => {
  if (selectedFilter.value === 'All') {
    return strengths.value;
  }

  if (selectedFilter.value === 'Relationship Building') {
    selectedFilter.value = 'relationship_building'
  }

  if (selectedFilter.value === 'Strategic Thinking') {
    selectedFilter.value = 'strategic_thinking'
  }

  return strengths.value.filter(strength => {
    return strength.category === selectedFilter.value.toLowerCase();
  });
});

onMounted(() => {
  getAllStrengths();
});

const getAllStrengths = () => {
  CliftonStrengthServices.getAllCliftonStrengths()
    .then((res) => {
      strengths.value = res.data;
      message.value = '';
    })
    .catch((err) => {
      message.value = `Error: ${err.code}: ${err.message}`;
      console.error(err);
    });
}

const editStrengthPopup = (strength) => {
  strengthToEdit.value = strength;
  showStrengthDetails.value = true;
  strengthEdit.value = true;
  strengthAdd.value = false;

  strengthCategory.value = capitalize(strengthToEdit.value.category);
  strengthDescription.value = strengthToEdit.value.description;
  strengthName.value = strengthToEdit.value.name;
};

function capitalize(s) {
  return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

const editStrength = () => {
  if (strengthCategory.value === 'Relationship Building') {
    strengthCategory.value = 'relationship_building'
  }

  if (strengthCategory.value === 'Strategic Thinking') {
    strengthCategory.value = 'strategic_thinking'
  }

  const updatedStrength = {
    category: strengthCategory.value.toLowerCase(),
    name: strengthName.value,
    description: strengthDescription.value,
  };

  CliftonStrengthServices.updateCliftonStrength(strengthToEdit.value.id, updatedStrength)
    .then((response) => {
      console.log("Strength updated successfully:", response.data);
      showStrengthDetails.value = false;
      getAllStrengths();
    })
    .catch((e) => {
      message.value = e.response.data.message;
      deleteError.value = true;
    });
};


const addStrengthPopup = () => {
  showStrengthDetails.value = true;
  strengthAdd.value = true;
  strengthEdit.value = false;
  strengthToEdit.value = null;

  strengthName.value = "";
  strengthDescription.value = "";
  strengthCategory.value = "";

};


const addStrength = () => {
  if (strengthCategory.value === 'Relationship Building') {
    strengthCategory.value = 'relationship_building'
  }

  if (strengthCategory.value === 'Strategic Thinking') {
    strengthCategory.value = 'strategic_thinking'
  }

  const newStrength = {
    name: strengthName.value,
    description: strengthDescription.value,
    category: strengthCategory.value.toLowerCase(),
  };

  console.log(newStrength)

  CliftonStrengthServices.createCliftonStrength(newStrength).then((response) => {
    showStrengthDetails.value = false;
    console.log("Strength added successfully:", response.data);
    getAllStrengths();
  })
    .catch((e) => {
      console.log(e)
      //message.value = e.response.data.message;
      deleteError.value = true;
    });
}


const deleteStrengthConfirmation = (strength) => {
  strengthToDelete.value = strength;
  showDeleteItem.value = true
  showStrengthDetails.value = false;

  console.log('Delete item:', strengthToDelete.value.name);
};

const deleteStrength = () => {
  CliftonStrengthServices.deleteCliftonStrength(strengthToDelete.value.id)
    .then(() => {
      showDeleteItem.value = false;
      strengths.value = strengths.value.filter((allStrengths) => allStrengths.id !== strengthToDelete.value.id);
    })
    .catch((e) => {
      message.value = e.response.data.message;
      deleteError.value = true;
    });
};

const deleteSelectedStrengths = (selected) => {
  if (selected.length > 0) {
    console.log("Deleting selected strengths: ", selected);
    selected.forEach(strength => {
      console.log("Deleting strength: ", strength.name);
      CliftonStrengthServices.deleteCliftonStrength(strength.id)
        .then(() => {
          showDeleteItem.value = false;
          strengths.value = strengths.value.filter((allStrengths) => allStrengths.id !== strength.id);
        })
        .catch((e) => {
          message.value = e.response.data.message;
          deleteError.value = true;
        });
    });
  } else {
    console.log("No strengths selected.");
  }
}

</script>