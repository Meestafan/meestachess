# Simple AutoBattler - GitHub Copilot Instructions

## Project Goal

Build a playable web-based auto battler inspired by games like Teamfight Tactics, Dota Auto Chess, and Hearthstone Battlegrounds.

This is a **Proof of Concept (PoC)**.

The primary objective is to create a fun, playable demo as quickly as possible while keeping the code organized enough that it can later evolve into a production-quality engine.

Do **not** prematurely optimize for enterprise architecture.

Favor simplicity, readability, and iterative development.

---

# Tech Stack

Frontend

* Angular
* TypeScript
* SCSS

Backend

* NestJS
* TypeScript
* WebSockets (later)

Shared Game Logic

* Pure TypeScript
* No Angular dependencies
* No browser APIs
* Shared between frontend and backend

---

# Guiding Principles

1. Deliver working software first.
2. Keep files small and focused.
3. Avoid unnecessary abstractions.
4. Only introduce complexity when it solves an actual problem.
5. Every feature should leave the game in a playable state.
6. Refactoring is expected as the project grows.

---

# Development Roadmap

## Phase 1 - Playable Prototype

The first milestone is a playable demo.

Features:

* 8x8 board
* Place units
* Start battle
* Units move automatically
* Units attack automatically
* Units die
* Winning team declared

No economy.

No networking.

No abilities.

No traits.

No animations beyond simple movement.

No persistence.

The demo should be playable with colored squares representing units.

---

## Phase 2

After the prototype is playable:

* Shop
* Bench
* Gold
* Interest
* Rounds
* Win/Loss streaks

---

## Phase 3

* Abilities
* Mana
* Traits
* Synergies
* Items

---

## Phase 4

* Multiplayer
* Matchmaking
* Replay system
* Save games
* Spectator mode

---

# Architecture

The project should remain layered.

Angular UI

↓

Application Services

↓

Game Engine

The game engine must not reference Angular.

The UI renders engine state.

---

# Engine Design

For the prototype, prefer simple classes over elaborate patterns.

Examples:

* Board
* Tile
* Unit
* Game
* Simulation

Avoid overengineering.

Introduce additional abstractions only when needed.

---

# Simulation

The simulation runs in fixed ticks.

Each tick:

1. Find targets
2. Move units
3. Attack
4. Remove dead units
5. Check victory

Simulation should remain deterministic.

---

# Rendering

Angular is responsible only for rendering.

Do not place game logic inside Angular components.

---

# Code Style

* Strict TypeScript
* Small methods
* Descriptive names
* Avoid `any`
* Prefer composition
* Favor readability over cleverness

---

# Copilot Behavior

When generating code:

* Finish one subsystem completely before starting another.
* Prefer working implementations over placeholders.
* Avoid generating unused abstractions.
* If multiple solutions exist, choose the simplest one that satisfies the current milestone.
* Do not implement future features until requested.
* Assume the project will be refactored after the playable prototype is complete.
