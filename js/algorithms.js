/* algorithms.js — BFS, DFS, Dijkstra, A* (2D grid üzerinde) */

window.Algorithms = (function () {

  function neighbors(grid, row, col, dirs) {
    if (!dirs) dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    const result = [];
    for (const [dr, dc] of dirs) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols && !grid.isWall(r, c))
        result.push([r, c]);
    }
    return result;
  }

  function reconstruct(prev, start, end) {
    const path = [];
    let cur = `${end[0]},${end[1]}`;
    const startKey = `${start[0]},${start[1]}`;
    while (cur && cur !== startKey) {
      const [r, c] = cur.split(',').map(Number);
      path.unshift([r, c]);
      cur = prev[cur];
    }
    path.unshift([...start]);
    return path;
  }

  // BFS: sabit yön sırası → tüm ajanlar aynı deterministik yolu alır → yoğun çarpışma
  const BFS_DIRS = [[0,1],[1,0],[0,-1],[-1,0]];

  // DFS: ters sıra → sola/yukarı önce → uzun kaotik yollar
  const DFS_DIRS = [[-1,0],[0,-1],[1,0],[0,1]];

  // ── BFS ──────────────────────────────────────────────────
  function bfs(grid, start, end) {
    const visited  = new Set();
    const prev     = {};
    const queue    = [[...start]];
    const startKey = `${start[0]},${start[1]}`;
    const endKey   = `${end[0]},${end[1]}`;
    visited.add(startKey);

    while (queue.length) {
      const [r, c] = queue.shift();
      const key = `${r},${c}`;
      if (key === endKey) return reconstruct(prev, start, end);
      for (const [nr, nc] of neighbors(grid, r, c, BFS_DIRS)) {
        const nk = `${nr},${nc}`;
        if (!visited.has(nk)) {
          visited.add(nk);
          prev[nk] = key;
          queue.push([nr, nc]);
        }
      }
    }
    return null;
  }

  // ── DFS ──────────────────────────────────────────────────
  function dfs(grid, start, end) {
    const visited  = new Set();
    const prev     = {};
    const stack    = [[...start]];
    const startKey = `${start[0]},${start[1]}`;
    const endKey   = `${end[0]},${end[1]}`;
    visited.add(startKey);

    while (stack.length) {
      const [r, c] = stack.pop();
      const key = `${r},${c}`;
      if (key === endKey) return reconstruct(prev, start, end);
      for (const [nr, nc] of neighbors(grid, r, c, DFS_DIRS)) {
        const nk = `${nr},${nc}`;
        if (!visited.has(nk)) {
          visited.add(nk);
          prev[nk] = key;
          stack.push([nr, nc]);
        }
      }
    }
    return null;
  }

  // ── Dijkstra ─────────────────────────────────────────────
  // agentId ile per-ajan küçük maliyet gürültüsü → rotalar hafifçe ayrışır
  function dijkstra(grid, start, end, agentId = 0) {
    function cellCost(r, c) {
      const w = grid.weight(r, c);
      if (w >= 99) return w;
      return w + ((r * 43 + c * 19 + agentId * 83) % 100) * 0.025;
    }

    const dist     = {};
    const prev     = {};
    const startKey = `${start[0]},${start[1]}`;
    const endKey   = `${end[0]},${end[1]}`;
    const open     = [{ key: startKey, cost: 0 }];
    dist[startKey] = 0;

    while (open.length) {
      open.sort((a, b) => a.cost - b.cost);
      const { key, cost } = open.shift();
      if (key === endKey) return reconstruct(prev, start, end);
      const [r, c] = key.split(',').map(Number);
      for (const [nr, nc] of neighbors(grid, r, c)) {
        const nk  = `${nr},${nc}`;
        const nc2 = cost + cellCost(nr, nc);
        if (dist[nk] === undefined || nc2 < dist[nk]) {
          dist[nk] = nc2;
          prev[nk] = key;
          open.push({ key: nk, cost: nc2 });
        }
      }
    }
    return null;
  }

  // ── A* ───────────────────────────────────────────────────
  // agentId ile heuristik gürültüsü → tie-breaking, her ajan farklı rota seçer → az çarpışma
  function astar(grid, start, end, agentId = 0) {
    function cellCost(r, c) {
      const w = grid.weight(r, c);
      if (w >= 99) return w;
      // FIX: Gürültü heuristik'e taşındı, cellCost temiz kalıyor (A* admissibility korunuyor)
      return w;
    }

    function h(r, c) {
      // FIX: Gürültü heuristik'te — backend ile tutarlı, tie-breaking için
      const noise = ((r * 31 + c * 17 + agentId * 97) % 100) * 0.005;
      return Math.abs(r - end[0]) + Math.abs(c - end[1]) + noise;
    }

    const g        = {};
    const prev     = {};
    const startKey = `${start[0]},${start[1]}`;
    const endKey   = `${end[0]},${end[1]}`;
    const open     = [{ key: startKey, f: h(start[0], start[1]) }];
    g[startKey]    = 0;

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const { key } = open.shift();
      if (key === endKey) return reconstruct(prev, start, end);
      const [r, c] = key.split(',').map(Number);
      for (const [nr, nc] of neighbors(grid, r, c)) {
        const nk = `${nr},${nc}`;
        const ng = (g[key] || 0) + cellCost(nr, nc);
        if (g[nk] === undefined || ng < g[nk]) {
          g[nk]    = ng;
          prev[nk] = key;
          open.push({ key: nk, f: ng + h(nr, nc) });
        }
      }
    }
    return null;
  }

  return { bfs, dfs, dijkstra, astar };
})();
