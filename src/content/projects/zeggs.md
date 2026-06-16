---
title: "ZeroEGGS"
description: "Zero-shot example-based gesture generation from speech with style control. A neural network framework that generates full-body co-speech gestures, including finger-level detail, with style controlled by a short example motion clip even for styles unseen during training."
image: "zeggs.png"
url: "https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS"
tags:
  - "gesture generation"
  - "speech"
  - "character animation"
  - "deep learning"
---

## Overview

ZeroEGGS is a neural network framework for speech-driven gesture generation with zero-shot style control. The system can control gesture style using a short example motion clip, including styles not seen during training.

### Key Features

- Zero-shot learning approach for gesture style transfer
- Variational framework for generating diverse, natural gesture sequences
- Style embedding system for flexible control over gesture characteristics
- Full-body motion generation including finger-level detail

<div class="video"><iframe src="https://www.youtube.com/embed/YFg7QKWkjwQ" title="ZeroEGGS demonstration" loading="lazy" allowfullscreen></iframe></div>
<p class="caption">
    ZeroEGGS demonstration showing gesture generation with style control from example clips
</p>

---

## Technical Details

The framework consists of several key components:

1. **Style Encoder**: Extracts style representations from example motion sequences
2. **Speech Encoder**: Processes audio features for synchronization
3. **Variational Generator**: Produces contextually appropriate gesture sequences
4. **Style Transfer**: Applies style characteristics to generated motions

The model uses a hierarchical variational autoencoder architecture with attention mechanisms for speech-gesture alignment and style disentanglement for flexible control.

---

## Evaluation

User studies demonstrated improvements in motion naturalness, speech appropriateness, and style portrayal compared to existing methods. The system supports 19 different gesture styles and generates full-body animations including finger movements.

Key technical achievements include real-time performance capability and robust generalization across different speakers and content types.

---

## Applications

The framework has applications in several domains:

**Gaming and Entertainment**: Character animation for NPCs, virtual avatars, and interactive storytelling systems.

**Content Creation**: Streamlined animation workflows for creators and real-time gesture generation.

**AI and Robotics**: Natural gesture expression for human-robot interaction and virtual assistants.

---

## Dataset and Code

The project includes a high-quality dataset with full-body motion capture data, synchronized speech audio, and 19 distinct gesture styles.

Open source contributions include the complete framework implementation, pre-trained models, training scripts, and evaluation tools.

---

## Resources

### Publication
Published in **Computer Graphics Forum** - [Read the full paper](https://onlinelibrary.wiley.com/doi/full/10.1111/cgf.14734)

### Open Source
Complete implementation available on [GitHub](https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS)
- Pre-trained models
- Training code
- Dataset tools
- Demo applications

### Industry Blog
Learn more about the research at [Ubisoft La Forge](https://www.ubisoft.com/en-us/studio/laforge/news/5ADkkY0BMG9vNSDuUMtkeg/zeroeggs-zeroshot-examplebased-gesture-generation-from-speech)

---

## Citation

If you use ZeroEGGS in your research or applications, please cite:

```bibtex
@article{ghorbani2022zeroeggs,
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
}
```
