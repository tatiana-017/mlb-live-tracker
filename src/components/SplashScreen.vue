<template>
    <div class="splash-container">
      <div class="splash-content">
        <img src="/mlbTrackerLogo.png" alt="Logo" class="logo" />
        <p class="app-name">MLB Live Tracker</p>
        <div class="loading-bar">
          <div class="progress"></div>
        </div>
        <p class="author-name"> By: Jeimy Arias</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "SplashScreen"
  };
  </script>
  
  <style scoped>
  .splash-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; 
  }
  
  .splash-content {
    text-align: center;
    animation: fadeIn 1s ease-in-out;
  }
  
  .logo {
    width: 200px; 
    animation: zoomIn 2s ease-in-out;
    margin-bottom: 20px;
  }
  
  .app-name {
    font-size: 1.5rem;
    color: #333;
    font-weight: bold;
  }
  
  .loading-bar {
    width: 200px;
    height: 5px;
    background-color: #e0e0e0;
    margin-top: 20px;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .progress {
    width: 0;
    height: 100%;
    background-color: #0a3d62;
    animation: loading 5s linear forwards;
  }
  
  /* Animación de Zoom */
  @keyframes zoomIn {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* Animación de Fade-in para el splash */
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  /* Animación de la barra de carga */
  @keyframes loading {
    100% {
      width: 100%;
    }
  }

  .author-name{
    color: #adabab;
    padding: 15px;
  }
  </style>  
  