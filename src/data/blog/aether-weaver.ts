// Data for the Aether Weaver post. Everything here is taken from the paper
// (arXiv:2507.21893) and its supplementary material, except the one scene-graph
// update marked `illustration`, which the post labels as hand-written.

export type Level = 'Low' | 'Medium' | 'High';

export interface ArcStage {
  name: string;
  start: number; // story progress (0-1) at which the stage begins
  goal: string;
  cues: [string, Level][];
  keywords: string[];
}

/** The Classic Arc, as listed in the paper's supplementary material. */
export const classicArc: ArcStage[] = [
  {
    name: 'Exposition',
    start: 0,
    goal: 'Introduce the main character(s), setting, and initial status quo.',
    cues: [['Peacefulness', 'Medium'], ['Curiosity', 'Low']],
    keywords: [],
  },
  {
    name: 'Rising Action',
    start: 0.25,
    goal: 'Develop conflicts, introduce obstacles, and build tension towards the climax. Protagonist faces escalating challenges.',
    cues: [['Suspense', 'High'], ['Tension', 'High'], ['Hope', 'Medium']],
    keywords: ['struggle', 'fight', 'discovery', 'obstacle', 'plan', 'train'],
  },
  {
    name: 'Climax',
    start: 0.65,
    goal: 'Reach the peak of conflict and tension; the protagonist faces their greatest challenge and makes a decisive choice or action.',
    cues: [['Tension', 'High'], ['Fear', 'Medium'], ['Hope', 'Low']],
    keywords: ['final confrontation', 'decisive action', 'all or nothing', 'showdown', 'turning point', 'revelation'],
  },
  {
    name: 'Falling Action',
    start: 0.8,
    goal: 'Show the immediate aftermath of the climax. Conflicts begin to resolve, tension decreases.',
    cues: [['Sadness', 'Low'], ['Peacefulness', 'Medium']],
    keywords: ['aftermath', 'consequences', 'healing', 'return', 'winding down'],
  },
  {
    name: 'Resolution',
    start: 0.9,
    goal: 'Tie up loose ends. The new status quo is established. Character arcs conclude.',
    cues: [['Peacefulness', 'High'], ['Hope', 'Medium']],
    keywords: ['resolved', 'new normal', 'ends', 'future', 'legacy'],
  },
];

/** The Affective Tone Mapper's knowledge-base entry for one tone. */
export const mystery = {
  tone: 'Mystery',
  summary: 'Evokes intrigue, curiosity, unknown, hidden truths.',
  modifiers: [
    'Focus on secrets, puzzles, and hidden truths. Introduce unanswered questions and obscured details.',
    'Describe enigmatic characters and subtle, confusing clues. Build anticipation without full revelation.',
    'Use evocative, atmospheric, and suggestive language. Employ fragmented sentences or rhetorical questions.',
  ],
  sound: 'Subtle, low-frequency drones; unsettling, barely audible hums. Distant, unresolved musical phrases. Isolated, unidentifiable creaks or whispers.',
  visual: 'Dominant low-key lighting with deep, sprawling shadows. Obscured areas featuring mist, fog, or heavy rain. Frame shots with partially hidden objects or figures. Use slightly off-kilter or Dutch angles.',
  levels: {
    Low: { words: ['curious', 'peculiar', 'subtle hint'], sound: ['soft hum', 'distant rustle'], visual: ['subtle shadows', 'selective focus'] },
    Medium: { words: ['enigmatic', 'unexplained', 'hidden', 'clues'], sound: ['eerie silence', 'unresolved chime', 'muffled whispers'], visual: ['obscured figures', 'moody lighting', 'half-glimpsed objects'] },
    High: { words: ['unfathomable', 'cryptic', 'dark truth', 'abyss'], sound: ['rising dissonant drones', 'piercing stings', 'fragmented whispers'], visual: ['impenetrable fog', 'silhouetted forms', 'extreme close-ups on obscured details'] },
  } as Record<Level, { words: string[]; sound: string[]; visual: string[] }>,
};

export type NodeKind = 'location' | 'character' | 'object' | 'event';

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  attrs: [string, string][];
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

/** The scene graph the Director produced for scene 1 of the Elara story (supplementary material). */
export const scene1 = {
  nodes: [
    { id: 'woods', label: 'Whispering Woods', kind: 'location', attrs: [['spatial description', 'deep within, ancient trees, bioluminescent flora']] },
    { id: 'shrine', label: 'Forgotten Shrine', kind: 'location', attrs: [['spatial description', 'hidden in the eastern groves'], ['contains relic', 'true'], ['relic power', 'immense']] },
    { id: 'elara', label: 'Elara', kind: 'character', attrs: [['mood', 'wonder and determination'], ['current location', 'Elderwood']] },
    { id: 'elderwood', label: 'Elderwood', kind: 'object', attrs: [['description', 'colossal, gnarled roots, breathtaking luminescence'], ['has spirit', 'true']] },
    { id: 'revelation', label: 'Spirit Revelation', kind: 'event', attrs: [['participants', 'Elara, Elderwood'], ['outcome', 'Spirit revealed growing blight and the existence/location of a powerful relic in a forgotten shrine.']] },
  ] as GraphNode[],
  edges: [
    { from: 'elara', to: 'elderwood', label: 'IS AT' },
    { from: 'elderwood', to: 'woods', label: 'INSIDE' },
    { from: 'shrine', to: 'woods', label: 'INSIDE' },
  ] as GraphEdge[],
};

/** A hand-written next sentence, and the updates the Director's rules call for. */
export const illustration = {
  sentence: 'Elara thanked the spirit and set off east, towards the Forgotten Shrine.',
  removed: { from: 'elara', to: 'elderwood', label: 'IS AT' } as GraphEdge,
  added: { from: 'elara', to: 'shrine', label: 'IS AT' } as GraphEdge,
  attr: ['elara', 'current location', 'Elderwood', 'Forgotten Shrine'] as const,
};

/** Table 1 of the paper: mean expert rating (1-5 Likert), 10 prompts, 10 raters. */
export const results = [
  { metric: 'Narrative fluency', aw: 4.62, base: 4.21 },
  { metric: 'Visual coherence', aw: 4.23, base: 2.85 },
  { metric: 'Auditory coherence', aw: 4.76, base: 4.1 },
  { metric: 'Affective alignment', aw: 4.67, base: 3.28 },
  { metric: 'Narrative arc adherence', aw: 4.3, base: 3.45 },
];
