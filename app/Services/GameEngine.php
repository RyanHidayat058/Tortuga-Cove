<?php

namespace App\Services;

use App\Models\Game;
use App\Models\User;

class GameEngine
{
    /**
     * Get the complete library of cards in the game.
     */
    public static function getCardLibrary(): array
    {
        return [
            // ================= TIER 1 CARDS =================
            // cost format: ['pearl' => X, 'sapphire' => Y, 'emerald' => Z, 'ruby' => W, 'obsidian' => V]
            ['id' => 1, 'tier' => 1, 'points' => 0, 'bonus' => 'pearl', 'cost' => ['obsidian' => 3], 'name' => 'Deckhand Cabin'],
            ['id' => 2, 'tier' => 1, 'points' => 0, 'bonus' => 'pearl', 'cost' => ['sapphire' => 1, 'emerald' => 2, 'obsidian' => 1], 'name' => 'Fishing Canoe'],
            ['id' => 3, 'tier' => 1, 'points' => 0, 'bonus' => 'pearl', 'cost' => ['sapphire' => 1, 'emerald' => 1, 'ruby' => 1, 'obsidian' => 1], 'name' => 'Castaway Compass'],
            ['id' => 4, 'tier' => 1, 'points' => 0, 'bonus' => 'pearl', 'cost' => ['sapphire' => 2, 'ruby' => 2], 'name' => 'Rope Rigging'],
            ['id' => 5, 'tier' => 1, 'points' => 1, 'cost' => ['pearl' => 4], 'bonus' => 'pearl', 'name' => 'Pearl Fishery'],

            ['id' => 6, 'tier' => 1, 'points' => 0, 'bonus' => 'sapphire', 'cost' => ['pearl' => 3], 'name' => 'Spyglass Lookout'],
            ['id' => 7, 'tier' => 1, 'points' => 0, 'bonus' => 'sapphire', 'cost' => ['pearl' => 1, 'emerald' => 1, 'ruby' => 2, 'obsidian' => 1], 'name' => 'Coastal Map'],
            ['id' => 8, 'tier' => 1, 'points' => 0, 'bonus' => 'sapphire', 'cost' => ['pearl' => 1, 'emerald' => 1, 'ruby' => 1, 'obsidian' => 1], 'name' => 'Nautical Astrolabe'],
            ['id' => 9, 'tier' => 1, 'points' => 0, 'bonus' => 'sapphire', 'cost' => ['emerald' => 2, 'obsidian' => 2], 'name' => 'Sail Cloth'],
            ['id' => 10, 'tier' => 1, 'points' => 1, 'cost' => ['sapphire' => 4], 'bonus' => 'sapphire', 'name' => 'Smuggler Dock'],

            ['id' => 11, 'tier' => 1, 'points' => 0, 'bonus' => 'emerald', 'cost' => ['sapphire' => 3], 'name' => 'Rum Cellar'],
            ['id' => 12, 'tier' => 1, 'points' => 0, 'bonus' => 'emerald', 'cost' => ['pearl' => 2, 'sapphire' => 1, 'obsidian' => 1], 'name' => 'Jungle Outpost'],
            ['id' => 13, 'tier' => 1, 'points' => 0, 'bonus' => 'emerald', 'cost' => ['pearl' => 1, 'sapphire' => 1, 'ruby' => 1, 'obsidian' => 1], 'name' => 'Swamp Haven'],
            ['id' => 14, 'tier' => 1, 'points' => 0, 'bonus' => 'emerald', 'cost' => ['pearl' => 2, 'ruby' => 2], 'name' => 'Shipwright tools'],
            ['id' => 15, 'tier' => 1, 'points' => 1, 'cost' => ['emerald' => 4], 'bonus' => 'emerald', 'name' => 'Emerald Reef'],

            ['id' => 16, 'tier' => 1, 'points' => 0, 'bonus' => 'ruby', 'cost' => ['pearl' => 3], 'name' => 'Gunpowder Keg'],
            ['id' => 17, 'tier' => 1, 'points' => 0, 'bonus' => 'ruby', 'cost' => ['pearl' => 2, 'sapphire' => 1, 'emerald' => 1, 'obsidian' => 1], 'name' => 'Boarding Cutlass'],
            ['id' => 18, 'tier' => 1, 'points' => 0, 'bonus' => 'ruby', 'cost' => ['pearl' => 1, 'sapphire' => 1, 'emerald' => 1, 'obsidian' => 1], 'name' => 'Flintlock Pistol'],
            ['id' => 19, 'tier' => 1, 'points' => 0, 'bonus' => 'ruby', 'cost' => ['sapphire' => 2, 'emerald' => 2], 'name' => 'Cannonballs'],
            ['id' => 20, 'tier' => 1, 'points' => 1, 'cost' => ['ruby' => 4], 'bonus' => 'ruby', 'name' => 'Ruby Mines'],

            ['id' => 21, 'tier' => 1, 'points' => 0, 'bonus' => 'obsidian', 'cost' => ['emerald' => 3], 'name' => 'Black Tar Pitch'],
            ['id' => 22, 'tier' => 1, 'points' => 0, 'bonus' => 'obsidian', 'cost' => ['pearl' => 1, 'sapphire' => 1, 'emerald' => 1, 'ruby' => 2], 'name' => 'Iron Shackles'],
            ['id' => 23, 'tier' => 1, 'points' => 0, 'bonus' => 'obsidian', 'cost' => ['pearl' => 1, 'sapphire' => 1, 'emerald' => 1, 'ruby' => 1], 'name' => 'Voodoo Totem'],
            ['id' => 24, 'tier' => 1, 'points' => 0, 'bonus' => 'obsidian', 'cost' => ['pearl' => 2, 'emerald' => 2], 'name' => 'Anchor Chain'],
            ['id' => 25, 'tier' => 1, 'points' => 1, 'cost' => ['obsidian' => 4], 'bonus' => 'obsidian', 'name' => 'Volcano Pit'],

            // ================= TIER 2 CARDS =================
            ['id' => 26, 'tier' => 2, 'points' => 1, 'bonus' => 'pearl', 'cost' => ['emerald' => 3, 'ruby' => 2, 'obsidian' => 2], 'name' => 'Sloop of War'],
            ['id' => 27, 'tier' => 2, 'points' => 2, 'bonus' => 'pearl', 'cost' => ['pearl' => 5], 'name' => 'Pearl Trader'],
            ['id' => 28, 'tier' => 2, 'points' => 2, 'bonus' => 'pearl', 'cost' => ['pearl' => 4, 'sapphire' => 2, 'obsidian' => 1], 'name' => 'Treasury Map'],
            ['id' => 29, 'tier' => 2, 'points' => 3, 'bonus' => 'pearl', 'cost' => ['pearl' => 6], 'name' => 'Infamy Bounty'],

            ['id' => 30, 'tier' => 2, 'points' => 1, 'bonus' => 'sapphire', 'cost' => ['pearl' => 2, 'emerald' => 2, 'ruby' => 3], 'name' => 'Schooner Raid'],
            ['id' => 31, 'tier' => 2, 'points' => 2, 'bonus' => 'sapphire', 'cost' => ['sapphire' => 5], 'name' => 'Sapphire Fleet'],
            ['id' => 32, 'tier' => 2, 'points' => 2, 'bonus' => 'sapphire', 'cost' => ['pearl' => 1, 'sapphire' => 4, 'emerald' => 2], 'name' => 'Smuggler Brigantine'],
            ['id' => 33, 'tier' => 2, 'points' => 3, 'bonus' => 'sapphire', 'cost' => ['sapphire' => 6], 'name' => 'Royal Bounty'],

            ['id' => 34, 'tier' => 2, 'points' => 1, 'bonus' => 'emerald', 'cost' => ['pearl' => 3, 'sapphire' => 2, 'obsidian' => 2], 'name' => 'Jungle Hideout'],
            ['id' => 35, 'tier' => 2, 'points' => 2, 'bonus' => 'emerald', 'cost' => ['emerald' => 5], 'name' => 'Emerald Cove'],
            ['id' => 36, 'tier' => 2, 'points' => 2, 'bonus' => 'emerald', 'cost' => ['sapphire' => 2, 'emerald' => 4, 'ruby' => 1], 'name' => 'Merchant Galleon'],
            ['id' => 37, 'tier' => 2, 'points' => 3, 'bonus' => 'emerald', 'cost' => ['emerald' => 6], 'name' => 'Cartel Pact'],

            ['id' => 38, 'tier' => 2, 'points' => 1, 'bonus' => 'ruby', 'cost' => ['pearl' => 2, 'sapphire' => 3, 'emerald' => 2], 'name' => 'First Mate'],
            ['id' => 39, 'tier' => 2, 'points' => 2, 'bonus' => 'ruby', 'cost' => ['ruby' => 5], 'name' => 'Ruby Fleet'],
            ['id' => 40, 'tier' => 2, 'points' => 2, 'bonus' => 'ruby', 'cost' => ['emerald' => 1, 'ruby' => 4, 'obsidian' => 2], 'name' => 'Quartermaster Room'],
            ['id' => 41, 'tier' => 2, 'points' => 3, 'bonus' => 'ruby', 'cost' => ['ruby' => 6], 'name' => 'Navy Commission'],

            ['id' => 42, 'tier' => 2, 'points' => 1, 'bonus' => 'obsidian', 'cost' => ['sapphire' => 3, 'emerald' => 2, 'ruby' => 2], 'name' => 'Experienced Gunner'],
            ['id' => 43, 'tier' => 2, 'points' => 2, 'bonus' => 'obsidian', 'cost' => ['obsidian' => 5], 'name' => 'Obsidian Cove'],
            ['id' => 44, 'tier' => 2, 'points' => 2, 'bonus' => 'obsidian', 'cost' => ['pearl' => 2, 'ruby' => 1, 'obsidian' => 4], 'name' => 'Corsair Captain'],
            ['id' => 45, 'tier' => 2, 'points' => 3, 'bonus' => 'obsidian', 'cost' => ['obsidian' => 6], 'name' => 'Treason Pardon'],

            // ================= TIER 3 CARDS =================
            ['id' => 46, 'tier' => 3, 'points' => 3, 'bonus' => 'pearl', 'cost' => ['pearl' => 3, 'sapphire' => 3, 'emerald' => 5, 'ruby' => 3], 'name' => 'Bucaneer Sovereign'],
            ['id' => 47, 'tier' => 3, 'points' => 4, 'bonus' => 'pearl', 'cost' => ['obsidian' => 7], 'name' => 'Leviathan Galleon'],
            ['id' => 48, 'tier' => 3, 'points' => 4, 'bonus' => 'pearl', 'cost' => ['pearl' => 3, 'ruby' => 3, 'obsidian' => 6], 'name' => 'Tortuga Stronghold'],
            ['id' => 49, 'tier' => 3, 'points' => 5, 'bonus' => 'pearl', 'cost' => ['pearl' => 7, 'sapphire' => 3], 'name' => 'Emperor Throne Plunder'],

            ['id' => 50, 'tier' => 3, 'points' => 3, 'bonus' => 'sapphire', 'cost' => ['pearl' => 3, 'sapphire' => 3, 'emerald' => 3, 'obsidian' => 5], 'name' => 'Poseidon Crown'],
            ['id' => 51, 'tier' => 3, 'points' => 4, 'bonus' => 'sapphire', 'cost' => ['pearl' => 7], 'name' => 'The Flying Dutchman'],
            ['id' => 52, 'tier' => 3, 'points' => 4, 'bonus' => 'sapphire', 'cost' => ['pearl' => 6, 'sapphire' => 3, 'emerald' => 3], 'name' => 'Nassau Harbour'],
            ['id' => 53, 'tier' => 3, 'points' => 5, 'bonus' => 'sapphire', 'cost' => ['sapphire' => 7, 'emerald' => 3], 'name' => 'Sea King Conquest'],

            ['id' => 54, 'tier' => 3, 'points' => 3, 'bonus' => 'emerald', 'cost' => ['pearl' => 5, 'sapphire' => 3, 'ruby' => 3, 'obsidian' => 3], 'name' => 'Grand Admiral Ship'],
            ['id' => 55, 'tier' => 3, 'points' => 4, 'bonus' => 'emerald', 'cost' => ['sapphire' => 7], 'name' => 'The Jolly Roger'],
            ['id' => 56, 'tier' => 3, 'points' => 4, 'bonus' => 'emerald', 'cost' => ['sapphire' => 6, 'emerald' => 3, 'ruby' => 3], 'name' => 'Port Royal Garrison'],
            ['id' => 57, 'tier' => 3, 'points' => 5, 'bonus' => 'emerald', 'cost' => ['emerald' => 7, 'ruby' => 3], 'name' => 'El Dorado Plunder'],

            ['id' => 58, 'tier' => 3, 'points' => 3, 'bonus' => 'ruby', 'cost' => ['pearl' => 3, 'emerald' => 3, 'ruby' => 3, 'obsidian' => 5], 'name' => 'Royal Navy Dreadnought'],
            ['id' => 59, 'tier' => 3, 'points' => 4, 'bonus' => 'ruby', 'cost' => ['emerald' => 7], 'name' => 'The Crimson Storm'],
            ['id' => 60, 'tier' => 3, 'points' => 4, 'bonus' => 'ruby', 'cost' => ['emerald' => 6, 'ruby' => 3, 'obsidian' => 3], 'name' => 'Spanish Fort Siege'],
            ['id' => 61, 'tier' => 3, 'points' => 5, 'bonus' => 'ruby', 'cost' => ['ruby' => 7, 'obsidian' => 3], 'name' => 'Molten Treasury Raid'],

            ['id' => 62, 'tier' => 3, 'points' => 3, 'bonus' => 'obsidian', 'cost' => ['pearl' => 3, 'sapphire' => 5, 'emerald' => 3, 'ruby' => 3], 'name' => 'Blackbeard Armada'],
            ['id' => 63, 'tier' => 3, 'points' => 4, 'bonus' => 'obsidian', 'cost' => ['ruby' => 7], 'name' => 'The Queen Anne\'s Revenge'],
            ['id' => 64, 'tier' => 3, 'points' => 4, 'bonus' => 'obsidian', 'cost' => ['pearl' => 3, 'emerald' => 3, 'obsidian' => 6], 'name' => 'Kraken Pit Haven'],
            ['id' => 65, 'tier' => 3, 'points' => 5, 'bonus' => 'obsidian', 'cost' => ['obsidian' => 7, 'pearl' => 3], 'name' => 'Abyss Treasury Loot'],
        ];
    }

