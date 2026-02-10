// integration-map.js — D3 force-directed application integration / interface diagram
import { store } from '../store.js'
import { navigateTo } from '../router.js'

export default {
  name: 'IntegrationMap',
  template: `
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Schnittstellen-Diagramm der Applikations-Kommunikation. Pfeile zeigen Datenflüsse zwischen Anwendungen. Drag & Drop zum Anordnen.</p>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span class="font-medium">Schnittstellen-Typ:</span>
        <span v-for="it in ifTypes" :key="it.value" class="flex items-center gap-1">
          <span class="w-3 h-0.5 inline-block rounded" :style="{ backgroundColor: ifColor(it.value) }"></span>
          {{ it.symbol }} {{ it.label }}
        </span>
      </div>

      <!-- Filter -->
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="filterType" class="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white">
          <option value="">Alle Typen</option>
          <option v-for="it in ifTypes" :key="it.value" :value="it.value">{{ it.label }}</option>
        </select>
        <select v-model="filterApp" class="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white">
          <option value="">Alle Applikationen</option>
          <option v-for="app in sortedApps" :key="app.id" :value="app.id">{{ app.name }}</option>
        </select>
        <button @click="showForm = true"
                class="ml-auto bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-1.5 rounded-lg flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Integration hinzufügen
        </button>
      </div>

      <!-- Graph -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div ref="graphContainer" class="w-full h-[400px] lg:h-[560px]"></div>
      </div>

      <!-- Integration table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Alle Integrationen ({{ filtered.length }})</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">Quell-App</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Typ</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Ziel-App</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600 hidden md:table-cell">Protokoll</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600 hidden lg:table-cell">Beschreibung</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600 hidden sm:table-cell">Frequenz</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">Aktion</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="integ in filtered" :key="integ.id" class="hover:bg-surface-50">
              <td class="px-4 py-2 text-gray-700 cursor-pointer hover:text-primary-600" @click="navigateTo('/apps/' + integ.sourceAppId)">{{ appName(integ.sourceAppId) }}</td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: ifColor(integ.interfaceType) + '20', color: ifColor(integ.interfaceType) }">
                  {{ ifLabel(integ.interfaceType) }}
                </span>
              </td>
              <td class="px-4 py-2 text-gray-700 cursor-pointer hover:text-primary-600" @click="navigateTo('/apps/' + integ.targetAppId)">{{ appName(integ.targetAppId) }}</td>
              <td class="px-4 py-2 text-xs text-gray-500 hidden md:table-cell">{{ integ.protocol }}</td>
              <td class="px-4 py-2 text-xs text-gray-500 hidden lg:table-cell max-w-xs truncate">{{ integ.description }}</td>
              <td class="px-4 py-2 text-xs text-gray-500 hidden sm:table-cell">{{ integ.frequency }}</td>
              <td class="px-4 py-2 text-right">
                <button @click="editIntegration(integ)" class="text-gray-400 hover:text-primary-600 mr-2" title="Bearbeiten">
                  <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button @click="removeIntegration(integ.id)" class="text-gray-400 hover:text-red-600" title="Löschen">
                  <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="px-4 py-6 text-center text-gray-400">Keine Integrationen vorhanden</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="showForm = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-surface-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ editing ? 'Integration bearbeiten' : 'Neue Integration' }}</h3>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Quell-Applikation</label>
                <select v-model="form.sourceAppId" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2">
                  <option value="">— Wählen —</option>
                  <option v-for="app in sortedApps" :key="app.id" :value="app.id">{{ app.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Ziel-Applikation</label>
                <select v-model="form.targetAppId" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2">
                  <option value="">— Wählen —</option>
                  <option v-for="app in sortedApps" :key="app.id" :value="app.id">{{ app.name }}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Schnittstellen-Typ</label>
                <select v-model="form.interfaceType" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2">
                  <option v-for="it in ifTypes" :key="it.value" :value="it.value">{{ it.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Protokoll / Format</label>
                <input v-model="form.protocol" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2" placeholder="z.B. REST, CSV, JDBC" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Frequenz</label>
                <input v-model="form.frequency" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2" placeholder="z.B. Echtzeit, Täglich" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Richtung</label>
                <select v-model="form.direction" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2">
                  <option value="push">Push (Quelle → Ziel)</option>
                  <option value="pull">Pull (Ziel ← Quelle)</option>
                  <option value="bidirectional">Bidirektional</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Datenobjekte</label>
              <input v-model="form.dataObjects" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2" placeholder="z.B. Kunden, Aufträge, Rechnungen" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Beschreibung</label>
              <textarea v-model="form.description" rows="2" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2" placeholder="Kurze Beschreibung der Integration"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select v-model="form.status" class="w-full text-sm border border-surface-200 rounded-lg px-3 py-2">
                <option value="active">Aktiv</option>
                <option value="planned">Geplant</option>
                <option value="deprecated">Veraltet</option>
              </select>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-surface-200 flex justify-end gap-3">
            <button @click="showForm = false" class="text-sm px-4 py-2 rounded-lg border border-surface-200 hover:bg-surface-50">Abbrechen</button>
            <button @click="saveIntegration" :disabled="!form.sourceAppId || !form.targetAppId || form.sourceAppId === form.targetAppId"
                    class="text-sm px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40">
              {{ editing ? 'Speichern' : 'Hinzufügen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick, watch } = Vue
    const graphContainer = ref(null)
    const ifTypes = computed(() => store.data.enums.interfaceType || [])
    const filterType = ref('')
    const filterApp = ref('')
    const showForm = ref(false)
    const editing = ref(null)

    const emptyForm = () => ({
      sourceAppId: '', targetAppId: '', interfaceType: 'API',
      protocol: '', description: '', dataObjects: '',
      frequency: '', direction: 'push', status: 'active'
    })
    const form = ref(emptyForm())

    const sortedApps = computed(() =>
      [...store.data.applications].sort((a, b) => a.name.localeCompare(b.name))
    )

    const ifColorMap = { API: '#3b82f6', File: '#f59e0b', 'DB-Link': '#8b5cf6', Event: '#ef4444', ETL: '#10b981', Manual: '#64748b' }
    function ifColor (type) { return ifColorMap[type] || '#94a3b8' }
    function ifLabel (type) {
      const it = (store.data.enums.interfaceType || []).find(i => i.value === type)
      return it ? it.symbol + ' ' + it.label : type
    }
    function appName (id) { const a = store.appById(id); return a ? a.name : id }

    const filtered = computed(() => {
      let list = store.data.integrations || []
      if (filterType.value) list = list.filter(i => i.interfaceType === filterType.value)
      if (filterApp.value) list = list.filter(i => i.sourceAppId === filterApp.value || i.targetAppId === filterApp.value)
      return list
    })

    function editIntegration (integ) {
      editing.value = integ.id
      form.value = { ...integ }
      showForm.value = true
    }

    function saveIntegration () {
      if (editing.value) {
        store.updateIntegration(editing.value, { ...form.value })
      } else {
        store.addIntegration({ ...form.value })
      }
      showForm.value = false
      editing.value = null
      form.value = emptyForm()
      nextTick(renderGraph)
    }

    function removeIntegration (id) {
      store.deleteIntegration(id)
      nextTick(renderGraph)
    }

    function renderGraph () {
      if (!graphContainer.value || typeof d3 === 'undefined') return

      const container = graphContainer.value
      const width = container.clientWidth
      const height = container.clientHeight || 560

      const integrations = filtered.value
      if (!integrations.length) {
        d3.select(container).selectAll('*').remove()
        d3.select(container).append('div')
          .attr('style', 'display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:14px;')
          .text('Keine Integrationen für die aktuelle Filterauswahl')
        return
      }

      // Build nodes from apps involved in integrations
      const appIds = new Set()
      integrations.forEach(i => { appIds.add(i.sourceAppId); appIds.add(i.targetAppId) })

      const nodes = [...appIds].map(id => {
        const a = store.appById(id)
        return {
          id,
          name: a ? a.name : id,
          type: a ? a.type : '',
          criticality: a ? a.criticality : '',
          timeQuadrant: a ? a.timeQuadrant : ''
        }
      })

      const links = integrations.map(i => ({
        source: i.sourceAppId,
        target: i.targetAppId,
        type: i.interfaceType,
        direction: i.direction,
        label: i.protocol || i.interfaceType,
        description: i.description
      }))

      // Clear previous
      d3.select(container).selectAll('*').remove()

      const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .attr('viewBox', [0, 0, width, height])

      // Arrow markers per interface type
      const defs = svg.append('defs')
      Object.entries(ifColorMap).forEach(([type, color]) => {
        defs.append('marker')
          .attr('id', 'if-arrow-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 32).attr('refY', 0)
          .attr('markerWidth', 6).attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color)
        // Reverse arrow for bidirectional
        defs.append('marker')
          .attr('id', 'if-arrow-rev-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', -22).attr('refY', 0)
          .attr('markerWidth', 6).attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M10,-5L0,0L10,5').attr('fill', color)
      })

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(160))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50))

      // Links
      const link = svg.append('g').selectAll('line')
        .data(links).join('line')
        .attr('class', 'dep-link')
        .attr('stroke', d => ifColor(d.type))
        .attr('stroke-width', 2)
        .attr('marker-end', d => 'url(#if-arrow-' + d.type + ')')
        .attr('marker-start', d => d.direction === 'bidirectional' ? 'url(#if-arrow-rev-' + d.type + ')' : null)

      // Link labels (protocol)
      const linkLabel = svg.append('g').selectAll('text')
        .data(links).join('text')
        .text(d => d.label)
        .attr('text-anchor', 'middle')
        .attr('fill', d => ifColor(d.type))
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('dy', -6)

      // Nodes
      const timeColors = { Invest: '#22c55e', Tolerate: '#eab308', Migrate: '#f97316', Eliminate: '#ef4444' }
      const node = svg.append('g').selectAll('g')
        .data(nodes).join('g')
        .call(d3.drag()
          .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
        )
        .style('cursor', 'pointer')
        .on('click', (e, d) => { navigateTo('/apps/' + d.id) })

      // Node rectangles (rounded)
      node.append('rect')
        .attr('x', -28).attr('y', -18)
        .attr('width', 56).attr('height', 36)
        .attr('rx', 8)
        .attr('fill', '#f8fafc')
        .attr('stroke', d => timeColors[d.timeQuadrant] || '#94a3b8')
        .attr('stroke-width', 2.5)

      // Node labels
      node.append('text')
        .text(d => d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name)
        .attr('x', 0).attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '10px')

      // Small type badge inside rect
      node.append('text')
        .text(d => d.type || '')
        .attr('x', 0).attr('y', 3)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '9px')

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
        linkLabel
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2)
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      })
    }

    // Watch filters and re-render
    watch([filterType, filterApp], () => nextTick(renderGraph))

    onMounted(() => {
      nextTick(renderGraph)
      if (typeof ResizeObserver !== 'undefined' && graphContainer.value) {
        let resizeTimer = null
        const ro = new ResizeObserver(() => {
          clearTimeout(resizeTimer)
          resizeTimer = setTimeout(renderGraph, 200)
        })
        ro.observe(graphContainer.value)
      }
    })

    return {
      store, navigateTo, graphContainer, ifTypes, ifColor, ifLabel, appName,
      filterType, filterApp, sortedApps, filtered,
      showForm, editing, form, editIntegration, saveIntegration, removeIntegration
    }
  }
}
