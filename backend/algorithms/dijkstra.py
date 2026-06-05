"""Dijkstra — Ağırlıklı en kısa yol algoritması"""
import heapq


DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]


def dijkstra(grid, start, end, weights=None):
    """
    grid   : List[List[int]]  — 0=yol, 1=duvar
    start  : (row, col)
    end    : (row, col)
    weights: Dict[(row,col) -> float]  — opsiyonel ağırlık haritası
    return : List[(row, col)] path veya None
    """
    rows = len(grid)
    cols = len(grid[0])
    sr, sc = start
    er, ec = end

    dist = {(sr, sc): 0}
    prev = {}
    heap = [(0, sr, sc)]

    while heap:
        cost, r, c = heapq.heappop(heap)
        if (r, c) == (er, ec):
            return _reconstruct(prev, start, end)
        if cost > dist.get((r, c), float('inf')):
            continue
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                w    = weights.get((nr, nc), 1) if weights else 1
                ncst = cost + w
                if ncst < dist.get((nr, nc), float('inf')):
                    dist[(nr, nc)] = ncst
                    prev[(nr, nc)] = (r, c)
                    heapq.heappush(heap, (ncst, nr, nc))

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