    /**
     * Get the complete library of Nobles (Pirate Lords).
     */
    public static function getNobleLibrary(): array
    {
        return [
            ['id' => 1, 'points' => 3, 'cost' => ['pearl' => 3, 'sapphire' => 3, 'obsidian' => 3], 'name' => 'Captain Blackbeard'],
            ['id' => 2, 'points' => 3, 'cost' => ['pearl' => 3, 'ruby' => 3, 'emerald' => 3], 'name' => 'Madame Cheng'],
            ['id' => 3, 'points' => 3, 'cost' => ['sapphire' => 3, 'emerald' => 3, 'ruby' => 3], 'name' => 'Calico Jack'],
            ['id' => 4, 'points' => 3, 'cost' => ['emerald' => 3, 'ruby' => 3, 'obsidian' => 3], 'name' => 'Grace O\'Malley'],
            ['id' => 5, 'points' => 3, 'cost' => ['pearl' => 3, 'sapphire' => 3, 'emerald' => 3], 'name' => 'Sir Francis Drake'],
            ['id' => 6, 'points' => 3, 'cost' => ['pearl' => 4, 'obsidian' => 4], 'name' => 'Edward Low'],
            ['id' => 7, 'points' => 3, 'cost' => ['sapphire' => 4, 'pearl' => 4], 'name' => 'Henry Morgan'],
            ['id' => 8, 'points' => 3, 'cost' => ['ruby' => 4, 'emerald' => 4], 'name' => 'Anne Bonny'],
            ['id' => 9, 'points' => 3, 'cost' => ['emerald' => 4, 'obsidian' => 4], 'name' => 'Bartholomew Roberts'],
            ['id' => 10, 'points' => 3, 'cost' => ['ruby' => 4, 'obsidian' => 4], 'name' => 'Charles Vane'],
        ];
    }

