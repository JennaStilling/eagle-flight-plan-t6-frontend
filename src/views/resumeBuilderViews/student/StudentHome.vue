  <template>
    <div class="container">
        <!-- Side Navigation Bar -->
        <StudentHomeSideNav @request="toggleRequest()"/>
        <RequestReviewer v-if="isRequest" @toggleRequest="toggleRequest()"/>

        <!-- Main Content Area -->
        <div class="content">
            <div class="filtering-shortcuts">
                <Dropdown style="border-color: #708E9A;">
                    <template #trigger>
                        <button type="button" class = "button-text-color"> {{ selectedFilter }}</button>
                    </template>
                    <ul style="background-color: #708E9A; color: white; cursor: pointer;">
                      <li
                        v-for="filter in filterOptions" 
                        :key="filter"
                        @click="() => selectFilter(filter)"
                        :class="{ 'is-selected': selectedFilter === filter }">
                        {{ filter }}
                      </li>
                    </ul>
                </Dropdown>

                <div class="display-toggle">
                    <img src="/src/assets/lm-grid-icon.png" alt="Grid Layout" style="display: block; margin: auto;" 
                      @click="setDisplay('grid')" :class="{ active: displayType === 'grid', 'cursor-pointer': isActive }"/>
                    <img src="/src/assets/list-elements/lm-list-icon.png" alt="List Layout" style="display: block; margin: auto;" 
                      @click="setDisplay('list')" :class="{ active: displayType === 'list', 'cursor-pointer': isActive }"/>
                </div>
            </div>
  
            <div class="resume-main-area">
              <div class="resume-create-shortcut-area">
                <br><br><br><br>
                  <img src="/src/assets/add-icon.png" alt="Start Resume" 
                    :class="{ 'cursor-pointer': isActive }" style="display: block; margin: auto;" @click="createResume"/>
              </div>

              <div class="resume-previews">
                <ResumePreview
                  v-for="resume in resumes"
                  :key="resume.id"
                  :resume="resume"
                  :review="resume.review"
                  @edit="handleEdit"
                  @delete="handleDelete"
                />
              </div>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import Dropdown from 'v-dropdown';
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router';
  import Utils from '@/config/utils.js';
  import resumeServices from '@/services/resumeBuilderServices/resumeServices.js'
  import StudentHomeSideNav from '@/components/resumeBuilderComponents/studentPages/StudentHomeSideNav.vue';
  import ResumePreview from '@/components/resumeBuilderComponents/studentPages/ResumePreview.vue';
  import RequestReviewer from '@/components/resumeBuilderComponents/studentPages/RequestReviewer.vue';
  import resumeReviewServices from '@/services/resumeBuilderServices/resumeReviewServices.js';

  const user = Utils.getStore("user");
  const studentId = ref();
  const resumes = ref([]);
  const displayType = ref('grid'); // Default display type
  const router = useRouter();
  const filterOptions = ['- SORT BY -','Name', 'Last Modified', 'First Created']; // Filter options
  const selectedFilter = ref(filterOptions[0]);
  const isActive = ref(true);
  const isRequest = ref(false);
    
  const getResumes = async () => {
  try {
    const response = await resumeServices.getAllResumes(studentId.value);
    const resumesData = response.data;

    // Fetch the reviews for each resume
    const updatedResumes = await Promise.all(
      resumesData.map(async (resume) => {
        if (resume.resumeReviewId) {
          try {
            const reviewResponse = await resumeReviewServices.getResumeReviewById(resume.resumeReviewId);
            resume.review = reviewResponse.data; // Attach the review to the resume
          } catch (error) {
            console.error(`Error fetching review for resume ${resume.id}:`, error);
            resume.review = null; // Fallback if fetching review fails
          }
        } else {
          resume.review = null; // No review associated
        }
        return resume;
      })
    );

    resumes.value = updatedResumes; // Update the resumes with reviews
  } catch (error) {
    console.error("Could not retrieve resumes:", error);
  }
};
  
  const toggleRequest = () => {
    isRequest.value = !isRequest.value;
  }
  
  const createResume = () => {
    router.push({ name: 'addResume' }); // Navigate to the resume creation page
  };
  
  const setDisplay = (type) => {
    displayType.value = type;
    // Add logic to update the display based on the type
  };
  
  const selectFilter = (option) => {
  selectedFilter.value = option;

  switch(selectedFilter.value) {
    case 'Name':
      resumes.value = resumes.value.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
      break;
    case 'Last Modified':
      resumes.value = resumes.value.sort((a, b) => {
        const dateA = new Date(a.updatedAt || '');
        const dateB = new Date(b.updatedAt || '');
        return dateB - dateA; // Ascending order
      });
      break;
    case 'First Created':
      resumes.value = resumes.value.sort((a, b) => {
        const dateA = new Date(a.createdAt || '');
        const dateB = new Date(b.createdAt || '');
        return dateA - dateB; // Ascending order
      });
      break;
    default:
      resumes.value = resumes.value.sort((a, b) => {
        const idA = a.id || '';
        const idB = b.id || '';
        return idA.localeCompare(idB);
      });
  }

  console.log(`Resume list after filter: ${JSON.stringify(resumes.value)}`);
};
  
  onMounted(() => {
    Utils.getUser(user).then(value => {
      studentId.value = value.studentId;
      getResumes();
    });
  });

  const handleEdit = (id) => {
    router.push({ name: 'resume', params: { id } });
  };

  const handleDelete = async () => {
  };
  </script>
  
  <style scoped>
  .container {
    display: flex; /* Use flexbox for layout */
  }
  
  .content {
    padding-left: 40px; /* Padding for the content area */
    flex-grow: 1; /* Take up remaining space */
  }
  
  .filtering-shortcuts {
    display: flex;
    justify-content: flex-end; /* Space between dropdown and buttons */
    gap: 30px;
    align-items: right; /* Center vertically */
    margin-bottom: 20px; /* Space below the shortcuts */
    margin-top: 10px;
  }
  
  .display-toggle {
    margin-right: 30px; /* Space between buttons */
    display: flex;
    gap: 30px; /* Space between icons */
  }

  .icon-row {
    width: 24px; /* Adjust as needed */
    height: 24px; /* Adjust as needed */
    cursor: pointer;
  }

  .icon-row.active {
    stroke: #118ACB; /* Change stroke color when active */
  }

  .button-text-color {
    color: rgba(0,0,0);
  }

  .filtering-shortcuts .active {
    background-color: #708E9A; /* Highlight active button */
    color: rgb(0, 0, 0); /* Text color for active button */
  }
  
  .resume-main-area {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 20px;
  }

  .resume-create-shortcut-area {
    width: 222px; /* Set width to resemble a piece of paper */
    height: 298px; /* Set height */
    border: 2px dashed #118ACB; /* Dashed border */
    padding: 10px; /* Padding inside the box */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    border-radius: 20px;
    cursor: pointer;
  }
  
  .create-resume-button {
    background-color: #118ACB; /* Button color */
    color: white; /* Text color */
    border: none; /* No border */
    padding: 10px 20px; /* Padding */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor */
    font-size: 16px; /* Font size */
  }
  
  .create-resume-button:hover {
    background-color: #118ACB; /* Darker color on hover */
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .resume-previews {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    grid-auto-flow: dense;
  }
  </style>