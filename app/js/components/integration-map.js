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
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden relative">
        <!-- Zoom Controls -->
        <div class="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button @click="zoomIn" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm text-gray-600 hover:bg-surface-50 flex items-center justify-center text-lg font-bold" title="Zoom In">+</button>
          <button @click="zoomOut" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm text-gray-600 hover:bg-surface-50 flex items-center justify-center text-lg font-bold" title="Zoom Out">−</button>
          <button @click="zoomReset" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm text-gray-600 hover:bg-surface-50 flex items-center justify-center text-xs" title="Reset">⟲</button>
          <button @click="zoomFit" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm text-gray-600 hover:bg-surface-50 flex items-center justify-center text-xs" title="Fit All">▣</button>
        </div>
        <!-- Zoom Level Indicator -->
        <div class="absolute bottom-3 left-3 z-10 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded">
          Zoom: {{ Math.round(currentZoom * 100) }}% · Scroll/Pinch zum Zoomen · Drag zum Verschieben
        </div>
        <div ref="graphContainer" class="w-full" style="height: 640px; cursor: grab;"></div>
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
    const currentZoom = ref(1)
    let zoomBehavior = null
    let svgSelection = null

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

    // Zoom controls
    function zoomIn () {
      if (svgSelection && zoomBehavior) {
        svgSelection.transition().duration(300).call(zoomBehavior.scaleBy, 1.4)
      }
    }
    function zoomOut () {
      if (svgSelection && zoomBehavior) {
        svgSelection.transition().duration(300).call(zoomBehavior.scaleBy, 0.7)
      }
    }
    function zoomReset () {
      if (svgSelection && zoomBehavior) {
        svgSelection.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity)
      }
    }
    function zoomFit () {
      if (!svgSelection || !zoomBehavior || !graphContainer.value) return
      const container = graphContainer.value
      const g = svgSelection.select('g.graph-root')
      const bounds = g.node().getBBox()
      if (bounds.width === 0 || bounds.height === 0) return
      const fullWidth = container.clientWidth
      const fullHeight = container.clientHeight || 640
      const padding = 60
      const scale = Math.min(
        (fullWidth - padding * 2) / bounds.width,
        (fullHeight - padding * 2) / bounds.height,
        2 // max zoom
      )
      const tx = fullWidth / 2 - (bounds.x + bounds.width / 2) * scale
      const ty = fullHeight / 2 - (bounds.y + bounds.height / 2) * scale
      svgSelection.transition().duration(600)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
    }

    function renderGraph () {
      if (!graphContainer.value || typeof d3 === 'undefined') return

      const container = graphContainer.value
      const width = container.clientWidth
      const height = container.clientHeight || 640

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

      // Count connections per node for sizing
      const connCount = {}
      integrations.forEach(i => {
        connCount[i.sourceAppId] = (connCount[i.sourceAppId] || 0) + 1
        connCount[i.targetAppId] = (connCount[i.targetAppId] || 0) + 1
      })

      const nodes = [...appIds].map(id => {
        const a = store.appById(id)
        const conns = connCount[id] || 0
        return {
          id,
          name: a ? a.name : id,
          type: a ? a.type : '',
          criticality: a ? a.criticality : '',
          timeQuadrant: a ? a.timeQuadrant : '',
          connectionCount: conns,
          // Scale node size based on connections (min 32, max 60)
          nodeSize: Math.min(60, Math.max(32, 28 + conns * 2.5))
        }
      })

      // Aggregate links — group parallel connections between same nodes
      const linkMap = new Map()
      integrations.forEach(i => {
        const key = [i.sourceAppId, i.targetAppId].sort().join('|')
        if (!linkMap.has(key)) {
          linkMap.set(key, {
            source: i.sourceAppId,
            target: i.targetAppId,
            types: [],
            labels: [],
            descriptions: [],
            count: 0,
            direction: i.direction
          })
        }
        const entry = linkMap.get(key)
        entry.types.push(i.interfaceType)
        entry.labels.push(i.protocol || i.interfaceType)
        entry.descriptions.push(i.description)
        entry.count++
      })
      const links = [...linkMap.values()]

      // Clear previous
      d3.select(container).selectAll('*').remove()

      const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .attr('viewBox', [0, 0, width, height])
      svgSelection = svg

      // Zoom behavior
      zoomBehavior = d3.zoom()
        .scaleExtent([0.15, 4])
        .on('zoom', (event) => {
          graphRoot.attr('transform', event.transform)
          currentZoom.value = event.transform.k
        })
      svg.call(zoomBehavior)

      // Root group that receives zoom transforms
      const graphRoot = svg.append('g').attr('class', 'graph-root')

      // Arrow markers per interface type
      const defs = svg.append('defs')
      Object.entries(ifColorMap).forEach(([type, color]) => {
        defs.append('marker')
          .attr('id', 'if-arrow-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 38).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color)
        defs.append('marker')
          .attr('id', 'if-arrow-rev-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', -28).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M10,-5L0,0L10,5').attr('fill', color)
      })

      // Drop shadow for nodes
      const filter = defs.append('filter').attr('id', 'node-shadow')
        .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%')
      filter.append('feDropShadow').attr('dx', 0).attr('dy', 1).attr('stdDeviation', 2)
        .attr('flood-color', '#00000015')

      // Find hub node (most connections)
      const hubNode = nodes.reduce((max, n) => n.connectionCount > max.connectionCount ? n : max, nodes[0])

      // Simulation with improved forces
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
          // Longer distance for hub connections to spread things out
          const srcConns = connCount[typeof d.source === 'object' ? d.source.id : d.source] || 0
          const tgtConns = connCount[typeof d.target === 'object' ? d.target.id : d.target] || 0
          const maxConns = Math.max(srcConns, tgtConns)
          return maxConns > 10 ? 220 : maxConns > 5 ? 180 : 140
        }))
        .force('charge', d3.forceManyBody().strength(d => {
          // Hub nodes push harder
          return d.connectionCount > 10 ? -1200 : d.connectionCount > 5 ? -800 : -400
        }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.nodeSize + 20))
        .force('x', d3.forceX(width / 2).strength(0.04))
        .force('y', d3.forceY(height / 2).strength(0.04))
        .alphaDecay(0.02)
        .velocityDecay(0.4)

      // Links — use curves for multiple connections between same nodes
      const link = graphRoot.append('g').attr('class', 'links').selectAll('path')
        .data(links).join('path')
        .attr('fill', 'none')
        .attr('stroke', d => ifColor(d.types[0]))
        .attr('stroke-width', d => Math.min(4, 1.5 + d.count * 0.5))
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', d => 'url(#if-arrow-' + d.types[0] + ')')
        .attr('marker-start', d => d.direction === 'bidirectional' ? 'url(#if-arrow-rev-' + d.types[0] + ')' : null)

      // Link labels
      const linkLabel = graphRoot.append('g').attr('class', 'link-labels').selectAll('text')
        .data(links).join('text')
        .text(d => d.count > 1 ? d.labels[0] + ' (+' + (d.count - 1) + ')' : d.labels[0])
        .attr('text-anchor', 'middle')
        .attr('fill', d => ifColor(d.types[0]))
        .attr('font-size', '8px')
        .attr('font-weight', '500')
        .attr('dy', -8)
        .attr('opacity', 0.8)
        .attr('pointer-events', 'none')

      // Integration count badge on links with multiple integrations
      const linkBadge = graphRoot.append('g').attr('class', 'link-badges').selectAll('g')
        .data(links.filter(l => l.count > 1)).join('g')

      linkBadge.append('circle')
        .attr('r', 8)
        .attr('fill', d => ifColor(d.types[0]))
        .attr('opacity', 0.9)

      linkBadge.append('text')
        .text(d => d.count)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')

      // Nodes
      const timeColors = { Invest: '#22c55e', Tolerate: '#eab308', Migrate: '#3b82f6', Eliminate: '#ef4444' }
      const node = graphRoot.append('g').attr('class', 'nodes').selectAll('g')
        .data(nodes).join('g')
        .call(d3.drag()
          .on('start', (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
            d3.select(e.sourceEvent.target.closest('g')).select('rect').attr('stroke-width', 3.5)
          })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => {
            if (!e.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
            d3.select(e.sourceEvent.target.closest('g')).select('rect').attr('stroke-width', 2.5)
          })
        )
        .style('cursor', 'pointer')
        .on('click', (e, d) => { navigateTo('/apps/' + d.id) })

      // Highlight on hover
      node.on('mouseover', function (e, d) {
        // Dim all
        node.attr('opacity', 0.3)
        link.attr('opacity', 0.08)
        linkLabel.attr('opacity', 0)
        linkBadge.attr('opacity', 0.08)
        // Highlight connected
        const connectedIds = new Set([d.id])
        links.forEach(l => {
          const srcId = typeof l.source === 'object' ? l.source.id : l.source
          const tgtId = typeof l.target === 'object' ? l.target.id : l.target
          if (srcId === d.id || tgtId === d.id) {
            connectedIds.add(srcId)
            connectedIds.add(tgtId)
          }
        })
        node.filter(n => connectedIds.has(n.id)).attr('opacity', 1)
        link.filter(l => {
          const srcId = typeof l.source === 'object' ? l.source.id : l.source
          const tgtId = typeof l.target === 'object' ? l.target.id : l.target
          return srcId === d.id || tgtId === d.id
        }).attr('opacity', 0.85).attr('stroke-width', d2 => Math.min(5, 2.5 + d2.count * 0.5))
        linkLabel.filter(l => {
          const srcId = typeof l.source === 'object' ? l.source.id : l.source
          const tgtId = typeof l.target === 'object' ? l.target.id : l.target
          return srcId === d.id || tgtId === d.id
        }).attr('opacity', 1)
        linkBadge.filter(l => {
          const srcId = typeof l.source === 'object' ? l.source.id : l.source
          const tgtId = typeof l.target === 'object' ? l.target.id : l.target
          return srcId === d.id || tgtId === d.id
        }).attr('opacity', 1)
        // Tooltip
        d3.select(this).select('.node-tooltip').attr('opacity', 1)
      })
      .on('mouseout', function () {
        node.attr('opacity', 1)
        link.attr('opacity', 0.6).attr('stroke-width', d => Math.min(4, 1.5 + d.count * 0.5))
        linkLabel.attr('opacity', 0.8)
        linkBadge.attr('opacity', 0.9)
        d3.select(this).select('.node-tooltip').attr('opacity', 0)
      })

      // Node rectangles — scaled by connections
      node.append('rect')
        .attr('x', d => -d.nodeSize)
        .attr('y', d => -d.nodeSize * 0.55)
        .attr('width', d => d.nodeSize * 2)
        .attr('height', d => d.nodeSize * 1.1)
        .attr('rx', 10)
        .attr('fill', d => d.id === hubNode.id ? '#eff6ff' : '#f8fafc')
        .attr('stroke', d => timeColors[d.timeQuadrant] || '#94a3b8')
        .attr('stroke-width', 2.5)
        .attr('filter', 'url(#node-shadow)')

      // Connection count badge (top-right corner)
      const badgeG = node.filter(d => d.connectionCount > 1).append('g')
      badgeG.append('circle')
        .attr('cx', d => d.nodeSize - 4)
        .attr('cy', d => -d.nodeSize * 0.55 + 4)
        .attr('r', 9)
        .attr('fill', '#6366f1')
      badgeG.append('text')
        .text(d => d.connectionCount)
        .attr('x', d => d.nodeSize - 4)
        .attr('y', d => -d.nodeSize * 0.55 + 4)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')

      // App name inside node
      node.append('text')
        .text(d => {
          const maxLen = Math.max(10, Math.floor(d.nodeSize / 4))
          return d.name.length > maxLen ? d.name.slice(0, maxLen - 1) + '…' : d.name
        })
        .attr('x', 0).attr('y', -2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1e293b')
        .attr('font-size', d => d.connectionCount > 10 ? '11px' : '10px')
        .attr('font-weight', d => d.connectionCount > 5 ? '600' : '500')

      // Type label below name
      node.append('text')
        .text(d => d.type || '')
        .attr('x', 0).attr('y', 11)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '8px')

      // Hover tooltip (hidden by default)
      const tooltip = node.append('g').attr('class', 'node-tooltip').attr('opacity', 0)
      tooltip.append('rect')
        .attr('x', d => -60)
        .attr('y', d => d.nodeSize * 0.55 + 8)
        .attr('width', 120).attr('height', 28)
        .attr('rx', 6)
        .attr('fill', '#1e293b')
        .attr('opacity', 0.9)
      tooltip.append('text')
        .text(d => d.connectionCount + ' Integrationen · ' + d.timeQuadrant)
        .attr('x', 0)
        .attr('y', d => d.nodeSize * 0.55 + 26)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '9px')

      simulation.on('tick', () => {
        link.attr('d', d => {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y
        })
        linkLabel
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2)
        linkBadge
          .attr('transform', d => 'translate(' + ((d.source.x + d.target.x) / 2 + 14) + ',' + ((d.source.y + d.target.y) / 2 + 2) + ')')
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      })

      // After simulation settles, auto-fit
      simulation.on('end', () => {
        setTimeout(zoomFit, 100)
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
      filterType, filterApp, sortedApps, filtered, currentZoom,
      showForm, editing, form, editIntegration, saveIntegration, removeIntegration,
      zoomIn, zoomOut, zoomReset, zoomFit
    }
  }
}
