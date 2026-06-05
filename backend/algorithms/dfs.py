"""DFS — Derinlik Öncelikli Arama (Depth-First Search)"""

# Ters sıra → sola/yukarı önce gider → daha uzun, kaotik yollar
DIRS = [(-1, 0), (0, -1), (1, 0), (0, 1)]


def dfs(grid, start, end):
    """
    grid : List[List[int]]  — 0=yol, 1=duvar
    start: (row, col)
    end  : (row, col)
    return: List[(row, col)] path veya None
    """
    rows = len(grid)
    cols = len(grid[0])
    sr, sc = start
    er, ec = end

    visited = {(sr, sc)}
    prev    = {}
    stack   = [(sr, sc)]

    while stack:
        r, c = stack.pop()
        if (r, c) == (er, ec):
            return _reconstruct(prev, start, end)
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in visited:
                visited.add((nr, nc))
                prev[(nr, nc)] = (r, c)
                stack.append((nr, nc))

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
