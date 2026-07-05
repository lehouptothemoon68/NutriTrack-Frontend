<script setup lang="ts">
import {ref, onMounted, computed, watch} from "vue";
import type {Macronutrient, MealEntry} from "@/types/meal";
import {getAllMeals, createMeal, deleteMeal, updateMeal} from "@/services/mealService";
import {useAuth0} from "@auth0/auth0-vue";

const meals = ref<MealEntry[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const showOnlyFavorites= ref(false)
const { user } = useAuth0()

const newName= ref("")
const newCarbs = ref(0)
const newFat = ref(0)
const newProteins = ref(0)
const editingMealId = ref<number | null>(null)
const searchText = ref("")
const dailyGoal = ref(2000)

const filteredMeals = computed(() =>
  meals.value.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchText.value.toLowerCase())
    const matchesFavorite = !showOnlyFavorites.value || meal.favorite
    return matchesSearch && matchesFavorite
  })
)

const totalCalories = computed(() =>
  meals.value.reduce((sum, meal) => sum + calculateCalories(meal.macro), 0)
)

const totalMacros = computed(() => ({
  countCarbs: meals.value.reduce((sum, m) => sum + m.macro.countCarbs, 0),
  countFat: meals.value.reduce((sum, m) => sum + m.macro.countFat, 0),
  countProteins: meals.value.reduce((sum, m) => sum + m.macro.countProteins, 0)
}))

async function loadMeals(){
  if (!user.value?.email) return
  isLoading.value = true
  try {
    meals.value = await getAllMeals(user.value?.email)
  } catch (error) {
    errorMessage.value = "Error while loading meals."
    console.error(error)
  }finally {
    isLoading.value = false
  }
}

async function submitForm() {
  if (!newName.value) return
  try {
    const mealData = {
      name: newName.value,
      macro: {
        countCarbs: newCarbs.value,
        countFat: newFat.value,
        countProteins: newProteins.value
      }
    }
    if (editingMealId.value !== null) {
      await updateMeal(editingMealId.value, mealData, user.value?.email)
    } else {
      await createMeal(mealData, user.value?.email)
    }
    resetForm()
    await loadMeals()
  }catch (error) {
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

async function onEdit(meal: MealEntry){
  editingMealId.value = meal.id ?? null
  newName.value = meal.name
  newFat.value = meal.macro.countFat
  newCarbs.value = meal.macro.countCarbs
  newProteins.value = meal.macro.countProteins
}

function resetForm(){
  editingMealId.value = null
  newName.value = ""
  newCarbs.value = 0
  newFat.value = 0
  newProteins.value = 0
}

async function onToggleFavorite(meal: MealEntry){
  if(!meal.id) return
  try {
    await updateMeal(meal.id, {...meal, favorite: !meal.favorite}, user.value?.email)
    await loadMeals()
  } catch (error) {
    errorMessage.value = "Fehler beim Aktualisieren des Favoriten-Status."
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
  <div class="container py-4">
    <h2 class="mb-4">🥗 Meine Mahlzeiten</h2>

    <form @submit.prevent="submitForm" class="mb-4 p-3 border rounded bg-light">
      <h3 class="mb-3">{{ editingMealId !== null ? "Mahlzeit bearbeiten" : "Neue Mahlzeit hinzufügen" }}</h3>
      <div class="mb-2">
        <input v-model="newName" placeholder="Name der Mahlzeit" required class="form-control" />
      </div>
      <div class="mb-2">
        <input v-model.number="newCarbs" type="number" placeholder="Kohlenhydrate (g)" class="form-control" />
      </div>
      <div class="mb-2">
        <input v-model.number="newFat" type="number" placeholder="Fett (g)" class="form-control" />
      </div>
      <div class="mb-2">
        <input v-model.number="newProteins" type="number" placeholder="Proteine (g)" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary me-2">
        {{ editingMealId !== null ? "Aktualisieren" : "Speichern" }}
      </button>
      <button v-if="editingMealId !== null" type="button" @click="resetForm" class="btn btn-secondary">
        Abbrechen
      </button>
    </form>

    <div class="mb-3 d-flex gap-3 align-items-center">
      <input v-model="searchText" placeholder="Mahlzeit suchen..." class="form-control w-auto" />
      <label class="d-flex align-items-center gap-2">
        <input type="checkbox" v-model="showOnlyFavorites" />
        Nur Favoriten anzeigen
      </label>
    </div>

    <p v-if="isLoading">Lade Mahlzeiten...</p>
    <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    <ul v-else class="list-group mb-4">
      <li v-for="meal in filteredMeals" :key="meal.id ?? meal.name" class="list-group-item">
        <h5>{{ meal.name }}</h5>
        <p class="mb-1">Kohlenhydrate: {{ meal.macro.countCarbs }} g</p>
        <p class="mb-1">Fette: {{ meal.macro.countFat }} g</p>
        <p class="mb-1">Proteine: {{ meal.macro.countProteins }} g</p>
        <p class="mb-2"><strong>Kalorien: {{ calculateCalories(meal.macro) }} kcal</strong></p>
        <button @click="onDelete(meal)" class="btn btn-danger btn-sm me-2">Löschen</button>
        <button @click="onEdit(meal)" class="btn btn-warning btn-sm me-2">Bearbeiten</button>
        <button @click="onToggleFavorite(meal)" class="btn btn-outline-warning btn-sm">
          {{ meal.favorite ? "⭐ Favorit" : "☆ Favorit" }}
        </button>
      </li>
    </ul>

    <div class="p-3 border rounded bg-light mb-3">
      <h3 class="mb-3">📊 Tagesübersicht</h3>
      <p>Gesamtkalorien: <strong>{{ totalCalories }} kcal</strong></p>
      <p>Kohlenhydrate gesamt: {{ totalMacros.countCarbs }} g</p>
      <p>Fette gesamt: {{ totalMacros.countFat }} g</p>
      <p>Proteine gesamt: {{ totalMacros.countProteins }} g</p>
    </div>

    <div class="p-3 border rounded bg-light">
      <h3 class="mb-3">🎯 Tagesziel</h3>
      <div class="mb-2">
        <input v-model.number="dailyGoal" type="number" placeholder="Tagesziel in kcal" class="form-control w-auto" />
      </div>
      <p v-if="totalCalories <= dailyGoal" class="text-success">
        ✅ Noch {{ dailyGoal - totalCalories }} kcal übrig
      </p>
      <p v-else class="text-danger">
        ⚠️ Tagesziel um {{ totalCalories - dailyGoal }} kcal überschritten
      </p>
    </div>
  </div>
</template>

<style scoped>
form {
  max-width: 400px;
}
</style>
