<template>
  <div class="player-details">
    <div class="player-header">
      <div class="player-image-container">
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
        <h1>{{ player.fullName }}</h1>
        <p><strong>Team:</strong> {{ player.teamName || "Unknown" }}</p>
        <p>
          <strong>Position:</strong>
          {{ player.primaryPosition?.name || "Unknown" }}
        </p>
      </div>
      <div class="team-logo-container">
        <img
          v-if="player.teamName"
          :src="
            'https://www.mlbstatic.com/team-logos/' +
            player.currentTeam.id +
            '.svg'
          "
          :alt="player.teamName + ' Photo'"
          class="team-logo"
        />
      </div>
    </div>

    <div class="player-data">
      <button @click="goBack">Back to Players</button>
      <table>
        <colgroup>
          <col style="width: 30%" />
          <col style="width: 70%" />
        </colgroup>
        <tbody>
          <tr>
            <td><strong>Nationality:</strong></td>
            <td>{{ player.birthCountry }}</td>
          </tr>
          <tr>
            <td><strong>Age:</strong></td>
            <td>{{ player.currentAge }}</td>
          </tr>
          <tr>
            <td><strong>Height:</strong></td>
            <td>{{ player.height }}</td>
          </tr>
          <tr>
            <td><strong>Weight:</strong></td>
            <td>{{ player.weight }} lbs</td>
          </tr>
          <tr>
            <td><strong>Birth City/State:</strong></td>
            <td>{{ player.birthCity }}, {{ player.birthStateProvince }}</td>
          </tr>
          <tr>
            <td><strong>Draft Year:</strong></td>
            <td>{{ player.draftYear || "Unknown" }}</td>
          </tr>
          <tr>
            <td><strong>Debut Date:</strong></td>
            <td>{{ player.mlbDebutDate }}</td>
          </tr>
          <tr>
            <td><strong>Bats:</strong></td>
            <td>{{ player.batSide?.description }}</td>
          </tr>
          <tr>
            <td><strong>Throws:</strong></td>
            <td>{{ player.pitchHand?.description }}</td>
          </tr>
          <tr>
            <td><strong>Primary Number:</strong></td>
            <td>{{ player.primaryNumber || "Unknown" }}</td>
          </tr>
          <tr>
            <td><strong>Strike Zone:</strong></td>
            <td>
              Bottom: {{ player.strikeZoneBottom }} ft, Top:
              {{ player.strikeZoneTop }} ft
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="nextGames.length > 0" class="next-games">
        <h2>Upcoming Games</h2>
        <div class="games-container">
          <div v-for="game in nextGames" :key="game.gameDate" class="game-card">
            <div class="game-date">
              <span class="month">{{ getMonth(game.date) }}</span>
              <span class="day">{{ getDay(game.date) }}</span>
            </div>
            <div class="game-details">
              <p class="opponent">
                <strong>Opponent:</strong> {{ game.opponent }}
              </p>
              <p class="stadium">
                <strong>Stadium:</strong> {{ game.stadium }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="prediction-section">
        <h2 class="prediction-title">Predicción realizada por Vertex AI</h2>
        <div class="prediction-card">
          <div v-if="predictionResult !== null" class="prediction-output">
            <p>
              <strong>Predicción de juegos ganados:</strong>
              {{ predictionResult }}
            </p>
            <p>
              <strong>Intervalo:</strong> {{ minInterval }} - {{ maxInterval }}
            </p>
            <p>{{ predictionMessage }}</p>
          </div>
        </div>
        <div class="button-container">
          <button @click="fetchPrediction" class="prediction-button">
            Obtener Predicción
          </button>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "PlayerDetails",
  setup() {
    const player = ref({});
    const route = useRoute();
    const nextGames = ref([]);
    const isLoading = ref(true);
    const predictionResult = ref(null);
    const minInterval = ref(null);
    const maxInterval = ref(null);
    const predictionMessage = ref("");

    const interpretPrediction = (gamesWon) => {
      if (gamesWon >= 80) {
        return "¡Este jugador podría ser una pieza clave para llevar a su equipo a los playoffs! 🎉";
      } else if (gamesWon >= 50) {
        return "Este jugador tiene un buen desempeño, pero su equipo necesitará más esfuerzo para destacar.";
      } else {
        return "Parece que será una temporada difícil para este jugador y su equipo. 😕";
      }
    };

    const fetchPrediction = async () => {
      console.log(player.value.currentTeam.id);
      if (!player.value || !player.value.id) return;

      const convertHeightToFeet = (height) => {
        const regex = /(\d+)' (\d+)"/;
        const match = height.match(regex);
        if (match) {
          const feet = parseInt(match[1], 10);
          const inches = parseInt(match[2], 10);
          return feet + inches / 12;
        }
        return parseFloat(height);
      };

      const playerStats = {
        id: String(player.value.id),
        fullName: String(player.value.fullName || ""),
        currentAge: String(player.value.currentAge),
        height: String(convertHeightToFeet(player.value.height)),
        weight: String(player.value.weight),
        primaryPosition: String(
          player.value.primaryPosition?.abbreviation || ""
        ),
        batSide: String(player.value.batSide?.description || ""),
        pitchHand: String(player.value.pitchHand?.description || ""),
        mlbDebutDate: String(player.value.mlbDebutDate || ""),
        strikeZoneTop: String(player.value.strikeZoneTop),
        strikeZoneBottom: String(player.value.strikeZoneBottom),
        currentTeam: String(player.value.currentTeam.id),
        season: "2024",
        teamName: String(player.value.teamName || "Unknown"),
        gamesPlayed: "0",
        topPerformer: "false",
      };

      console.log("Datos enviados a Vertex AI:", playerStats);

      try {
        const response = await axios.post(
          "https://mlblivetracker.onrender.com/predict",
          playerStats
        );

        const dataPrediction = response.data.predictions[0];
        const predictionValue = dataPrediction.value;
        const lowerBound = dataPrediction.lower_bound;
        const upperBound = dataPrediction.upper_bound;

        minInterval.value = lowerBound;
        maxInterval.value = upperBound;
        predictionResult.value = predictionValue;
        predictionMessage.value = interpretPrediction(predictionValue);
      } catch (error) {
        console.error("Error en la predicción:", error);
      }
    };

    const fetchNextGames = async (season) => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${season}`
        );

        if (response.data.dates && response.data.dates.length > 0) {
          nextGames.value = response.data.dates
            .flatMap((date) => date.games)
            .filter(
              (game) =>
                game.teams.away.team.id === player.value.currentTeam.id ||
                game.teams.home.team.id === player.value.currentTeam.id
            )
            .map((game) => ({
              opponent:
                game.teams.away.team.id === player.value.currentTeam.id
                  ? game.teams.home.team.name
                  : game.teams.away.team.name,
              date: game.gameDate,
              stadium: game.venue.name,
            }))
            .slice(0, 10);
        }
      } catch (error) {
        console.error("Error al obtener los próximos partidos:", error);
      }
    };

    const fetchTeamId = async (playerId) => {
      try {
        const response = await axios.get(
          "https://statsapi.mlb.com/api/v1/sports/1/players?season=2024"
        );

        if (response.data.people && response.data.people.length > 0) {
          const playerData = response.data.people.find(
            (p) => p.id === playerId
          );
          if (playerData && playerData.currentTeam) {
            return playerData.currentTeam.id;
          }
        }

        return "Unknown";
      } catch (error) {
        console.error("Error al obtener el equipo:", error);
        return "Unknown";
      }
    };

    const fetchTeamName = async (teamId) => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/teams/${teamId}`
        );

        if (response.data.teams && response.data.teams.length > 0) {
          return response.data.teams[0].name;
        }

        return "Unknown";
      } catch (error) {
        console.error("Error al obtener el nombre del equipo:", error);
        return "Unknown";
      }
    };

    const fetchPlayerDetails = async () => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/people/${route.params.id}`
        );

        const playerData = response.data.people[0];
        const teamId = await fetchTeamId(playerData.id);

        if (teamId !== "Unknown") {
          const teamName = await fetchTeamName(teamId);
          playerData.teamName = teamName;
          playerData.currentTeam = { id: teamId };
        } else {
          playerData.teamName = "Unknown";
        }

        player.value = playerData;
        isLoading.value = false;

        await fetchPrediction();
        await fetchNextGames(2025);
      } catch (error) {
        console.error("Error al obtener los detalles del jugador:", error);
        isLoading.value = false;
      }
    };

    const goBack = () => {
      window.history.back();
    };

    onMounted(fetchPlayerDetails);

    const getMonth = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString("default", { month: "short" }); // 'Feb', 'Mar', etc.
    };

    const getDay = (dateString) => {
      const date = new Date(dateString);
      return date.getDate(); // Número del día
    };

    return {
      player,
      nextGames,
      isLoading,
      goBack,
      getMonth,
      getDay,
      predictionResult,
      predictionMessage,
      maxInterval,
      minInterval,
      fetchPrediction,
    };
  },
};
</script>

<style scoped>
.player-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.player-header {
  background-color: #0a3d62;
  color: white;
  padding: 30px;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  position: relative;
}

.player-image-container {
  width: 150px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 70px;
  margin-right: 20px;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.player-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.team-logo-container {
  position: absolute;
  top: 85px;
  right: 70px;
  width: 55px;
  height: 55px;
}

.team-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  font-weight: bold;
}

.player-data {
  text-align: left;
  padding: 25px;
}

table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  table-layout: fixed;
}

.player-data strong {
  font-weight: bold;
}

table,
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #0a3d62;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #303f9f;
}

.next-games {
  margin-top: 20px;
  width: 100%;
}

.next-games h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.games-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.game-card {
  width: 350px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
}

.game-date {
  background-color: #0a3d62; /* Azul para la fecha */
  color: white;
  padding: 15px;
  margin: 10px;
  border-radius: 5%;
  text-align: center;
  width: 20%; /* Ancho fijo para la fecha */
}

.month {
  font-size: 1rem;
  text-transform: uppercase;
  display: block;
}

.day {
  font-size: 1.5rem;
  font-weight: bold;
  display: block;
}

.game-details {
  padding: 5px;
  width: 80%;
}

.opponent {
  font-weight: bold;
  margin-bottom: 5px;
}

.stadium {
  color: #555;
  margin-bottom: 0;
}

.prediction-title {
  color: #1a4672; /* Dark blue */
  text-align: center;
  margin-bottom: 10px;
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
}

.prediction-card {
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 70%;
  background-image: linear-gradient(
    to right,
    #4285f4,
    #34a853,
    #fbbc05,
    #ea4335,
    #4285f4
  ); 
  background-size: 400% 400%;
  animation: gradientRotate 15s linear infinite; 
}

@keyframes gradientRotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.prediction-output {
  color: #000; 
}

.prediction-output strong {
  font-weight: bold;
}

.back-button {
  background-color: #4285f4; /* Google blue */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* Smooth transition */
}

.back-button:hover {
  background-color: #357ae8; /* Slightly darker blue on hover */
}

.button-container {
  display: flex;
  justify-content: right; /* Center the button horizontally */
  margin-bottom: 20px; /* Add some space below the button */
}

.prediction-button {
  background-color: #4285f4; /* Google blue */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* Smooth transition */
}

.prediction-button:hover {
  background-color: #357ae8; /* Slightly darker blue on hover */
}
</style>
