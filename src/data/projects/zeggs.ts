// Data for the ZeroEGGS project page. Paper numbers are copied from Ghorbani et al., Computer Graphics Forum 42(1),
// 2023 (arXiv:2209.07556v2); the table each comes from is named. Numbers measured on the released models and data
// are in zeggs-measured.json, written by scripts/zeggs/make_page_data.py.
import measured from './zeggs-measured.json';

export { measured };

export const paperUrl = 'https://doi.org/10.1111/cgf.14734';
export const arxivUrl = 'https://arxiv.org/abs/2209.07556';
export const codeUrl = 'https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS';

export const authors = [
  { name: 'Saeed Ghorbani' },
  { name: 'Ylva Ferstl' },
  { name: 'Daniel Holden' },
  { name: 'Nikolaus F. Troje' },
  { name: 'Marc-André Carbonneau' },
];

/** Table 1: minutes of motion capture per style. "Oration" takes are named "Speech" in the dataset's files. */
export const datasetMinutes: { style: string; minutes: number }[] = [
  { style: 'Agreement', minutes: 5.25 },
  { style: 'Angry', minutes: 7.95 },
  { style: 'Disagreement', minutes: 5.33 },
  { style: 'Distracted', minutes: 5.29 },
  { style: 'Flirty', minutes: 3.27 },
  { style: 'Happy', minutes: 10.08 },
  { style: 'Laughing', minutes: 3.85 },
  { style: 'Oration', minutes: 3.98 },
  { style: 'Neutral', minutes: 11.13 },
  { style: 'Old', minutes: 11.37 },
  { style: 'Pensive', minutes: 6.21 },
  { style: 'Relaxed', minutes: 10.81 },
  { style: 'Sad', minutes: 11.8 },
  { style: 'Sarcastic', minutes: 6.52 },
  { style: 'Scared', minutes: 5.58 },
  { style: 'Sneaky', minutes: 6.27 },
  { style: 'Still', minutes: 5.33 },
  { style: 'Threatening', minutes: 5.84 },
  { style: 'Tired', minutes: 7.13 },
];
export const datasetTotalMinutes = 134.65;

export type Measure = 'Naturalness' | 'Appropriateness' | 'Style';
export interface StudyRow { measure: Measure; dataset: 'ZEGGS' | 'TSG'; zeggs: [number, number]; moglow: [number, number] }
/** Table 2: mean ± standard deviation of the MUSHRA-like ratings (0 to 100). */
export const study: StudyRow[] = [
  { measure: 'Naturalness', dataset: 'ZEGGS', zeggs: [56.3, 22.2], moglow: [11.8, 12.2] },
  { measure: 'Appropriateness', dataset: 'ZEGGS', zeggs: [48.9, 20.3], moglow: [7.8, 9.6] },
  { measure: 'Style', dataset: 'ZEGGS', zeggs: [58.1, 25.9], moglow: [12.9, 16.1] },
  { measure: 'Naturalness', dataset: 'TSG', zeggs: [36.7, 18.4], moglow: [32.7, 21.0] },
  { measure: 'Appropriateness', dataset: 'TSG', zeggs: [38.3, 23.3], moglow: [32.2, 20.6] },
  { measure: 'Style', dataset: 'TSG', zeggs: [61.9, 23.3], moglow: [19.8, 18.0] },
];
/** Table 2: model size and inference time per frame. */
export const modelStats = { zeggs: { params: 25, ms: 4 }, moglow: { params: 86, paramsWithStyle: 88, ms: 29 } };

export const bibtex = `@article{ghorbani2022zeroeggs,
  author = {Ghorbani, Saeed and Ferstl, Ylva and Holden, Daniel and Troje, Nikolaus F. and Carbonneau, Marc-André},
  title = {ZeroEGGS: Zero-shot Example-based Gesture Generation from Speech},
  journal = {Computer Graphics Forum},
  volume = {42},
  number = {1},
  pages = {206-216},
  keywords = {animation, gestures, character control, motion capture},
  doi = {https://doi.org/10.1111/cgf.14734},
  url = {https://onlinelibrary.wiley.com/doi/abs/10.1111/cgf.14734},
  eprint = {https://onlinelibrary.wiley.com/doi/pdf/10.1111/cgf.14734},
  year = {2023}
}`;
