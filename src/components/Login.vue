<template>
    <div class="login-page">
      <v-container class="login-container" fill-height>
        <v-row justify="center" align="center" class="welcome-container">
          <div class="welcome-message">
            <h1 class="welcome-text">Welcome to <br>
               Eagle Flight Plan!</h1>
            <p class="instructions">
              Log in to Career Services.
            </p>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div class="signup-section">
              <SocialLogin @login-success="handleLoginSuccess" @login-failure="handleLoginFailure" />
            </div>
          </div>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script>
  import "@/assets/generic-stylesheet.css";
  import SocialLogin from "@/components/resumeBuilderComponents/SocialLogin.vue";
  import { useRouter } from "vue-router";
  import { ref } from "vue";
  
  export default {
    name: "Login",
    components: {
      SocialLogin,
    },
    setup() {
      const router = useRouter();
      const errorMessage = ref("");
  
      const handleLoginSuccess = () => {
        router.push('/homeFP');
      };
  
      const handleLoginFailure = (message) => {
        errorMessage.value = message; // Set error message to display
      };
  
      return {
        handleLoginSuccess,
        handleLoginFailure,
        errorMessage,
      };
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    margin-left: 100vh;
    box-shadow: 20 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .logo {
    width: 81px;
    margin-bottom: 20px;
  }
  </style>