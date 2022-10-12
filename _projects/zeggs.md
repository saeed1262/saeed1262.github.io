---
layout: page
title: ZEGGS
description: ZeroEGGS - Zero-shot Example-based Gesture Generation from Speech
img: /assets/img/zeggs.png
importance: 1
category: work
---

We present ZeroEGGS, a neural network framework for speech-driven gesture generation with zero-shot style control by example. This means style can be controlled via only a short example motion clip, even for motion styles unseen during training. Our model uses a Variational framework to learn a style embedding, making it easy to modify style through latent space manipulation or blending and scaling of style embeddings. The probabilistic nature of our framework further enables the generation of a variety of outputs given the same input, addressing the stochastic nature of gesture motion. In a series of experiments, we first demonstrate the flexibility and generalizability of our model to new speakers and styles. In a user study, we then show that our model outperforms previous state-of-the-art techniques in naturalness of motion, appropriateness for speech, and style portrayal. Finally, we release a high-quality dataset of full-body gesture motion including fingers, with speech, spanning across 19 different styles.


<div class="row justify-content-sm-center">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/YFg7QKWkjwQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Publication
Here is a link to the preprint [manuscript](https://arxiv.org/abs/2209.07556).

---

## Code
The code, pre-trained models, and our dataset are hosted on GitHub which can be found [here](https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS).

---

### Referencing ZEGGS
```bibtex
@article{ghorbani2022zeroeggs,
  title={ZeroEGGS: Zero-shot Example-based Gesture Generation from Speech},
  author={Ghorbani, Saeed and Ferstl, Ylva and Holden, Daniel and Troje, Nikolaus F and Carbonneau, Marc-Andr{\'e}},
  journal={arXiv preprint arXiv:2209.07556},
  year={2022}
}
```