    /**
     * Initialise the game state.
     */
    public function initGame(Game $game, array $players): void
    {
        if (($game->game_type ?? 'splendor') === 'snakes') {
            $playerStates = [];
            foreach ($players as $index => $player) {
                $playerStates[$player->id] = [
                    'user_id' => $player->id,
                    'name' => $player->name,
                    'index' => $index,
                    'position' => 1,
                    'color' => match ($index) {
                        0 => 'Red',
                        1 => 'Blue',
                        2 => 'Green',
                        default => 'Yellow'
                    },
                ];
            }

            $boardState = [
                'game_type' => 'snakes',
                'players' => $playerStates,
                'log' => [
                    '⚓ The voyage of Snakes & Ladders has begun!',
                    'Roll the dice to navigate through the stormy sea to reach the safe harbor at cell 100!',
                ],
            ];

            $game->forceFill([
                'status' => 'playing',
                'current_player_index' => 0,
                'board_state' => $boardState,
            ])->save();

            return;
        }

        $playerCount = count($players);

        // Define token count
        // 2 players: 4 tokens of each type.
        // 3 players: 5 tokens of each type.
        // 4 players: 7 tokens of each type.
        // Gold token is always 5.
        $tokenCount = match ($playerCount) {
            2 => 4,
            3 => 5,
            default => 7,
        };

        $tokens = [
            'pearl' => $tokenCount,
            'sapphire' => $tokenCount,
            'emerald' => $tokenCount,
            'ruby' => $tokenCount,
            'obsidian' => $tokenCount,
            'gold' => 5,
        ];

        // Retrieve and shuffle cards
        $allCards = self::getCardLibrary();
        $decks = [
            'tier1' => [],
            'tier2' => [],
            'tier3' => [],
        ];

        foreach ($allCards as $card) {
            $decks['tier'.$card['tier']][] = $card;
        }

        shuffle($decks['tier1']);
        shuffle($decks['tier2']);
        shuffle($decks['tier3']);

        // Draw 4 cards of each tier for the board
        $boardCards = [
            'tier1' => array_splice($decks['tier1'], 0, 4),
            'tier2' => array_splice($decks['tier2'], 0, 4),
            'tier3' => array_splice($decks['tier3'], 0, 4),
        ];

        // Draw Nobles (playerCount + 1)
        $allNobles = self::getNobleLibrary();
        shuffle($allNobles);
        $nobles = array_splice($allNobles, 0, $playerCount + 1);

        // Initialise players stats
        $playerStates = [];
        foreach ($players as $index => $player) {
            $playerStates[$player->id] = [
                'user_id' => $player->id,
                'name' => $player->name,
                'index' => $index,
                'tokens' => [
                    'pearl' => 0,
                    'sapphire' => 0,
                    'emerald' => 0,
                    'ruby' => 0,
                    'obsidian' => 0,
                    'gold' => 0,
                ],
                'bonuses' => [
                    'pearl' => 0,
                    'sapphire' => 0,
                    'emerald' => 0,
                    'ruby' => 0,
                    'obsidian' => 0,
                ],
                'purchased_cards' => [],
                'reserved_cards' => [],
                'nobles' => [],
                'points' => 0,
            ];
        }

        $creator = User::find($game->creator_id);

        $boardState = [
            'tokens' => $tokens,
            'cards' => $boardCards,
            'decks' => $decks,
            'nobles' => $nobles,
            'players' => $playerStates,
            'log' => [
                'Game created by '.($creator->name ?? 'Unknown').'.',
                'Ahoy! Decks shuffled and tokens stacked.',
            ],
        ];

        $game->forceFill([
            'status' => 'playing',
            'current_player_index' => 0,
            'board_state' => $boardState,
        ])->save();
    }

