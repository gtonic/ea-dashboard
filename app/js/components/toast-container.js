// toast-container.js — Global toast notification overlay
import { toasts, removeToast } from '../api-client.js'

export default {
  name: 'ToastContainer',
  setup () {
    return { toasts, removeToast }
  },
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] space-y-2 max-w-sm">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium cursor-pointer transition-all',
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
          ]"
          @click="removeToast(toast.id)">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  `
}
