"""A* — Sezgisel En Kısa Yol Algoritması"""
import heapq


DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]


def astar(grid, start, end, agent_id=0, weights=None):
    """
    grid    : List[List[int]]  — 0=yol, 1=duvar
    start   : (row, col)
    end     : (row, col)
    agent_id: Her ajan farklı tie-breaking → daha az çarpışma
    weights : Dict[(row,col) -> float]  — opsiyonel ağırlık haritası
    return  : List[(row, col)] path veya None
    """
    rows = len(grid)
    cols = len(grid[0])
    sr, sc = start
    er, ec = end

    def noise(r, c):
        """Ajan bazlı küçük gürültü — aynı f değerinde farklı tercih"""
        return ((r * 31 + c * 17 + agent_id * 97) % 100) * 0.005

    def heuristic(r, c):
        return abs(r - er) + abs(c - ec) + noise(r, c)

    g    = {(sr, sc): 0}
    prev = {}
    heap = [(heuristic(sr, sc), 0, sr, sc)]

    while heap:
        f, cost, r, c = heapq.heappop(heap)
        if (r, c) == (er, ec):
            return _reconstruct(prev, start, end)
        if cost > g.get((r, c), float('inf')):
            continue
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                w   = weights.get((nr, nc), 1) if weights else 1
                ng  = cost + w
                if ng < g.get((nr, nc), float('inf')):
                    g[(nr, nc)]    = ng
                    prev[(nr, nc)] = (r, c)
                    heapq.heappush(heap, (ng + heuristic(nr, nc), ng, nr, nc))

    return None


def _reconstruct(prev, start, end):
    path = []
    cur  = end
    while cur != start:
        path.append(cur)
        cur = prev[cur]
    path.append(start)
    path.reverse()
    return path
