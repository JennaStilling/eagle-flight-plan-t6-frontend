<template>
    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="showAddUser()">
        Add User
    </v-btn>


    <v-overlay v-model="overlay" class="popup">
        <v-card class="edit-user">
            <div class="scroll">
                <v-sheet class="form">
                    <v-form ref="formReference" v-model="formValid">
                        <v-row class="profile-image-row">

                            <div class="image-container" @click="triggerFileInput">
                                <input type="file" ref="fileInput" style="display: none" @change="fileUpload($event)" />
                                <div v-if="newUser.image" class="image-preview">
                                    <img :src="newUser.image" alt="Uploaded Image" />
                                </div>
                                <div v-else class="image-preview">
                                    <img :src="blankImage">
                                </div>
                            </div>

                            <div>
                                <h1 class="ma-1">New User</h1>

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
                                        variant="solo" density="compact">
                                    </v-select>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">First Name</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newUser.fName" required variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Last Name</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newUser.lName" required variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Email</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newUser.email" :rules="formData.emailRules" required
                                        variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Phone Number</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newUser.phone_number" :rules="formData.phoneRules" required
                                        variant="solo" density="compact"
                                        @input="newUser.phone_number = formatPhoneNumber(newUser.phone_number)">
                                    </v-text-field>
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
                                    <v-text-field v-model="newStudent.student_issued_id"
                                        :rules="formData.studentIdRules" required variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Graduation Date</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newStudent.graduation_date" :rules="formData.dateRules"
                                        required variant="solo" density="compact"
                                        @input="newStudent.graduation_date = formatDate(newStudent.graduation_date)">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Points Available</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newStudent.points" :rules="formData.pointsRules" required
                                        variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Points Earned</label>
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field v-model="newStudent.total_points" :rules="formData.pointsRules"
                                        required variant="solo" density="compact">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row class="form-row">
                                <v-col cols="2" class="label-column">
                                    <label class="label-description">Clifton Strengths</label>
                                </v-col>
                                <v-col cols="10">

                                    <v-row align="center" justify="start">
                                        <v-col v-for="(selection, i) in selections" :key="selection.name"
                                            class="py-1 pe-0" cols="auto">
                                            <v-chip :disabled="loading" closable class="ma-1" color="primary"
                                                rounded="lg"
                                                @click:close="newCliftonStrengths.cliftonStrengthsToAdd.splice(i, 1)">

                                                {{ selection.name }}
                                            </v-chip>
                                        </v-col>

                                        <v-col cols="12">
                                            <v-menu v-model="menu" close-on-content-click>
                                                <template v-slot:activator="{ props }">
                                                    <v-text-field ref="searchField" v-model="search" label="Search"
                                                        hide-details single-line variant="solo" density="compact"
                                                        v-bind="props">
                                                    </v-text-field>
                                                </template>

                                                <v-list style="max-height: 300px; overflow-y: auto;">
                                                    <template v-for="cliftonStrengths in filteredCliftonStrengths">
                                                        <v-list-item
                                                            v-if="!newCliftonStrengths.cliftonStrengthsToAdd.includes(cliftonStrengths)"
                                                            :key="cliftonStrengths.id" :disabled="loading"
                                                            @click="newCliftonStrengths.cliftonStrengthsToAdd.push(cliftonStrengths)">
                                                            <template v-slot:prepend>
                                                            </template>

                                                            <v-list-item-title v-text="cliftonStrengths.name">
                                                            </v-list-item-title>
                                                        </v-list-item>
                                                    </template>
                                                </v-list>
                                            </v-menu>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>

                        <v-divider />
                        <v-card-actions>
                            <v-spacer />
                            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addUser">
                                Add
                            </v-btn>
                            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="cancelAdd">
                                Cancel
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-sheet>
            </div>
        </v-card>
    </v-overlay>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { computed, ref, onMounted, watch } from "vue";
import blankImage from "@/assets/blankProfile.jpg";

const props = defineProps({
    roles: Object,
    cliftonStrengths: Object,
});

const emit = defineEmits(['add-user']);

const roleData = ref({
    rolesToAdd: [],
})

const newUser = ref({
    prefix: null,
    fName: null,
    lName: null,
    email: null,
    phone_number: null,
    image: null,
    image_type: null,
    studentId: null
})

const newStudent = ref({
    address: null,
    graduation_date: null,
    points: null,
    student_issued_id: null,
    total_points: null,
})

