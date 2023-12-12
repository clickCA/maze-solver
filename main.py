import tkinter as tk
from tkinter import messagebox
import time
from generate_maze import generate_maze
from collections import deque

def bfs(maze, start, end):
    rows, cols = len(maze), len(maze[0])
    print("END", end)
    def is_valid(x, y):
        return 0 <= x < rows and 0 <= y < cols and maze[x][y] == 'c'

    def explore(x, y):
        
      
        directions = [(0, 1),(1, 0),(-1, 0), (0, -1)]
        queue = deque([(x, y)])
        while queue:
            curr_x, curr_y = queue.popleft()
            print(curr_x, curr_y)
            for dx, dy in directions:
                nx, ny = curr_x + dx, curr_y + dy
                if is_valid(nx, ny) and maze[nx][ny] != 'v':
                    if (nx, ny) == end:
                        return True  # Found a path to the destination
                    maze[nx][ny] = 'v'  # Mark the cell as visited
                    queue.append((nx, ny))
            update_canvas()
            time.sleep(0.05)  # Adjust the delay as needed
        return False  # No path found from this cell

    start_x, start_y = start
    return explore(start_x, start_y)
def dfs(maze, start, end):
    rows, cols = len(maze), len(maze[0])
    print("END", end)
    def is_valid(x, y):
        return 0 <= x < rows and 0 <= y < cols and maze[x][y] == 'c'

    def explore(x, y):
        print(x,y)
        if (x, y) == end:
            return True  # Destination reached

        maze[x][y] = 'v'  # Mark the cell as visited
        update_canvas()
        time.sleep(0.05)  # Adjust the delay as needed

        directions = [(0, 1),(1, 0),(-1, 0), (0, -1)]
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if is_valid(nx, ny) and maze[nx][ny] != 'v':
                if explore(nx, ny):
                    return True  # Found a path to the destination

        return False  # No path found from this cell

    start_x, start_y = start
    return explore(start_x, start_y)

def update_canvas():
    canvas.delete("all")
    for i, row in enumerate(maze):
        for j, cell in enumerate(row):
            color = "black" if cell == "w" else "white" if cell == "c" else "gray"
            canvas.create_rectangle(j * cell_size, i * cell_size,
                                    (j + 1) * cell_size, (i + 1) * cell_size,
                                    fill=color, outline="black")

    root.update()



# Example maze
width = 34
height = 10
maze = generate_maze(height,width)

start_position = (0, 1)
end_position = (height-1 ,width-2)
def solve_maze():
    if (bfs(maze, start_position, end_position)):
        print("Path found!")
        maze[end_position[0]][end_position[1]] = 'v'
        update_canvas()
        messagebox.showinfo("Maze Solver", "Path Found!")
    # if dfs(maze, start_position, end_position):
    #     print("Path found!")
    #     maze[end_position[0]][end_position[1]] = 'v'
    #     update_canvas()
    #     messagebox.showinfo("Maze Solver", "Path Found!")
    else:
        print("No path found.")
# Tkinter setup
root = tk.Tk()
root.title("Maze Solver")

cell_size = 30
canvas = tk.Canvas(root, width=len(maze[0]) * cell_size, height=len(maze) * cell_size, bg="white")
canvas.pack()

solve_button = tk.Button(root, text="Solve Maze", command=solve_maze)
solve_button.pack()

root.mainloop()
