# Coding Standards

## General
- **Indentation**: 4 spaces.
- **Naming**: 
    - Variables/functions: `camelCase`
    - Classes: `PascalCase`
    - Constants: `UPPER_SNAKE_CASE`
    - Files: `PascalCase.js` for classes (e.g., `Unit.js`), `camelCase.js` for utilities/main (e.g., `main.js`, `constants.js`).
- **Comments**: Use comments to separate major methods or sections.

## File Structure
- **Modularization**: Code is split into `js/` directory.
- **One Class Per File**: Generally, each major class gets its own file (e.g., `js/Unit.js`).
- **Globals**: `js/constants.js` contains global configuration. `js/main.js` is the entry point.
- **Dependency**: Since ES modules (`import`/`export`) are **not** used, be mindful of script loading order in `index.html`. Base classes and constants must load before dependent code.

## Game Architecture
- **Entities**: Visual elements (`Unit`, `Projectile`) implement `update()` and `draw(ctx)`.
- **State**: `Game` class (`js/Game.js`) controls state.
- **Rendering**: `Battlefield` class (`js/Battlefield.js`) manages the canvas and draw calls.
- **Audio**: `SoundManager` class (`js/SoundManager.js`).

## Best Practices
- **Performance**: Minimize object creation in the render loop.
- **Safety**: Ensure referenced classes are loaded.
