// Data for the "Probing Physics in Motion Diffusion Models" project page. Every number is copied from the paper
// (arXiv:2611.24423): its tables and the data behind its figures. Nothing here is estimated or recomputed.

export const bibtex = `@article{ghorbani2026probing,
  title   = {Probing Physics in Motion Diffusion Models Against Their Own Estimate},
  author  = {Ghorbani, Saeed},
  journal = {arXiv preprint arXiv:2611.24423},
  year    = {2026}
}`;

/** The step-through: one recorded 50-step MDM sample, "a person jumps forward" (the jump of Figure 8). */
export const jumpStages = [
  { key: 'start', label: 'start', name: 'the guess at the start', fallRate: null as number | null },
  { key: '20', label: '20%', name: 'the guess at 20% of the way', fallRate: 9.5 },
  { key: '40', label: '40%', name: 'the guess at 40% of the way', fallRate: 8.8 },
  { key: 'final', label: 'finished motion', name: 'the finished motion', fallRate: 8.5 },
];

export interface CompareRow {
  target: string;
  model: string;
  value: number;
  lo?: number; // 95% prompt-bootstrap interval, where the paper reports one
  hi?: number;
}

/**
 * The standard comparison at 20% of denoising (Table 2, mean over three seeds): the best layer's linear probe minus
 * the label computed from the model's own estimate ("explicit"). Positive: the layer looks better informed.
 */
const naive = [
  // target, model, best layer, explicit
  ['Dynamic balance', '50-step MDM', 0.838, 0.783],
  ['Dynamic balance', '1000-step MDM', 0.697, 0.655],
  ['Static balance', '50-step MDM', 0.759, 0.769],
  ['Static balance', '1000-step MDM', 0.560, 0.546],
  ['In flight', '50-step MDM', 0.973, 0.876],
  ['In flight', '1000-step MDM', 0.926, 0.788],
  ['Flight gravity', '50-step MDM', 0.820, 0.707],
  ['Flight gravity', '1000-step MDM', 0.692, 0.691],
] as const;
export const standardRows: CompareRow[] = naive.map(([target, model, layer, explicit]) => ({ target, model, value: layer - explicit }));

/**
 * The fair comparison at 20% of denoising (Figure 5b, seeds pooled, readouts tuned on held-out prompts): what adding
 * the layer to the tuned readout of the estimate gains, with the readout allowed to fall back to the estimate alone.
 */
export const fairRows: CompareRow[] = [
  { target: 'Dynamic balance', model: '50-step MDM', value: 0.0001, lo: -0.0006, hi: 0.0008 },
  { target: 'Dynamic balance', model: '1000-step MDM', value: -0.0025, lo: -0.005, hi: -0.0003 },
  { target: 'Dynamic balance', model: 'MotionDiffuse', value: 0.0, lo: 0.0, hi: 0.0 },
  { target: 'Static balance', model: '50-step MDM', value: -0.0012, lo: -0.004, hi: 0.0019 },
  { target: 'Static balance', model: '1000-step MDM', value: 0.0, lo: 0.0, hi: 0.0 },
  { target: 'Static balance', model: 'MotionDiffuse', value: 0.0, lo: 0.0, hi: 0.0 },
  { target: 'In flight', model: '50-step MDM', value: -0.0037, lo: -0.0083, hi: -0.0 },
  { target: 'In flight', model: '1000-step MDM', value: -0.0005, lo: -0.0026, hi: 0.0017 },
  { target: 'In flight', model: 'MotionDiffuse', value: -0.0043, lo: -0.009, hi: -0.0007 },
  { target: 'Floats or falls (jumps)', model: '50-step MDM', value: -0.0001, lo: -0.0087, hi: 0.0081 },
  { target: 'Floats or falls (jumps)', model: '1000-step MDM', value: 0.001, lo: -0.0014, hi: 0.0033 },
  { target: 'Floats or falls (jumps)', model: 'MotionDiffuse', value: 0.0007, lo: -0.0167, hi: 0.0168 },
  { target: 'Fall rate (jumps)', model: '50-step MDM', value: 0.0768, lo: 0.0507, hi: 0.1065 },
  { target: 'Fall rate (jumps)', model: '1000-step MDM', value: 0.0756, lo: 0.0533, hi: 0.0958 },
  { target: 'Fall rate (jumps)', model: 'MotionDiffuse', value: 0.0251, lo: 0.0035, hi: 0.0474 },
];

