<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\User;
use App\Services\GameEngine;
use App\Services\SudokuGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SudokuGameTest extends TestCase
{
    use RefreshDatabase;

    public function test_player_can_create_sudoku_room_with_difficulty(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('games.create'), [
            'game_type' => 'sudoku',
            'difficulty' => 'hard',
            'max_players' => 2,
        ]);

        $game = Game::where('creator_id', $user->id)->first();
        $this->assertNotNull($game);
        $this->assertEquals('sudoku', $game->game_type);
        $this->assertEquals('hard', $game->difficulty);
        $this->assertEquals(2, $game->max_players);
        $this->assertEquals('waiting', $game->status);

        $response->assertRedirect(route('games.show', $game->uuid));
    }

    public function test_sudoku_generator_creates_valid_solved_board_and_puzzle(): void
    {
        $solved = SudokuGenerator::generateSolvedBoard();
        $this->assertCount(9, $solved);
        foreach ($solved as $row) {
            $this->assertCount(9, $row);
            $this->assertEquals(range(1, 9), sort($row) ? $row : []);
        }

        $puzzleData = SudokuGenerator::generatePuzzle('easy');
        $this->assertArrayHasKey('initial_board', $puzzleData);
        $this->assertArrayHasKey('solution_board', $puzzleData);
        $this->assertGreaterThanOrEqual(40, $puzzleData['clues_count']);
    }

    public function test_sudoku_game_initializes_with_puzzle_and_player_states(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $game = Game::create([
            'uuid' => 'sudoku-test-init-uuid',
            'creator_id' => $user1->id,
            'status' => 'waiting',
            'game_type' => 'sudoku',
            'difficulty' => 'normal',
            'max_players' => 2,
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user1->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user2->id, 'player_index' => 1]);

        $engine = new GameEngine;
        $engine->initGame($game, [$user1, $user2]);

        $game->refresh();
        $this->assertEquals('playing', $game->status);
        $this->assertEquals('sudoku', $game->board_state['game_type']);
        $this->assertArrayHasKey($user1->id, $game->board_state['players']);
        $this->assertArrayHasKey($user2->id, $game->board_state['players']);
        $this->assertFalse($game->board_state['players'][$user1->id]['solved']);
        $this->assertEquals(0, $game->board_state['players'][$user1->id]['mistakes_count']);
    }

    public function test_player_can_fill_cell_and_progress_updates(): void
    {
        $user = User::factory()->create();
        $solution = SudokuGenerator::generateSolvedBoard();
        $initial = $solution;
        $initial[0][0] = 0; // 1 empty cell

        $game = Game::create([
            'uuid' => 'sudoku-fill-test-uuid',
            'creator_id' => $user->id,
            'status' => 'playing',
            'game_type' => 'sudoku',
            'difficulty' => 'normal',
            'max_players' => 1,
            'board_state' => [
                'game_type' => 'sudoku',
                'difficulty' => 'normal',
                'initial_board' => $initial,
                'solution_board' => $solution,
                'clues_count' => 80,
                'players' => [
                    $user->id => [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'index' => 0,
                        'current_board' => $initial,
                        'mistakes_count' => 0,
                        'progress' => 98,
                        'solved' => false,
                        'surrendered' => false,
                        'finish_order' => null,
                    ],
                ],
                'finished_count' => 0,
                'rematch_votes' => [],
                'log' => [],
            ],
        ]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user->id, 'player_index' => 0]);

        $correctVal = $solution[0][0];
        $response = $this->actingAs($user)->post(route('games.sudoku.fill', $game->uuid), [
            'row' => 0,
            'col' => 0,
            'val' => $correctVal,
        ]);

        $response->assertSessionHasNoErrors();
        $game->refresh();
        $this->assertTrue($game->board_state['players'][$user->id]['solved']);
        $this->assertEquals(100, $game->board_state['players'][$user->id]['progress']);
        $this->assertEquals('finished', $game->status);
        $this->assertEquals($user->id, $game->winner_id);
    }

    public function test_solo_and_multiplayer_sudoku_rematch(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $puzzle = SudokuGenerator::generatePuzzle('easy');

        $game = Game::create([
            'uuid' => 'sudoku-rematch-test-uuid',
            'creator_id' => $user1->id,
            'status' => 'finished',
            'game_type' => 'sudoku',
            'difficulty' => 'easy',
            'max_players' => 2,
            'board_state' => [
                'game_type' => 'sudoku',
                'difficulty' => 'easy',
                'initial_board' => $puzzle['initial_board'],
                'solution_board' => $puzzle['solution_board'],
                'clues_count' => $puzzle['clues_count'],
                'players' => [
                    $user1->id => [
                        'user_id' => $user1->id,
                        'name' => $user1->name,
                        'index' => 0,
                        'current_board' => $puzzle['solution_board'],
                        'mistakes_count' => 0,
                        'progress' => 100,
                        'solved' => true,
                        'surrendered' => false,
                        'finish_order' => 1,
                    ],
                    $user2->id => [
                        'user_id' => $user2->id,
                        'name' => $user2->name,
                        'index' => 1,
                        'current_board' => $puzzle['solution_board'],
                        'mistakes_count' => 1,
                        'progress' => 100,
                        'solved' => true,
                        'surrendered' => false,
                        'finish_order' => 2,
                    ],
                ],
                'finished_count' => 2,
                'rematch_votes' => [],
                'log' => [],
            ],
        ]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user1->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user2->id, 'player_index' => 1]);

        // Player 1 votes rematch
        $this->actingAs($user1)->post(route('games.rematch', $game->uuid));
        $game->refresh();
        $this->assertEquals('finished', $game->status);
        $this->assertCount(1, $game->board_state['rematch_votes']);

        // Player 2 votes rematch
        $this->actingAs($user2)->post(route('games.rematch', $game->uuid));
        $game->refresh();
        $this->assertEquals('playing', $game->status);
        $this->assertFalse($game->board_state['players'][$user1->id]['solved']);
        $this->assertFalse($game->board_state['players'][$user2->id]['solved']);
    }
}
