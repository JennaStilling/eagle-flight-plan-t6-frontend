<template>
  <div class="resume-builder">
    <div class="resume-sidebar">
      <!-- Title Section -->
      <div class="title-section">
        <label for="resumeTitle" class="title-label">Title:</label>
        <input v-model="resumeTitle" id="resumeTitle" class="title-input" placeholder="First Resume" />
        <button @click="saveResume">
          <Icon :icon=saveIcon :alt="'save'" :class="save - button" :width="48" :height="48" />
        </button>
        <button @click="downloadPDF">
          <Icon :icon=downloadIcon :alt="'download'" :width="48" :height="48" />
        </button>
      </div>

      <!-- Reviewer Suggestion -->
      <div class="suggestion-box" v-if="resumeStatus">
        {{ resumeReview.suggestion }}
        <div class="submit-button">
          <button @click="deleteReview()">Complete</button>
        </div>
      </div>

      <!-- Dropdown Sections -->
      <div v-for="(section, sectionKey) in dropdownSections" :key="sectionKey" class="dropdown-section">
        <div class="dropdown-header" @click="toggleDropdown(sectionKey)">
          <Icon class="section-icon" :icon="getSectionIcon(sectionKey)" :alt="`${section.label} Icon`" :width="48" :height="48" />
          <span style="text-transform: capitalize;">{{ sectionKey }}</span>
          <Icon class="arrow-icon" :icon="isDropdownOpen[sectionKey] ? dropDownUpIcon : dropDownIcon" :alt="'arrow'"
          :width="48" :height="48" />
        </div>

        <div v-if="isDropdownOpen[sectionKey]" class="dropdown-content">
          <!-- Education Section -->
          <div v-if="sectionKey === 'education'">
            <div v-if="dropdownSections[sectionKey].items.length" class="section-list">
              <div v-for="(item, index) in dropdownSections[sectionKey].items" :key="index" class="student-contact-info"
                @click="toggleCheckbox(item)">
                <div class="student-contact-info-inner">
                  <div class="group-child" :class="{ selected: item.isSelected }">
                    <p>
                      {{
                        item.degree
                          ? `${item.degree}, ${item.institution}`
                          : item.institution
                      }}
                    </p>
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
                  <p>
                    {{
                      education.degree
                        ? `${education.degree}, ${education.institution}`
                        : education.institution
                    }}
                  </p>
                  <Icon :icon="isCourseDropdownOpen[index] ? dropDownUpIcon : dropDownIcon"
                  :width="48" :height="48"/>
                </div>

                <!-- Courses Dropdown Content -->
                <div v-if="isCourseDropdownOpen[index]" class="courses-dropdown-content">
                  <div v-if="education.courses && education.courses.length">
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
                  <div class="group-child" :class="{ selected: item.isSelected }">
                    <p v-if="sectionKey === 'experience'">
                      {{ item.role }}, {{ item.company }}
                    </p>
                    <p v-else-if="sectionKey === 'certifications'">
                      {{ item.name }}, {{ item.company }}
                    </p>
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

    <!-- Main Content -->
    <div class="main-content">
      <div class="edit-bar">
        <div class="tab" :class="{ active: activeTab === 'preview' }" @click="handleTabChange('preview')">
          Preview
        </div>
        <div class="tab" :class="{ active: activeTab === 'template' }" @click="handleTabChange('template')">
          Select Template
        </div>
        <div class="tab" :class="{ active: activeTab === 'ai' }" @click="handleTabChange('ai')">
          AI Analysis
        </div>
      </div>

      <!-- Preview Tab -->
      <div v-if="activeTab === 'preview'" class="pdf-preview">
        <iframe id="pdfPreview" ref="pdfPreview" width="100%" height="100%"></iframe>
      </div>

      <!-- Select Template Tab -->
      <div v-if="activeTab === 'template'" class="template-list">
        <div v-for="(template, index) in templates" :key="index" class="template-item"
          :class="{ active: template.name === selectedTemplate }">
          <p class="template-name">{{ template.name }}</p>
          <button @click="previewTemplate(template)" class="preview-button">
            Preview
          </button>
        </div>
      </div>

      <!-- AI Analysis Tab -->
      <div v-if="activeTab === 'ai'" class="ai-tab">
        <div>
          <!-- Job Description Field -->
          <div class="text-field-with-title">
            <label for="jobDescription" class="field-label">Job Description</label>
            <div class="textarea-wrapper">
              <textarea v-model="jobDescription" rows="3" class="text-field"
                placeholder="Paste desired job description here..."></textarea>
              <button @click="pasteFromClipboard" class="paste-icon" title="Paste" >
                <Icon :icon="pasteIcon" :alt="'Paste'" :color="'#f3f3f3'" />
              </button>
            </div>
            <span class="mandatory">*</span>
          </div>

          <!-- AI Suggestion Field -->
          <div class="text-field-with-title">
            <label for="aiSuggestion" class="field-label">AI Suggestion</label>
            <textarea v-model="result" :placeholder="loading ? 'Loading...' : ''" rows="18" class="text-field"
              readonly></textarea>
            <span class="mandatory">*</span>
          </div>

          <!-- Generate AI Review Button -->
          <div @click="cohereRequest" class="ai-review-button">
            <Icon :icon="aiIcon" :alt="'AI Icon'" :class="'ai-icon'" />
            Generate AI Review
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
// Services, etc...
import { ref, onMounted } from 'vue';
import educationServices from '@/services/resumeBuilderServices/educationServices.js';
import courseServices from '@/services/resumeBuilderServices/courseServices.js';
import experienceServices from '@/services/resumeBuilderServices/experienceServices.js';
import certificationServices from '@/services/resumeBuilderServices/certificationServices.js';
import skillServices from '@/services/resumeBuilderServices/skillServices.js';
import projectServices from '@/services/resumeBuilderServices/projectServices.js';
import Utils from '@/config/utils';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import resumeServices from '@/services/resumeBuilderServices/resumeServices.js'
import resumeReviewServices from '@/services/resumeBuilderServices/resumeReviewServices.js';
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

