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
  import SocialLogin from "@/components/SocialLogin.vue";
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
        router.push('/home');
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
  .login-page {
    background-image: url('@/assets/eagle-login-background.jpg');
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    margin-left: -10px; 
    box-shadow: 20 8px 12px rgba(0, 0, 0, 20);
    overflow: hidden;
  }
  
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
  
  .welcome-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .welcome-message {
    background-color: white;
    padding: 40px 50px;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    text-align: center;
    width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .welcome-text {
    font-size: 1.8em;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }
  
  .instructions {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 30px;
    text-align: center;
    line-height: 1.4;
    font-weight: lighter;
  }
  
  .error-message {
    color: red; 
    margin-bottom: 20px; 
  }
  
  .signup-section {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
    box-shadow: 20 4px 8px rgba(0, 0, 0, 0.9);
  }
  
  .signup-section .social-login-btn {
    width: 100%;
    text-align: center;
    color: #fff;
    box-shadow: 20 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .login-modal {
    position: absolute;
    right: 500px; 
    bottom: 50px; 
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    text-align: center;
    width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  </style>