    /**
     * Action: Take tokens from the board.
     */
    public function takeTokens(Game $game, User $user, array $selectedTokens): void
    {
        $this->validateTurn($game, $user);
        $state = $game->board_state;
        $playerId = $user->id;
        $player = &$state['players'][$playerId];

        // Count selected tokens
        $counts = array_count_values($selectedTokens);
        $colors = array_keys($counts);
        $totalSelected = count($selectedTokens);

        if ($totalSelected === 0) {
            throw new \Exception('Ye must select some treasures to plunder!');
        }

        // Validate selection colors
        foreach ($colors as $color) {
            if ($color === 'gold') {
                throw new \Exception('Ye cannot plunder Gold Doubloons directly! Ye must reserve a card to earn them.');
            }
            if (! in_array($color, ['pearl', 'sapphire', 'emerald', 'ruby', 'obsidian'])) {
                throw new \Exception('Invalid token type.');
            }
            if (($state['tokens'][$color] ?? 0) < ($counts[$color] ?? 0)) {
                throw new \Exception("There aren't enough {$color} tokens left on the board.");
            }
        }

        // Calculate current total tokens in player's hand
        $currentTotalTokens = array_sum($player['tokens']);
        if ($currentTotalTokens + $totalSelected > 10) {
            throw new \Exception('A pirate cannot carry more than 10 treasures! Return some before plundering more.');
        }

        // Validate Splendor rules:
        // 1. Take 3 different colored tokens.
        // 2. Take 2 of the same color, but ONLY if there are at least 4 available on the board.
        if ($totalSelected === 3) {
            if (count($colors) !== 3) {
                throw new \Exception('To plunder 3 treasures, they must all be of different types.');
            }
        } elseif ($totalSelected === 2) {
            if (count($colors) === 1) {
                $color = $colors[0];
                if ($state['tokens'][$color] < 4) {
                    throw new \Exception('Ye can only plunder 2 of the same treasure if there are 4 or more remaining in the chest.');
                }
            } else {
                // If taking only 2 different, that's allowed as a fallback if board doesn't have 3 different,
                // but standard rules usually enforce taking exactly 3 different if available, or just 2 same.
                // We'll allow taking 2 different to be flexible, but forbid taking 2 of one and 1 of another.
                throw new \Exception('Invalid plundering selection. Choose 3 different or 2 identical treasures.');
            }
        } elseif ($totalSelected === 1) {
            // Allow taking 1 token if that's all that's left
            $totalBoardTokens = 0;
            foreach ($state['tokens'] as $k => $v) {
                if ($k !== 'gold') {
                    $totalBoardTokens += $v;
                }
            }
            // Standard rule allows taking fewer if not enough colors are available
        } else {
            throw new \Exception('Ye can only plunder up to 3 treasures per turn.');
        }

        // Execute action
        $logDetails = [];
        foreach ($counts as $color => $count) {
            $state['tokens'][$color] -= $count;
            $player['tokens'][$color] += $count;
            $logDetails[] = "{$count} ".ucfirst($color);
        }

        $state['log'][] = "🏴‍☠️ {$player['name']} plundered ".implode(', ', $logDetails).'.';

        $game->board_state = $state;
        $this->switchTurn($game);
    }