/** Figure 8b-d: R² for the final fall rate of jumps at each recorded step, tuned readouts, layer 5, seeds pooled. */
export const fallRate = {
  steps: [20, 40, 60, 80],
  models: [
    { name: '50-step MDM', estimate: [0.3514, 0.4743, 0.5804, 0.7433], both: [0.4282, 0.5172, 0.5985, 0.7483], gain: [0.0768, 0.0429, 0.0181, 0.005], gainLo: [0.0507, 0.0272, 0.0092, -0.0014], gainHi: [0.1065, 0.059, 0.0285, 0.0128] },
    { name: '1000-step MDM', estimate: [0.2875, 0.3779, 0.5045, 0.6323], both: [0.3631, 0.4208, 0.5124, 0.6379], gain: [0.0756, 0.0429, 0.0079, 0.0056], gainLo: [0.0533, 0.0224, -0.0025, -0.0034], gainHi: [0.0958, 0.0585, 0.0186, 0.0143] },
  ],
};

/**
 * Figure 10: delivered floating (% of motions) against compute (multiples of one full sample) as the retry budget grows
 * from 1 to 20 tries, with the final check kept. Each point: [compute, floating %, budget].
 */
export type Curve = [number, number, number][];
export const early: { name: string; filter: Curve; rule: Curve; oracle: Curve }[] = [
  { name: '50-step MDM', filter: [[1.0, 9.36, 1], [1.0945, 5.546, 2], [1.1501, 4.48, 3], [1.192, 3.936, 4], [1.2352, 3.758, 5], [1.2703, 3.53, 6], [1.3411, 3.306, 8], [1.4066, 3.082, 10], [1.4646, 2.972, 12], [1.5467, 2.756, 15], [1.6873, 2.62, 20]], rule: [[1.0, 9.36, 1], [1.0533, 5.668, 2], [1.083, 4.718, 3], [1.1049, 4.284, 4], [1.1253, 3.972, 5], [1.1418, 3.826, 6], [1.1759, 3.62, 8], [1.2034, 3.466, 10], [1.2309, 3.392, 12], [1.2738, 3.29, 15], [1.3334, 3.228, 20]], oracle: [[1.0, 9.36, 1], [1.0208, 5.546, 2], [1.033, 4.48, 3], [1.0422, 3.936, 4], [1.0517, 3.758, 5], [1.0595, 3.53, 6], [1.0751, 3.306, 8], [1.0895, 3.082, 10], [1.1022, 2.972, 12], [1.1203, 2.756, 15], [1.1512, 2.62, 20]] },
  { name: '1000-step MDM', filter: [[1.0, 17.686, 1], [1.1758, 9.416, 2], [1.2705, 6.774, 3], [1.3412, 5.418, 4], [1.3926, 4.59, 5], [1.4391, 4.198, 6], [1.5197, 3.636, 8], [1.5927, 3.406, 10], [1.6636, 3.26, 12], [1.7558, 3.078, 15], [1.9098, 2.958, 20]], rule: [[1.0, 17.686, 1], [1.1132, 10.018, 2], [1.1693, 7.294, 3], [1.2022, 6.064, 4], [1.2246, 5.198, 5], [1.2458, 4.776, 6], [1.2743, 4.224, 8], [1.3072, 4.026, 10], [1.3284, 3.88, 12], [1.3637, 3.716, 15], [1.4022, 3.618, 20]], oracle: [[1.0, 17.686, 1], [1.0353, 9.416, 2], [1.0544, 6.774, 3], [1.0686, 5.418, 4], [1.0789, 4.59, 5], [1.0883, 4.198, 6], [1.1045, 3.636, 8], [1.1191, 3.406, 10], [1.1334, 3.26, 12], [1.1519, 3.078, 15], [1.1829, 2.958, 20]] },
];
