<?php

namespace App\Services;

class SudokuGenerator
{
    /**
     * Generate a complete valid 9x9 solved Sudoku board.
     *
     * @return array<int, array<int, int>>
     */
    public static function generateSolvedBoard(): array
    {
        $board = array_fill(0, 9, array_fill(0, 9, 0));
        self::solveBoard($board);

        return $board;
    }

    /**
     * Solve a 9x9 board using randomized backtracking.
     *
     * @param  array<int, array<int, int>>  $board
     */
    public static function solveBoard(array &$board): bool
    {
        for ($row = 0; $row < 9; $row++) {
            for ($col = 0; $col < 9; $col++) {
                if ($board[$row][$col] === 0) {
                    $numbers = range(1, 9);
                    shuffle($numbers);

                    foreach ($numbers as $num) {
                        if (self::isValidPlacement($board, $row, $col, $num)) {
                            $board[$row][$col] = $num;

                            if (self::solveBoard($board)) {
                                return true;
                            }

                            $board[$row][$col] = 0;
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check if a number can be placed at (row, col) without violating Sudoku rules.
     *
     * @param  array<int, array<int, int>>  $board
     */
    public static function isValidPlacement(array $board, int $row, int $col, int $num): bool
    {
        // Check Row
        for ($c = 0; $c < 9; $c++) {
            if ($board[$row][$c] === $num) {
                return false;
            }
        }

        // Check Column
        for ($r = 0; $r < 9; $r++) {
            if ($board[$r][$col] === $num) {
                return false;
            }
        }

        // Check 3x3 Box
        $startRow = intdiv($row, 3) * 3;
        $startCol = intdiv($col, 3) * 3;
        for ($r = 0; $r < 3; $r++) {
            for ($c = 0; $c < 3; $c++) {
                if ($board[$startRow + $r][$startCol + $c] === $num) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Generate puzzle and solution pair based on difficulty.
     *
     * @return array{initial_board: array<int, array<int, int>>, solution_board: array<int, array<int, int>>, clues_count: int}
     */
    public static function generatePuzzle(string $difficulty = 'normal'): array
    {
        $solution = self::generateSolvedBoard();
        $puzzle = $solution;

        // Number of clues to keep based on difficulty
        $cluesCount = match (strtolower($difficulty)) {
            'easy' => rand(44, 48),       // ~46 clues (easier)
            'hard' => rand(28, 32),       // ~30 clues (challenging)
            'extreme' => rand(22, 26),    // ~24 clues (expert)
            default => rand(35, 39),      // ~37 clues (normal/medium)
        };

        $cellsToRemove = 81 - $cluesCount;
        $positions = [];
        for ($r = 0; $r < 9; $r++) {
            for ($c = 0; $c < 9; $c++) {
                $positions[] = [$r, $c];
            }
        }
        shuffle($positions);

        for ($i = 0; $i < $cellsToRemove; $i++) {
            [$r, $c] = $positions[$i];
            $puzzle[$r][$c] = 0;
        }

        return [
            'initial_board' => $puzzle,
            'solution_board' => $solution,
            'clues_count' => $cluesCount,
        ];
    }
}
