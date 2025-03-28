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
            <v-btn color="#5EC4B6" class="button me-2" variant="elevated" @click.stop="manage" rounded="lg">
                Manage
            </v-btn>
            <v-btn color="#F04E3E" class="button me-2" variant="elevated" @click.stop="deleteButton" rounded="lg">
                Delete
            </v-btn>
            <v-btn color="#5EC4B6" class="button me-2" variant="elevated" @click.stop="action3" rounded="lg"
                v-if="hasRole('student')">
                Manage Flight Plan
            </v-btn>
        </v-row>


        <v-overlay v-model="overlay" class="popup">
            <v-card class="edit-user">
                <div class="scroll">
                    <v-sheet class="form">
                        <v-form ref="formReference" v-model="formValid">
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
                                            variant="solo" density="compact" disabled>
                                        </v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="form-row">
                                    <v-col cols="2" class="label-column">
                                        <label class="label-description">Phone Number</label>
                                    </v-col>
                                    <v-col cols="10">
                                        <v-text-field v-model="newUser.phone_number" :rules="formData.phoneRules"
                                            required variant="solo" density="compact"
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
                            <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteButton">
                                Delete
                            </v-btn>
                        </v-card-actions>
                    </v-sheet>
                </div>
            </v-card>
        </v-overlay>

        <v-overlay v-model="showDeleteItem" class="popup">
            <v-card class="delete-user">
                <div class="scroll">
                    <div class="modal-header">
                        <br />
                        <p v-if="!deleteError">
                            Do you want to DELETE user<br />
                        </p>
                        <p v-if="deleteError">
                            Error deleting<br />{{ user.fName + " " + user.lName }}.
                        </p>
                    </div>

                    <v-row class="profile-image-row-delete">
                        <div v-if="props.user.image" class="image-container">
                            <img :src="props.user.image" alt="Uploaded Image" />
                        </div>
                        <div v-else class="image-container">
                            <img :src="blankImage">
                        </div>
                        <div>
                            <h3 class="ma-1">{{ user.prefix }} {{ user.fName }} {{ user.lName }}</h3>
                            <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma-1" color="primary"
                                rounded="lg" :text="formatRole(role.role_type)">
                            </v-chip>
                        </div>
                    </v-row>

                    <v-card-actions class="button-row-delete">
                        <v-btn v-if="!deleteError" color="#D9D9D9" variant="elevated" class="button"
                            @click="showDeleteItem = false">CANCEL</v-btn>
                        <v-btn v-if="!deleteError" color="#F04E3E" variant="elevated" class="error"
                            @click="deleteUser(user)">DELETE</v-btn>
                        <v-btn v-if="deleteError" @click="
                            deleteError = false;
                        showDeleteItem = false;
                        ">CLOSE</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-overlay>
    </div>

</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, onMounted, computed, watch, watchEffect } from "vue";
import blankImage from "@/assets/blankProfile.jpg";

const props = defineProps({
    user: Object,
    userRoles: Object,
    roles: Object,
    student: Object,
    cliftonStrengths: Object,
    studentCliftonStrengths: Object,
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
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    // Format as (123) 456-7890
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value; // Return the original value if it doesn't match
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

const formatSQLDateToMMDDYYYY = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

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
    updateUserData();
    updateStudentData();
    prePopulateRolesToAdd();
    prePopulateCliftonStrengthsToAdd();
}

const overlay = ref(false);

const menu = ref(false);

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

const action3 = () => {
    console.log("Manage Flight Plan, please make this another component or something, or I guess just route to another page, pop up makes a little more sense though");
};

const saveUser = () => {
    const form = formReference.value;
    const valid = formValid.value
    form.validate();
    if (form && valid) {
        newUser.value.phone_number = newUser.value.phone_number.replace(/\D/g, '');
        fixImageData();
        overlay.value = false;
        emit('save-user', { user: newUser.value, student: newStudent.value, cliftonStrengths: newCliftonStrengths.value.cliftonStrengthsToAdd, newRoles: roleData.value.rolesToAdd });
    }

};

const fixImageData = () => {
    if (newUser.value.image) {
        newUser.value.image = newUser.value.image.split(',')[1];
    }
}

const showDeleteItem = ref(false);
const deleteError = ref(false);

const deleteButton = () => {
    showDeleteItem.value = true;
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

const prePopulateCliftonStrengthsToAdd = () => {
    newCliftonStrengths.value.cliftonStrengthsToAdd = props.studentCliftonStrengths?.map(
        (studentCliftonStrength) => props.cliftonStrengths.find((cliftonStrength) => cliftonStrength?.id === studentCliftonStrength.cliftonStrengthId));
}

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
        phone_number: formatPhoneNumber(props.user.phone_number),
        image: props.user.image,
        image_type: props.user.image_type,
        studentId: props.user.studentId
    }
};

const updateStudentData = () => {
    newStudent.value = {
        id: props.student?.id,
        address: props.student?.address,
        graduation_date: formatSQLDateToMMDDYYYY(props.student?.graduation_date),
        points: props.student?.points,
        student_issued_id: props.student?.student_issued_id,
        total_points: props.student?.total_points,
    }
}

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

.user-preview:hover {
    background-color: rgba(230, 230, 230, 1);
    transition: background-color 0.3s ease;
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

.delete-user {
    background-color: rgb(255, 255, 255);

    width: 30vw;
    /* Set width to resemble a piece of paper */
    height: 30vh;
    /* Set height */
    padding: 10px;
    /* Padding inside the box */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* Subtle shadow */
    margin-bottom: 10px;
    /* Space below the shortcut area */
    border-radius: 20px;
}

.profile-image-row {
    align-items: center;
    margin: auto;
}

.profile-image-row-delete {
    align-items: center;
    margin: auto;
    justify-content: center;
}

.button-row {
    align-items: center;
    margin: auto;
}

.button-row-delete {
    align-items: center;
    margin: auto;
    justify-content: center;
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

.modal-header {
    width: 100%;
    /* Ensure full width */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>