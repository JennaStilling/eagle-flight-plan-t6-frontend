<template>
    <div class="user-preview" @click="selectUser" @mouseover="handleMouseover" @mouseleave="handleMouseleave">

        <v-row class="profile-image-row">
            <div v-if="props.user.image" class="image-container">
                <img :src="props.user.image" alt="Uploaded Image" />
            </div>
            <div v-else class="image-container">
                <img :src="blankImage">
            </div>
            <div>
                <h3 class="ma-1">{{ user.prefix }} {{ user.fName }} {{ user.lName }}</h3>
                <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma-1" color="primary" rounded="lg"
                    :text="formatRole(role.role_type)">
                </v-chip>
            </div>
        </v-row>

        <br>
        <v-row class="button-row">
            <v-btn color="#5EC4B6" class="me-2" @click.stop="manage" rounded="lg">
                Manage
            </v-btn>
            <v-btn color="#5EC4B6" class="me-2" @click.stop="action2" rounded="lg">
                Action 2
            </v-btn>
            <v-btn color="#5EC4B6" class="me-2" @click.stop="action3" rounded="lg">
                3
            </v-btn>
        </v-row>


        <v-overlay v-model="overlay" class="popup">
            <v-card class="edit-user">
                <div class="scroll">
                    <v-sheet class="form">
                        <v-form ref="form">
                            <v-row class="profile-image-row">

                                <div class="image-container" @click="triggerFileInput">
                                    <input type="file" ref="fileInput" style="display: none"
                                        @change="fileUpload($event)" />
                                    <div v-if="newUser.image" class="image-preview">
                                        <img :src="newUser.image" alt="Uploaded Image" />
                                    </div>
                                    <div v-else class="image-preview">
                                        <img :src="blankImage">
                                    </div>
                                </div>

                                <div>
                                    <h1 class="ma-1">{{ user.prefix }} {{ user.fName }} {{ user.lName }}</h1>

                                    <h3>Assigned Roles</h3>
                                    <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma-1"
                                        color="primary" rounded="lg" :text="formatRole(role.role_type)">
                                    </v-chip>

                                    <h3>Available Roles</h3>
                                    <v-chip-group v-model="roleData.rolesToAdd" multiple>
                                        <v-chip v-for="role in roles" :key="role.id" class="ma-1" color="primary"
                                            rounded="lg" :value="role.role_type" :text="formatRole(role.role_type)">
                                        </v-chip>
                                    </v-chip-group>
                                </div>
                            </v-row>

                            <v-divider />
                            <br />

                            <div>
                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Prefix</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-select v-model="newUser.prefix" :items="formData.prefixes" required
                                            variant="solo" hide-details density="compact"></v-select>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">First Name</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newUser.fName" required variant="solo" hide-details
                                            density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Last Name</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newUser.lName" required variant="solo" hide-details
                                            density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Email</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newUser.email" required variant="solo" hide-details
                                            density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Phone Number</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newUser.phone_number" required variant="solo"
                                            hide-details density="compact"></v-text-field>
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-if="hasRole('student')">
                                <v-divider />
                                <br />
                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Student ID</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newStudent.student_issued_id" required variant="solo"
                                            hide-details density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Graduation Date</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newStudent.graduation_date" required variant="solo"
                                            hide-details density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Points Available</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newStudent.points" required variant="solo" hide-details
                                            density="compact"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Points Earned</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newStudent.total_points" required variant="solo"
                                            hide-details density="compact"></v-text-field>
                                    </v-col>
                                </v-row>
                            </div>


                        </v-form>
                        <v-divider />
                        <v-card-actions>
                            <v-spacer />
                            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="saveUser">
                                Save
                            </v-btn>
                            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="cancelEdit">
                                Cancel
                            </v-btn>
                            <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteUser">
                                Delete
                            </v-btn>
                        </v-card-actions>
                    </v-sheet>
                </div>
            </v-card>
        </v-overlay>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from "vue";
import blankImage from "@/assets/blankProfile.jpg";

const props = defineProps({
    user: Object,
    userRoles: Object,
    roles: Object,
    student: Object,
});

const emit = defineEmits(['save-user', 'delete-user']);

const roleData = ref({
    rolesToAdd: [],
})

const newUser = ref({
    id: props.user.id,
    prefix: props.user.prefix,
    fName: props.user.fName,
    lName: props.user.lName,
    email: props.user.email,
    phone_number: props.user.phone_number,
    image: props.user.image,
    image_type: props.user.image_type,
    studentId: props.user.studentId
})

const newStudent = ref({
    id: props.student?.id,
    address: props.student?.address,
    graduation_date: props.student?.graduation_date,
    points: props.student?.points,
    student_issued_id: props.student?.student_issued_id,
    total_points: props.student?.total_points,
})

const newCliftonStrengths = ref({
    cliftonStrengthsToAdd: [],
})

const formData = ref({
    prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
    nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be 10 characters or less',
    ],
})

const specificUserRoles = ref([]);

onMounted(() => {
    refresh();
});

watch(() => props.user, () => {
    refresh();
}, { deep: true });

watchEffect(() => props.userRoles, () => {
    refresh();
}), { deep: true };

const refresh = () => {
    getSpecificUserRoles();
    prePopulateRolesToAdd();
    updateUserData();
    updateStudentData();
    updateCliftonStrengths();
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
            newUser.value.image = base64String; // Preview
            newUser.value.image_type = file.type; // Saves the file type whenever the image changes
        };
    }
};

const selectUser = () => {
    refresh();
    overlay.value = !overlay.value;
};

const manage = () => {
    selectUser();
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
    fixImageData();
    emit('save-user', { user: newUser.value, student: newStudent.value, cliftonStrengths: newCliftonStrengths.value, newRoles: roleData.value.rolesToAdd });
};

const fixImageData = () => {
    if (newUser.value.image) {
        newUser.value.image = newUser.value.image.split(',')[1];
    }
}

const deleteUser = () => {
    overlay.value = false;
    emit('delete-user', props.user);
};

const cancelEdit = () => {
    overlay.value = false;
};

const formatRole = (role) => {
    return role.replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const getSpecificUserRoles = () => {
    specificUserRoles.value = props.userRoles.map(
        (userRole) => props.roles.find((role) => role?.id === userRole.roleId));
};

const prePopulateRolesToAdd = () => {
    roleData.value.rolesToAdd = specificUserRoles.value.map(role => role.role_type);
};

const hasRole = (role) => {
    return roleData.value.rolesToAdd.some((userRole) => userRole === role);
};

const updateUserData = () => {
    newUser.value = {
        id: props.user.id,
        prefix: props.user.prefix,
        fName: props.user.fName,
        lName: props.user.lName,
        email: props.user.email,
        phone_number: props.user.phone_number,
        image: props.user.image,
        image_type: props.user.image_type,
        studentId: props.user.studentId
    }
};

const updateStudentData = () => {
    newStudent.value = {
        id: props.student?.id,
        address: props.student?.address,
        graduation_date: props.student?.graduation_date,
        points: props.student?.points,
        student_issued_id: props.student?.student_issued_id,
        total_points: props.student?.total_points,
    }
}

const updateCliftonStrengths = () => {

}
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
    margin: 2%;
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
    width: 20%;
    height: 20%;
    margin: 1%;
    cursor: pointer;
}

.label-description {
    color: #202020;
    text-align: right;
    font-family: Poppins;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.label-column p {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 12px;
    color: #555;
}

.form-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
</style>