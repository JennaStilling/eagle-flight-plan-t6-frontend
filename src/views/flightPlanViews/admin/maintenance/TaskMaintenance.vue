<template>
    <v-card
      title="Tasks"
      flat
    >
      <template v-slot:text>
        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>
  
      <v-data-table
        :headers="headers"
        :items="tasks"
        :search="search"
        :v-model="selected"
      ></v-data-table>
    </v-card>
  </template>

<script setup>
import { ref, onMounted } from 'vue';
import TaskServices from '@/services/flightPlanServices/taskServices';

// Reactive references for state
const search = ref('');
const tasks = ref([]);
const message = ref('');
const headers = ref([
  { align: 'start', key: 'name', title: 'Name' },
  { key: 'description', title: 'Description' },
  { key: 'category', title: 'Category' },
  { key: 'point_value', title: 'Point Value' },
  { key: 'reflection', title: 'Reflection Required?' },
]);

onMounted(() => {
  TaskServices.getAllTasks()
    .then((res) => {
      tasks.value = res.data; 
      message.value = '';
      console.log(tasks.value);
    })
    .catch((err) => {
      message.value = `Error: ${err.code}: ${err.message}`; // Show error message
      console.error(err);
    });
});
</script>

<style>
    /* @import stylesheet */
</style>


<style scoped>

</style>