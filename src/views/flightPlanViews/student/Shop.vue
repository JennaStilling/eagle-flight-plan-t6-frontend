<template>
    <div>
        <v-card flat>
            <!-- Shop title: includes search and filter by cost. -->
            <div class="title-row">
                <h1 class="table-title">
                    <img :src="ShopIcon" alt="Shop Icon" class="shop-icon" />
                    Shop
                </h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search awards..." variant="solo-filled" hide-details
                        single-line density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>

                    <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Cost"
                        variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>
                </div>
            </div>

            <!-- Awards / Shop Grid -->
            <div class="shop-grid">
                <div v-for="item in paginatedItems" :key="item.id" class="shop-item" @click="openModal(item)">
                    <img :src="item.image" alt="Item Image" class="item-image" />
                    <h3 class="item-title">{{ item.name }}</h3>
                    <p class="item-cost">{{ item.cost }} Points</p>
                </div>
            </div>

            <!-- Pagination -->
            <v-pagination v-model="currentPage" :length="totalPages" class="pagination" color="#811429"></v-pagination>

            <!-- Award Details Modal -->
            <v-dialog v-model="isModalOpen" max-width="700px">
                <v-card v-if="selectedItem" class="modal-card">
                    <div class="modal-header">
                        <span class="modal-title-text">{{ selectedItem.name }}</span>
                        <button class="modal-close-btn" @click="isModalOpen = false"
                            style="font-size: 48px; font-weight: bold;">
                            <Icon icon="material-symbols:close" width="32" height="32" />
                        </button>
                    </div>

                    <v-card-text class="modal-body">

                        <!-- Left: Award Image -->
                        <div class="modal-left">
                            <img :src="selectedItem.image" alt="Award Image" class="modal-image" />
                        </div>

                        <!-- Right: Info (cost, description, & redemption info)-->
                        <div class="modal-right">
                            <div class="cost-badge">
                                {{ selectedItem.cost }} Points
                            </div>

                            <!-- Description -->
                            <div class="detail-section">
                                <div class="detail-header">
                                    <Icon icon="mdi:information-outline" width="20" height="20" />
                                    <h3>Description</h3>
                                </div>
                                <p>{{ selectedItem.description }}</p>
                            </div>

                            <!-- Redemption info -->
                            <div class="detail-section">
                                <div class="detail-header">
                                    <Icon icon="mdi:ticket-confirmation-outline" width="20" height="20" />
                                    <h3>How to Redeem?</h3>
                                </div>
                                <p>{{ selectedItem.redemption_info }}</p>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import awardServices from '@/services/flightPlanServices/awardServices';
import { Icon } from "@iconify/vue";
import ShopIcon from '@/assets/navigation/shoppingCart.png';

const search = ref('');
const items = ref([]);
const message = ref('');
const selectedFilter = ref('All');

// Pagenation states ------------------------------------------------------
const currentPage = ref(1);
const itemsPerPage = 8;

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / itemsPerPage);
});

// Modal states ------------------------------------------------------------
const isModalOpen = ref(false);
const selectedItem = ref(null);

const openModal = (item) => {
    selectedItem.value = item;
    isModalOpen.value = true;
};

// Filter options for cost points ----------------------------------------------------------------------------------------
const filterOptions = ref(['All', 'Less than 200', '200 - 400', '400 - 600', '600 - 800', '800 - 1000', 'More than 1000']);

const filteredItems = computed(() => {
    // First, filter by search term
    let filtered = search.value.trim()
        ? items.value.filter(item =>
            item.name.toLowerCase().includes(search.value.toLowerCase()))
        : items.value;

    // Then apply the cost points filter
    if (selectedFilter.value === 'All') {
        return filtered;
    }
    else if (selectedFilter.value === 'Less than 200') {
        return filtered.filter(item => item.cost <= 200);
    }
    else if (selectedFilter.value === 'More than 1000') {
        return filtered.filter(item => item.cost >= 1000);
    }
    else {
        const [min, max] = selectedFilter.value.split(' - ').map(Number);
        return filtered.filter(item => item.cost >= min && item.cost < max);
    }
});

// Fetch all awards ---------------------------------------------------------
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
</script>

<style scope>
/* Layout and Container Styles */
.title-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
}

.shop-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 16px;
}

/* Title Styles */
.table-title {
    font-family: 'Poppins', sans-serif !important;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    user-select: none;
}

.shop-icon {
    width: 29px;
    height: 29px;
    margin-right: 1px;
    vertical-align: middle;
}

/* Search and Filter Styles */
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

/* Shop Item Styles */
.shop-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
    min-height: 300px;
}

.shop-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
    height: 200px;
    object-fit: contain;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    user-select: none;
}

.item-title {
    font-size: 20px;
    font-weight: 600;
    margin: 8px 0;
    color: #333;
    user-select: none;
}

.item-cost {
    font-size: 19px;
    font-weight: 470;
    color: #811429 !important;
    user-select: none;
}

/* Pagination Styles */
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

/* Modal Styles */
.modal-card {
    max-width: 700px;
}

.modal-header {
    display: flex;
    align-items: center;
    padding: 16px 16px;
    border-bottom: 1px solid #eee;
    user-select: none;
}

.modal-title-text {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    user-select: none;
}

.modal-close-btn {
    position: absolute !important;
    top: 12px;
    right: 12px;
    z-index: 2;
    font-size: 42px;
    font-weight: bold;
    color: #811429 !important;
    background: none;
    border: none;
    cursor: pointer;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease-in-out;
}

.modal-close-btn:hover {
    transform: scale(1.2);
    color: #a50e2d;
}

.modal-body {
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
    margin-top: -1%;
    user-select: none;
}

.modal-left {
    flex: 1 1 40%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-right {
    flex: 1 1 55%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cost-badge {
    background-color: #811429;
    color: white;
    font-size: 20px;
    font-weight: 600;
    padding: 8px 12px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1px;
    align-self: flex-start;
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.detail-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #555;
    margin: 0;
}

.detail-section {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-section p {
    font-size: 16px;
    color: #666;
    line-height: 1.5;
    margin: 0;
}

.cost-value {
    font-weight: 600;
    color: #811429;
    user-select: none;
}
</style>