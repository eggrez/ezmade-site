export type SceneRange = {
  enterStart: number;
  enterEnd: number;
  holdEnd: number;
  exitEnd: number;
};

export type ScenePreset = {
  enterY: number;
  exitY: number;
  enterScale: number;
  exitScale: number;
  enterBlur: number;
  exitBlur: number;
};

export type HomeTimeline = {
  hero: SceneRange;
  what: SceneRange;
  featured: SceneRange;
  about: SceneRange;
  contact: SceneRange;
};

export const HOME_EXPERIENCE_HEIGHT = 760;

export const defaultScenePreset: ScenePreset = {
  enterY: 40,
  exitY: -24,
  enterScale: 0.99,
  exitScale: 1.008,
  enterBlur: 8,
  exitBlur: 6,
};

export const homeTimeline: HomeTimeline = {
  hero: {
    enterStart: 0,
    enterEnd: 0,
    holdEnd: 0.17,
    exitEnd: 0.27,
  },

  what: {
    enterStart: 0.16,
    enterEnd: 0.255,
    holdEnd: 0.30,
    exitEnd: 0.43,
  },

  featured: {
  enterStart: 0.39,
  enterEnd: 0.52,
  holdEnd: 0.64,
  exitEnd: 0.76,
},

  about: {
    enterStart: 0.755,
    enterEnd: 0.83,
    holdEnd: 0.88,
    exitEnd: 0.925,
  },

  contact: {
    enterStart: 0.92,
    enterEnd: 1,
    holdEnd: 1,
    exitEnd: 1,
  },
};