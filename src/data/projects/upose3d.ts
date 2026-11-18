// Data for the UPose3D project page. Numbers are copied from the paper's
// tables (arXiv:2404.14634v3, ECCV 2024); errors are in millimetres.

export const authors = [
  { name: 'Vandad Davoodnia', url: 'https://vdavoodnia.github.io/', note: 'Queen’s University, Ubisoft La Forge' },
  { name: 'Saeed Ghorbani', note: 'Ubisoft La Forge' },
  { name: 'Marc-André Carbonneau', note: 'Ubisoft La Forge' },
  { name: 'Alexandre Messier', note: 'Ubisoft La Forge' },
  { name: 'Ali Etemad', note: 'Queen’s University' },
];

export interface BarRow {
  label: string;
  value: number;
  group?: string;
  ours?: boolean;
  detail?: string; // shown in the tooltip and table
}

/** Table 1: Human3.6M, in distribution, MPJPE. Rows without an MPJPE are left out. */
export const inDistribution: BarRow[] = [
  { group: 'Trained with 3D labels', label: 'TesseTrack', value: 18.7, detail: 'HRNet, 5 frames' },
  { group: 'Trained with 3D labels', label: 'AdaFuse', value: 19.5, detail: 'ResNet152, 1 frame' },
  { group: 'Trained with 3D labels', label: 'Learnable Triangulation', value: 20.7, detail: 'ResNet152, 1 frame' },
  { group: 'Trained with 3D labels', label: 'Canonical Fusion', value: 21.0, detail: 'ResNet152, 1 frame' },
  { group: 'Trained with 3D labels', label: 'MTF-Transformer+ (27 frames)', value: 25.8, detail: 'CPN, 27 frames' },
  { group: 'Trained with 3D labels', label: 'MTF-Transformer+ (1 frame)', value: 26.5, detail: 'CPN, 1 frame' },
  { group: 'Trained with 3D labels', label: 'Jiang et al.', value: 27.8, detail: 'ResNet152, 1 frame, uncalibrated cameras' },
  { group: 'Trained with 3D labels', label: 'Flex', value: 30.2, detail: 'ResNet152, all frames, uncalibrated cameras' },
  { group: 'Trained with 2D labels only', label: 'UPose3D (CPN, 27 frames)', value: 26.4, ours: true, detail: 'CPN, 27 frames' },
  { group: 'Trained with 2D labels only', label: 'UPose3D (CPN, 1 frame)', value: 26.9, ours: true, detail: 'CPN, 1 frame' },
  { group: 'Trained with 2D labels only', label: 'UPose3D (ResNet152, 27 frames)', value: 29.9, ours: true, detail: 'ResNet152, 27 frames' },
  { group: 'Trained with 2D labels only', label: 'DLT (CPN)', value: 30.5, detail: 'CPN, 1 frame' },
  { group: 'Trained with 2D labels only', label: 'UPose3D (ResNet152, 1 frame)', value: 31.0, ours: true, detail: 'ResNet152, 1 frame' },
  { group: 'Trained with 2D labels only', label: 'DLT (ResNet152)', value: 36.3, detail: 'ResNet152, 1 frame' },
  { group: 'Trained with 2D labels only', label: 'EpipolarPose', value: 55.08, detail: 'ResNet50, 1 frame' },
  { group: '2D labels + camera parameters in training', label: 'Epipolar Transformers', value: 19.0, detail: 'ResNet152, 1 frame' },
  { group: '2D labels + camera parameters in training', label: 'TransFusion', value: 25.8, detail: 'ResNet50, 1 frame' },
  { group: '2D labels + camera parameters in training', label: 'TR Loss', value: 25.8, detail: 'HRNet, 1 frame; uses 1% of unlabelled test data in training' },
  { group: '2D labels + camera parameters in training', label: 'UPose3D (CPN, 27 frames)', value: 26.2, ours: true, detail: 'CPN, 27 frames' },
  { group: '2D labels + camera parameters in training', label: 'Cross-view Fusion', value: 26.2, detail: 'ResNet152, 1 frame' },
  { group: '2D labels + camera parameters in training', label: 'UPose3D (ResNet50, from scratch)', value: 57.3, ours: true, detail: 'ResNet50, 27 frames, trained from scratch with no extra data' },
  { group: '2D labels + camera parameters in training', label: 'DLT (ResNet50, from scratch)', value: 71.2, detail: 'ResNet50, 1 frame, trained from scratch with no extra data' },
];

