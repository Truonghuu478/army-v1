# Technology Stack

## Core
- **Language**: Vanilla JavaScript (ES6+).
- **Module System**: None (Script Tags). Relies on global scope and keys loading order in `index.html`.
- **Markup**: HTML5.
- **Styling**: Plain CSS.

## Rendering
- **HTML5 Canvas**: Logic in `js/Battlefield.js`. Renders `Unit` (`js/Unit.js`) and effects.

## Audio
- **Web Audio API**: Logic in `js/SoundManager.js`.

## Architecture
- **Object-Oriented**: Class-based separation.
- **Files**:
    - `js/constants.js`: Configuration.
    - `js/Game.js`: Controller / Game Loop.
    - `js/Battlefield.js`: View / Renderer.
