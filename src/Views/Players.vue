<template>
  <div class="players-page">
    <h1>Players</h1>
    <p>Here, you can see more details about the players.</p>

    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
      <p>Loading players...</p>
    </div>

    <div v-else class="table-container">
      <div class="controls-container">
        <div class="search-container">
          <span class="material-icons search-icon">search</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name, position, or team..."
            class="search-input"
          />
        </div>

        <div class="filters-container">
          <button class="filter-button">
            <span class="material-icons">filter_list</span>
            <select v-model="selectedAges" multiple>
              <option v-for="age in uniqueAges" :key="age" :value="age">
                {{ age }}
              </option>
            </select>
          </button>

          <button class="filter-button">
            <span class="material-icons">public</span>
            <select v-model="selectedNationalities" multiple>
              <option
                v-for="nationality in uniqueNationalities"
                :key="nationality"
                :value="nationality"
              >
                {{ nationality }}
              </option>
            </select>
          </button>
        </div>
      </div>

      <table class="players-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Team</th>
            <th>Nationality</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in paginatedPlayers" :key="player.id">
            <td>{{ player.fullName }}</td>
            <td>{{ player.primaryPosition.name }}</td>
            <td>{{ player.teamName || "Unknown" }}</td>
            <td>{{ player.birthCountry }}</td>
            <td>{{ player.currentAge }}</td>
            <td>
              <router-link :to="'/players/' + player.id" class="view-more">
                View More
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          <span class="material-icons">chevron_left</span>
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed } from "vue";

export default {
  name: "Players",
  setup() {
    const players = ref([]);
    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 15;
    const loading = ref(true);
    const selectedAges = ref([]);
    const selectedNationalities = ref([]);

    const fetchTeamName = async (teamId) => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/teams/${teamId}`
        );
        return response.data.teams[0]?.name || "Unknown";
      } catch (error) {
        console.error("Error al obtener el equipo:", error);
        return "Unknown";
      }
    };

    const fetchPlayers = async () => {
      try {
        const response = await axios.get(
          "https://statsapi.mlb.com/api/v1/sports/1/players?season=2024"
        );
        const allPlayers = response.data.people;

        const activePlayers = allPlayers.filter((player) => player.active);

        const playersWithTeams = await Promise.all(
          activePlayers.map(async (player) => {
            const teamName = player.currentTeam
              ? await fetchTeamName(player.currentTeam.id)
              : "Unknown";
            return { ...player, teamName };
          })
        );

        players.value = playersWithTeams;
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchPlayers);

    const uniqueAges = computed(() => [
      ...new Set(players.value.map((player) => player.currentAge)),
    ]);
    const uniqueNationalities = computed(() => [
      ...new Set(players.value.map((player) => player.birthCountry)),
    ]);

    const filteredPlayers = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      let filtered = players.value;

      if (query) {
        filtered = filtered.filter(
          (player) =>
            player.fullName.toLowerCase().includes(query) ||
            player.primaryPosition.name.toLowerCase().includes(query) ||
            player.teamName.toLowerCase().includes(query)
        );
      }

      if (selectedAges.value.length > 0) {
        filtered = filtered.filter((player) =>
          selectedAges.value.includes(player.currentAge)
        );
      }

      if (selectedNationalities.value.length > 0) {
        filtered = filtered.filter((player) =>
          selectedNationalities.value.includes(player.birthCountry)
        );
      }

      return filtered;
    });

    const totalPages = computed(() =>
      Math.ceil(filteredPlayers.value.length / itemsPerPage)
    );

    const paginatedPlayers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return filteredPlayers.value.slice(start, start + itemsPerPage);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    return {
      players,
      searchQuery,
      currentPage,
      totalPages,
      paginatedPlayers,
      nextPage,
      prevPage,
      loading,
      selectedAges,
      selectedNationalities,
      uniqueAges,
      uniqueNationalities,
    };
  },
};
</script>

<style scoped>
.players-page {
  text-align: left;
  margin: 30px;
}

.players-page h1 {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 10px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #0a3d62;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.table-container {
  background-color: #efefef;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-container {
  width: 60%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-input:focus {
  border-color: #333;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 20px;
}

.filters-container {
  display: flex;
  gap: 1rem;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0a3d62;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
}

.filter-button:hover {
  background-color: #1565c0;
}

.filter-button select {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.filter-button:hover select {
  visibility: visible;
  opacity: 1;
}

.players-table {
  width: 100%;
  border-collapse: collapse;
}

.players-table th,
.players-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #b8b8b8;
}

.players-table th {
  background-color: #0a3d62;
  color: white;
}

.players-table tr:hover {
  background-color: #f5f5f5;
}

.view-more {
  font-size: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
}

.view-more:hover {
  background-color: #218838;
}

.pagination {
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination button {
  background-color: #0a3d62;
  color: white;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination button:disabled {
  background-color: #a9a9a9;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: scale(1.05);
}

.material-icons {
  font-size: 24px;
}
</style>

