<script setup lang="ts">
import {ref, computed, watch} from "vue";
import type {Macronutrient, MealEntry} from "@/types/meal";
import {getAllMeals, createMeal, deleteMeal, updateMeal} from "@/services/mealService";
import {useAuth0} from "@auth0/auth0-vue";

const meals = ref<MealEntry[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const { user } = useAuth0()

const newName = ref("")
const newCarbs = ref(0)
const newFat = ref(0)
const newProteins = ref(0)
const dailyGoal = ref(2000)
const validationError = ref<string | null>(null)

function validateForm(): boolean {
  if (!newName.value.trim()) {
    validationError.value = "Name darf nicht leer sein."
    return false
  }
  if (newCarbs.value < 0 || newFat.value < 0 || newProteins.value < 0) {
    validationError.value = "Makronährstoffe dürfen nicht negativ sein."
    return false
  }
  if (newCarbs.value > 1000 || newFat.value > 1000 || newProteins.value > 1000) {
    validationError.value = "Makronährstoffe dürfen nicht über 1000g sein."
    return false
  }
  validationError.value = null
  return true
}

const totalCalories = computed(() =>
  meals.value.reduce((sum, meal) => sum + calculateCalories(meal.macro), 0)
)

const totalMacros = computed(() => ({
  countCarbs: meals.value.reduce((sum, m) => sum + m.macro.countCarbs, 0),
  countFat: meals.value.reduce((sum, m) => sum + m.macro.countFat, 0),
  countProteins: meals.value.reduce((sum, m) => sum + m.macro.countProteins, 0)
}))

const goalProgress = computed(() => {
  if (dailyGoal.value === 0) return 0
  return Math.min(Math.round((totalCalories.value / dailyGoal.value) * 100), 100)
})

async function loadMeals(){
  if (!user.value?.email) return
  isLoading.value = true
  try {
    meals.value = await getAllMeals(user.value?.email)
  } catch (error) {
    errorMessage.value = "Fehler beim Laden."
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

async function submitForm() {
  if (!validateForm()) return
  try {
    const mealData = {
      name: newName.value,
      macro: {
        countCarbs: newCarbs.value,
        countFat: newFat.value,
        countProteins: newProteins.value
      }
    }
    await createMeal(mealData, user.value?.email)
    newName.value = ""
    newCarbs.value = 0
    newFat.value = 0
    newProteins.value = 0
    await loadMeals()
  } catch (error) {
    errorMessage.value = "Fehler beim Speichern."
    console.error(error)
  }
}

async function onDelete(meal: MealEntry){
  if(!meal.id) return
  if(!confirm("Wirklich löschen?")) return
  try {
    await deleteMeal(meal.id, user.value?.email)
    await loadMeals()
  } catch (error) {
    errorMessage.value = "Fehler beim Löschen."
    console.error(error)
  }
}

async function onToggleFavorite(meal: MealEntry){
  if(!meal.id) return
  try {
    await updateMeal(meal.id, {...meal, favorite: !meal.favorite}, user.value?.email)
    await loadMeals()
  } catch (error) {
    errorMessage.value = "Fehler beim Aktualisieren."
    console.error(error)
  }
}

function calculateCalories(macro: Macronutrient): number{
  return macro.countFat * 9 + macro.countProteins * 4 + macro.countCarbs * 4
}

watch(user, () => {
  if (user.value?.email) {
    loadMeals()
  }
}, { immediate: true })
</script>

<template>
  <div class="page">
    <div class="main-container">

      <!-- Stats oben -->
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">🔥 Kalorien</p>
          <p class="stat-value">{{ totalCalories }}</p>
          <p class="stat-unit">kcal</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">🍞 Kohlenhydrate</p>
          <p class="stat-value">{{ totalMacros.countCarbs }}</p>
          <p class="stat-unit">g</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">🥑 Fett</p>
          <p class="stat-value">{{ totalMacros.countFat }}</p>
          <p class="stat-unit">g</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">💪 Protein</p>
          <p class="stat-value">{{ totalMacros.countProteins }}</p>
          <p class="stat-unit">g</p>
        </div>
      </div>

      <div class="content-grid">

        <!-- Linke Spalte -->
        <div class="left-column">

          <!-- Formular -->
          <div class="card">
            <h2 class="card-title">➕ Mahlzeit hinzufügen</h2>
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label>Name der Mahlzeit</label>
                <input v-model="newName" placeholder="z.B. Hähnchen mit Reis" class="input" />
              </div>
              <div class="form-group">
                <label>🍞 Kohlenhydrate (g)</label>
                <input v-model.number="newCarbs" type="number" min="0" max="1000" class="input" />
              </div>
              <div class="form-group">
                <label>🥑 Fett (g)</label>
                <input v-model.number="newFat" type="number" min="0" max="1000" class="input" />
              </div>
              <div class="form-group">
                <label>💪 Proteine (g)</label>
                <input v-model.number="newProteins" type="number" min="0" max="1000" class="input" />
              </div>
              <p v-if="validationError" class="error-msg">⚠️ {{ validationError }}</p>
              <button type="submit" class="btn-primary">Speichern</button>
            </form>
          </div>

          <!-- Tagesziel -->
          <div class="card">
            <h2 class="card-title">🎯 Tagesziel</h2>
            <div class="form-group">
              <label>Kalorienziel (kcal)</label>
              <input v-model.number="dailyGoal" type="number" min="0" class="input" />
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: goalProgress + '%', backgroundColor: goalProgress >= 100 ? '#ef4444' : '#22c55e' }"></div>
            </div>
            <p class="progress-text">{{ totalCalories }} / {{ dailyGoal }} kcal ({{ goalProgress }}%)</p>
            <p v-if="totalCalories <= dailyGoal" class="success-text">✅ Noch {{ dailyGoal - totalCalories }} kcal übrig</p>
            <p v-else class="error-text">⚠️ Tagesziel um {{ totalCalories - dailyGoal }} kcal überschritten</p>
          </div>

        </div>

        <!-- Rechte Spalte: Mahlzeiten -->
        <div class="right-column">
          <div class="card">
            <h2 class="card-title">📋 Meine Mahlzeiten</h2>
            <p v-if="isLoading" class="loading-text">⏳ Lade Mahlzeiten...</p>
            <p v-else-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
            <div v-else>
              <p v-if="meals.length === 0" class="empty-text">Noch keine Mahlzeiten. Füge deine erste Mahlzeit hinzu!</p>
              <div v-for="meal in meals" :key="meal.id ?? meal.name" class="meal-card">
                <div class="meal-header">
                  <h3 class="meal-name">{{ meal.name }}</h3>
                  <span class="meal-calories">{{ calculateCalories(meal.macro) }} kcal</span>
                </div>
                <div class="meal-macros">
                  <span class="macro-badge carbs">🍞 {{ meal.macro.countCarbs }}g</span>
                  <span class="macro-badge fat">🥑 {{ meal.macro.countFat }}g</span>
                  <span class="macro-badge protein">💪 {{ meal.macro.countProteins }}g</span>
                </div>
                <div class="meal-actions">
                  <button @click="onToggleFavorite(meal)" class="btn-favorite">
                    {{ meal.favorite ? "⭐ Favorit" : "☆ Favorit" }}
                  </button>
                  <button @click="onDelete(meal)" class="btn-delete">🗑️ Löschen</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}




.main-container {
  max-width: 1100px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page {
  padding: 2rem 1rem;
  min-height: 100vh;
  background: white;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #15803d;
  margin: 0;
}

.stat-unit {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.25rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.4rem;
}

.input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.input:focus {
  border-color: #22c55e;
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background: #16a34a;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  background: #f3f4f6;
  border-radius: 999px;
  height: 12px;
  margin: 0.75rem 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.progress-text {
  font-size: 0.85rem;
  color: #6b7280;
  text-align: center;
  margin: 0.25rem 0;
}

.success-text {
  color: #16a34a;
  font-weight: 600;
  text-align: center;
  margin-top: 0.5rem;
}

.error-text {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
  margin-top: 0.5rem;
}

.meal-card {
  border: 1.5px solid #f3f4f6;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.meal-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-name {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.meal-calories {
  font-size: 1rem;
  font-weight: 700;
  color: #22c55e;
}

.meal-macros {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.macro-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.carbs { background: #fef9c3; color: #854d0e; }
.fat { background: #dcfce7; color: #166534; }
.protein { background: #fee2e2; color: #991b1b; }

.meal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-favorite {
  padding: 0.35rem 0.75rem;
  background: #fef9c3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #854d0e;
}

.btn-delete {
  padding: 0.35rem 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-delete:hover { background: #fecaca; }

.loading-text, .empty-text {
  color: #6b7280;
  text-align: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
