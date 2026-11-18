// Talks and features: shown in the home page's Talks section and in the CV's
// "Talks and Featured Works" (src/data/cv.ts builds that section from this list).
export interface Talk {
  kind: 'talk' | 'feature';
  title: string;
  venue: string; // as it appears on the CV
  year?: string;
  links?: { label: string; url: string }[];
}

export const talks: Talk[] = [
  {
    kind: 'talk',
    title: 'ZeroEGGS, Zero-shot Example-based Gesture Generation from Speech',
    venue: 'SIGGRAPH ASIA, Daegu, Korea',
    year: '2022',
    links: [{ label: 'Session', url: 'https://sa2022.siggraph.org/en/presentation/?id=gp_132&sess=sess279' }],
  },
  { kind: 'talk', title: 'Generating Animation from Speech', venue: 'UDC, Montreal, Canada', year: '2022' },
  { kind: 'talk', title: 'Using Machine Learning in Character Animation', venue: 'CVR-VISTA Conference, Toronto, Canada', year: '2022' },
  { kind: 'talk', title: 'Simultaneous Localization and Mapping Using Active Vision', venue: 'York University, Canada', year: '2018' },
  { kind: 'talk', title: 'Probabilistic Vision-based Localization', venue: 'University of Wollongong, Australia', year: '2017' },
  {
    kind: 'feature',
    title: 'Ubisoft’s New AI, Breathing Life Into Games!',
    venue: 'Two Minute Papers Channel',
    links: [{ label: 'Video', url: 'https://www.youtube.com/watch?v=Dt0cA2phKfU' }],
  },
  { kind: 'feature', title: 'Auto-labelling of Markers in Motion Capture', venue: 'Vista News' },
  { kind: 'feature', title: 'MoVi, A Large Multi-Purpose Motion and Video Dataset', venue: 'Vista News' },
];
