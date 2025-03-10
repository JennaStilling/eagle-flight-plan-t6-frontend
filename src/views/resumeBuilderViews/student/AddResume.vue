<template>
  <div class="resume-builder">
    <div class="resume-sidebar">

      <!-- Title Section -->
      <div class="title-section">
        <label for="resumeTitle" class="title-label">Title:</label>
        <input v-model="resumeTitle" id="resumeTitle" class="title-input" placeholder="My Resume" />
        <button @click="saveResume">
          <Icon :icon=saveIcon :width="48" :height="48" :alt="'save'" />
        </button>
        <button @click="downloadPDF">
          <Icon :icon=downloadIcon :width="48" :height="48" :alt="'download'" />
        </button>
      </div>

      <!-- Dropdown Sections -->

      <div v-for="(section, sectionKey) in dropdownSections" :key="sectionKey" class="dropdown-section">
        <div class="dropdown-header" @click="toggleDropdown(sectionKey)">
          <Icon class="section-icon" :icon="getSectionIcon(sectionKey)" :width="48"
            :height="48" :alt="`${section.label} Icon`" />
          <span style="text-transform: capitalize;">{{ sectionKey }}</span>
          <Icon class="arrow-icon" :icon="isDropdownOpen[sectionKey] ? dropDownUpIcon : dropDownIcon"
            :width="48" :height="48" :alt="'arrow'"/>
        </div>


        <div v-if="isDropdownOpen[sectionKey]" class="dropdown-content">
          <!-- Education Section -->
          <div v-if="sectionKey === 'education'">
            <div v-if="dropdownSections[sectionKey].items.length" class="section-list">
              <div v-for="(item, index) in dropdownSections[sectionKey].items" :key="index" class="student-contact-info"
                @click="toggleCheckbox(item)">
                <div class="student-contact-info-inner">
                  <div class="group-child" :class="{ 'selected': item.isSelected }">
                    <p>{{ item.degree ? `${item.degree}, ${item.institution}` : item.institution }}</p>
                    <label class="custom-checkbox">
                      <input type="checkbox" v-model="item.isSelected" />
                      <span class="checkmark"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <p v-else>No education data available.</p>
          </div>

          <!-- Courses Section -->
          <div v-if="sectionKey === 'courses'">
            <div v-if="dropdownSections.education.items.length" class="section-list">
              <!-- Courses Dropdown -->
              <div v-for="(education, index) in dropdownSections.education.items" :key="index" class="courses-dropdown">
                <!-- Courses Dropdown Header -->
                <div class="courses-dropdown-header" @click="toggleCourseDropdown(index, education.id)">
                  <p>{{ education.degree ? `${education.degree}, ${education.institution}` : education.institution }}
                  </p>
                  <Icon class="arrow-icon" :icon="isCourseDropdownOpen[index] ? dropDownUpIcon : dropDownIcon" :width="48" :height="48"/>
                </div>

                <!-- Courses Dropdown Content -->
                <div v-if="isCourseDropdownOpen[index]" class="courses-dropdown-content">
                  <div v-if="education.courses.length">
                    <ul>
                      <li v-for="(course, courseIndex) in education.courses" :key="courseIndex" class="course-item">
                        <label class="custom-checkbox">
                          <input type="checkbox" v-model="course.isSelected" @click="toggleCourseCheckbox(course)" />
                          {{ course.name }} &nbsp;
                          <span class="checkmark"></span>
                        </label>
                      </li>
                    </ul>
                  </div>
                  <p v-else>No courses available.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Sections -->
          <div v-if="sectionKey !== 'education' && sectionKey !== 'courses'">
            <div v-if="dropdownSections[sectionKey].items.length" class="section-list">
              <div v-for="(item, index) in dropdownSections[sectionKey].items" :key="index" class="student-contact-info"
                @click="toggleCheckbox(item)">
                <div class="student-contact-info-inner">
                  <div class="group-child" :class="{ 'selected': item.isSelected }">
                    <p v-if="sectionKey === 'experience'">{{ item.role }}, {{ item.company }}</p>
                    <p v-else-if="sectionKey === 'certifications'">{{ item.name }}, {{ item.company }}</p>
                    <p v-else-if="sectionKey === 'skills'">{{ item.name }}</p>
                    <p v-else-if="sectionKey === 'projects'">{{ item.name }}</p>
                    <label class="custom-checkbox">
                      <input type="checkbox" v-model="item.isSelected" />
                      <span class="checkmark"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <p v-else>No {{ sectionKey }} data available.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="main-content">
      <PreviewBar @tab-change="handleTabChange" />
      <div class="pdf-preview" v-if="activeTab === 'preview'">
        <iframe id="pdfPreview" ref="pdfPreview" width="100%" height="100%"></iframe>
      </div>
      <div v-if="activeTab === 'template'">
        <div class="template-list" width="100%" height="100%">
          <div v-for="(template, index) in templates" :key="index" class="template-item"
            :class="{ active: template.name === selectedTemplate }">
            <p class="template-name">{{ template.name }}</p>
            <button @click="previewTemplate(template)" class="preview-button">Preview</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import educationServices from '@/services/resumeBuilderServices/educationServices.js';
