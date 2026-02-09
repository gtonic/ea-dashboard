#!/usr/bin/env python3
"""Build single-file EA Bebauungsplan HTML from multi-file app/."""

import os, re, json

BASE = os.path.dirname(os.path.abspath(__file__))
APP  = os.path.join(BASE, 'app')
JS   = os.path.join(APP, 'js')
COMP = os.path.join(JS, 'components')
OUT  = os.path.join(BASE, 'bebauungsplan.html')

def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

def strip_imports(code):
    lines = code.split('\n')
    return '\n'.join(l for l in lines if not (l.strip().startswith('import ') and ' from ' in l))

def convert_export_default(code, var_name):
    return re.sub(r'export\s+default\s*\{', f'const {var_name} = {{', code, count=1)

def strip_exports(code):
    code = re.sub(r'export\s+async\s+function\s+', 'async function ', code)
    code = re.sub(r'export\s+function\s+', 'function ', code)
    code = re.sub(r'export\s+const\s+', 'const ', code)
    return code

COMPONENTS = [
    ('domain-form.js',      'DomainForm'),
    ('capability-form.js',  'CapabilityForm'),
    ('app-form.js',         'AppForm'),
    ('project-form.js',     'ProjectForm'),
    ('process-form.js',     'ProcessForm'),
    ('vendor-form.js',      'VendorForm'),
    ('dashboard.js',        'DashboardView'),
    ('settings.js',         'SettingsView'),
    ('domain-list.js',      'DomainList'),
    ('domain-detail.js',    'DomainDetail'),
    ('app-list.js',         'AppList'),
    ('app-detail.js',       'AppDetail'),
    ('cap-app-matrix.js',   'CapAppMatrix'),
    ('time-quadrant.js',    'TimeQuadrant'),
    ('project-list.js',     'ProjectList'),
    ('project-detail.js',   'ProjectDetail'),
    ('project-heatmap.js',  'ProjectHeatmap'),
    ('dependency-graph.js', 'DependencyGraph'),
    ('process-list.js',     'ProcessList'),
    ('process-detail.js',   'ProcessDetail'),
    ('vendor-list.js',      'VendorList'),
    ('vendor-detail.js',    'VendorDetail'),
    ('demand-list.js',      'DemandList'),
    ('demand-detail.js',    'DemandDetail'),
    ('demand-form.js',      'DemandForm'),
    ('maturity-gap.js',     'MaturityGap'),
    ('layout.js',           'AppLayout'),
]

print('Building single-file HTML...')

# 1. Read seed data JSON
seed_json = read(os.path.join(APP, 'data', 'bebauungsplan.json'))
json.loads(seed_json)
print(f'  Seed data: {len(seed_json)} bytes')

# 2. Read and convert store.js
store_raw = read(os.path.join(JS, 'store.js'))
store_code = strip_imports(store_raw)
store_code = strip_exports(store_code)

# Replace fetch-based loadData with synchronous SEED_DATA version
store_code = re.sub(
    r'async\s+function\s+loadData\s*\(\s*\)\s*\{.*?\n\}',
    '''function loadData () {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      store.data = JSON.parse(saved)
      store.loaded = true
      return
    } catch (e) { console.warn('[store] corrupt localStorage, loading seed', e) }
  }
  try {
    store.data  = JSON.parse(JSON.stringify(SEED_DATA))
    store.loaded = true
    persist()
  } catch (e) {
    console.error('[store] failed to load seed data', e)
    store.data  = createEmptyState()
    store.loaded = true
  }
}''',
    store_code, count=1, flags=re.DOTALL
)

store_code = store_code.replace('async function resetToSeed', 'function resetToSeed')
# Fix: loadData() is now synchronous so resetToSeed must return Promise for .then() callers
store_code = store_code.replace('return loadData()', 'loadData()\n  return Promise.resolve()')
print(f'  Store: {len(store_code)} chars')

# 3. Read and convert router.js
router_raw = read(os.path.join(JS, 'router.js'))
router_code = strip_imports(router_raw)
router_code = strip_exports(router_code)
print(f'  Router: {len(router_code)} chars')

# 4. Read and convert components
component_blocks = []
for filename, varname in COMPONENTS:
    raw = read(os.path.join(COMP, filename))
    code = strip_imports(raw)
    code = convert_export_default(code, varname)
    component_blocks.append(f'// ── {varname} ({filename}) ──\n{code}')
    print(f'  Component {varname}: {len(code)} chars')

# 5. Assemble script content
sc = []
sc.append('// EA Bebauungsplan - Metallwerk Vorarlberg GmbH')
sc.append('// Single-File Build - works as file:// without server\n')
sc.append('// ── Vue API destructuring (global build) ──')
sc.append('const { reactive, watch } = Vue;\n')
sc.append('// ── SEED DATA ──')
sc.append(f'const SEED_DATA = {seed_json};\n')
sc.append('// ══════ STORE ══════')
sc.append(store_code)
sc.append('\n// ══════ ROUTER ══════')
sc.append(router_code)
sc.append('\n// ══════ COMPONENTS ══════')
for block in component_blocks:
    sc.append('\n' + block)
