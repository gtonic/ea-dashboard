// login.js — Login form component
import { store } from '../store.js'
import { auth, login, logout, toasts, addToast } from '../api-client.js'
import { i18n } from '../i18n.js'
import { navigateTo } from '../router.js'

export default {
  name: 'LoginView',
  setup () {
    return { store, auth, i18n, navigateTo }
  },
  data () {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  computed: {
    t () { return this.i18n.t }
  },
  methods: {
    async handleLogin () {
      this.error = null
      this.loading = true
      try {
        await login(this.email, this.password)
        addToast(t('login.success'), 'success')
        navigateTo('/')
      } catch (e) {
        this.error = e?.message || 'Login fehlgeschlagen'
      } finally {
        this.loading = false
      }
    },
    handleLogout () {
      logout()
    }
  },
  template: `
    <div class="min-h-[60vh] flex items-center justify-center">
      <div v-if="!auth.isLoggedIn" class="w-full max-w-md">
        <div class="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8">
          <div class="text-center mb-6">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">EA Dashboard Login</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Melden Sie sich an, um fortzufahren</p>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
              <input v-model="email" type="email" required autofocus
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
              <input v-model="password" type="password" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••" />
            </div>
            <button type="submit" :disabled="loading"
              class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading">Anmelden...</span>
              <span v-else>Anmelden</span>
            </button>
          </form>
        </div>
      </div>

      <div v-else class="w-full max-w-md">
        <div class="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Eingeloggt als {{ auth.user?.name || auth.user?.email }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Rolle: {{ auth.user?.role }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ auth.user?.email }}</p>
          <div class="flex gap-3 justify-center">
            <button @click="navigateTo('/')"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
              Zum Dashboard
            </button>
            <button @click="handleLogout"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}
