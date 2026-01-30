---
description: Patterns for modifying and extending the game logic
---

# Game Logic Patterns

## Adding a New Unit Type
1.  **Define Constants**: In `js/constants.js`:
    - Add key to `UNIT_TYPES`.
    - Add stats to `UNIT_STATS` (range, damage, color, etc.).
2.  **Visuals**: In `js/Unit.js`, update `draw()` if specific custom drawing is needed (like the Tank turret).
3.  **Audio**: In `js/SoundManager.js`, update `playShoot()` to handle the new unit type's sound.

## Particle Effects
1.  **Create Class**: Add a new class (e.g., `Smoke`) in `js/Projectile.js` (or a separate file if complex).
2.  **Implementation**: Must have `update()` (manage life) and `draw(ctx)`.
3.  **Integration**: 
    - Add a list to `Battlefield` (e.g., `this.smokes = []`) in `js/Battlefield.js`.
    - Update `Battlefield.draw()` and `Battlefield.updateAnimations()` to loop through this list.

## Phase System
The game follows a turn-based structured phase system (`RED MOVE` -> `RED ATTACK` -> etc.).
- **Logic**: Managed in `js/Game.js` within `nextPhase()` and `executePhase()`.
- **State Prevention**: `processingPhase` flag prevents re-entrancy during async actions (like movement animations).
