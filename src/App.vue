<template>
  <div id="app">
    <transition name="fade" @after-leave="onSplashLeave">
      <SplashScreen v-if="showSplash" />
    </transition>
    <HeaderApp v-if="!showSplash" />
    <router-view v-if="!showSplash" />
    <FooterApp v-if="!showSplash" />
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
  },
  methods: {
    onSplashLeave() {
      this.$router.push('/'); 
    }
  }
};
</script>