    /**
     * Action: Reserve a card from the board or deck.
     */
    public function reserveCard(Game $game, User $user, int $cardId, string $tier): void
    {
        $this->validateTurn($game, $user);
        $state = $game->board_state;
        $playerId = $user->id;
        $player = &$state['players'][$playerId];

        if (count($player['reserved_cards']) >= 3) {
            throw new \Exception('Ye can only reserve up to 3 charts (cards) at a time!');
        }

        $card = null;
        $cardIndex = -1;
        $fromBoard = false;

        // Search card on the board
        foreach ($state['cards'][$tier] as $idx => $c) {
            if ($c['id'] === $cardId) {
                $card = $c;
                $cardIndex = $idx;
                $fromBoard = true;
                break;
            }
        }

        // Search in deck if not on board (reserving directly from deck)
        if (! $card) {
            foreach ($state['decks'][$tier] as $idx => $c) {
                if ($c['id'] === $cardId) {
                    $card = $c;
                    $cardIndex = $idx;
                    break;
                }
            }
        }

        if (! $card) {
            throw new \Exception('The chart ye seek does not exist.');
        }

        // Remove card from board/deck
        if ($fromBoard) {
            array_splice($state['cards'][$tier], $cardIndex, 1);
            // Replace board card from deck
            if (count($state['decks'][$tier]) > 0) {
                $replacement = array_shift($state['decks'][$tier]);
                $state['cards'][$tier][] = $replacement;
            }
        } else {
            array_splice($state['decks'][$tier], $cardIndex, 1);
        }

        // Add to player's reserved list
        $player['reserved_cards'][] = $card;

        // Give 1 gold token if available
        $earnedGold = false;
        if ($state['tokens']['gold'] > 0) {
            // Check hand limit (10 tokens total)
            $currentTotalTokens = array_sum($player['tokens']);
            if ($currentTotalTokens < 10) {
                $state['tokens']['gold']--;
                $player['tokens']['gold']++;
                $earnedGold = true;
            }
        }

        $goldMsg = $earnedGold ? ' and earned a Gold Doubloon' : '';
        $state['log'][] = "🗺️ {$player['name']} reserved '{$card['name']}' (Tier ".substr($tier, -1)."){$goldMsg}.";

        $game->board_state = $state;
        $this->switchTurn($game);
    }

