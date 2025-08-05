---
layout: page
title: Aether Weaver
description: Multimodal Affective Narrative Co-Generation with Dynamic Scene Graphs
img: assets/img/AE.png
importance: 1
category: work
---

# Aether Weaver

## Multimodal Affective Narrative Co-Generation with Dynamic Scene Graphs

We introduce Aether Weaver, a novel, integrated framework for multimodal narrative co-generation that overcomes limitations of sequential text-to-visual pipelines. Our system concurrently synthesizes textual narratives, dynamic scene graph representations, visual scenes, and affective soundscapes, driven by a tightly integrated, co-generation mechanism. At its core, the Narrator, a large language model, generates narrative text and multimodal prompts, while the Director acts as a dynamic scene graph manager, and analyzes the text to build and maintain a structured representation of the story's world, ensuring spatio-temporal and relational consistency for visual rendering and subsequent narrative generation. Additionally, a Narrative Arc Controller guides the high-level story structure, influencing multimodal affective consistency, further complemented by an Affective Tone Mapper that ensures congruent emotional expression across all modalities. Through qualitative evaluations on a diverse set of narrative prompts encompassing various genres, we demonstrate that Aether Weaver significantly enhances narrative depth, visual fidelity, and emotional resonance compared to cascaded baseline approaches. This integrated framework provides a robust platform for rapid creative prototyping and immersive storytelling experiences.

## Key Innovations

### Co-generative Mechanism

Our approach concurrently synthesizes:
- Textual narratives
- Dynamic scene graph representations
- Visual scenery
- Affective atmospheres

This tightly integrated mechanism ensures consistency and coherence across all modalities.

### Core Components
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/AE.png" title="Aether Weaver" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

#### The Narrator
A large language model that generates narrative text and multimodal prompts.

#### The Director
A dynamic scene graph manager that analyzes text to build and maintain a coherent representation of the story world, ensuring spatio-temporal and relational consistency for visual rendering and subsequent narrative generation.

#### Narrative Arc Controller
Guides the high-level story structure, interweaving multimodal affective overtones.

#### Affective Tone Mapper
Ensures congruent emotional expression across all modalities.

## Research Impact

Through qualitative evaluations on diverse narrative prompts spanning numerous genres and settings, we demonstrated Aether Weaver's ability to generate coherent, emotionally resonant, and engaging multimodal narratives, outperforming sequential pipelines.

## Applications

- Interactive storytelling
- Game narrative development
- Educational content creation
- Entertainment media production
- Therapeutic narrative experiences

---

## Publications

- Ghorbani, S. (2025). Aether Weaver: Multimodal Affective Narrative Co-Generation with Dynamic Scene Graphs. arXiv preprint. [PDF](https://arxiv.org/pdf/2507.21893)

---

### Referencing

```bibtex
@article{ghorbani2025aether,
  title={Aether Weaver: Multimodal Affective Narrative Co-Generation with Dynamic Scene Graphs},
  author={Ghorbani, Saeed},
  journal={arXiv preprint arXiv:2507.21893},
  year={2025}
}
}