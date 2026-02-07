// dependency-graph.js — D3 force-directed project dependency network
import { store } from '../store.js'
import { navigateTo } from '../router.js'

export default {
  name: 'DependencyGraph',
  template: `
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Force-directed graph of project dependencies. Arrows show direction (source depends on target). Drag nodes to rearrange.</p>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span class="font-medium">Dependency types:</span>
        <span v-for="dt in depTypes" :key="dt.value" class="flex items-center gap-1">
          <span class="w-3 h-0.5 inline-block rounded" :style="{ backgroundColor: depColor(dt.value) }"></span>
          {{ dt.symbol }} {{ dt.label }}
        </span>
      </div>

      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div ref="graphContainer" class="w-full h-[400px] lg:h-[560px]"></div>
      </div>

      <!-- Dependency table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">All Dependencies ({{ store.data.projectDependencies.length }})</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">Source (depends on →)</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Type</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Target (blocking)</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600 hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="dep in store.data.projectDependencies" :key="dep.sourceProjectId + dep.targetProjectId" class="hover:bg-surface-50">
              <td class="px-4 py-2 text-gray-700">{{ projName(dep.sourceProjectId) }}</td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: depColor(dep.type) + '20', color: depColor(dep.type) }">
                  {{ depLabel(dep.type) }}
                </span>
              </td>
              <td class="px-4 py-2 text-gray-700">{{ projName(dep.targetProjectId) }}</td>
              <td class="px-4 py-2 text-xs text-gray-500 hidden sm:table-cell">{{ dep.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  setup () {
    const { ref, onMounted, nextTick } = Vue
    const graphContainer = ref(null)
    const depTypes = store.data.enums.dependencyType || []

    const depColorMap = { T: '#ef4444', D: '#3b82f6', P: '#8b5cf6', R: '#f59e0b', F: '#10b981', Z: '#64748b' }
    function depColor (type) { return depColorMap[type] || '#94a3b8' }
    function depLabel (type) {
      const dt = depTypes.find(d => d.value === type)
      return dt ? dt.symbol : type
    }
    function projName (id) { const p = store.projectById(id); return p ? p.name : id }

    function renderGraph () {
      if (!graphContainer.value || typeof d3 === 'undefined') return

      const container = graphContainer.value
      const width = container.clientWidth
      const height = container.clientHeight || 560

      // Build nodes & links
      const projectIds = new Set()
      store.data.projectDependencies.forEach(d => { projectIds.add(d.sourceProjectId); projectIds.add(d.targetProjectId) })
      // Include all projects even if no deps
      store.data.projects.forEach(p => projectIds.add(p.id))

      const nodes = [...projectIds].map(id => {
        const p = store.projectById(id)
        return {
          id,
          name: p ? p.name : id,
          status: p ? p.status : 'gray',
          budget: p ? p.budget : 0,
          domainColor: p ? (store.domainById(p.primaryDomain)?.color || '#94a3b8') : '#94a3b8'
        }
      })

      const links = store.data.projectDependencies.map(d => ({
        source: d.sourceProjectId,
        target: d.targetProjectId,
        type: d.type
      }))

      // Clear previous
      d3.select(container).selectAll('*').remove()

      const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .attr('viewBox', [0, 0, width, height])

      // Arrow markers
      const defs = svg.append('defs')
      Object.entries(depColorMap).forEach(([type, color]) => {
        defs.append('marker')
          .attr('id', 'arrow-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 25).attr('refY', 0)
          .attr('markerWidth', 6).attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color)
      })

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40))

      const link = svg.append('g').selectAll('line')
        .data(links).join('line')
        .attr('class', 'dep-link')
        .attr('stroke', d => depColor(d.type))
        .attr('stroke-width', 2)
        .attr('marker-end', d => 'url(#arrow-' + d.type + ')')

      const node = svg.append('g').selectAll('g')
        .data(nodes).join('g')
        .call(d3.drag()
          .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
        )
        .style('cursor', 'pointer')
        .on('click', (e, d) => { navigateTo('/projects/' + d.id) })

      const statusColors = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }

      node.append('circle')
        .attr('r', d => Math.max(12, Math.sqrt(d.budget / 5000)))
        .attr('fill', d => d.domainColor)
        .attr('stroke', d => statusColors[d.status] || '#94a3b8')
        .attr('stroke-width', 3)
        .attr('opacity', 0.85)

      node.append('text')
        .text(d => d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name)
        .attr('x', 0).attr('y', d => Math.max(12, Math.sqrt(d.budget / 5000)) + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', width < 600 ? '11px' : '10px')

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      })
    }

    onMounted(() => {
      nextTick(renderGraph)
      // Re-render on resize
      if (typeof ResizeObserver !== 'undefined' && graphContainer.value) {
        let resizeTimer = null
        const ro = new ResizeObserver(() => {
          clearTimeout(resizeTimer)
          resizeTimer = setTimeout(renderGraph, 200)
        })
        ro.observe(graphContainer.value)
      }
    })

    return { store, graphContainer, depTypes, depColor, depLabel, projName }
  }
}
