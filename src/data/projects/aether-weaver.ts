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

/**
 * The same scene-1 graph exactly as printed in the paper's supplementary
 * material: node ids, raw attributes (Elara's location is stored as the
 * Elderwood's id), edge ids, and the event's participants.
 */
export const scene1Raw = {
  scene: 1,
  ids: { woods: '729e017b', shrine: 'afe85846', elara: 'de1cf932', elderwood: 'cdbd9338', revelation: '26117842' } as Record<string, string>,
  attrs: {
    woods: [['spatial description', 'deep within, ancient trees, bioluminescent flora']],
    shrine: [['spatial description', 'hidden in the eastern groves'], ['contains relic', 'true'], ['relic power', 'immense']],
    elara: [['mood', 'wonder and determination'], ['current location id', 'cdbd9338-23a7-43e9-9623-937ba7a923d2']],
    elderwood: [['description', 'colossal, gnarled roots, breathtaking luminescence'], ['has spirit', 'true']],
    revelation: [['outcome', 'Spirit revealed growing blight and the existence/location of a powerful relic in a forgotten shrine.']],
  } as Record<string, [string, string][]>,
  edges: [
    { from: 'elara', to: 'elderwood', label: 'IS AT', id: '625524a2' },
    { from: 'elderwood', to: 'woods', label: 'INSIDE', id: 'aca05c17' },
    { from: 'shrine', to: 'woods', label: 'INSIDE', id: '7ea31f73' },
  ],
  participants: { revelation: ['elara', 'elderwood'] } as Record<string, string[]>,
};

/** One state of the dynamic scene graph, and what the Director did to reach it. */
export interface GraphStep {
  key: string;
  tab: string;
  source: 'paper' | 'illustration';
  sentence?: string;
  elaraAt: 'elderwood' | 'shrine';
  edges: GraphEdge[]; // the graph's edges after this step
  fresh?: GraphEdge; // an edge added in this step
  rejected?: GraphEdge; // an edge the Director refused to add
  attrs?: Record<string, Record<string, string>>; // attribute changes, by node id
  log: [string, string][]; // pipeline stage -> what it found
  verdict?: { ok: boolean; text: string };
}

const atShrine: GraphEdge = { from: 'elara', to: 'shrine', label: 'IS AT' };
const afterMove = [atShrine, ...scene1.edges.filter((e) => e.from !== 'elara')];
const movedAttrs = { elara: { 'current location': 'Forgotten Shrine' } };

/**
 * Scene 1 is the paper's graph. The two sentences after it are hand-written
 * illustrations (labelled as such in the post), with the updates the Director's
 * rules call for: an accepted move, and a teleport it flags.
 */
export const graphSteps: GraphStep[] = [
  {
    key: 'scene1',
    tab: 'Scene 1 (from the paper)',
    source: 'paper',
    elaraAt: 'elderwood',
    edges: scene1.edges,
    log: [
      ['Nodes', 'Whispering Woods and Forgotten Shrine (locations), Elara (character), Elderwood (key object), Spirit Revelation (event)'],
      ['Edges', 'Elara IS AT Elderwood; Elderwood INSIDE Whispering Woods; Forgotten Shrine INSIDE Whispering Woods'],
    ],
  },
  {
    key: 'move',
    tab: 'Next: she moves',
    source: 'illustration',
    sentence: 'Elara thanked the spirit and set off east, towards the Forgotten Shrine.',
    elaraAt: 'shrine',
    edges: afterMove,
    fresh: atShrine,
    attrs: movedAttrs,
    log: [
      ['Entities', 'Elara (character), the spirit → Elderwood (key object), Forgotten Shrine (location). All already in the graph.'],
      ['Relations', 'Elara moves to the Forgotten Shrine'],
      ['Attributes', 'Elara.current location: Elderwood → Forgotten Shrine'],
      ['Spatial', 'The shrine is inside the Whispering Woods, so Elara is still in the woods'],
      ['Update', '− Elara IS AT Elderwood   + Elara IS AT Forgotten Shrine'],
    ],
    verdict: { ok: true, text: 'Consistent: the move is described in the text, so the update is applied.' },
  },
  {
    key: 'teleport',
    tab: 'Next: a continuity error',
    source: 'illustration',
    sentence: 'Elara sat down beneath the Elderwood’s roots to rest.',
    elaraAt: 'shrine',
    edges: afterMove,
    rejected: { from: 'elara', to: 'elderwood', label: 'IS AT' },
    attrs: movedAttrs,
    log: [
      ['Entities', 'Elara (character), Elderwood (key object)'],
      ['Relations', 'Elara IS AT Elderwood'],
      ['Attributes', 'None'],
      ['Spatial', 'The graph has Elara at the Forgotten Shrine, and nothing in this segment takes her back'],
      ['Update', 'None: the new edge is rejected'],
    ],
    verdict: {
      ok: false,
      text: 'Inconsistent: Elara would teleport. Flagged, with a corrective prompt back to the Narrator: “Elara is at the Forgotten Shrine. Either describe her journey back to the Elderwood, or set this scene at the shrine.”',
    },
  },
];

/** Table 1 of the paper: mean expert rating (1-5 Likert), 10 prompts, 10 raters. */
export const results = [
  { metric: 'Narrative fluency', aw: 4.62, base: 4.21 },
  { metric: 'Visual coherence', aw: 4.23, base: 2.85 },
  { metric: 'Auditory coherence', aw: 4.76, base: 4.1 },
  { metric: 'Affective alignment', aw: 4.67, base: 3.28 },
  { metric: 'Narrative arc adherence', aw: 4.3, base: 3.45 },
];
