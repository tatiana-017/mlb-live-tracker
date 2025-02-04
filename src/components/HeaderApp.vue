<template>
  <header>
    <nav>
      <div class="titleApp">
        <img src="/src/assets/mlbLogo.png" alt="Icono" class="icono-titulo">
        <h1>MLB Live Tracker</h1>
      </div>
      <ul>
        <li><router-link to="/" exact>Home</router-link></li>
        <li><router-link to="/players" exact>Players</router-link></li>
        <li><router-link to="/calendar" exact>Calendar</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  background: #8293a0;
  color: white;
}

nav, .titleApp {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icono-titulo {
  width: 50px;
  margin: 0.5rem;
  margin-left: 1.2rem;
}

h1 {
  font-size: 20px;
  font-weight: bold;
}

ul {
  list-style: none;
  display: flex;
}

li {
  padding: 1.2rem;
}

a {
  text-decoration: none;
  font-weight: bold;
  color: #0a3d62; 
}


.router-link-exact-active {
  color: aliceblue; 
}

li:hover, a:hover { 
  background-color: #71808b;
}
</style>
