<template>
  <div class="home">
    <div class="content">
      <div class="slideshow">
        <swiper
          :modules="[Pagination, Autoplay]"
          :slides-per-view="1"
          :space-between="10"
          :loop="true"
          :pagination="{ clickable: true }"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          class="mySwiper"
        >
          <swiper-slide>
            <img :src="slide1" alt="Slide 1" />
          </swiper-slide>
          <swiper-slide>
            <img :src="slide2" alt="Slide 2" />
          </swiper-slide>
          <swiper-slide>
            <img :src="slide3" alt="Slide 3" />
          </swiper-slide>
          <swiper-slide>
            <img :src="slide4" alt="Slide 4" />
          </swiper-slide>
        </swiper>
      </div>

      <div class="text">
        <h1>Welcome to MLB Live Tracker</h1>
        <div class="divider"></div>
        <p>
          MLB Tracker is your ideal platform to follow in real time all the
          statistics, news and updates of Major League Baseball.
        </p>
      </div>
    </div>
  </div>

  <section class="upcoming-games">
    <h2>Upcoming Games</h2>
    <swiper
      :modules="[Navigation, Autoplay]"
      :slides-per-view="6"
      :space-between="20"
      :loop="true"
      :navigation="true"
      :autoplay="{ delay: 50000, disableOnInteraction: false }"
      class="games-swiper"
    >
      <swiper-slide
        v-for="game in upcomingGames"
        :key="game.date"
        class="game-card"
      >
        <div class="game-info">
          <img
            :src="getTeamLogo(game.homeTeamId)"
            :alt="game.homeTeam"
            class="team-logo"
          />
          <span class="vs">vs</span>
          <img
            :src="getTeamLogo(game.awayTeamId)"
            :alt="game.awayTeam"
            class="team-logo"
          />
        </div>
        <p class="game-date">{{ formatDate(game.date) }}</p>
      </swiper-slide>
    </swiper>
  </section>

  <section class="players-section">
    <h2>Follow your favorite players</h2>
    <div class="players-container">
      <div v-for="player in players" :key="player.id" class="player-card">
        <div class="player-photo">
          <img
            v-if="player.id"
            :src="
              'https://securea.mlb.com/mlb/images/players/head_shot/' +
              player.id +
              '.jpg'
            "
            :alt="player.fullName + ' Photo'"
            class="player-photo"
          />
        </div>
        <div class="player-info">
          <h3>{{ player.fullName }}</h3>
          <p>Team: {{ player.teamName || "Desconocido" }}</p>
        </div>
        <div class="follow-icon">
          <font-awesome-icon :icon="['fas', 'user-plus']" class="icon" />
        </div>
      </div>
    </div>
    <router-link to="/players">
      <button class="viewmore-button">View more</button>
    </router-link>
  </section>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import slide1 from "@/assets/slides/slide1.png";
import slide2 from "@/assets/slides/slide2.png";
import slide3 from "@/assets/slides/slide3.png";
import slide4 from "@/assets/slides/slide4.png";
import axios from "axios";
import { ref, onMounted } from "vue";

export default {
  name: "Home",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const players = ref([]);
    const upcomingGames = ref([]);

    const fetchTeamName = async (teamId) => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/teams/${teamId}`
        );
        return response.data.teams[0].name;
      } catch (error) {
        console.error("Error al obtener el equipo:", error);
        return "Desconocido";
      }
    };

    const fetchPlayers = async () => {
      try {
        const response = await axios.get(
          "https://statsapi.mlb.com/api/v1/sports/1/players?season=2024"
        );
        const allPlayers = response.data.people;
        const activePlayers = allPlayers.filter((player) => player.active);
        const selectedPlayers = activePlayers
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        for (let player of selectedPlayers) {
          if (player.currentTeam) {
            player.teamName = await fetchTeamName(player.currentTeam.id);
          }
        }

        players.value = selectedPlayers;
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      }
    };

    const fetchUpcomingGames = async () => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024`
        );

        if (response.data.dates && response.data.dates.length > 0) {
          upcomingGames.value = response.data.dates
            .flatMap((date) => date.games)
            .slice(0, 10)
            .map((game) => ({
              homeTeam: game.teams.home.team.name,
              homeTeamId: game.teams.home.team.id,
              awayTeam: game.teams.away.team.name,
              awayTeamId: game.teams.away.team.id,
              date: game.gameDate,
            }));
        }
      } catch (error) {
        console.error("Error al obtener los próximos partidos:", error);
      }
    };

    const getTeamLogo = (teamId) => {
      return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    onMounted(() => {
      fetchPlayers();
      fetchUpcomingGames();
    });

    return {
      slide1,
      slide2,
      slide3,
      slide4,
      Pagination,
      Autoplay,
      Navigation,
      players,
      upcomingGames,
      getTeamLogo,
      formatDate,
    };
  },
};
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.content {
  display: flex;
  width: 95%;
  max-width: 1200px;
}

.slideshow {
  width: 60%;
}

.mySwiper {
  width: 100%;
  height: 400px;
}

.mySwiper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.text {
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 15px;
  padding-left: 20px;
}

.text h1 {
  font-size: 2rem;
  font-weight: bold;
}

.divider {
  width: 100%;
  height: 3px;
  background-color: #0a3d62;
  margin: 20px 0;
  border-radius: 2px;
}

.text p {
  font-size: 1.2rem;
  color: #555;
}

.upcoming-games {
  align-content: center;
  height: 200px;
  padding: 20px;
  background-color: #f8f9fa;
  text-align: center;
  background: #e7e6e6;
}

.upcoming-games h2 {
  font-size: 22px;
  color: #0a3d62;
  font-weight: bold;
}

.games-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.game-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease-in-out;
}

.game-card:hover {
  transform: scale(1.05);
}

.game-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.team-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.vs {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.game-date {
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
}

.players-section {
  text-align: center;
  margin-top: 0px;
  padding: 30px;
  background: #ffff;
}

.players-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.player-card {
  background: #e7e6e6;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  width: 180px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.player-photo {
  width: 50px;
  height: 60px;
  margin-right: 10px;
  border-radius: 50px;
}

.players-section h2 {
  font-size: 22px;
  margin-bottom: 15px;
  font-weight: bold;
  color: #0a3d62;
}

.player-card h3 {
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}

.player-card p {
  color: #666;
}

.player-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.viewmore-button {
  border: none;
  color: #ffff;
  width: 100px;
  padding: 10px;
  font-weight: bold;
  background-color: #0a3d62;
  border-radius: 22px;
  margin-top: 20px;
}

.viewmore-button:hover {
  background: #1e5f7e;
}
</style>