sc.append('''
// ══════ APP INIT ══════
const app = Vue.createApp(AppLayout);

app.component('app-layout', AppLayout);
app.component('dashboard-view', DashboardView);
app.component('settings-view', SettingsView);
app.component('domain-list', DomainList);
app.component('domain-detail', DomainDetail);
app.component('domain-form', DomainForm);
app.component('capability-form', CapabilityForm);
app.component('app-list', AppList);
app.component('app-form', AppForm);
app.component('app-detail', AppDetail);
app.component('cap-app-matrix', CapAppMatrix);
app.component('time-quadrant', TimeQuadrant);
app.component('project-list', ProjectList);
app.component('project-form', ProjectForm);
app.component('project-detail', ProjectDetail);
app.component('project-heatmap', ProjectHeatmap);
app.component('dependency-graph', DependencyGraph);
app.component('process-list', ProcessList);
app.component('process-detail', ProcessDetail);
app.component('process-form', ProcessForm);
app.component('maturity-gap', MaturityGap);
app.component('vendor-list', VendorList);
app.component('vendor-detail', VendorDetail);
app.component('vendor-form', VendorForm);

app.component('demand-list', DemandList);
app.component('demand-detail', DemandDetail);
app.component('demand-form', DemandForm);

initRouter();
loadData();
startWatching();
app.mount('#app');

console.log('[EA Bebauungsplan] App mounted - ' + store.data.meta.company);
''')

main_script = '\n'.join(sc)

# 6. Write HTML file part by part to avoid </script> in Python literals
SC = '</' + 'script>'  # avoid triggering HTML parser issues

with open(OUT, 'w', encoding='utf-8') as f:
    # HEAD
    f.write('<!DOCTYPE html>\n<html lang="en" class="h-full">\n<head>\n')
    f.write('  <meta charset="UTF-8" />\n')
    f.write('  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n')
    f.write('  <title>EA Bebauungsplan</title>\n\n')
    f.write('  <script src="https://cdn.tailwindcss.com">' + SC + '\n')
    f.write('  <script>\n')
    f.write("    tailwind.config = {\n")
    f.write("      darkMode: 'class',\n")
    f.write("      theme: { extend: { colors: {\n")
    f.write("        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },\n")
    f.write("        surface: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' },\n")
    f.write("      }}}\n    }\n")
    f.write('  ' + SC + '\n\n')
    f.write('  <script src="https://cdn.jsdelivr.net/npm/chart.js@4">' + SC + '\n')
    f.write('  <script src="https://cdn.jsdelivr.net/npm/d3@7">' + SC + '\n')
    f.write('  <script src="https://unpkg.com/vue@3/dist/vue.global.js">' + SC + '\n\n')

    # STYLE
    f.write('  <style>\n')
    f.write('    [v-cloak] { display: none !important; }\n')
    f.write('    ::-webkit-scrollbar { width: 6px; height: 6px; }\n')
    f.write('    ::-webkit-scrollbar-track { background: transparent; }\n')
    f.write('    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }\n')
    f.write('    ::-webkit-scrollbar-thumb:hover { background: #64748b; }\n')
    f.write('    .fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }\n')
    f.write('    .fade-enter-from, .fade-leave-to { opacity: 0; }\n')
    f.write('    .domain-swatch { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }\n')
    f.write('    .maturity-bar { height: 8px; border-radius: 4px; transition: width .5s ease; }\n')
    f.write('    .time-grid-line { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 4,4; }\n')
    f.write('    .matrix-cell:hover { transform: scale(1.15); z-index: 10; }\n')
    f.write('    .matrix-cell { transition: transform .15s ease; }\n')
    f.write('    .dep-link { fill: none; stroke-opacity: 0.6; }\n')
    f.write('    .dep-node text { font-size: 11px; pointer-events: none; }\n')
    f.write('    .nav-item { transition: background-color .15s ease, color .15s ease; }\n')
    f.write('    .nav-item:hover { background-color: #e2e8f0; }\n')
    f.write('    .nav-item.active { background-color: #dbeafe; color: #1d4ed8; font-weight: 600; }\n')
    f.write('    @media (max-width: 1024px) { .sidebar-collapsed { transform: translateX(-100%); } }\n')
    f.write('    @media print { .no-print { display: none !important; } .sidebar { display: none !important; } }\n')
    f.write('  </style>\n')
    f.write('</head>\n')

    # BODY
    f.write('<body class="h-full bg-surface-50 text-gray-800 antialiased">\n')
    f.write('  <div id="app" v-cloak>\n')
    f.write('    <app-layout></app-layout>\n')
    f.write('  </div>\n\n')
    f.write('  <script>\n')
    f.write(main_script)
    f.write('  ' + SC + '\n')
    f.write('</body>\n</html>\n')

# Stats
with open(OUT, encoding='utf-8') as f:
    content = f.read()
lines = content.count('\n')
size_kb = len(content.encode('utf-8')) / 1024
print(f'\n  Created {OUT}')
print(f'   {lines} lines, {size_kb:.0f} KB')
