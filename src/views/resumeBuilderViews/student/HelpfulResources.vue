<template>
    <div class="container">
      <!-- Side Navigation Bar -->
      <StudentHomeSideNav @request="toggleRequest" />
  
      <!-- Main Content Area -->
      <div class="content">
        <div class="resources-container">
          <h1>Helpful Resources</h1>
          
          <div class="resources-content">
            <img :src="clockTower" alt="Clock Tower" class="resources-image">
            
            <div class="resources-text">
              <h2>Building a Resume</h2>
              <p>
                Learn the <a href="https://docs.google.com/document/d/1eyb_lSlPvFSq9KNWPW0Go413GaYHrIAr7F9NgGS3wo8/edit?tab=t.0" target="_blank"><strong>Basics</strong></a>: craft a clear, tailored resume. Highlight 
                <a href="https://ddtjogezxr16i.cloudfront.net/images/Transferable-Skills-Worksheets-Resume-Help.pdf" target="_blank"><strong>transferable skills</strong></a> like teamwork and problem-solving. 
                Then you can prepare to soar in your <a href="https://app.jobscan.co/plan" target="_blank"><strong>interviews</strong></a>.
              </p>
              <br>
              <h2>Crafting a Cover Letter</h2>
              <p>
                After creating your resume, follow clear <a href="https://ddtjogezxr16i.cloudfront.net/images/TheCoverLetterBeforeYouWrite.docx" target="_blank"><strong>guidelines</strong></a> and use an 
                <a href="https://docs.google.com/document/d/1gr7MduZuZerdBmPPJWIdjoxd7wta24wzBHwVLb5WGLc/edit" target="_blank"><strong>outline</strong></a> to create your cover letter. Look at the following 
                <a href="https://ddtjogezxr16i.cloudfront.net/images/Cover-Letter-Rubric.pdf" target="_blank"><strong>rubric</strong></a> for help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import StudentHomeSideNav from '@/components/resumeBuilderComponents/studentPages/StudentHomeSideNav.vue';
  import clockTower from '@/assets/clocktower.jpg';
  import { ref } from 'vue';
  
  const isRequest = ref(false);
  
  const toggleRequest = () => {
    isRequest.value = !isRequest.value;
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
  }
  
  .content {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: #f5f5f5;
  }
  
  .resources-container {
    padding: 40px;
    background-color: white;
    color: #811429;
    font-family: 'Poppins', sans-serif;
    max-width: 800px;
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }
  
  .resources-container h1 {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    border-bottom: 4px solid #811429;
    padding-bottom: 10px;
    letter-spacing: 1px;
  }
  
  .resources-content {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-top: 30px;
  }
  
  .resources-image {
    width: 40%;
    border-radius: 12px;
    box-shadow: 5px 5px 15px rgba(0,0,0,0.1);
  }
  
  .resources-text {
    width: 55%;
  }
  
  .resources-text h2 {
    border-left: 5px solid #811429;
    padding-left: 15px;
    font-size: 1.8rem;
    font-weight: 600;
    color: #811429;
  }
  
  .resources-text p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
  }

  .resources-text a {
    color: #118ACB;
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }
  
  .resources-text h2 + p {
    margin-top: 25px;
  }
  </style>