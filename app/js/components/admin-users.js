// admin-users.js — Admin user management component
import { store } from '../store.js'
import { auth, adminApi, addToast } from '../api-client.js'
import { i18n } from '../i18n.js'

export default {
  name: 'AdminUsers',
  setup () {
    return { store, auth, i18n }
  },
  data () {
    return {
      users: [],
      loading: true,
      showForm: false,
      editingUser: null,
      form: { email: '', name: '', password: '', role: 'viewer', is_active: true },
      formError: null
    }
  },
  async mounted () {
    await this.loadUsers()
  },
  methods: {
    async loadUsers () {
      this.loading = true
      try {
        this.users = await adminApi.listUsers()
      } catch (e) {
        addToast(e.message || 'Fehler beim Laden der Benutzer', 'error')
      } finally {
        this.loading = false
      }
    },
    openCreateForm () {
      this.editingUser = null
      this.form = { email: '', name: '', password: '', role: 'viewer', is_active: true }
      this.formError = null
      this.showForm = true
    },
    openEditForm (user) {
      this.editingUser = user
      this.form = { email: user.email, name: user.name, password: '', role: user.role, is_active: user.is_active }
      this.formError = null
      this.showForm = true
    },
    async saveUser () {
      this.formError = null
      try {
        const payload = { ...this.form }
        if (!payload.password) delete payload.password
        if (this.editingUser) {
          await adminApi.updateUser(this.editingUser.id, payload)
          addToast('Benutzer aktualisiert', 'success')
        } else {
          await adminApi.createUser(payload)
          addToast('Benutzer erstellt', 'success')
        }
        this.showForm = false
        await this.loadUsers()
      } catch (e) {
        this.formError = e.message || 'Fehler beim Speichern'
      }
    },
    async deleteUser (user) {
      if (!confirm('Benutzer "' + user.email + '" wirklich löschen?')) return
      try {
        await adminApi.deleteUser(user.id)
        addToast('Benutzer gelöscht', 'success')
        await this.loadUsers()
      } catch (e) {
        addToast(e.message || 'Fehler beim Löschen', 'error')
      }
    },
    roleLabel (role) {
      return { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }[role] || role
    },
    roleBadgeClass (role) {
      return {
        admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }[role] || 'bg-gray-100 text-gray-700'
    }
  },
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Benutzerverwaltung</h2>
        <button @click="openCreateForm"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Neuer Benutzer
        </button>
      </div>

      <!-- User Form Modal -->
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white dark:bg-surface-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
            {{ editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
          </h3>
          <div v-if="formError" class="mb-3 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {{ formError }}
          </div>
          <form @submit.prevent="saveUser" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
              <input v-model="form.email" type="email" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input v-model="form.name" type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passwort {{ editingUser ? '(leer = unverändert)' : '' }}
              </label>
              <input v-model="form.password" type="password" :required="!editingUser"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rolle</label>
              <select v-model="form.role"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-800 dark:text-gray-200">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.is_active" type="checkbox" id="user-active"
                class="rounded border-gray-300 dark:border-gray-600" />
              <label for="user-active" class="text-sm text-gray-700 dark:text-gray-300">Aktiv</label>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="submit"
                class="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
                Speichern
              </button>
              <button type="button" @click="showForm = false"
                class="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-gray-500">Laden...</div>

      <!-- User Table -->
      <div v-else class="bg-white dark:bg-surface-800 rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-surface-700">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">E-Mail</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Rolle</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-surface-700/50">
              <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ user.name || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-4 py-3">
                <span :class="roleBadgeClass(user.role)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="user.is_active" class="text-green-600 dark:text-green-400 text-xs font-medium">Aktiv</span>
                <span v-else class="text-gray-400 text-xs">Inaktiv</span>
              </td>
              <td class="px-4 py-3 text-right space-x-2">
                <button @click="openEditForm(user)"
                  class="text-primary-600 dark:text-primary-400 hover:underline text-xs">Bearbeiten</button>
                <button @click="deleteUser(user)"
                  class="text-red-600 dark:text-red-400 hover:underline text-xs">Löschen</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="users.length === 0" class="text-center py-8 text-gray-500">Keine Benutzer vorhanden</div>
      </div>
    </div>
  `
}