    /**
     * Action: Buy a card from board or reserved list.
     */
    public function buyCard(Game $game, User $user, int $cardId, string $tier, bool $fromReserved): void
    {
        $this->validateTurn($game, $user);
        $state = $game->board_state;
        $playerId = $user->id;
        $player = &$state['players'][$playerId];

        $card = null;
        $cardIndex = -1;

        if ($fromReserved) {
            foreach ($player['reserved_cards'] as $idx => $c) {
                if ($c['id'] === $cardId) {
                    $card = $c;
                    $cardIndex = $idx;
                    break;
                }
            }
        } else {
            foreach ($state['cards'][$tier] as $idx => $c) {
                if ($c['id'] === $cardId) {
                    $card = $c;
                    $cardIndex = $idx;
                    break;
                }
            }
        }

        if (! $card) {
            throw new \Exception('The chart ye want to buy is not available.');
        }

        // Calculate card cost after applying player bonuses
        $actualCost = [];
        $goldNeeded = 0;
        $tokenPayment = [];

        foreach ($card['cost'] as $color => $costAmount) {
            $bonusAmount = $player['bonuses'][$color] ?? 0;
            $discountedCost = max(0, $costAmount - $bonusAmount);
            $actualCost[$color] = $discountedCost;

            $tokenAmount = $player['tokens'][$color] ?? 0;
            if ($tokenAmount >= $discountedCost) {
                $tokenPayment[$color] = $discountedCost;
            } else {
                $tokenPayment[$color] = $tokenAmount;
                $goldNeeded += ($discountedCost - $tokenAmount);
            }
        }

        // Check if player has enough gold
        if ($player['tokens']['gold'] < $goldNeeded) {
            throw new \Exception('Ye do not have enough treasures or gold doubloons to purchase this asset!');
        }

        // Execute payment: deduct tokens and return to board pile
        foreach ($tokenPayment as $color => $amount) {
            $player['tokens'][$color] -= $amount;
            $state['tokens'][$color] += $amount;
        }

        if ($goldNeeded > 0) {
            $player['tokens']['gold'] -= $goldNeeded;
            $state['tokens']['gold'] += $goldNeeded;
        }

        // Remove card from original list
        if ($fromReserved) {
            array_splice($player['reserved_cards'], $cardIndex, 1);
        } else {
            array_splice($state['cards'][$tier], $cardIndex, 1);
            // Replace card on board from deck
            if (count($state['decks'][$tier]) > 0) {
                $replacement = array_shift($state['decks'][$tier]);
                $state['cards'][$tier][] = $replacement;
            }
        }

        // Add card to player's purchased list
        $player['purchased_cards'][] = $card;

        // Add permanent bonus
        $bonusColor = $card['bonus'];
        $player['bonuses'][$bonusColor] = ($player['bonuses'][$bonusColor] ?? 0) + 1;

        // Add points
        $player['points'] += $card['points'];

        $state['log'][] = "⚓ {$player['name']} purchased '{$card['name']}' (Tier ".substr($tier, -1).') for '.$card['points'].' infamy points.';

        // Check for Nobles (Pirate Lords) visit
        $this->checkNoblesVisit($state, $player);

        $game->board_state = $state;
        $this->switchTurn($game);
    }

