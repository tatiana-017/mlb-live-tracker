import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUserPlus, faArrowRight } from "@fortawesome/free-solid-svg-icons"; // Icono de usuario y arrow-right
import { createRouter, createWebHashHistory } from "vue-router"; // Asegura que vue-router está importado correctamente
import Home from "./Views/Home.vue";
import Players from "./Views/Players.vue";
import PlayersDetails from "./Views/PlayersDetails.vue";
import Calendar from "./Views/Calendar.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/players", component: Players },
  {
    path: "/players/:id",
    name: "player-details",
    component: PlayersDetails,
    props: true,
  },
  { path: "/calendar", component: Calendar},
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

library.add(faUserPlus, faArrowRight);

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router);
app.mount("#app");
