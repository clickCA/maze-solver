from tkinter import Tk, Canvas, Button, Label
import random


class Node:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.parent = None


def is_valid(x, y, maze):
    """
    Checks if a position is within the maze and valid.
    """
    width, height = len(maze[0]), len(maze)
    return 0 <= x < width and 0 <= y < height and maze[y][x] == 0


def dfs(maze, start, end):
  """
  Implements Depth-First Search (DFS) for maze solving.
  """
  stack = [start]
  visited = set()
  path = []
  while stack:
    current = stack.pop()
    visited.add(current)

    if current == end:
      path.append(current)
      while stack and stack[-1] != current:
        current = stack.pop()
      path.append(current)
      return path

    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
      new_x, new_y = current.x + dx, current.y + dy
      if is_valid(new_x, new_y, maze) and (new_x, new_y) not in visited:
        stack.append(Node(new_x, new_y))
        visited.add((new_x, new_y))
        stack[-1].parent = current

  return False


# Define maze size
width = 30
height = 20

# Create the main window
window = Tk()
window.title("Maze Solver")

# Create the canvas to display the maze
canvas = Canvas(window, width=width * 20, height=height * 20)
canvas.pack()

# Define cell size
cell_size = 20


# Generate a random maze
maze = [[random.randint(0, 1) for _ in range(width)] for _ in range(height)]

# Set start and end points
start_x, start_y = random.randint(0, width - 1), random.randint(0, height - 1)
end_x, end_y = random.randint(0, width - 1), random.randint(0, height - 1)

maze[start_y][start_x] = 2  # Start point
maze[end_y][end_x] = 3      # End point

# Check if the maze is solvable
start = Node(start_x, start_y)
end = Node(end_x, end_y)
if dfs(maze, start, end):
    print("Maze is solvable!")
else:
    print("Maze is not solvable.")


# Function to draw the maze
def draw_maze():
    for y in range(height):
        for x in range(width):
            if maze[y][x] == 1:  # Wall
                canvas.create_rectangle(x * cell_size, y * cell_size, (x + 1) * cell_size, (y + 1) * cell_size,
                                      fill="black")
            else:  # Path
                canvas.create_rectangle(x * cell_size, y * cell_size, (x + 1) * cell_size, (y + 1) * cell_size,
                                      fill="white")


# Start and end point labels
start_label = Label(window, text="Start")
start_label.place(x=10, y=10)
end_label = Label(window, text="End")
end_label.place(x=width * cell_size - 30, y=height * cell_size - 30)



# Function to solve the maze (replace with your actual maze solving algorithm)
def solve_maze():
    # Find start and end nodes
    start = None
    end = None
    for y in range(height):
        for x in range(width):
            if maze[y][x] == 2:
                start = Node(x, y)
            elif maze[y][x] == 3:
                end = Node(x, y)

    path = dfs(maze, start, end)
    print(path)
    if path:
       
        for node in path:
            x, y = node.x, node.y
            canvas.create_rectangle(x * cell_size, y * cell_size, (x + 1) * cell_size, (y + 1) * cell_size,
                                  fill="red")

    else:
        print("Maze cannot be solved using DFS")


# Solve button
solve_button = Button(window, text="Solve", command=solve_maze)
solve_button.place(x=width * cell_size / 2 - 20, y=height * cell_size - 30)

draw_maze()

# Run the main window loop
window.mainloop()