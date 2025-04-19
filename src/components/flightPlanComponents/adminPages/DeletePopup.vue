<template>
    <slot name="trigger" :open="showDeletePopup" />
    <v-overlay v-model="overlay" class="popup">
        <v-card class="popup-actions">
            <div class="scroll">
                <div class="modal-header">
                    <br />
                    <p> Do you want to DELETE<br /></p>
                    <p>{{ name }}</p>
                </div>
                <v-card-actions class="button-row-delete">
                    <v-btn class="button" variant="elevated" color="#708E9A" @click="cancelDelete">CANCEL</v-btn>
                    <v-btn class="button" variant="elevated" color="#F04E3E" @click="confirmDelete">DELETE</v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </v-overlay>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref } from "vue";

const props = defineProps({
    name: String,
});

const emit = defineEmits(['delete']);

const overlay = ref(false);

const showDeletePopup = () => {
    overlay.value = !overlay.value;
};

const confirmDelete = () => {
    overlay.value = false;
    emit('delete');
};

const cancelDelete = () => {
    overlay.value = false;
};
</script>

<style scoped>
.label-column {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    margin-top: 0px;
    padding-top: 0;
    height: 50px;
}
</style>