import experienceServices from '@/services/resumeBuilderServices/experienceServices.js';
import certificationServices from '@/services/resumeBuilderServices/certificationServices.js';
import skillServices from '@/services/resumeBuilderServices/skillServices.js';
import projectServices from '@/services/resumeBuilderServices/projectServices.js';
import courseServices from '@/services/resumeBuilderServices/courseServices.js';
import Utils from '@/config/utils';
import html2pdf from 'html2pdf.js';
import PreviewBar from '@/components/resumeBuilderComponents/studentPages/PreviewBar.vue';
import resumeServices from '@/services/resumeBuilderServices/resumeServices.js';
import resumeEducationServices from '@/services/resumeBuilderServices/resumeEducationServices.js';
import resumeCourseServices from '@/services/resumeBuilderServices/resumeCourseServices.js';
import resumeExperienceServices from '@/services/resumeBuilderServices/resumeExperienceServices.js';
import resumeCertificationServices from '@/services/resumeBuilderServices/resumeCertificationServices.js';
import resumeSkillServices from '@/services/resumeBuilderServices/resumeSkillServices.js';
import resumeProjectServices from '@/services/resumeBuilderServices/resumeProjectServices.js';

// Icons
import editPencilIcon from '@/assets/build-icons/edit-pencil.png';

import { Icon } from '@iconify/vue';

import { loadTemplateOne } from '@/services/resumeBuilderServices/templates/templateOne.js';
import { loadTemplateTwo } from '@/services/resumeBuilderServices/templates/templateTwo.js';
import { loadTemplateThree } from '@/services/resumeBuilderServices/templates/templateThree.js';
import { loadTemplateFour } from '@/services/resumeBuilderServices/templates/templateFour.js';
import { loadTemplateFive } from '@/services/resumeBuilderServices/templates/templateFive.js';
import { loadTemplateSix } from '@/services/resumeBuilderServices/templates/templateSix.js';
import { loadTemplateSeven } from '@/services/resumeBuilderServices/templates/templateSeven.js';

import { useRouter } from "vue-router";
import html2canvas from 'html2canvas';

