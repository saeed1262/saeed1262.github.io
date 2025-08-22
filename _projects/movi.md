---
layout: page
title: MoVi Dataset
description: A large multi-purpose human motion and video dataset with synchronized pose, body meshes, and video recordings
img: /assets/img/movi.png
importance: 1
category: work
related_publications: ghorbani2020movi
---

## Overview

MoVi is a comprehensive human motion and video dataset that provides synchronized pose, body meshes, and video recordings. The dataset enables research in human motion analysis, pose estimation, action recognition, and motion synthesis.

### Key Features

- Multi-modal data with synchronized motion capture, video, and IMU recordings
- 90 actors (60 female, 30 male) performing over 20 different actions
- Multiple camera viewpoints including handheld perspective
- Full-body pose estimation and shape deformation annotations
- Data captured under different clothing conditions

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        <img class="img-fluid rounded z-depth-1" src="{{ '/assets/img/publication_preview/demo.gif' | relative_url }}" alt="MoVi Dataset Examples" title="MoVi Dataset Examples"/>
    </div>
</div>
<div class="caption">
    Sample motion sequences from the MoVi dataset showing synchronized multi-modal data capture
</div>

---

## Dataset Statistics

| **Metric** | **Value** |
|------------|-----------|
| **Total Actors** | 90 (60F, 30M) |
| **Actions** | 20+ everyday and sports movements |
| **Motion Capture Data** | 9 hours |
| **Video Data** | 17 hours (4 viewpoints) |
| **IMU Data** | 6.6 hours |
| **Capture Rounds** | 5 different hardware systems |

---

## Applications

### Research Applications
- Human pose estimation and tracking from multiple viewpoints
- Motion prediction and forecasting
- Action recognition and classification
- Gait analysis and biomechanical studies

### Practical Applications
- Character animation for games and films
- Sports performance analysis
- Healthcare and rehabilitation monitoring
- Human-computer interaction systems

---

## Technical Details

### Data Modalities
1. **Optical Motion Capture**: High-precision 3D joint positions and orientations
2. **Video Recordings**: Multi-view RGB video at various resolutions
3. **IMU Sensors**: Inertial measurement data for wearable applications
4. **Body Meshes**: Full-body shape deformations using SMPL model

### Hardware Systems
The dataset was captured using professional optical motion capture systems, multiple synchronized video cameras, and wireless IMU sensor networks under controlled lighting conditions.

---

## Impact

MoVi was the first dataset to provide synchronized multi-modal human motion data, making it a valuable resource for the computer vision and graphics research communities. The dataset has been widely adopted for various research applications and continues to support advances in human motion understanding.

---

## Resources

### Publication
Published in **PLOS ONE** - [Read the full paper](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0253157)

### Code & Tools
Complete toolbox and tutorials available on [GitHub](https://github.com/saeed1262/MoVi-Toolbox)

### Official Website
Visit the [main MoVi website](https://www.biomotionlab.ca/movi/) for dataset download and documentation

### Dataset Access
The dataset is freely available for research purposes. Please visit the official website for access instructions and licensing information.

---

## Citation

If you use the MoVi dataset in your research, please cite:

```bibtex
@article{ghorbani2021movi,
  title={MoVi: A large multi-purpose human motion and video dataset},
  author={Ghorbani, Saeed and Mahdaviani, Kimia and Thaler, Anne and Kording, Konrad and Cook, Douglas James and Blohm, Gunnar and Troje, Nikolaus F},
  journal={Plos one},
  volume={16},
  number={6},
  pages={e0253157},
  year={2021},
  publisher={Public Library of Science San Francisco, CA USA}
}
```