/** Table 2: RICH, out of distribution, MPJPE. Training sources are (2D estimator, pose compiler). */
export const outOfDistribution: BarRow[] = [
  { label: 'UPose3D (27 frames)', value: 34.7, ours: true, detail: 'Trained on COCO (2D) and AMASS (pose compiler)' },
  { label: 'UPose3D (1 frame)', value: 36.2, ours: true, detail: 'Trained on COCO (2D) and AMASS (pose compiler)' },
  { label: 'UPose3D (1 frame, Human3.6M 2D)', value: 49.9, ours: true, detail: 'Trained on Human3.6M + MPII (2D) and AMASS (pose compiler)' },
  { label: 'UPose3D (27 frames, Human3.6M only)', value: 51.8, ours: true, detail: 'Trained on Human3.6M + MPII (2D) and Human3.6M (pose compiler)' },
  { label: 'HRNet-W48 + grid search', value: 64.4, detail: 'Trained on COCO; triangulation by grid search' },
  { label: 'HRNet-W48 + DLT', value: 66.0, detail: 'Trained on COCO; plain triangulation' },
  { label: 'AdaFuse', value: 524.0, detail: 'Trained on Human3.6M + MPII and Human3.6M' },
];

/** Table 3: ablations on Human3.6M with a 27-frame window, MPJPE. */
export const ablations: BarRow[] = [
  { label: 'UPose3D', value: 26.42, ours: true, detail: 'The full method' },
  { label: 'Without the image uncertainty', value: 27.61, detail: 'Uncertainty from the 2D estimator removed' },
  { label: 'Without the compiler uncertainty', value: 26.42, detail: 'Same MPJPE; PA-MPJPE rises from 23.42 to 23.58' },
  { label: 'Without the pose compiler', value: 37.14, detail: 'Only the 2D estimator’s keypoints' },
  { label: 'Without any uncertainty', value: 48.11, detail: 'Both branches, plain triangulation' },
  { label: 'Without the image branch', value: 69.9, detail: 'Only the pose compiler’s keypoints' },
  { label: 'No uncertainty, no compiler', value: 30.48, detail: 'Image keypoints only, plain triangulation: the same as DLT' },
  { label: 'No uncertainty, no image branch', value: 77.25, detail: 'Compiler keypoints only, plain triangulation' },
];

/** Table 4: computation cost (single frame). */
export const compute = [
  { label: 'UPose3D', params: 65.4, cams4: 208.7, cams10: 517.7, ours: true },
  { label: 'Epipolar Transformers', params: 68.1, cams4: 406.5, cams10: 1016.2 },
  { label: 'MTF-Transformers', params: 78.6, cams4: 407.0, cams10: 1017.8 },
  { label: 'AdaFuse', params: 69.7, cams4: 595.0, cams10: 1487.6 },
  { label: 'Learnable Triangulation', params: 80.6, cams4: 716.1, cams10: 1326.9 },
];

export const bibtex = `@misc{davoodnia2024upose3d,
  title         = {UPose3D: Uncertainty-Aware 3D Human Pose Estimation with Cross-View and Temporal Cues},
  author        = {Vandad Davoodnia and Saeed Ghorbani and Marc-André Carbonneau and Alexandre Messier and Ali Etemad},
  year          = {2024},
  eprint        = {2404.14634},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CV},
  url           = {https://arxiv.org/abs/2404.14634}
}`;