    /**
     * Validate that it is the user's turn.
     */
    private function validateTurn(Game $game, User $user): void
    {
        if ($game->status !== 'playing') {
            throw new \Exception('The game has not started or is already finished.');
        }

        $state = $game->board_state;
        $players = array_values($state['players']);

        // Order players by their index
        usort($players, fn ($a, $b) => $a['index'] <=> $b['index']);

        $activePlayer = $players[$game->current_player_index] ?? null;

        if (! $activePlayer || $activePlayer['user_id'] !== $user->id) {
            throw new \Exception("It's not yer turn to act, matey!");
        }
    }

    /**
     * Check if any Nobles (Pirate Lords) should visit the player.
     */
    private function checkNoblesVisit(array &$state, array &$player): void
    {
        $visitedNobleIndex = -1;

        foreach ($state['nobles'] as $idx => $noble) {
            $eligible = true;
            foreach ($noble['cost'] as $color => $requiredCount) {
                $bonusCount = $player['bonuses'][$color] ?? 0;
                if ($bonusCount < $requiredCount) {
                    $eligible = false;
                    break;
                }
            }

            if ($eligible) {
                $visitedNobleIndex = $idx;
                break; // Assign first eligible noble
            }
        }

        if ($visitedNobleIndex !== -1) {
            $noble = $state['nobles'][$visitedNobleIndex];

            // Move noble to player
            $player['nobles'][] = $noble;
            $player['points'] += $noble['points'];

            $state['log'][] = "👑 Pirate Lord '{$noble['name']}' was impressed and joined {$player['name']}'s crew! (+3 Infamy)";

            // Remove from board
            array_splice($state['nobles'], $visitedNobleIndex, 1);
        }
    }

    /**
     * End player's turn and switch to next player. Check victory conditions.
     */
    private function switchTurn(Game $game): void
    {
        $state = $game->board_state;
        $players = array_values($state['players']);

        // Order players by their index
        usort($players, fn ($a, $b) => $a['index'] <=> $b['index']);
        $playerCount = count($players);

        $nextIndex = ($game->current_player_index + 1) % $playerCount;

        // If nextIndex is 0, it means a full round of turns is complete!
        // We only check victory at the end of a round, so that all players have had an equal number of turns.
        if ($nextIndex === 0) {
            $winnerCandidates = [];
            $maxPoints = 14; // Must reach at least 15 points

            foreach ($players as $p) {
                if ($p['points'] > $maxPoints) {
                    $winnerCandidates = [$p];
                    $maxPoints = $p['points'];
                } elseif ($p['points'] == $maxPoints && $maxPoints >= 15) {
                    $winnerCandidates[] = $p;
                }
            }

            if (! empty($winnerCandidates)) {
                $winner = null;

                if (count($winnerCandidates) === 1) {
                    $winner = $winnerCandidates[0];
                } else {
                    // Tie-breaker: Player with the FEWEST purchased cards wins
                    // If still tied, it's a shared victory (we'll just pick the first one)
                    usort($winnerCandidates, fn ($a, $b) => count($a['purchased_cards']) <=> count($b['purchased_cards']));
                    $winner = $winnerCandidates[0];
                }

                $state['log'][] = "🏆 THE RIVALRY IS OVER! Captain '{$winner['name']}' rules the Seven Seas with {$winner['points']} Infamy Points!";

                $game->forceFill([
                    'status' => 'finished',
                    'winner_id' => $winner['user_id'],
                    'board_state' => $state,
                ])->save();

                return;
            }
        }

        $game->forceFill([
            'current_player_index' => $nextIndex,
            'board_state' => $state,
        ])->save();
    }

