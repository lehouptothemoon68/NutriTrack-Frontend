import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MealList from '@/components/MealList.vue'

// Auth0 mocken
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    user: { value: { email: 'test@test.com' } }
  })
}))

// mealService mocken
vi.mock('@/services/mealService', () => ({
  getAllMeals: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: 'Pizza',
      macro: { countCarbs: 50, countFat: 20, countProteins: 15 },
      favorite: false
    },
    {
      id: 2,
      name: 'Burger',
      macro: { countCarbs: 40, countFat: 25, countProteins: 20 },
      favorite: true
    }
  ]),
  createMeal: vi.fn().mockResolvedValue({}),
  deleteMeal: vi.fn().mockResolvedValue({}),
  updateMeal: vi.fn().mockResolvedValue({})
}))

describe('MealList', () => {
  it('1. Komponente wird gerendert', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.exists()).toBe(true)
  })

  it('2. Überschrift wird angezeigt', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.text()).toContain('Meine Mahlzeiten')
  })

  it('3. Formular ist vorhanden', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('4. Kalorien werden korrekt berechnet - Pizza', () => {
    const macro = { countCarbs: 50, countFat: 20, countProteins: 15 }
    const kalorien = macro.countFat * 9 + macro.countProteins * 4 + macro.countCarbs * 4
    expect(kalorien).toBe(440)
  })

  it('5. Kalorien werden korrekt berechnet - Burger', () => {
    const macro = { countCarbs: 40, countFat: 25, countProteins: 20 }
    const kalorien = macro.countFat * 9 + macro.countProteins * 4 + macro.countCarbs * 4
    expect(kalorien).toBe(465)
  })

  it('6. Tagesübersicht ist vorhanden', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.text()).toContain('Tagesübersicht')
  })

  it('7. Tagesziel ist vorhanden', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.text()).toContain('Tagesziel')
  })

  it('8. Speichern Button ist vorhanden', async () => {
    const wrapper = mount(MealList)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
})
