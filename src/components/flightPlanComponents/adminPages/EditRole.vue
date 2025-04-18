<template>
    <v-btn variant="plain" size="small" @click="showEditRole()">
        <Icon icon="material-symbols:edit-outline" width="24" height="24" />
    </v-btn>
    <v-overlay v-model="overlay" class="popup">
        <v-card class="edit-user">
            <div class="scroll">
                <v-sheet class="form">
                    <v-form ref="formReference" v-model="formValid">
                        <h1 class="ma-1">New Role</h1>
                        <v-divider />
                        <br />
                        <v-row class="form-row">
                            <v-col cols="2" class="label-column">
                                <label class="label-description">Name</label>
                            </v-col>
                            <v-col cols="10">
                                <v-text-field v-model="newRole.name" required variant="solo" density="compact">
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="form-row">
                            <v-col cols="2" class="label-column">
                                <label class="label-description">Type</label>
                            </v-col>
                            <v-col cols="10">
                                <v-text-field v-model="newRole.role_type" required variant="solo" density="compact"
                                    disabled>
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="form-row">
                            <v-col cols="2" class="label-column">
                                <label class="label-description">Permissions</label>
                            </v-col>
                            <v-col cols="10">
                                <v-row align="center" justify="start">
                                    <v-col v-for="(selection, i) in selections" :key="selection.type" class="py-1 pe-0"
                                        cols="auto">
                                        <v-chip closable class="ma-1" color="primary" rounded="lg"
                                            @click:close="permissions.permissionsToAdd.splice(i, 1)">

                                            {{ formatString(selection.type) }}
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
                                                <template v-for="permission in filteredPermissions">
                                                    <v-list-item
                                                        v-if="!permissions.permissionsToAdd.includes(permission)"
                                                        :key="permission.id"
                                                        @click="permissions.permissionsToAdd.push(permission)">
                                                        <template v-slot:prepend>
                                                        </template>
                                                        <v-list-item-title v-text="formatString(permission.type)">
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </template>
                                            </v-list>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <br />
                        <v-divider />
                        <v-card-actions>
                            <v-spacer />
                            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="saveRole">
                                Save
                            </v-btn>
                            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="cancelEdit">
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
import { computed, ref, watch } from "vue";
import { Icon } from "@iconify/vue"

const props = defineProps({
    permissions: Object,
    role: Object,
});

const emit = defineEmits(['save-role']);

const overlay = ref(false);

const menu = ref(false);

const searchField = ref()

const search = ref('')

const newRole = ref({
    id: props.role.id,
    name: props.role.name,
    role_type: props.role.role_type,
})

const permissions = ref({
    permissionsToAdd: [...props.role.permissions],
})

const formValid = ref(false);
const formReference = ref(null);

const showEditRole = () => {
    overlay.value = !overlay.value;
};

const saveRole = () => {
    overlay.value = false;
    emit('save-role', { roleData: newRole.value, permissionsData: permissions.value.permissionsToAdd });
};

const cancelEdit = () => {
    overlay.value = false;
};

const filteredPermissions = computed(() => {
    const _search = search.value.toLowerCase()
    if (!_search) return props.permissions
    return props.permissions.filter(item => {
        const text = item.type.toLowerCase()
        return text.indexOf(_search) > -1
    })
})

const selections = computed(() => {
    const selections = []
    for (const selection of permissions.value.permissionsToAdd) {
        selections.push(selection)
    }
    return selections
})

watch(permissions.value.permissionsToAdd, () => {
    search.value = ''
})

const formatString = (input) => {
    return input.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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