const newCliftonStrengths = ref({
    cliftonStrengthsToAdd: [],
})

const formValid = ref(false);
const formReference = ref(null);

const formData = ref({
    prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
    nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be 10 characters or less',
    ],
    emailRules: [
        v => !!v || 'Email is required',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',
    ],
    phoneRules: [
        v => !!v || 'Phone number is required',
        v => /^(\+1\s?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/.test(v) || 'Invalid phone number',
    ],
    studentIdRules: [
        v => !!v || 'Student ID is required',
        v => /^\d+$/.test(v) || 'Student ID must be numerical',
    ],
    pointsRules: [
        v => !!v || 'Points are required',
        v => /^\d+$/.test(v) || 'Points must be numerical',
    ],
    dateRules: [
        v => !!v || 'Date is required',
        v => /^\d{2}\/\d{2}\/\d{4}$/.test(v) || 'Date must be in the format MM/DD/YYYY',
        v => {
            const [month, day, year] = v.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return (
                !isNaN(date.getTime()) &&
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            ) || 'Invalid date';
        },
    ],
})

const formatPhoneNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
};

const formatDate = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d/]/g, '');
    const match = cleaned.match(/^(\d{2})\/?(\d{2})?\/?(\d{4})?$/);
    if (match) {
        const month = match[1] || '';
        const day = match[2] || '';
        const year = match[3] || '';
        return `${month}${day ? `/${day}` : ''}${year ? `/${year}` : ''}`;
    }
    return value;
};

onMounted(() => {

});

const clear = () => {
    clearUserData();
    clearStudentData();
    clearCliftonStrengths();
    clearNewRoles();
}

const overlay = ref(false);

const menu = ref(false);

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

const showAddUser = () => {
    clear();
    overlay.value = !overlay.value;
};

const addUser = () => {
    const form = formReference.value;
    const valid = formValid.value;
    form.resetValidation();
    form.validate();
    if (form && valid) {
        overlay.value = false;
        fixImageData();
        if (!roleData.value.rolesToAdd.includes('student')) {
            newStudent.value = null;
            newCliftonStrengths.value.cliftonStrengthsToAdd = null;
        }
        emit('add-user', { user: newUser.value, student: newStudent.value, cliftonStrengths: newCliftonStrengths.value.cliftonStrengthsToAdd, newRoles: roleData.value.rolesToAdd });
    }
};

const fixImageData = () => {
    if (newUser.value.image) {
        newUser.value.image = newUser.value.image.split(',')[1];
    }
}

const cancelAdd = () => {
    overlay.value = false;
};

const formatRole = (role) => {
    return role.replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const hasRole = (role) => {
    return roleData.value.rolesToAdd.some((userRole) => userRole === role);
};

const searchField = ref()

const loading = ref(false)
const search = ref('')

const filteredCliftonStrengths = computed(() => {
    const _search = search.value.toLowerCase()
    if (!_search) return props.cliftonStrengths
    return props.cliftonStrengths.filter(item => {
        const text = item.name.toLowerCase()
        return text.indexOf(_search) > -1
    })
})

const selections = computed(() => {
    const selections = []
    for (const selection of newCliftonStrengths.value.cliftonStrengthsToAdd) {
        selections.push(selection)
    }
    return selections
})

watch(newCliftonStrengths.value.cliftonStrengthsToAdd, () => {
    search.value = ''
})

const clearUserData = () => {
    newUser.value = {
        id: null,
        prefix: null,
        fName: null,
        lName: null,
        email: null,
        phone_number: null,
        image: null,
        image_type: null,
        studentId: null,
    }
};

const clearStudentData = () => {
    newStudent.value = {
        id: null,
        address: null,
        graduation_date: null,
        points: null,
        student_issued_id: null,
        total_points: null,
    }
}

const clearCliftonStrengths = () => {
    newCliftonStrengths.value.cliftonStrengthsToAdd = [];
}

const clearNewRoles = () => {
    roleData.value.rolesToAdd = [];
}
</script>

<style scoped>
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

.image-container {
    width: 20%;
    height: 20%;
    margin: 1%;
    cursor: pointer;
}

.label-column {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    text-align: right;
    margin-top: 0px;
    padding-top: 0;
    height: 50px;
}

.label-description {
    color: #202020;
    font-family: Poppins;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    margin: 0;
}
</style>