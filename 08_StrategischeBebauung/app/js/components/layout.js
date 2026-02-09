// layout.js — App shell with sidebar navigation and header
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'AppLayout',
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Backdrop -->
      <div v-if="store.sidebarOpen" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="store.sidebarOpen = false"></div>

      <!-- Sidebar -->
      <aside class="sidebar no-print bg-white border-r border-surface-200 flex flex-col transition-all duration-300
                    fixed inset-y-0 left-0 z-40 w-64 lg:static lg:z-auto"
             :class="store.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'">
        <!-- Logo / Brand -->
        <div class="h-16 flex items-center px-4 border-b border-surface-200 shrink-0">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <div class="font-bold text-sm text-gray-900 leading-tight">EA Bebauungsplan</div>
            <div class="text-xs text-gray-500 truncate">{{ store.data.meta.company || 'Enterprise Architecture' }}</div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1">Overview</div>
          <a v-for="item in navOverview" :key="item.path"
             :href="linkTo(item.path)" @click="closeMobile()"
             class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700"
             :class="{ active: isActive(item.path) }">
            <span v-html="item.icon" class="w-5 h-5 shrink-0"></span>
            <span>{{ item.label }}</span>
          </a>

          <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-1">Capabilities & Apps</div>
          <a v-for="item in navCapApps" :key="item.path"
             :href="linkTo(item.path)" @click="closeMobile()"
             class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700"
             :class="{ active: isActive(item.path) }">
            <span v-html="item.icon" class="w-5 h-5 shrink-0"></span>
            <span>{{ item.label }}</span>
          </a>

          <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-1">Projects</div>
          <a v-for="item in navProjects" :key="item.path"
             :href="linkTo(item.path)" @click="closeMobile()"
             class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700"
             :class="{ active: isActive(item.path) }">
            <span v-html="item.icon" class="w-5 h-5 shrink-0"></span>
            <span>{{ item.label }}</span>
          </a>

          <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-1">Strategy & KPIs</div>
          <a v-for="item in navStrategy" :key="item.path"
             :href="linkTo(item.path)" @click="closeMobile()"
             class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700"
             :class="{ active: isActive(item.path) }">
            <span v-html="item.icon" class="w-5 h-5 shrink-0"></span>
            <span>{{ item.label }}</span>
          </a>

          <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-1">System</div>
          <a :href="linkTo('/settings')" @click="closeMobile()"
             class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700"
             :class="{ active: isActive('/settings') }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Settings</span>
          </a>
        </nav>

        <!-- Version info -->
        <div class="border-t border-surface-200 px-4 py-3 text-[10px] text-gray-400 shrink-0">
          v{{ store.data.meta.version }} · Last saved {{ lastSaved }}
        </div>
      </aside>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-surface-200 flex items-center px-4 gap-4 shrink-0 no-print">
          <button @click="store.sidebarOpen = !store.sidebarOpen"
                  class="p-2 rounded-lg hover:bg-surface-100 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
          <div class="flex-1"></div>
          <span class="text-xs text-gray-400 hidden sm:block">{{ store.data.meta.company }}</span>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-surface-50">
          <div v-if="!store.loaded" class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p class="text-gray-500">Loading data…</p>
            </div>
          </div>
          <component v-else :is="currentComponent" :key="router.path"></component>
        </main>
      </div>
    </div>
  `,
  setup () {
    const navOverview = [
      { path: '/', label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>' }
    ]
    const navCapApps = [
      { path: '/domains', label: 'Domains', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>' },
      { path: '/apps', label: 'Applications', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' },
      { path: '/vendors', label: 'Vendors', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>' },
      { path: '/capability-matrix', label: 'Cap-App Matrix', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>' },
      { path: '/time', label: 'TIME Quadrant', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>' }
    ]
    const navProjects = [
      { path: '/projects', label: 'Portfolio', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>' },
      { path: '/demands', label: 'Demand Backlog', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>' },
      { path: '/demand-pipeline', label: 'Demand Pipeline', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18v4H3V4zm2 6h14v4H5v-4zm4 6h6v4H9v-4z"/></svg>' },
      { path: '/project-heatmap', label: 'Project Heatmap', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>' },
      { path: '/dependencies', label: 'Dependencies', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' }
    ]
    const navStrategy = [
      { path: '/budget-dashboard', label: 'Budget Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
      { path: '/roadmap', label: 'Strategy Roadmap', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
      { path: '/executive-summary', label: 'Executive Summary', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>' },
      { path: '/processes', label: 'E2E Processes', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' },
      { path: '/maturity-gap', label: 'Maturity Gap', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>' }
    ]

    const pageTitles = {
      'dashboard-view': 'Dashboard',
      'domain-list': 'Domains & Capabilities',
      'domain-detail': 'Domain Detail',
      'app-list': 'Applications',
      'app-detail': 'Application Detail',
      'cap-app-matrix': 'Capability–Application Matrix',
      'time-quadrant': 'TIME Quadrant',
      'project-list': 'Project Portfolio',
      'project-detail': 'Project Detail',
      'project-heatmap': 'Project–Domain Heatmap',
      'dependency-graph': 'Project Dependencies',
      'process-list': 'E2E Processes',
      'process-detail': 'Process Detail',
      'vendor-list': 'Vendor Management',
      'vendor-detail': 'Vendor Detail',
      'demand-list': 'Demand Backlog',
      'demand-detail': 'Demand Detail',
      'demand-pipeline': 'Demand Pipeline',
      'budget-dashboard': 'Budget Dashboard',
      'maturity-gap': 'Maturity Gap Analysis',
      'roadmap-view': 'Strategy Roadmap',
      'executive-summary': 'Executive Summary',
      'settings-view': 'Settings'
    }

    const { computed } = Vue
    const currentComponent = computed(() => router.component || 'dashboard-view')
    const pageTitle = computed(() => pageTitles[currentComponent.value] || 'EA Bebauungsplan')
    const lastSaved = computed(() => {
      const d = store.data.meta.lastUpdated
      if (!d) return '—'
      try { return new Date(d).toLocaleDateString('de-AT') } catch { return d }
    })

    function isActive (path) {
      if (path === '/') return router.path === '/'
      return router.path.startsWith(path)
    }

    function closeMobile () {
      if (window.innerWidth < 1024) store.sidebarOpen = false
    }

    // Start with sidebar closed on mobile
    if (window.innerWidth < 1024) store.sidebarOpen = false

    return {
      store, router, linkTo, navigateTo,
      navOverview, navCapApps, navProjects, navStrategy,
      currentComponent, pageTitle, lastSaved, isActive, closeMobile
    }
  }
}
