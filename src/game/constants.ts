export const CANVAS_W = 960;
export const CANVAS_H = 540;

export const ROAD_Y = 180;
export const ROAD_H = 280;
export const LANE_H = ROAD_H / 4;
export const LANES = [ROAD_Y + 20, ROAD_Y + LANE_H + 10, ROAD_Y + LANE_H * 2, ROAD_Y + LANE_H * 3 - 10];

export const PLAYER_W = 60;
export const PLAYER_H = 30;
export const PLAYER_START_X = 80;
export const PLAYER_MIN_X = 20;
export const PLAYER_MAX_X = CANVAS_W - PLAYER_W - 20;
export const PLAYER_MIN_Y = ROAD_Y + 5;
export const PLAYER_MAX_Y = ROAD_Y + ROAD_H - PLAYER_H - 5;
export const PLAYER_SPEED = 3;
export const PLAYER_FRICTION = 0.85;
export const HITBOX_INSET_X = 4;
export const HITBOX_INSET_Y = 3;

export const TOUCH_GAIN = 1.2;
export const TOUCH_FOLLOW = 0.3;
export const TOUCH_MAX_SPEED = 4.5;

export const BASE_SPEED = 1.5;
export const MIN_SPEED = 1;
/** Every `LEVEL_METERS` the level goes up: faster, more traffic, and one more police car every two levels. */
export const LEVEL_METERS = 2500;
export const SPEED_PER_LEVEL = 0.4;
export const MAX_LEVEL = 10;
export const LEVEL_BANNER_FRAMES = 120;
export const SLOWDOWN_PER_CARTON = 0.3;

export const MAX_TOBACCO = 8;
export const SLOW_THRESHOLD = 4;
export const CARTON_SIZE = 20;
export const METERS_PER_CARTON = 150;

export const DROP_OFF_W = 50;
export const DROP_OFF_REACH = 40;
export const DROP_OFF_EVERY = 300;

export const POLICE_W = 55;
export const POLICE_H = 28;
export const POLICE_CHASE_FRAMES = 600;
export const POLICE_CHANCE = 0.15;
/** How far ahead the police looks for trucks and cones, and how fast it swerves around them. */
export const POLICE_LOOKAHEAD = 140;
export const POLICE_DODGE_SPEED = 2.2;
export const POLICE_DODGE_MARGIN = 6;
/** Chance the police doesn't see an obstacle in time and crashes into it. */
export const POLICE_MISS_CHANCE = 0.2;
export const TRUCK_W = 70;
export const TRUCK_H = 32;
export const TRUCK_CHANCE = 0.5;
export const CONE_SIZE = 20;

export const QUOTE_FRAMES = 120;
export const CRASH_FRAMES = 50;
export const POPUP_FRAMES = 50;
export const EXHAUST_EVERY = 5;
export const DRAG_HINT_FRAMES = 180;