import { cohereClient } from "@/services/resumeBuilderServices/cohereClientServices.js";

export default {
  components: {
    Icon,
  },
  setup() {
    const user = Utils.getStore('user');
    const studentId = ref(null);
    const resumeTitle = ref('');
    const resume = ref({
      name: null,
      template_type: null
    });
    const changeTemplateType = (type) => {
      resume.value.template_type = type;
    };
    const activeTab = ref('preview');
    // Will be changed to props once student homepage is done
    const router = useRouter();
    const path = window.location.pathname;
    const match = path.match(/\/resume\/(\d+)$/);
    const resumeId = ref(match ? Number(match[1]) : null);
    const resumeReview = ref(null);
    const resumeStatus = ref(false);

    const isDropdownOpen = ref({
      education: false,
      courses: false,
      experience: false,
      certifications: false,
      skills: false,
      projects: false,
    });
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
    const pasteIcon = "material-symbols:content-paste-rounded";
    const aiIcon = "material-symbols:network-intel-node-rounded";

    const getSectionIcon = (sectionKey) => {
      return sectionIcons[sectionKey] || '';
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
      activeTab.value = 'preview';
      handleTabChange('preview');
    };

    onMounted(() => {
      Utils.getUser(Utils.getStore('user')).then(user => {
        studentId.value = user.studentId;
        getResume();
        loadEducationData();
        loadCoursesData();
        loadExperienceData();
        loadCertificationData();
        loadSkillData();
        loadProjectData();

        // Ensure the PDF preview is updated only once
        let previewUpdated = false; // Flag to track if updatePDFPreview has been called
        const iframe = document.querySelector("iframe");

        if (iframe) {
          iframe.addEventListener('load', () => {
            console.log('Iframe loaded');
            if (!previewUpdated) {
              previewUpdated = true;
              setTimeout(() => {
                updatePDFPreview(); // Call with a slight delay
              }, 500); // Delay in milliseconds
            }
          });

          if (!previewUpdated) {
            previewUpdated = true;
            setTimeout(() => {
              updatePDFPreview();
            }, 500);
          }
        } else {
          console.error('Iframe not found');
        }
      });
    });

    function handleTabChange(tab) {
      console.log('Tab changed to:', tab);
      activeTab.value = tab;

      if (tab === 'preview') {
        setTimeout(() => {
          const iframe = document.querySelector("iframe");
          if (iframe) {
            updatePDFPreview();
            console.log('Gets here');
          } else {
            console.error('Iframe not found for PDF preview when handling tab change');
          }
        }, 0); // Delay for Document Object Model (DOM) to update
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

    const saveAsPNG = (resumeIdHere) => {
      const content = generatePDFContent(); // Generate the content
      const container = document.createElement('div'); // Create a container element
      container.innerHTML = content;

      container.style.backgroundColor = '#ffffff'; // White background
      container.style.padding = '0';
      container.style.overflow = 'hidden';
      container.style.display = 'inline-block';
      container.style.transform = 'scale(0.32)'; // Scale down the text content
      container.style.transformOrigin = 'top center';
      container.style.position = 'relative'; // Ensure proper layout alignment
      container.style.height = '200px'; // Fixed height
      container.style.margin = '0 auto'; // Center the container horizontally
      container.style.padding = '55px'

      document.body.appendChild(container); // Temporarily append to body

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
        //console.log("Resume id:", resumeIdHere);

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

    const generatePDFContent = () => {
      const user = Utils.getStore('user');
      const sections = dropdownSections.value;

      switch (resume.value.template_type) {
        case 1:
          return loadTemplateOne(user, sections);
          break;
        case 2:
          return loadTemplateTwo(user, sections);
          break;
        case 3:
          return loadTemplateThree(user, sections);
          break;
        case 4:
          return loadTemplateFour(user, sections);
          break;
        case 5:
          return loadTemplateFive(user, sections);
          break;
        case 6:
          return loadTemplateSix(user, sections);
          break;
        case 7:
          return loadTemplateSeven(user, sections);
          break;
        default:
          return loadTemplateOne(user, sections);
      }
    };

    const getResume = () => {
      resumeServices.getResume(studentId.value, resumeId.value)
        .then((response) => {
          resume.value = response.data;
          resumeTitle.value = response.data.name;
          if (resume.value.resumeReviewId != null) getReview();
        })
        .catch((error) => {
          console.log("Could not retrieve resume: " + error);
        })
    }

    // Loads all the section data
    const loadData = (service, sectionKey, resumeService) => {
      service(studentId.value)
        .then(response => {
          dropdownSections.value[sectionKey].items = response.data.map(item => ({
            ...item,
            isSelected: false
          }));
          resumeService(resumeId.value)
            .then((response) => {
              response.data.forEach(item => {
                dropdownSections.value[sectionKey].items.forEach(obj => {
                  if (sectionKey === "education") if (obj.id === item.educationId) obj.isSelected = true;
                  if (sectionKey === "courses") if (obj.id === item.courseId) obj.isSelected = true;
                  if (sectionKey === "experience") if (obj.id === item.experienceId) obj.isSelected = true;
                  if (sectionKey === "certifications") if (obj.id === item.certificationId) obj.isSelected = true;
                  if (sectionKey === "skills") if (obj.id === item.skillId) obj.isSelected = true;
                  if (sectionKey === "projects") if (obj.id === item.projectId) obj.isSelected = true;
                })
              });
              updatePDFPreview();
            })
            .catch((error) => {
              if (error.response && error.response.status === 406) {
                message.value = "Error: " + error.code + ":" + error.message;
                console.log(error);
              } else {
                console.log(error);
              }
            });
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
            courses: [] // Initialize courses array
          }));
          resumeEducationServices.getAllResumeEducations(resumeId.value)
            .then(resumeEducations => {
              resumeEducations.data.forEach(resumeEducation => {
                dropdownSections.value.education.items.forEach(education => {
                  if (education.id === resumeEducation.educationId) {
                    education.isSelected = true;
                  }
                });
              });
              loadCoursesData(); // Load courses after setting education selection
            })
            .catch(error => {
              console.error('Failed to fetch resume education data:', error);
            });
        })
        .catch(error => {
          console.error('Failed to fetch education data:', error);
        });
    };


    const loadExperienceData = () => loadData(experienceServices.getAllExperiences, 'experience', resumeExperienceServices.getAllResumeExperiences);
    const loadCertificationData = () => loadData(certificationServices.getAllCertifications, 'certifications', resumeCertificationServices.getAllResumeCertifications);
    const loadSkillData = () => loadData(skillServices.getAllSkills, 'skills', resumeSkillServices.getAllResumeSkills);
    const loadProjectData = () => loadData(projectServices.getAllProjects, 'projects', resumeProjectServices.getAllResumeProjects);
    const loadCoursesData = () => {
      dropdownSections.value.education.items.forEach((education, index) => {
        courseServices.getAllCourses(studentId.value, education.id)
          .then(response => {
            dropdownSections.value.education.items[index].courses = response.data.map(course => ({
              ...course,
              isSelected: false // Initialize isSelected property
            }));
            resumeCourseServices.getAllResumeCourses(resumeId.value, education.id)
              .then(resumeCourses => {
                resumeCourses.data.forEach(resumeCourse => {
                  dropdownSections.value.education.items[index].courses.forEach(course => {
                    if (course.id === resumeCourse.courseId) {
                      course.isSelected = true;
                    }
                  });
                });
              })
              .catch(error => {
                console.error(`Failed to fetch resume courses for education ID ${education.id}:`, error);
              });
          })
          .catch(error => {
            console.error(`Failed to fetch courses for education ID ${education.id}:`, error);
          });
      });
    };


    const toggleDropdown = (sectionKey) => {
      isDropdownOpen.value[sectionKey] = !isDropdownOpen.value[sectionKey];
    };

    const toggleCheckbox = (item) => {
      item.isSelected = !item.isSelected;
      //console.log("Item selected in toggle checkbox:", item);
      updatePDFPreview();
    };

    const isCourseDropdownOpen = ref({});

    const toggleCourseDropdown = (index, educationId) => {
      isCourseDropdownOpen.value[index] = !isCourseDropdownOpen.value[index];
    };

    const toggleCourseCheckbox = (course) => {
      course.isSelected = !course.isSelected;
      //console.log('Course selection toggled:', course.name, 'isSelected:', course.isSelected);
      updatePDFPreview(); // Update the PDF preview if necessary
    };

    const downloadPDF = () => {
      // Create a temporary container for the HTML content
      const content = generatePDFContent();
      const container = document.createElement('div');
      container.innerHTML = content;

      // Append the container to the body temporarily
      document.body.appendChild(container);

      // Use html2pdf to generate and download the PDF
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
      resume.value.name = resumeTitle;

      resumeServices.updateResume(studentId.value, resumeId.value, resume.value)
        .then((res) => {
          resumeId.value = res.data.id;
          updateResumeInfo();
          const resumeIdHere = res.data.id;

          saveAsPNG(resumeIdHere).then(() => {
            console.log("Resume saved successfully", resumeIdHere);
            router.push({ name: "studentHome" }); // Navigate back home
          });
        })
        .catch((error) => {
          if (error.response && error.response.status === 406) {
            message.value = "Error: " + error.code + ":" + error.message;
            console.log(error);
          } else {
            console.log(error);
          }
        });

    }

    const loading = ref(false);

    const jobDescription = ref(null);
    const result = ref('');

    async function cohereRequest() {
      try {
        loading.value = true;
        result.value = '';

        console.log(generatePDFContent())

        const response = await cohereClient.chat({
          message: `Job Descrption:${jobDescription.value} Resume:${generatePDFContent()}`,
          model: "command-r-08-2024",
          preamble: "You are an AI-assistant chatbot. You are trained to assist users by analyzing their resume. You will provide a concise list of recommendations to improve their resumes. Users will send their resumes in html. Only give recommendations about the descriptions of each item in their resume and how those items relate to the job description. Do not mention that the request was made in HTML in your response."
        });
        result.value = response.text;
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false;
      }
    }

    function updateResumeInfo() {
      const selectedEducation = dropdownSections.value.education.items.filter(item => item.isSelected);
      const selectedCourses = dropdownSections.value.courses.items.filter(item => item.isSelected);
      const selectedExperience = dropdownSections.value.experience.items.filter(item => item.isSelected);
      const selectedCertifications = dropdownSections.value.certifications.items.filter(item => item.isSelected);
      const selectedSkills = dropdownSections.value.skills.items.filter(item => item.isSelected);
      const selectedProjects = dropdownSections.value.projects.items.filter(item => item.isSelected);

      deleteResumeData(resumeEducationServices.deleteAllResumeEducations);
      deleteResumeData(resumeCourseServices.deleteAllResumeCourses);
      deleteResumeData(resumeExperienceServices.deleteAllResumeExperiences);
      deleteResumeData(resumeCertificationServices.deleteAllResumeCertifications);
      deleteResumeData(resumeSkillServices.deleteAllResumeSkills);
      deleteResumeData(resumeProjectServices.deleteAllResumeProjects);

      selectedEducation.forEach(item => {
        resumeEducationServices.createResumeEducation(resumeId.value, item.id, {})
          .then(() => {
            console.log("Education added to resume successfully");
          })
          .catch((error) => {
            if (error.response && error.response.status === 406) {
              message.value = "Error: " + error.code + ":" + error.message;
              console.log(error);
            } else {
              console.log(error);
            }
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

      selectedExperience.forEach(item => {
        resumeExperienceServices.createResumeExperience(resumeId.value, item.id, {})
          .then(() => {
            console.log("Experience added to resume successfully");
          })
          .catch((error) => {
            if (error.response && error.response.status === 406) {
              message.value = "Error: " + error.code + ":" + error.message;
              console.log(error);
            } else {
              console.log(error);
            }
          });
      });

      selectedCertifications.forEach(item => {
        resumeCertificationServices.createResumeCertification(resumeId.value, item.id, {})
          .then(() => {
            console.log("Certification added successfully to resume");
          })
          .catch((error) => {
            if (error.response && error.response.status === 406) {
              message.value = "Error: " + error.code + ":" + error.message;
              console.log(error);
            } else {
              console.log(error);
            }
          })
      })

      selectedSkills.forEach(item => {
        resumeSkillServices.createResumeSkill(resumeId.value, item.id, {})
          .then(() => {
            console.log("Skill added to resume successfully");
          })
          .catch((error) => {
            if (error.response && error.response.status === 406) {
              message.value = "Error: " + error.code + ":" + error.message;
              console.log(error);
            } else {
              console.log(error);
            }
          });
      });

      selectedProjects.forEach(item => {
        resumeProjectServices.createResumeProject(resumeId.value, item.id, {})
          .then(() => {
            console.log("Project added to resume successfully");
          })
          .catch((error) => {
            if (error.response && error.response.status === 406) {
              message.value = "Error: " + error.code + ":" + error.message;
              console.log(error);
            } else {
              console.log(error);
            }
          });
      });
    }

    async function pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText(); // Read text from clipboard
        if (text) {
          this.jobDescription = text; // Set the job description
        } else {
          alert('Clipboard is empty!');
        }
      } catch (error) {
        alert('Failed to read clipboard: ' + error.message);
      }
    }

    const getReview = () => {
      resumeReviewServices.getResumeReviewById(resume.value.resumeReviewId)
        .then((res) => {
          resumeReview.value = res.data;
          if (resumeReview.value.status === "reviewed") resumeStatus.value = true;
          console.log(resumeReview.value);
        })
        .catch((error) => {
          console.log(error);
        })
    }

    const deleteReview = () => {
      resumeReviewServices.deleteResumeReview(studentId.value, resumeReview.value.id)
        .then((res) => {
          console.log(res.data);
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        })
    }

    const deleteResumeData = (service) => {
      service(resumeId.value)
        .then(() => {
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return {
      studentId,
      isDropdownOpen,
      isCourseDropdownOpen,
      dropdownSections,
      toggleDropdown,
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
      aiIcon,
      pasteIcon,
      pasteFromClipboard,
      cohereRequest,
      loading,
      result,
      jobDescription,
      toggleCourseDropdown,
      toggleCourseCheckbox,
      resumeReview,
      resumeStatus,
      deleteReview,
    };
  }
};
</script>


<style scoped>
@import '@/assets/view-resume.css';

.edit-bar {

    background-color: #5D6D73;
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 20px;
    max-width: 100%;
    margin-left: 70px;
  }

.tab {
  flex: 1;
  padding: 10px 20px;
  text-align: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tab.active {
  background-color: #0e74a0;
  font-weight: bold;
}

.tab:hover {
  background-color: #0b547c;
}

.nav-button {
  background-color: #5AC8FA;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: #4BB5D7;
}

.gray-rectangle {
  margin-left: 70px;
  height: 105px;
  background-color: #D2D9DC;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px;
}

.ai-review-button {
  background: #118ACB;
  color: #f3f3f3; 
  border: none;
  padding: 15px 20px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.ai-review-button:hover {
  background: rgba(17, 138, 203, 0.5);
  transform: scale(1.05);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.ai-icon {
  width: 48px;
  height: 50px;
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.field-label {
  font-size: 16px;
  font-weight: 600;
  color: #02161e;
  margin-bottom: 5px;
  display: block;
}

.text-field-with-title {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 110vh;
}

.cohere-button {
  background: linear-gradient(135deg, #022B3A 0%, #04425A 100%);
  color: #E0F7FA;
  border: 2px solid #04425A;
  padding: 15px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  max-width: 40%;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  margin-right: 40px;
}

.cohere-button:hover {
  background: linear-gradient(135deg, #033A4E 0%, #044F6D 100%);
  transform: translateY(-3px);
  border-color: #056885;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.6);
}

.cohere-button:active {
  transform: translateY(1px);
  background: linear-gradient(135deg, #021E2C 0%, #033A4E 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.textarea-wrapper {
  display: flex;
  position: relative;
  align-items: right;
  width: 100%;
}

.text-field {
  width: 100%;
  padding-right: 40px; 
  color: #000000;
}

.text-field-ai {
  width: 100%;
  padding-right: 40px; 
  color: #000000;
}

.paste-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.paste-icon img {
  width: 27px;
  height: 29px;
  transition: opacity 0.3s ease;
}

.paste-icon:hover img {
  opacity: 0.7;
}

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

.course-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  color: #fff;
}

.suggestion-box {
  min-height: 50px;
  background-color: #D2D9DC;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;
  margin: 10px;
  color: black;
  flex-wrap: wrap;
}

.submit-button {
  align-self: flex-end;
  padding: 5px;
  border-radius: 10px;
  background-color: #118ACB;
  color: white;
}
</style>

<style scoped>
:deep(.text-field::placeholder) {
  color: gray;
}
</style>