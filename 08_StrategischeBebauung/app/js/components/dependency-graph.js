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

      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden relative">
        <!-- Zoom Controls -->
        <div class="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button @click="zoomIn" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm hover:bg-surface-50 flex items-center justify-center text-gray-600 font-bold text-lg" title="Zoom in">+</button>
          <button @click="zoomOut" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm hover:bg-surface-50 flex items-center justify-center text-gray-600 font-bold text-lg" title="Zoom out">&minus;</button>
          <button @click="zoomReset" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm hover:bg-surface-50 flex items-center justify-center text-gray-500 text-xs" title="Reset">&#x27F2;</button>
          <button @click="zoomFit" class="w-8 h-8 bg-white border border-surface-200 rounded-lg shadow-sm hover:bg-surface-50 flex items-center justify-center text-gray-500 text-xs" title="Fit all">&#x25A3;</button>
        </div>
        <!-- Zoom Level -->
        <div class="absolute bottom-3 right-3 z-10 text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded">{{ Math.round(currentZoom * 100) }}%</div>
        <div ref="graphContainer" class="w-full h-[560px] lg:h-[640px]" style="cursor:grab"></div>
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
    const currentZoom = ref(1)
    const depTypes = store.data.enums.dependencyType || []

    const depColorMap = { T: '#ef4444', D: '#3b82f6', P: '#8b5cf6', R: '#f59e0b', F: '#10b981', Z: '#64748b' }
    function depColor (type) { return depColorMap[type] || '#94a3b8' }
    function depLabel (type) {
      const dt = depTypes.find(d => d.value === type)
      return dt ? dt.symbol : type
    }
    function projName (id) { const p = store.projectById(id); return p ? p.name : id }

    let zoomBehavior = null
    let svgSelection = null

    function zoomIn () { if (svgSelection && zoomBehavior) svgSelection.transition().duration(300).call(zoomBehavior.scaleBy, 1.4) }
    function zoomOut () { if (svgSelection && zoomBehavior) svgSelection.transition().duration(300).call(zoomBehavior.scaleBy, 0.7) }
    function zoomReset () { if (svgSelection && zoomBehavior) svgSelection.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity) }
    function zoomFit () {
      if (!svgSelection || !zoomBehavior) return
      const container = graphContainer.value
      if (!container) return
      const svg = container.querySelector('svg')
      const root = svg?.querySelector('.graph-root')
      if (!root) return
      const bbox = root.getBBox()
      if (bbox.width === 0 || bbox.height === 0) return
      const w = container.clientWidth
      const h = container.clientHeight
      const padding = 60
      const scale = Math.min((w - padding * 2) / bbox.width, (h - padding * 2) / bbox.height, 2)
      const tx = w / 2 - scale * (bbox.x + bbox.width / 2)
      const ty = h / 2 - scale * (bbox.y + bbox.height / 2)
      svgSelection.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
    }

    function renderGraph () {
      if (!graphContainer.value || typeof d3 === 'undefined') return

      const container = graphContainer.value
      const width = container.clientWidth
      const height = container.clientHeight || 640

      // Build nodes & links
      const projectIds = new Set()
      store.data.projectDependencies.forEach(d => { projectIds.add(d.sourceProjectId); projectIds.add(d.targetProjectId) })
      store.data.projects.forEach(p => projectIds.add(p.id))

      // Count connections per node
      const connCount = {}
      store.data.projectDependencies.forEach(d => {
        connCount[d.sourceProjectId] = (connCount[d.sourceProjectId] || 0) + 1
        connCount[d.targetProjectId] = (connCount[d.targetProjectId] || 0) + 1
      })

      const nodes = [...projectIds].map(id => {
        const p = store.projectById(id)
        const cc = connCount[id] || 0
        return {
          id,
          name: p ? p.name : id,
          status: p ? p.status : 'gray',
          budget: p ? p.budget : 0,
          domainColor: p ? (store.domainById(p.primaryDomain)?.color || '#94a3b8') : '#94a3b8',
          connectionCount: cc,
          nodeRadius: Math.max(18, Math.min(40, 18 + cc * 4))
        }
      })

      // Aggregate parallel links between same node pairs
      const linkMap = new Map()
      store.data.projectDependencies.forEach(d => {
        const key = d.sourceProjectId + '→' + d.targetProjectId
        if (linkMap.has(key)) {
          const existing = linkMap.get(key)
          existing.count++
          if (!existing.types.includes(d.type)) existing.types.push(d.type)
        } else {
          linkMap.set(key, {
            source: d.sourceProjectId,
            target: d.targetProjectId,
            type: d.type,
            types: [d.type],
            count: 1
          })
        }
      })
      const links = [...linkMap.values()]

      // Clear previous
      d3.select(container).selectAll('*').remove()

      const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .attr('viewBox', [0, 0, width, height])

      // Defs: drop shadow + arrow markers
      const defs = svg.append('defs')
      const filter = defs.append('filter').attr('id', 'dep-shadow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%')
      filter.append('feDropShadow').attr('dx', 0).attr('dy', 1).attr('stdDeviation', 2).attr('flood-opacity', 0.15)

      Object.entries(depColorMap).forEach(([type, color]) => {
        defs.append('marker')
          .attr('id', 'dep-arrow-' + type)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 10).attr('refY', 0)
          .attr('markerWidth', 7).attr('markerHeight', 7)
          .attr('orient', 'auto')
          .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color)
      })

      // Zoom behavior
      zoomBehavior = d3.zoom()
        .scaleExtent([0.15, 4])
        .on('zoom', (event) => {
          graphRoot.attr('transform', event.transform)
          currentZoom.value = event.transform.k
        })
      svgSelection = d3.select(svg.node())
      svgSelection.call(zoomBehavior)

      const graphRoot = svg.append('g').attr('class', 'graph-root')

      // Adaptive simulation parameters
      const maxConn = Math.max(...nodes.map(n => n.connectionCount), 1)
      const linkDist = maxConn > 8 ? 200 : maxConn > 4 ? 160 : 130
      const chargeStr = maxConn > 8 ? -1000 : maxConn > 4 ? -600 : -400

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(linkDist))
        .force('charge', d3.forceManyBody().strength(chargeStr))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.nodeRadius + 20))
        .force('x', d3.forceX(width / 2).strength(0.04))
        .force('y', d3.forceY(height / 2).strength(0.04))

      // Draw links as paths
      const link = graphRoot.append('g').attr('class', 'links').selectAll('g')
        .data(links).join('g')

      link.append('path')
        .attr('class', 'dep-link-path')
        .attr('stroke', d => depColor(d.type))
        .attr('stroke-width', d => d.count > 1 ? 3 : 2)
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', d => 'url(#dep-arrow-' + d.type + ')')

      // Count badges for bundled links
      link.filter(d => d.count > 1).append('circle')
        .attr('r', 8)
        .attr('fill', '#7c3aed')
        .attr('stroke', '#fff').attr('stroke-width', 1.5)
        .attr('class', 'dep-count-badge')

      link.filter(d => d.count > 1).append('text')
        .text(d => d.count)
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('fill', '#fff').attr('font-size', '9px').attr('font-weight', 'bold')
        .attr('class', 'dep-count-text')

      // Draw nodes
      const statusColors = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }

      const node = graphRoot.append('g').attr('class', 'nodes').selectAll('g')
        .data(nodes).join('g')
        .call(d3.drag()
          .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
        )
        .style('cursor', 'pointer')
        .on('click', (e, d) => { navigateTo('/projects/' + d.id) })

      // Hub background glow for highly-connected nodes
      node.filter(d => d.connectionCount >= 4).append('circle')
        .attr('r', d => d.nodeRadius + 6)
        .attr('fill', d => d.domainColor)
        .attr('opacity', 0.15)
        .attr('filter', 'url(#dep-shadow)')

      // Main circle
      node.append('circle')
        .attr('r', d => d.nodeRadius)
        .attr('fill', d => d.domainColor)
        .attr('stroke', d => statusColors[d.status] || '#94a3b8')
        .attr('stroke-width', 3)
        .attr('opacity', 0.9)
        .attr('filter', 'url(#dep-shadow)')

      // Connection count badge (top right)
      node.filter(d => d.connectionCount >= 2).append('circle')
        .attr('cx', d => d.nodeRadius * 0.7)
        .attr('cy', d => -d.nodeRadius * 0.7)
        .attr('r', 9)
        .attr('fill', '#7c3aed')
        .attr('stroke', '#fff').attr('stroke-width', 1.5)

      node.filter(d => d.connectionCount >= 2).append('text')
        .text(d => d.connectionCount)
        .attr('x', d => d.nodeRadius * 0.7)
        .attr('y', d => -d.nodeRadius * 0.7)
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('fill', '#fff').attr('font-size', '9px').attr('font-weight', 'bold')

      // Node label
      node.append('text')
        .text(d => d.name.length > 20 ? d.name.slice(0, 18) + '…' : d.name)
        .attr('x', 0).attr('y', d => d.nodeRadius + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '10px')
        .attr('font-weight', d => d.connectionCount >= 4 ? '600' : '400')

      // Tooltip
      const tooltip = d3.select(container).append('div')
        .style('position', 'absolute').style('pointer-events', 'none')
        .style('background', 'rgba(0,0,0,0.8)').style('color', '#fff')
        .style('padding', '6px 10px').style('border-radius', '6px')
        .style('font-size', '11px').style('display', 'none')
        .style('z-index', '20').style('white-space', 'nowrap')

      // Hover highlighting
      node.on('mouseover', (event, d) => {
        const connIds = new Set([d.id])
        links.forEach(l => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source
          const tid = typeof l.target === 'object' ? l.target.id : l.target
          if (sid === d.id) connIds.add(tid)
          if (tid === d.id) connIds.add(sid)
        })
        node.transition().duration(200).style('opacity', n => connIds.has(n.id) ? 1 : 0.2)
        link.transition().duration(200).style('opacity', l => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source
          const tid = typeof l.target === 'object' ? l.target.id : l.target
          return (sid === d.id || tid === d.id) ? 1 : 0.1
        })
        const p = store.projectById(d.id)
        let info = '<strong>' + d.name + '</strong><br>' + d.connectionCount + ' Abhängigkeiten'
        if (p && p.status) info += '<br>Status: ' + p.status
        if (p && p.primaryDomain) {
          const dom = store.domainById(p.primaryDomain)
          if (dom) info += '<br>Domäne: ' + dom.name
        }
        tooltip.html(info).style('display', 'block')
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 10) + 'px')
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.offsetX + 12) + 'px').style('top', (event.offsetY - 10) + 'px')
      })
      .on('mouseout', () => {
        node.transition().duration(300).style('opacity', 1)
        link.transition().duration(300).style('opacity', 1)
        tooltip.style('display', 'none')
      })

      // Tick
      simulation.on('tick', () => {
        link.select('.dep-link-path').attr('d', d => {
          const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y
          const dx = tx - sx, dy = ty - sy
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const sr = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source))?.nodeRadius || 18
          const tr = nodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target))?.nodeRadius || 18
          const startX = sx + (dx / dist) * sr
          const startY = sy + (dy / dist) * sr
          const endX = tx - (dx / dist) * (tr + 8)
          const endY = ty - (dy / dist) * (tr + 8)
          return 'M' + startX + ',' + startY + 'L' + endX + ',' + endY
        })
        // Position count badges at midpoint
        link.select('.dep-count-badge').attr('cx', d => (d.source.x + d.target.x) / 2).attr('cy', d => (d.source.y + d.target.y) / 2)
        link.select('.dep-count-text').attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2)
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      })

      // Auto-fit after simulation settles
      simulation.on('end', () => { setTimeout(zoomFit, 100) })
    }

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

    return { store, graphContainer, currentZoom, depTypes, depColor, depLabel, projName, zoomIn, zoomOut, zoomReset, zoomFit }
  }
}
