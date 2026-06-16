---
title: "Probabilistic Motion Model"
description: "Probabilistic character motion synthesis using a hierarchical deep latent variable model. A framework that generates realistic and diverse character animations from weak control signals while preserving the stochastic nature of human movement."
image: "motion.jpeg"
url: "https://arxiv.org/pdf/2010.09950.pdf"
tags:
  - "motion synthesis"
  - "character animation"
  - "variational autoencoder"
  - "deep learning"
---

We present a probabilistic framework to generate character animations based on weak control signals, such that the synthesized motions are realistic while retaining the stochastic nature of human movement. The proposed architecture, which is designed as a hierarchical recurrent model, maps each sub-sequence of motions into a stochastic latent code using a variational autoencoder extended over the temporal domain. We also propose an objective function which respects the impact of each joint on the pose and compares the joint angles based on angular distance. We use two novel quantitative protocols and human qualitative assessment to demonstrate the ability of our model to generate convincing and diverse periodic and non-periodic motion sequences without the need for strong control signals.

<div class="video"><iframe src="https://www.youtube.com/embed/r9F74LcGC0A" title="Probabilistic Motion Model demonstration" loading="lazy" allowfullscreen></iframe></div>

---

## Publication

**Probabilistic Character Motion Synthesis using a Hierarchical Deep Latent Variable Model**, Ghorbani, Saeed, Wloka, Calden, Etemad, Ali, Brubaker, Marcus A., and Troje, Nikolaus F. *Computer Graphics Forum 2020*. [Paper](https://arxiv.org/pdf/2010.09950.pdf)

---

### Referencing

```bibtex
@article {ghorbani2020b,
journal = {Computer Graphics Forum},
title = {Probabilistic Character Motion Synthesis using a Hierarchical Deep Latent Variable Model},
author = {Ghorbani, Saeed and Wloka, Calden and Etemad, Ali and Brubaker, Marcus A. and Troje, Nikolaus F.},
year = {2020},
publisher = {The Eurographics Association and John Wiley & Sons Ltd.},
ISSN = {1467-8659},
DOI = {10.1111/cgf.14116}
}
```
