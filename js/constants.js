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
    [UNIT_TYPES.INFANTRY]: {
        range: 150,
        damage: 10,
        hp: 50,
        moveSpeed: 1.5,
        fireRate: 800, // ms
        color: { [TEAM_RED]: '#FF4444', [TEAM_BLUE]: '#4488FF' },
        width: 25,
        height: 25
    },
    [UNIT_TYPES.TANK]: {
        range: 250,
        damage: 25,
        hp: 150,
        moveSpeed: 1.0,
        fireRate: 1500, // ms
        color: { [TEAM_RED]: '#AA2222', [TEAM_BLUE]: '#2266AA' },
        width: 50,
        height: 35
    },
    [UNIT_TYPES.ARTILLERY]: {
        range: 450,
        damage: 60,
        hp: 40,
        moveSpeed: 0.5,
        fireRate: 3000, // ms
        color: { [TEAM_RED]: '#880000', [TEAM_BLUE]: '#004488' },
        width: 35,
        height: 35
    }
};

const UNIT_COSTS = {
    [UNIT_TYPES.INFANTRY]: 15,
    [UNIT_TYPES.TANK]: 100,
    [UNIT_TYPES.ARTILLERY]: 250
};

const BASE_STATS = {
    HP: 1000,
    WIDTH: 100,
    HEIGHT: 150,
    COLOR: {
        [TEAM_RED]: '#880000',
        [TEAM_BLUE]: '#004488'
    },
    HEIGHT: 150,
    COLOR: {
        [TEAM_RED]: '#880000',
        [TEAM_BLUE]: '#004488'
    },
    Y_POSITION: 400 // Ground level approximation
};

const TURRET_STATS = {
    RANGE: 375, // +25% from 300
    DAMAGE: 30,
    FIRE_RATE: 1000,
    COLOR: { [TEAM_RED]: '#AA4444', [TEAM_BLUE]: '#4444AA' },
    WIDTH: 20,
    HEIGHT: 20
};

const TURRET_COST = 200;