export default {
  name: 'AddResume',
  components: {
    PreviewBar,
    Icon,
  },
  setup() {
    const user = Utils.getStore('user');
    const studentId = ref(null);
    const resumeTitle = ref('');
    const router = useRouter();
    const resume = ref({
      name: null,
      template_type: 1
    });
    const changeTemplateType = (type) => {
      resume.value.template_type = type;
    };
    const resumeId = ref(null);
    const isDropdownOpen = ref({
      education: false,
      experience: false,
      certifications: false,
      skills: false,
      projects: false,
      courses: false,
    });
    const isCourseDropdownOpen = ref({});
    const isNestedDropdownOpen = ref({});
    const dropdownSections = ref({
      education: { items: [] },
      courses: { items: [] },
      experience: { items: [] },
      certifications: { items: [] },
      skills: { items: [] },
      projects: { items: [] },
    });
    const sectionIcons = {
      education: "material-symbols:school-outline-rounded",
      experience: "material-symbols:work-outline",
      certifications: "material-symbols:award-star-rounded",
      skills: "material-symbols:balance-rounded",
      projects: "material-symbols:assignment-ind",
      courses: "material-symbols:book-ribbon-outline-rounded",
    };
    const dropDownUpIcon = "material-symbols:arrow-drop-up-rounded";
    const dropDownIcon = "material-symbols:arrow-drop-down-rounded";
    const downloadIcon = "material-symbols:download-rounded";
    const saveIcon = "material-symbols:save";

    const getSectionIcon = (sectionKey) => {
      return sectionIcons[sectionKey] || 'default-icon';
    };



    const templates = ref([
      { name: '01: Default', type: 1 },
      { name: '02: Teal Template', type: 2 },
      { name: '03: Generic Georgia', type: 3 },
      { name: '04: Experience Centered', type: 4 },
      { name: '05: Pale Green', type: 5 },
      { name: '06: Bold Black', type: 6 },
      { name: '07: Productive Purple', type: 7 },
    ]);

    const selectedTemplate = ref(templates.value[0].name);

    const selectTemplate = (template) => {
      selectedTemplate.value = template.name;
    };

    const previewTemplate = (template) => {
      selectTemplate(template);
      changeTemplateType(template.type);
      handleTabChange('preview');
    };

    onMounted(() => {
      Utils.getUser(Utils.getStore('user')).then(user => {
        studentId.value = user.studentId;
        loadEducationData();
        loadExperienceData();
        loadCertificationData();
        loadSkillData();
        loadProjectData();
        const iframe = document.querySelector("iframe");
        if (iframe) {
          iframe.addEventListener('load', () => {
            updatePDFPreview();
          });
          updatePDFPreview();
        } else {
          console.error('Iframe not found');
        }
      });
    });

    const activeTab = ref('preview');

    function handleTabChange(tab) {
      console.log('Tab changed to:', tab);
      activeTab.value = tab;
      if (tab === 'preview') {
        setTimeout(() => {
          const iframe = document.querySelector("iframe");
          if (iframe) {
            updatePDFPreview();
          } else {
            console.error('Iframe not found for PDF preview when handling tab change');
          }
        }, 0);
      }
    }

    const updatePDFPreview = () => {
      const iframe = document.querySelector("iframe");
      if (iframe) {
        let doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) doc = doc.document;
        try {
          doc.open();
          doc.write(generatePDFContent());
          doc.close();
        } catch (error) {
          console.error('Error updating PDF preview:', error);
        }
      } else {
        console.error('Iframe not found when updating');
      }
    };

    const generatePDFContent = () => {
      const user = Utils.getStore('user');
      const sections = dropdownSections.value;

      sections.courses.items = dropdownSections.value.education.items.flatMap(education =>
        education.courses.filter(course => course.isSelected)
      );

      console.log('Selected Courses:', sections.courses.items);

      switch (resume.value.template_type) {
        case 1:
          return loadTemplateOne(user, sections);
        case 2:
          return loadTemplateTwo(user, sections);
        case 3:
          return loadTemplateThree(user, sections);
        case 4:
          return loadTemplateFour(user, sections);
        case 5:
          return loadTemplateFive(user, sections);
        case 6:
          return loadTemplateSix(user, sections);
        case 7:
          return loadTemplateSeven(user, sections);
        default:
          return loadTemplateOne(user, sections);
      }
    };

    const loadData = (service, sectionKey) => {
      service(studentId.value)
        .then(response => {
          dropdownSections.value[sectionKey].items = response.data.map(item => ({
            ...item,
            isSelected: false
          }));
        })
        .catch(error => {
          console.error(`Failed to fetch ${sectionKey} data:`, error);
        });
    };

    const loadEducationData = () => {
      educationServices.getAllEducations(studentId.value)
        .then(response => {
          dropdownSections.value.education.items = response.data.map(education => ({
            ...education,
            isSelected: false,
            courses: []
          }));
          loadCoursesData(); // Load courses for each education item
        })
        .catch(error => {
          console.error('Failed to fetch education data:', error);
        });
    };

    const loadExperienceData = () => loadData(experienceServices.getAllExperiences, 'experience');
    const loadCertificationData = () => loadData(certificationServices.getAllCertifications, 'certifications');
    const loadSkillData = () => loadData(skillServices.getAllSkills, 'skills');
    const loadProjectData = () => loadData(projectServices.getAllProjects, 'projects');

    const loadCoursesData = () => {
      dropdownSections.value.education.items.forEach((education, index) => {
        courseServices.getAllCourses(studentId.value, education.id)
          .then(response => {
            dropdownSections.value.education.items[index].courses = response.data.map(course => ({
              ...course,
              isSelected: false // Initialize isSelected property
            }));
            console.log(`Courses loaded for education ID ${education.id}:`, dropdownSections.value.education.items[index].courses);
          })
          .catch(error => {
            console.error(`Failed to fetch courses for education ID ${education.id}:`, error);
          });
      });
    };

    const toggleDropdown = (sectionKey) => {
      isDropdownOpen.value[sectionKey] = !isDropdownOpen.value[sectionKey];
    };

    const toggleCourseDropdown = (index, educationId) => {
      isCourseDropdownOpen.value[index] = !isCourseDropdownOpen.value[index];
    };

    const toggleCourseCheckbox = (course) => {
      console.log('toggleCourseCheckbox called for:', course.name);
      course.isSelected = !course.isSelected;
      console.log('Course selected, then update PDF:', course);
      updatePDFPreview(); // Update the PDF preview if necessary
    };

    const toggleNestedDropdown = (educationIndex, courseIndex) => {
      if (!isNestedDropdownOpen.value[educationIndex]) {
        isNestedDropdownOpen.value[educationIndex] = {};
      }
      isNestedDropdownOpen.value[educationIndex][courseIndex] = !isNestedDropdownOpen.value[educationIndex][courseIndex];
    };

    const toggleCheckbox = (item) => {
      item.isSelected = !item.isSelected;
      updatePDFPreview();
    };

    const saveAsPNG = (resumeIdHere) => {
      const content = generatePDFContent(); // Generate the content
      const container = document.createElement('div'); // Create a container element
      container.innerHTML = content;

      container.style.backgroundColor = '#ffffff'; // White background
      container.style.padding = '0'; // Optional: Avoid extra spacing
      container.style.overflow = 'hidden'; // Prevent any overflow
      container.style.display = 'inline-block'; // Ensure proper inline layout for consistent capture
      container.style.transform = 'scale(0.32)'; // Scale down the text content
      container.style.transformOrigin = 'top center'; // Adjust scaling origin
      container.style.position = 'relative'; // Ensure proper layout alignment
      container.style.height = '200px'; // Fixed height
      container.style.margin = '0 auto'; // Center the container horizontally
      container.style.padding = '55px'

      document.body.appendChild(container); // Temporarily append to body

      // Calculate dimensions for html2canvas
      const options = {
        scale: 3, // Increase resolution
        width: 150, // Set fixed width
        height: container.offsetHeight, // Capture the full height dynamically
        useCORS: true, // Cross-origin support
        backgroundColor: '#ffffff' // Set white background explicitly
      };

      console.log(options.width, options.height);

      // Use html2canvas to capture the content
      return html2canvas(container, options).then(async (canvas) => {
        console.log("Canvas:", canvas);
        const imageURL = canvas.toDataURL('image/png');
        //console.log("Image URL:", imageURL);
        console.log("Resume id:", resumeIdHere);

        // Upload the image
        try {
          const response = await resumeServices.uploadResumeImage(studentId.value, resumeIdHere, imageURL);
          if (response.status === 200 || response.status === 201) {
            console.log('PNG uploaded successfully');
          } else {
            console.error('Failed to upload PNG');
          }
        } catch (error) {
          console.log("Image URL should be:", imageURL);
          console.error('Error uploading PNG:', error);
        } finally {
          document.body.removeChild(container); // Clean up the DOM
        }
      });
    };


    const downloadPDF = () => {
      const content = generatePDFContent();
      const container = document.createElement('div');
      container.innerHTML = content;

      document.body.appendChild(container);

      html2pdf()
        .set({
          margin: 3,
          filename: resumeTitle.value || `${user.fName}_${user.lName}_Resume.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait' }
        })
        .from(container)
        .save()
        .then(() => {
          document.body.removeChild(container);
        });
    };

    function saveResume() {
      // Save the resume data
      console.log("Title value:" + resumeTitle.value)
      resume.value.name = resumeTitle.value || "My Resume";

      resumeServices.createResume(studentId.value, resume.value)
        .then((res) => {
          resumeId.value = res.data.id;
          const resumeIdHere = res.data.id;
          addResumeInfo();

          saveAsPNG(resumeIdHere).then(() => {
            console.log("Resume saved successfully", resumeIdHere);
            router.push({ name: "studentHome" }); // Navigate back home
          });

        })
        .catch((error) => {
          if (error.response && error.response.status === 406) {
            console.log("Error: " + error.code + ":" + error.message);
          } else {
            console.log(error);
          }
        });
    }


    function addResumeInfo() {
      const selectedEducation = dropdownSections.value.education.items.filter(item => item.isSelected);
      const selectedExperience = dropdownSections.value.experience.items.filter(item => item.isSelected);
      const selectedCertifications = dropdownSections.value.certifications.items.filter(item => item.isSelected);
      const selectedSkills = dropdownSections.value.skills.items.filter(item => item.isSelected);
      const selectedProjects = dropdownSections.value.projects.items.filter(item => item.isSelected);
      const selectedCourses = dropdownSections.value.education.items.flatMap(education => education.courses.filter(course => course.isSelected));

      selectedEducation.forEach(item => {
        resumeEducationServices.createResumeEducation(resumeId.value, item.id, {})
          .then(() => {
            console.log("Education added to resume successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      });

      selectedExperience.forEach(item => {
        resumeExperienceServices.createResumeExperience(resumeId.value, item.id, {})
          .then(() => {
            console.log("Experience added to resume successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      });

      selectedCertifications.forEach(item => {
        resumeCertificationServices.createResumeCertification(resumeId.value, item.id, {})
          .then(() => {
            console.log("Certification added successfully to resume");
          })
          .catch((error) => {
            console.log(error);
          });
      });

      selectedSkills.forEach(item => {
        resumeSkillServices.createResumeSkill(resumeId.value, item.id, {})
          .then(() => {
            console.log("Skill added to resume successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      });

      selectedProjects.forEach(item => {
        resumeProjectServices.createResumeProject(resumeId.value, item.id, {})
          .then(() => {
            console.log("Project added to resume successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      });

      selectedCourses.forEach(course => {
        resumeCourseServices.createResumeCourse(resumeId.value, course.educationId, course.id, {})
          .then(() => {
            console.log("Course added to resume successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }

    return {
      studentId,
      isDropdownOpen,
      isCourseDropdownOpen,
      isNestedDropdownOpen,
      dropdownSections,
      toggleDropdown,
      toggleCourseDropdown,
      toggleCourseCheckbox,
      toggleNestedDropdown,
      toggleCheckbox,
      updatePDFPreview,
      editPencilIcon,
      dropDownUpIcon,
      dropDownIcon,
      downloadIcon,
      saveIcon,
      getSectionIcon,
      downloadPDF,
      saveResume,
      resumeTitle,
      activeTab,
      handleTabChange,
      templates,
      selectedTemplate,
      selectTemplate,
      previewTemplate,
    };
  },
};
</script>


<style scoped>
@import '@/assets/view-resume.css';

.courses-dropdown {
  margin-bottom: 20px;
  background-color: #084565;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
}

.courses-dropdown-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  font-size: 24px;
  color: white;
  background-color: #0b547c;
  border-bottom: 1px solid #099ace;
}

.courses-dropdown-content {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #0e74a0;
  transition: height 0.3s ease;
}

.courses-dropdown.open .courses-dropdown-content {
  display: block;
}

.education-dropdown {
  margin-bottom: 15px;
  background-color: #128DCF;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  transition: all 0.3s ease;
}

.education-dropdown-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  font-size: 20px;
  color: white;
  background-color: #1c88bf;
}

.education-dropdown-content {
  display: none;
  padding: 10px;
  background-color: #1a7fb8;
  font-size: 16px;
  color: #fff;
}

.education-dropdown.open .education-dropdown-content {
  display: flex;
}

.courses-dropdown-header:hover,
.education-dropdown-header:hover {
  background-color: #0a6c91;
}

.course-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  color: #fff;
}
</style>

<style scoped>
.transparent-btn {
  background-color: transparent !important;
  box-shadow: none;
  min-width: unset;
}

.white-icon {
  color: white;
}

.icon {
  width: 24px;
  height: 24px;
}
</style>