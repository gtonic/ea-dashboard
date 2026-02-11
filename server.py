#!/usr/bin/env python3
"""
EA Bebauungsplan — Development Server with Save API

Serves static files AND provides a POST /api/save endpoint
that writes changes back to app/data/bebauungsplan.json.

Usage:
    python server.py [--port 8080]
"""

import http.server
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

# ── Config ──────────────────────────────────────────────
PORT = int(sys.argv[sys.argv.index('--port') + 1]) if '--port' in sys.argv else 8080
DATA_FILE = Path(__file__).parent / 'app' / 'data' / 'bebauungsplan.json'
MAX_BACKUPS = 10


class EARequestHandler(http.server.SimpleHTTPRequestHandler):
    """Extends SimpleHTTPRequestHandler with a JSON save endpoint."""

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == '/api/save':
            self._handle_save()
        else:
            self.send_error(404, f'POST not supported for {self.path}')

    def _handle_save(self):
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, 'Empty request body')
                return
            if content_length > 50_000_000:  # 50 MB safety limit
                self.send_error(413, 'Payload too large')
                return

            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            # Validate: must have meta + domains at minimum
            if 'meta' not in data or 'domains' not in data:
                self.send_error(400, 'Invalid data: missing meta or domains')
                return

            # Create backup
            self._create_backup()

            # Write data
            data['meta']['lastUpdated'] = datetime.now().isoformat()
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            # Respond
            response = json.dumps({
                'ok': True,
                'message': 'Data saved successfully',
                'timestamp': data['meta']['lastUpdated'],
                'size': os.path.getsize(DATA_FILE)
            })
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.encode('utf-8'))

            print(f'[save] ✓ bebauungsplan.json updated ({os.path.getsize(DATA_FILE):,} bytes)')

        except json.JSONDecodeError as e:
            self.send_error(400, f'Invalid JSON: {e}')
        except Exception as e:
            self.send_error(500, f'Save failed: {e}')

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        # Add CORS headers to all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def _create_backup(self):
        """Create a timestamped backup of the current data file."""
        if not DATA_FILE.exists():
            return
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        backup_path = DATA_FILE.with_suffix(f'.json.bak.{timestamp}')
        shutil.copy2(DATA_FILE, backup_path)
        print(f'[save] Backup → {backup_path.name}')

        # Clean up old backups (keep only MAX_BACKUPS)
        backups = sorted(DATA_FILE.parent.glob('bebauungsplan.json.bak.*'))
        while len(backups) > MAX_BACKUPS:
            oldest = backups.pop(0)
            oldest.unlink()
            print(f'[save] Removed old backup: {oldest.name}')

    def log_message(self, format, *args):
        # Quieter logging — skip noisy requests
        msg = format % args
        if '/api/save' in msg or 'POST' in msg:
            super().log_message(format, *args)
        elif any(ext in msg for ext in ['.json', '.js', '.html']):
            super().log_message(format, *args)


if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    print(f'╔══════════════════════════════════════════════╗')
    print(f'║  EA Bebauungsplan Server                     ║')
    print(f'║  http://localhost:{PORT:<5}                      ║')
    print(f'║  Data: {DATA_FILE.relative_to(Path(__file__).parent)}  ║')
    print(f'║  Save API: POST /api/save                    ║')
    print(f'╚══════════════════════════════════════════════╝')

    server = http.server.HTTPServer(('', PORT), EARequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        server.server_close()