    /**
     * Forfeit / Surrender the game.
     */
    public function forfeitGame(Game $game, User $user): void
    {
        if ($game->status !== 'playing') {
            throw new \Exception('The voyage is not active.');
        }

        $state = $game->board_state;
        $playerId = $user->id;

        if (! isset($state['players'][$playerId])) {
            throw new \Exception('Ye are not part of this crew.');
        }

        $surrenderingPlayer = $state['players'][$playerId];

        // Find other players
        $otherPlayers = [];
        foreach ($state['players'] as $id => $p) {
            if ($id != $playerId) {
                $otherPlayers[] = $p;
            }
        }

        if (empty($otherPlayers)) {
            // No other players, just finish game with creator
            $winnerId = $game->creator_id;
            $winnerName = $state['players'][$winnerId]['name'] ?? 'Unknown';
        } else {
            // Find the player with the highest points among the remaining players
            usort($otherPlayers, function ($a, $b) {
                if ($a['points'] === $b['points']) {
                    return count($a['purchased_cards']) <=> count($b['purchased_cards']); // Tie-breaker: fewer cards
                }

                return $b['points'] <=> $a['points']; // Highest points first
            });
            $winner = $otherPlayers[0];
            $winnerId = $winner['user_id'];
            $winnerName = $winner['name'];
        }

        $state['log'][] = "🏳️ Captain '{$surrenderingPlayer['name']}' has surrendered and fled the voyage! Captain '{$winnerName}' claims victory!";

        $game->forceFill([
            'status' => 'finished',
            'winner_id' => $winnerId,
            'board_state' => $state,
        ])->save();
    }

    /**
     * Action: Roll the die in Snakes and Ladders.
     */
    public function rollDie(Game $game, User $user, ?int $clientRoll = null): void
    {
        $this->validateTurn($game, $user);
        $state = $game->board_state;
        $playerId = $user->id;
        $player = &$state['players'][$playerId];

        // Roll a 6-sided die (respect clientRoll if valid to ensure animation and logic match exactly)
        if ($clientRoll !== null && $clientRoll >= 1 && $clientRoll <= 6) {
            $roll = $clientRoll;
        } else {
            $roll = rand(1, 6);
        }
        $oldPosition = $player['position'];
        $newPosition = $oldPosition + $roll;

        $logMsg = "🎲 Captain '{$player['name']}' rolled a {$roll} and moved from {$oldPosition} to ";

        if ($newPosition > 100) {
            // Bounce back
            $excess = $newPosition - 100;
            $newPosition = 100 - $excess;
            $logMsg .= "100, then bounced back to {$newPosition}.";
        } else {
            $logMsg .= "{$newPosition}.";
        }

        // Check for ladders (rigging ropes/anchors)
        // 2 -> 38, 7 -> 14, 8 -> 31, 15 -> 26, 21 -> 42, 28 -> 84, 36 -> 44, 51 -> 67, 71 -> 91, 78 -> 98, 87 -> 94
        $ladders = [
            2 => 38,
            7 => 14,
            8 => 31,
            15 => 26,
            21 => 42,
            28 => 84,
            36 => 44,
            51 => 67,
            71 => 91,
            78 => 98,
            87 => 94,
        ];

        // Check for snakes (sea serpents/whirlpools)
        // 16 -> 6, 46 -> 25, 49 -> 11, 62 -> 19, 64 -> 60, 74 -> 53, 89 -> 68, 92 -> 88, 95 -> 75, 99 -> 80
        $snakes = [
            16 => 6,
            46 => 25,
            49 => 11,
            62 => 19,
            64 => 60,
            74 => 53,
            89 => 68,
            92 => 88,
            95 => 75,
            99 => 80,
        ];

        $extraLog = '';
        if (isset($ladders[$newPosition])) {
            $upPosition = $ladders[$newPosition];
            $extraLog = " ⚓ scaled rigging ropes to {$upPosition}!";
            $newPosition = $upPosition;
        } elseif (isset($snakes[$newPosition])) {
            $downPosition = $snakes[$newPosition];
            $extraLog = " 🐉 got caught by a Sea Serpent and dragged down to {$downPosition}!";
            $newPosition = $downPosition;
        }

        $player['position'] = $newPosition;
        $state['log'][] = $logMsg.$extraLog;
        $state['last_roll'] = $roll;

        // Check victory
        if ($newPosition === 100) {
            $state['log'][] = "🏆 VICTORY! Captain '{$player['name']}' has successfully anchored at cell 100 and conquered the Sea of Serpents!";

            $game->forceFill([
                'status' => 'finished',
                'winner_id' => $playerId,
                'board_state' => $state,
            ])->save();

            return;
        }

        // Switch turn
        $players = array_values($state['players']);
        usort($players, fn ($a, $b) => $a['index'] <=> $b['index']);
        $playerCount = count($players);
        $nextIndex = ($game->current_player_index + 1) % $playerCount;

        $game->forceFill([
            'current_player_index' => $nextIndex,
            'board_state' => $state,
        ])->save();
    }
}
