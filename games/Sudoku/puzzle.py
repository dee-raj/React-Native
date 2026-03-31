import copy
import random


# ---------- VALIDATION ----------
def is_valid(board, row, col, num):
    for i in range(9):
        if board[row][i] == num:
            return False
        if board[i][col] == num:
            return False

    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True


# ---------- SOLVER ----------
def solve_sudoku(board):
    empty_cells = [(r, c) for r in range(9) for c in range(9) if board[r][c] == 0]

    def backtrack(i=0):
        if i == len(empty_cells):
            return True

        r, c = empty_cells[i]

        for num in range(1, 10):
            if is_valid(board, r, c, num):
                board[r][c] = num
                if backtrack(i + 1):
                    return True
                board[r][c] = 0

        return False

    return backtrack()


# ---------- COUNT SOLUTIONS ----------
def count_solutions(board, limit=4):
    empty_cells = [(r, c) for r in range(9) for c in range(9) if board[r][c] == 0]

    def backtrack(i=0):
        if i == len(empty_cells):
            return 1

        r, c = empty_cells[i]
        count = 0

        for num in range(1, 10):
            if is_valid(board, r, c, num):
                board[r][c] = num
                count += backtrack(i + 1)
                board[r][c] = 0

                if count >= limit:
                    return count

        return count

    return backtrack()


# ---------- FULL BOARD GENERATOR ----------
def generate_full_board():
    board = [[0] * 9 for _ in range(9)]

    def fill():
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)

                    for num in nums:
                        if is_valid(board, r, c, num):
                            board[r][c] = num
                            if fill():
                                return True
                            board[r][c] = 0
                    return False
        return True

    fill()
    return board


# ---------- PUZZLE GENERATOR ----------
def generate_puzzle(difficulty="hard"):
    while True:  # 🔁 retry until valid puzzle
        full = generate_full_board()
        puzzle = copy.deepcopy(full)

        cells = [(r, c) for r in range(9) for c in range(9)]
        random.shuffle(cells)

        removed = 0
        max_remove = 55 if difficulty != "medium" else 50

        for r, c in cells:
            if removed >= max_remove:
                break

            temp = puzzle[r][c]
            puzzle[r][c] = 0

            board_copy = copy.deepcopy(puzzle)
            solutions = count_solutions(board_copy)

            # 🧠 relaxed removal rules
            if difficulty == "hard":
                if solutions != 1:
                    puzzle[r][c] = temp
                else:
                    removed += 1

            elif difficulty == "medium":
                # allow 1 or 2 during removal
                if solutions > 2 or solutions == 0:
                    puzzle[r][c] = temp
                else:
                    removed += 1

            else:  # easy
                if solutions < 1:
                    puzzle[r][c] = temp
                else:
                    removed += 1

        # ✅ FINAL VALIDATION (critical fix)
        final_solutions = count_solutions(copy.deepcopy(puzzle))

        if difficulty == "easy" and final_solutions >= 3:
            return puzzle

        if difficulty == "medium" and final_solutions == 2:
            return puzzle

        if difficulty == "hard" and final_solutions == 1:
            return puzzle


# ---------- RUN DEMO ------
difficulty = "hard"  # change: easy / medium / hard

puzzle = generate_puzzle(difficulty)

print(f"\nGenerated {difficulty.upper()} puzzle:\n")
for row in puzzle:
    print(row)

solutions = count_solutions(copy.deepcopy(puzzle))
print("\nSolutions:", solutions)
