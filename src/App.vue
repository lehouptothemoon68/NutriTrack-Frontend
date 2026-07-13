<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, user, loginWithRedirect, logout: auth0Logout, isLoading } = useAuth0()
const login = () => loginWithRedirect()
const doLogout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } })
</script>

<template>
  <div class="app">

    <!-- Navbar -->
    <nav class="navbar" v-if="isAuthenticated">
      <div class="navbar-brand">🍱 NutriTrack</div>
      <div class="navbar-right">
        <span class="user-email">👤 {{ user?.email }}</span>
        <button @click="doLogout" class="btn-logout">Logout</button>
      </div>
    </nav>

    <!-- Login Seite -->
    <div v-if="!isLoading && !isAuthenticated" class="login-page">
      <div class="login-card">
        <div class="login-icon">🍱</div>
        <h1 class="login-title">NutriTrack</h1>
        <p class="login-subtitle">Verfolge deine tägliche Kalorienzufuhr</p>
        <div class="login-features">
          <div class="feature">✅ Mahlzeiten tracken</div>
          <div class="feature">✅ Kalorien berechnen</div>
          <div class="feature">✅ Tagesziel setzen</div>
        </div>
        <button @click="login" class="btn-login">🔐 Jetzt einloggen</button>
        <p class="login-hint">Noch kein Account? Einfach registrieren!</p>
      </div>
    </div>

    <!-- App Inhalt -->
    <div v-else-if="isAuthenticated">
      <RouterView />
    </div>

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: white;
}


.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 800;
  color: #15803d;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 0.9rem;
  color: #6b7280;
}

.btn-logout {
  padding: 0.4rem 1rem;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-logout:hover {
  background: #fecaca;
}

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 420px;
  width: 100%;
}

.login-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #15803d;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.feature {
  color: #374151;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  background: #f0fdf4;
  border-radius: 8px;
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1rem;
}

.btn-login:hover {
  background: #16a34a;
}

.login-hint {
  color: #9ca3af;
  font-size: 0.85rem;
}
</style>
