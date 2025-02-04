<template>
  <div class="calendar-container">
    <h1>MLB Season Calendar</h1>
    <div class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">
          <span class="material-icons">chevron_left</span>
        </button>
        <span>{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="nextMonth">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
      <div class="calendar-grid">
        <div class="day-name" v-for="day in daysOfWeek" :key="day">
          {{ day }}
        </div>
        <div
          v-for="day in daysInMonth"
          :key="day.date"
          :class="['day', { today: isToday(day.date) }]"
        >
          {{ day.day }}
          <div
            class="event"
            v-for="event in getEventsForDay(day.date)"
            :key="event.title"
            @click="showEventDetails(event)"
          >
            {{ event.awayAbbreviation }} <strong>vs</strong>
            {{ event.homeAbbreviation }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedEvent" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">
          <i class="material-icons">close</i>
        </span>

        <div class="modal-header">
          <!-- Equipo Visitante -->
          <div class="team-info">
            <img
              v-if="selectedEvent.awayTeamId"
              :src="getTeamLogo(selectedEvent.awayTeamId)"
              :alt="selectedEvent.awayName + ' Logo'"
              class="team-logo"
            />
            <h3>{{ selectedEvent.awayName }}</h3>
          </div>

          <div class="vs">VS</div>

          <!-- Equipo Local -->
          <div class="team-info">
            <img
              v-if="selectedEvent.homeTeamId"
              :src="getTeamLogo(selectedEvent.homeTeamId)"
              :alt="selectedEvent.homeName + ' Logo'"
              class="team-logo"
            />
            <h3>{{ selectedEvent.homeName }}</h3>
          </div>
        </div>

        <div class="modal-body">
          <p><strong>Fecha:</strong> {{ formatDate(selectedEvent.start) }}</p>
          <p><strong>Hora:</strong> {{ formatTime(selectedEvent.start) }}</p>
          <p v-if="selectedEvent.venue">
            <strong>Lugar:</strong> {{ selectedEvent.venue }}
          </p>
          <p v-else><strong>Lugar:</strong> No disponible</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import axios from "axios";

export default defineComponent({
  setup() {
    const currentMonth = ref(new Date().getMonth());
    const currentYear = ref(new Date().getFullYear());
    const selectedDate = ref(null);
    const events = ref([]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const currentMonthName = computed(() => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return monthNames[currentMonth.value];
    });

    const daysInMonth = computed(() => {
      const firstDay = new Date(currentYear.value, currentMonth.value, 1);
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
      const days = [];
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          date: new Date(currentYear.value, currentMonth.value, i),
          day: i,
        });
      }
      return days;
    });

    const fetchGames = async () => {
      try {
        const response = await axios.get(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${currentYear.value}`
        );

        if (response.data.dates) {
          const gameEvents = response.data.dates.flatMap((date) =>
            date.games.map((game) => ({
              date: new Date(game.gameDate),
              awayTeamId: game.teams.away.team.id,
              homeTeamId: game.teams.home.team.id,
              title: `${game.teams.away.team.name} vs ${game.teams.home.team.name}`, // Título provisional
              venue: game.venue
                ? game.venue.name
                  ? game.venue.name
                  : "No Disponible"
                : "No Disponible",
            }))
          );

          // Obtener abreviaturas de los equipos
          const teamIds = [
            ...new Set(
              gameEvents.flatMap((game) => [game.awayTeamId, game.homeTeamId])
            ),
          ];
          const teamsResponse = await Promise.all(
            teamIds.map((teamId) =>
              axios.get(`https://statsapi.mlb.com/api/v1/teams/${teamId}`)
            )
          );

          const teams = teamsResponse.map((response) => response.data.teams[0]);

          // Actualizar eventos con abreviaturas
          events.value = gameEvents.map((gameEvent) => {
            const awayTeam = teams.find(
              (team) => team.id === gameEvent.awayTeamId
            );
            const homeTeam = teams.find(
              (team) => team.id === gameEvent.homeTeamId
            );

            return {
              start: gameEvent.date,
              end: gameEvent.date,
              awayTeamId: gameEvent.awayTeamId,
              homeTeamId: gameEvent.homeTeamId,
              awayAbbreviation: awayTeam ? awayTeam.abbreviation : "N/A",
              homeAbbreviation: homeTeam ? homeTeam.abbreviation : "N/A",
              awayName: awayTeam ? awayTeam.name : "Unknown",
              homeName: homeTeam ? homeTeam.name : "Unknown",
              venue: gameEvent.venue,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    const prevMonth = () => {
      currentMonth.value--;
      if (currentMonth.value < 0) {
        currentMonth.value = 11;
        currentYear.value--;
      }
      fetchGames();
    };

    const nextMonth = () => {
      currentMonth.value++;
      if (currentMonth.value > 11) {
        currentMonth.value = 0;
        currentYear.value++;
      }
      fetchGames();
    };

    const isToday = (date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const showEvents = (date) => {
      selectedDate.value = date;
    };

    const getEventsForDay = (date) => {
      return events.value.filter(
        (event) =>
          event.start.getDate() === date.getDate() &&
          event.start.getMonth() === date.getMonth() &&
          event.start.getFullYear() === date.getFullYear()
      );
    };

    const selectedEvent = ref(null);

    const showEventDetails = (event) => {
      selectedEvent.value = event;
    };

    const closeModal = () => {
      selectedEvent.value = null;
    };

    const formatDate = (date) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("es-ES", options); // Formato en español
    };

    const formatTime = (date) => {
      const options = { hour: "2-digit", minute: "2-digit" };
      return date.toLocaleTimeString("es-ES", options); // Formato en español
    };

    const getTeamLogo = (teamId) => {
      if (teamId) {
        return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
      } else {
        return null; // O una imagen por defecto si lo deseas
      }
    };

    onMounted(fetchGames);

    return {
      currentMonthName,
      currentYear,
      daysOfWeek,
      daysInMonth,
      events,
      prevMonth,
      nextMonth,
      isToday,
      showEvents,
      getEventsForDay,
      selectedDate,
      selectedEvent,
      showEventDetails,
      closeModal,
      formatDate,
      formatTime,
      getTeamLogo,
    };
  },
});
</script>

<style scoped>
/* Estilos generales */
.calendar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.calendar-container h1 {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 20px;
}

.calendar {
  width: 95%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  background-color: #0a3d62;
  font-size: 18px;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header button {
  background: none;
  border: none;
  cursor: pointer;
}

.material-icons {
  color: #eee;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-name {
  font-weight: bold;
  color: #000;
  padding: 10px;
  text-align: center;
}

.day {
  padding: 10px;
  color: #000;
  border: 1px solid #eee;
  text-align: center;
  cursor: pointer;
}

.today {
  background-color: #a6c7de;
}

.event {
  background-color: #e0f2f7;
  color: #000;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}

.event:hover {
  background-color: #bbdefb;
}

/* Estilos del Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo oscuro más opaco */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  width: 400px;
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
}

/* Animación de aparición */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Botón de cerrar */
.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
}

.close i {
  color: #000;
}

/* Encabezado del modal */
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 15px;
}

/* VS en el centro */
.vs {
  font-size: 24px;
  font-weight: bold;
  color: #d32f2f; /* Rojo fuerte */
}

/* Contenedor de logos y nombres */
.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Logos de equipos */
.team-logo {
  width: 90px;
  height: 90px;
  margin-bottom: 10px;
  transition: transform 0.3s ease-in-out;
}

.team-logo:hover {
  transform: scale(1.1);
}

/* Estilos del cuerpo del modal */
.modal-body {
  margin-top: 15px;
  font-size: 16px;
  color: #333;
}

.modal-body p {
  margin: 5px 0;
  font-weight: bold;
}
</style>
