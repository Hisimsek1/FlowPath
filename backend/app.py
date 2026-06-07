"""FlowPath Backend — Flask API"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import time

from algorithms import bfs, dfs, dijkstra, astar

app = Flask(__name__)
CORS(app)  # Frontend'den istek gelsin

# ── Harita tanımları (frontend ile aynı) ─────────────────────────────────────
ROWS = 20
COLS = 30

MAPS = [
    # Harita 0 — Şehir ızgarası
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,0,0,1,1,0,1,0,0,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,0,0,0,1],
        [1,0,1,0,0,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1],
        [1,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,0,0,0,1,1,1,0,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,1,0,1,1,1,1,0,1,0,0,0,1,0,1,0,0,1,0,1],
        [1,0,1,0,1,0,1,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    # Harita 1 — Labirent
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    # Harita 2 — Açık alan
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
]

# Harita ağırlıkları (Dijkstra/A* için) — bazı hücreler daha "pahalı"
# Belirli zone'larda weight=3 → Dijkstra/A* bu yolları atlar, BFS görmez
WEIGHT_ZONES = [
    # (row_start, row_end, col_start, col_end, weight)
    (5, 14, 10, 20, 3),   # Merkez bölge — yoğun trafik
    (3, 8,  3,  8,  2),   # Sol üst köşe
    (12, 17, 20, 27, 2),  # Sağ alt köşe
]


def build_weights(map_index):
    """Haritaya özel ağırlık haritası döner."""
    weights = {}
    for r in range(ROWS):
        for c in range(COLS):
            if MAPS[map_index][r][c] == 0:
                w = 1
                for r0, r1, c0, c1, ww in WEIGHT_ZONES:
                    if r0 <= r <= r1 and c0 <= c <= c1:
                        w = max(w, ww)
                if w > 1:
                    weights[(r, c)] = w
    return weights


def make_rng(seed):
    """Deterministik sayı üreteci (frontend ile aynı seed)."""
    s = [seed & 0xffffffff]
    def rng():
        s[0] = (s[0] * 1664525 + 1013904223) & 0xffffffff
        return s[0] / 0xffffffff
    return rng


def random_free(grid, rng):
    for _ in range(10000):
        r = 1 + int(rng() * (ROWS - 2))
        c = 1 + int(rng() * (COLS - 2))
        if grid[r][c] == 0:
            return (r, c)
    # Fallback: ilk boş hücreyi döndür
    for r in range(1, ROWS - 1):
        for c in range(1, COLS - 1):
            if grid[r][c] == 0:
                return (r, c)


# ── API endpoint'leri ─────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'FlowPath Backend çalışıyor'})


@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    POST body:
      {
        "algorithm": "bfs" | "dfs" | "dijkstra" | "astar",
        "map": 0 | 1 | 2,
        "agents": 5 | 15 | 25 | 35,
        "seed": 42  (opsiyonel)
      }

    Response:
      {
        "algorithm": "bfs",
        "map": 0,
        "agents": 25,
        "paths": [ [[r,c], [r,c], ...], ... ],  # her ajan için yol
        "collisions": 12,
        "total_steps": 340,
        "duration_ms": 14.2,
        "arrived": 24
      }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body bekleniyor'}), 400

    algo_key = (data.get('algorithm') or 'bfs').lower()

    try:
        map_index   = int(data.get('map', 0))
        agent_count = int(data.get('agents', 5))
        seed        = int(data.get('seed', 42))
    except (ValueError, TypeError):
        return jsonify({'error': 'map, agents, seed integer olmalı'}), 400

    if map_index not in (0, 1, 2):
        return jsonify({'error': 'map 0, 1 veya 2 olmalı'}), 400
    if algo_key not in ('bfs', 'dfs', 'dijkstra', 'astar'):
        return jsonify({'error': 'algorithm: bfs, dfs, dijkstra, astar'}), 400
    if not (1 <= agent_count <= 55):
        return jsonify({'error': 'agents 1-55 arasında olmalı'}), 400

    grid    = MAPS[map_index]
    weights = build_weights(map_index)
    rng     = make_rng(seed)

    t0 = time.perf_counter()

    paths   = []
    arrived = 0

    for i in range(agent_count):
        start = random_free(grid, rng)
        end   = random_free(grid, rng)

        if algo_key == 'bfs':
            path = bfs(grid, start, end)
        elif algo_key == 'dfs':
            path = dfs(grid, start, end)
        elif algo_key == 'dijkstra':
            path = dijkstra(grid, start, end, weights)
        else:  # astar
            path = astar(grid, start, end, agent_id=i, weights=weights)

        if path:
            paths.append([[int(r), int(c)] for r, c in path])
            arrived += 1
        else:
            paths.append([[int(start[0]), int(start[1])]])

    duration_ms = (time.perf_counter() - t0) * 1000

    # Çarpışma simülasyonu (ajanlar aynı anda aynı hücrede)
    collisions   = 0
    total_steps  = 0
    max_len      = max(len(p) for p in paths) if paths else 0

    for step in range(max_len):
        pos_count = {}
        for path in paths:
            idx = min(step, len(path) - 1)
            key = (path[idx][0], path[idx][1])
            pos_count[key] = pos_count.get(key, 0) + 1
        for cnt in pos_count.values():
            if cnt >= 2:
                collisions += cnt - 1

    total_steps = sum(len(p) - 1 for p in paths)

    return jsonify({
        'algorithm':   algo_key,
        'map':         map_index,
        'agents':      agent_count,
        'paths':       paths,
        'collisions':  collisions,
        'total_steps': total_steps,
        'duration_ms': round(duration_ms, 2),
        'arrived':     arrived,
    })


@app.route('/api/algorithms', methods=['GET'])
def list_algorithms():
    """Mevcut algoritmaların kısa açıklaması"""
    return jsonify({
        'algorithms': [
            {
                'key':         'bfs',
                'name':        'BFS',
                'full_name':   'Breadth-First Search',
                'complexity':  'O(V + E)',
                'optimal':     True,
                'weighted':    False,
                'description': 'Katman katman genişler. Ağırlıksız gridde en kısa yolu bulur. Çok ajanda çarpışma yüksek.'
            },
            {
                'key':         'dfs',
                'name':        'DFS',
                'full_name':   'Depth-First Search',
                'complexity':  'O(V + E)',
                'optimal':     False,
                'weighted':    False,
                'description': 'Derin bir yola gider. Optimal değil, kaotik. Karşılaştırma için kullanışlı.'
            },
            {
                'key':         'dijkstra',
                'name':        'Dijkstra',
                'full_name':   "Dijkstra's Algorithm",
                'complexity':  'O((V + E) log V)',
                'optimal':     True,
                'weighted':    True,
                'description': 'Ağırlıklı gridde maliyet-optimal yol. Pahalı bölgelerden kaçar.'
            },
            {
                'key':         'astar',
                'name':        'A*',
                'full_name':   'A* Search',
                'complexity':  'O((V + E) log V)',
                'optimal':     True,
                'weighted':    True,
                'description': 'Dijkstra + Manhattan heuristik. En akıllı ve hızlısı. Az çarpışma.'
            },
        ]
    })


if __name__ == '__main__':
    print("FlowPath Backend başlatılıyor...")
    print("Endpoints:")
    print("  GET  http://localhost:5000/api/health")
    print("  GET  http://localhost:5000/api/algorithms")
    print("  POST http://localhost:5000/api/simulate")
    app.run(debug=True, port=5000)
