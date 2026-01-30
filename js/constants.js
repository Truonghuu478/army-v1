// --- CONSTANTS ---
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const TEAM_RED = 'RED';
const TEAM_BLUE = 'BLUE';

const UNIT_TYPES = {
    INFANTRY: 'infantry',
    TANK: 'tank',
    ARTILLERY: 'artillery'
};

const UNIT_STATS = {
    [UNIT_TYPES.INFANTRY]: { range: 150, damage: 15, hp: 50, move: 80, color: { [TEAM_RED]: '#FF4444', [TEAM_BLUE]: '#4488FF' }, width: 25, height: 25 },
    [UNIT_TYPES.TANK]: { range: 250, damage: 35, hp: 120, move: 60, color: { [TEAM_RED]: '#AA2222', [TEAM_BLUE]: '#2266AA' }, width: 50, height: 35 },
    [UNIT_TYPES.ARTILLERY]: { range: 400, damage: 50, hp: 40, move: 40, color: { [TEAM_RED]: '#880000', [TEAM_BLUE]: '#004488' }, width: 35, height: 35 }
};

const PHASES = {
    RED_MOVE: 'RED MOVE',
    RED_ATTACK: 'RED ATTACK',
    BLUE_MOVE: 'BLUE MOVE',
    BLUE_ATTACK: 'BLUE ATTACK'
};
