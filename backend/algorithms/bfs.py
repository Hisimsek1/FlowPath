"""BFS — Genişlik Öncelikli Arama (Breadth-First Search)"""
from collections import deque


DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]


def bfs(grid, start, end):
    """
    grid : List[List[int]]  — 0=yol, 1=duvar
    start: (row, col)
    end  : (row, col)
    return: List[(row, col)] path (start dahil) veya None
    """
    rows = len(grid)
    cols = len(grid[0])
    sr, sc = start
    er, ec = end

    visited = {(sr, sc)}
    prev    = {}
    queue   = deque([(sr, sc)])

    while queue:
        r, c = queue.popleft()
        if (r, c) == (er, ec):
            return _reconstruct(prev, start, end)
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in visited:
                visited.add((nr, nc))
                prev[(nr, nc)] = (r, c)
                queue.append((nr, nc))

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
