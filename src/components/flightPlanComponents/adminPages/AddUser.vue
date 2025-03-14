<template>
    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addUser()">
        Add User
    </v-btn>


    <v-overlay v-model="overlay" class="popup">
        <v-card class="edit-user">
            <div class="scroll">
                <v-sheet class="form">

                    <v-form ref="form">
                        <h3>New User</h3>

                        <div class="image-container" @click="triggerFileInput">
                            <input type="file" ref="fileInput" style="display: none" @change="fileUpload($event)" />
                            <img :src="userData.image">
                        </div>

                        <div>
                            <h3>Assigned Roles:</h3>
                            <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma=1" color="primary"
                                rounded="lg" :text="formatRole(role.role_type)">
                            </v-chip>

                            <h3>Available Roles</h3>
                            <v-chip-group v-model="roleData.rolesToAdd" multiple>
                                <v-chip v-for="role in roles" :key="role.id" class="ma-1" color="primary" rounded="lg"
                                    :value="role.role_type" :text="formatRole(role.role_type)">
                                </v-chip>
                            </v-chip-group>
                        </div>
                        <div>
                            <v-select v-model="userData.prefix" :items="userData.prefixes" label="Prefix" required
                                variant="solo"></v-select>
                            <v-text-field v-model="userData.firstName" :counter="10" label="First Name" required
                                variant="solo"></v-text-field>
                            <v-text-field v-model="userData.lastName" :counter="10" label="Last Name" required
                                variant="solo"></v-text-field>
                            <v-text-field v-model="userData.email" :counter="10" label="Email" required
                                variant="solo"></v-text-field>
                            <v-text-field v-model="userData.phoneNumeber" :counter="10" label="Phone Number" required
                                variant="solo"></v-text-field>
                        </div>
                        <div v-if="hasRole('student')">
                            <v-text-field v-model="userData.studentId" :counter="10" label="StudentID" required
                                variant="solo"></v-text-field>
                            <v-text-field v-model="userData.class" :counter="10" label="Class" required
                                variant="solo"></v-text-field>
                            <v-select v-model="userData.select" :items="userData.items" label="Graduation Date" required
                                variant="solo"></v-select>
                            <v-text-field v-model="userData.points" label="Points Earned" required
                                variant="solo"></v-text-field>
                        </div>
                        <div class="d-flex flex-row">
                            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="saveUser">
                                Add
                            </v-btn>
                            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="cancelEdit">
                                Cancel
                            </v-btn>
                        </div>
                    </v-form>
                </v-sheet>
            </div>
        </v-card>
    </v-overlay>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
    roles: Object,
});

const emit = defineEmits(['save-user', 'delete-user', 'cancel-edit']);

const roleData = ref({
    rolesToAdd: [],
})

const userData = ref({
    id: null,
    prefix: null,
    prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
    firstName: null,
    lastName: null,
    email: null,
    phoneNumeber: null,
    nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be 10 characters or less',
    ],
    studentId: null,
    select: null,
    items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4',
    ],
    image: null,
})

const specificUserRoles = ref([]);

onMounted(() => {

});

const refresh = () => {
    getSpecificUserRoles();
    prePopulateRolesToAdd();
}

const overlay = ref(false);



const handleMouseover = () => {
    //console.log("MOUSE ON");
};

const handleMouseleave = () => {
    //console.log("MOUSE OFF");
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
            userImage.value = base64String; // Preview
            userImageType.value = file.type; // Saves the file type whenever the image changes
        };
    }
};

const addUser = () => {
    overlay.value = !overlay.value;
};

const quickAction1 = () => {
    console.log("Quick Action 1");
};

const action2 = () => {
    console.log("Action 2");
};

const action3 = () => {
    console.log("Action 3");
};

const saveUser = () => {
    overlay.value = false;
    //check if form is valid
    emit('save-user', { user: userData.value, newRoles: roleData.value.rolesToAdd });
};

const deleteUser = () => {
    overlay.value = false;
    emit('delete-user', props.user.id);
};

const cancelEdit = () => {
    overlay.value = false;
};

const formatRole = (role) => {
    return role.replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const hasRole = (role) => {
    return specificUserRoles.value.some((userRole) => userRole.role_type === role);
};

const updateUserData = () => {
    userData.value = {
        id: props.user.id,
        prefix: props.user.prefix,
        prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
        firstName: props.user.fName,
        lastName: props.user.lName,
        email: props.user.email,
        phoneNumeber: props.user.phone_number,
        nameRules: [
            v => !!v || 'Name is required',
            v => (v && v.length <= 10) || 'Name must be 10 characters or less',
        ],
        studentId: props.user.studentId,
        select: null,
        items: [
            'Item 1',
            'Item 2',
            'Item 3',
            'Item 4',
        ],
        checkbox: false,
    };
};


</script>

<style scoped>
.user-preview {

    background-color: rgba(249, 247, 247, 1);

    width: 100%;
    /* Set width to resemble a piece of paper */
    min-height: 220px;
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

.edit-user {

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
}

.scroll {
    overflow-y: auto;
    max-height: 100%;
}

.form {
    width: 50vw;
    margin: auto;
}

.popup {
    align-items: center;
    justify-content: center;

}

.profile-image-row {
    align-items: center;
    margin: auto;
}

.button-row {
    align-items: center;
    margin: auto;
}

.image-container {
    cursor: pointer;
}
</style>