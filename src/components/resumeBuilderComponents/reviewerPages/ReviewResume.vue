<template>
  <div class="resume-container">
      <!-- Resume Title -->
    <div class="header" v-if="resume">
      <button class="back-button" @click="returnToInbox()">&#x2190;</button>
      <h1 style="color:black;">{{ resume.name }}</h1>
    </div>
    <div class="content">
      <!-- The resume -->
      <div class="resume-pdf">
          <iframe id="pdfPreview" ref="pdfPreview" width="100%" height="100%"></iframe>
      </div>
      <!-- Right Side -->
      <div class="email-section">
          <!-- Student Message to reviewer -->
        <div class="email-box" v-if="studentUser && resumeReview">
          <p><strong>{{ studentUser.fName + ' ' + studentUser.lName }} &lt;{{ studentUser.email }}&gt;</strong></p>
          <p>{{ resumeReview.notes }}</p>
        </div>
        <!-- Where the Reviewer will write their suggestions -->
        <div class="comments-section">
          <label for="comments">Comments:</label>
          <textarea id="comments" v-model="reviewSuggestions" placeholder="Feedback..."></textarea>
        </div>
        <!-- Requesting an in-person metting (Stretch Goal?) -->
        <!-- <div class="options">
          <input type="checkbox" id="inPersonMeeting" />
          <label for="inPersonMeeting">Request in-person meeting</label>
        </div> -->
        <button class="send-button" @click="submitReview()">SEND</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import userResumeReviewServices from '@/services/resumeBuilderServices/userResumeReviewServices';
import resumeReviewServices from '@/services/resumeBuilderServices/resumeReviewServices';
import resumeServices from '@/services/resumeBuilderServices/resumeServices';
import resumeCertificationServices from '@/services/resumeBuilderServices/resumeCertificationServices';
import resumeEducationServices from '@/services/resumeBuilderServices/resumeEducationServices';
import resumeCourseServices from '@/services/resumeBuilderServices/resumeCourseServices';
import resumeExperienceServices from '@/services/resumeBuilderServices/resumeExperienceServices';
import resumeProjectServices from '@/services/resumeBuilderServices/resumeProjectServices';
import resumeSkillServices from '@/services/resumeBuilderServices/resumeSkillServices';
import educationServices from '@/services/resumeBuilderServices/educationServices';
import courseServices from '@/services/resumeBuilderServices/courseServices';
import experienceServices from '@/services/resumeBuilderServices/experienceServices';
import certificationServices from '@/services/resumeBuilderServices/certificationServices';
import projectServices from '@/services/resumeBuilderServices/projectServices';
import skillServices from '@/services/resumeBuilderServices/skillServices';
import { loadTemplateOne } from '@/services/resumeBuilderServices/templates/templateOne.js';
import { loadTemplateTwo } from '@/services/resumeBuilderServices/templates/templateTwo.js';
import { loadTemplateThree} from '@/services/resumeBuilderServices/templates/templateThree.js';
import { loadTemplateFour } from '@/services/resumeBuilderServices/templates/templateFour.js';
import { loadTemplateFive } from '@/services/resumeBuilderServices/templates/templateFive.js';
import { loadTemplateSix } from '@/services/resumeBuilderServices/templates/templateSix.js';
import { loadTemplateSeven } from '@/services/resumeBuilderServices/templates/templateSeven.js';
import userServices from '@/services/resumeBuilderServices/userServices';
import Utils from '@/config/utils';

const router = useRouter();
const studentUser = ref(null);
const resumeReview = ref(null);
const resume = ref(null);
const reviewSuggestions = ref("");
const dropdownSections = ref({
    education: { items: [] },
    experience: { items: [] },
    certifications: { items: [] },
    skills: { items: [] },
    projects: { items: [] },
  });

const path = window.location.pathname;
const match = path.match(/\/review-resume\/(\d+)$/);
const resumeReviewId = ref(match ? Number(match[1]) : null);

