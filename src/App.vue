<template>
  <div id="app">
    <transition name="fade" @after-leave="onSplashLeave">
      <SplashScreen v-if="showSplash" />
    </transition>
    <HeaderApp />
    <router-view />
    <FooterApp />
  </div>
</template>

<script>
import HeaderApp from './components/HeaderApp.vue';
import FooterApp from './components/FooterApp.vue';
import SplashScreen from "@/components/SplashScreen.vue"; 
export default {
  components: {
    HeaderApp,
    FooterApp,
    SplashScreen 
  },
  data() {
    return {
      showSplash: true 
    };
  },
  mounted() {
    
    setTimeout(() => {
      this.showSplash = false; 
    }, 3000);
  }
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1; 
}

footer {
  margin-top: auto; 
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