onMounted(() => {
  getResumeReview();
});

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
    const sections = dropdownSections.value;
    switch (resume.value.template_type) {
      case 1:
        return loadTemplateOne(studentUser.value, sections);
      case 2:
        return loadTemplateTwo(studentUser.value, sections);
      case 3:
        return loadTemplateThree(studentUser.value, sections);
      case 4:
        return loadTemplateFour(studentUser.value, sections);
      case 5:
        return loadTemplateFive(studentUser.value, sections);
      case 6:
        return loadTemplateSix(studentUser.value, sections);
      case 7:
        return loadTemplateSeven(studentUser.value, sections);
      default:
        return loadTemplateOne(studentUser.value, sections);
    }
  };

const getResumeReview = () => {
  resumeReviewServices.getResumeReviewById(resumeReviewId.value)
      .then((res) => {
          resumeReview.value = res.data;
          // With the resume Review
          getStudentUser();
          getResume();
      })
      .catch((error) => {
          console.log(error);
      });
};

const getResume = () => {
  resumeServices.getResumeAsReviewer(resumeReview.value.id)
      .then((res) => {
          resume.value = res.data[0];
          // Get the Resume Data here
          loadEducationData();
          loadCoursesData();
          loadExperienceData()
          loadCertificationData();
          loadSkillData()
          loadProjectData();
      })
      .catch((error) => {
          console.log(error);
      })
};

const getStudentUser = () => {
  userServices.getAllStudentUsers(resumeReview.value.studentId)
      .then((res) => {
          studentUser.value = res.data[0];
      })
      .catch((error) => {
          console.log(error);
      })
};

const loadData = (service, sectionKey, resumeService) => {
    service(resumeReview.value.studentId)
      .then(response => {
        dropdownSections.value[sectionKey].items = response.data.map(item => ({
          ...item,
          isSelected: false
        }));
        resumeService(resume.value.id)
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
    educationServices.getAllEducations(resumeReview.value.studentId)
      .then(response => {
        dropdownSections.value.education.items = response.data.map(education => ({
          ...education,
          isSelected: false,
          courses: [] // Initialize courses array
        }));
        resumeEducationServices.getAllResumeEducations(resume.value.id)
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
      courseServices.getAllCourses(resumeReview.value.studentId, education.id)
        .then(response => {
          dropdownSections.value.education.items[index].courses = response.data.map(course => ({
            ...course,
            isSelected: false // Initialize isSelected property
          }));
          resumeCourseServices.getAllResumeCourses(resume.value.id, education.id)
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

  const submitReview = () => {
      // Update resumeReview
      resumeReview.value.suggestion = reviewSuggestions.value;
      resumeReview.value.status = "reviewed";
      updateReview();
      // Return to ReviewerInbox
      returnToInbox();
  };

  const updateReview = () => {
      resumeReviewServices.updateResumeReview(resumeReview.value.studentId, resumeReview.value.id, resumeReview.value)
          .then((res) => {
              console.log("Suggestions added to resume review");
          })
          .catch((error) => {
              console.log(error);
          });
  };

  const returnToInbox = () => {
    router.push({ name: 'review-inbox'});
  }
</script>

<style scoped>
.resume-container {
  margin-top: 10px;
  background-color: #cfe0e8;
  padding: 20px;
  border-radius: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 700px;
  max-height: 100%;
}

.header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.back-button {
  background: #811429;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  color: white;
  border: none;
  border-radius: 15px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.resume-pdf {
  flex: 1;
  margin-left: 50px;
  margin-right: 50px;
  background-color: white;
  min-height: 500px;
}

.email-section {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.email-box {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.comments-section {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.options {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.send-button {
  background-color: #118ACB;
  color: white;
  font-weight: 400;
  border: none;
  padding: 7px 10px;
  cursor: pointer;
}

.inPersonMeeting {
  margin-right: 10px;
  padding: 10px;
}
</style> 