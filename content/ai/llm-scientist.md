---
title: "The LLM Scientist"
order: 6
summary: "Building the best possible models: the transformer architecture, pre-training, post-training datasets, supervised fine-tuning, preference alignment, evaluation, quantization and new trends."
category: "AI"
level: Intermediate
---

# The LLM Scientist

Building the best possible models: the transformer architecture, pre-training, post-training datasets, supervised fine-tuning, preference alignment, evaluation, quantization and new trends.

This section of the course focuses on learning how to build the best possible LLMs using the latest techniques.

![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/roadmap_scientist.png)

## The LLM Architecture

> **Source:** [The LLM Architecture](https://github.com/mlabonne/llm-course#the-llm-architecture) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

An in-depth knowledge of the Transformer architecture is not required, but it's important to understand the main steps of modern LLMs: converting text into numbers through tokenization, processing these tokens through layers including attention mechanisms, and finally generating new text through various sampling strategies.

- **Architectural overview**: Understand the evolution from encoder-decoder Transformers to decoder-only architectures like GPT, which form the basis of modern LLMs. Focus on how these models process and generate text at a high level.
- **Tokenization**: Learn the principles of tokenization - how text is converted into numerical representations that LLMs can process. Explore different tokenization strategies and their impact on model performance and output quality.
- **Attention mechanisms**: Master the core concepts of attention mechanisms, particularly self-attention and its variants. Understand how these mechanisms enable LLMs to process long-range dependencies and maintain context throughout sequences.
- **Sampling techniques**: Explore various text generation approaches and their tradeoffs. Compare deterministic methods like greedy search and beam search with probabilistic approaches like temperature sampling and nucleus sampling.

📚 **References**:
* [Visual intro to Transformers](https://www.youtube.com/watch?v=wjZofJX0v4M) by 3Blue1Brown: Visual introduction to Transformers for complete beginners.
* [LLM Visualization](https://bbycroft.net/llm) by Brendan Bycroft: Interactive 3D visualization of LLM internals.
* [nanoGPT](https://www.youtube.com/watch?v=kCc8FmEb1nY) by Andrej Karpathy: A 2h-long YouTube video to reimplement GPT from scratch (for programmers). He also made a video about [tokenization](https://www.youtube.com/watch?v=zduSFxRajkE).
* [Attention? Attention!](https://lilianweng.github.io/posts/2018-06-24-attention/) by Lilian Weng: Historical overview to introduce the need for attention mechanisms.
* [Decoding Strategies in LLMs](https://mlabonne.github.io/blog/posts/2023-06-07-Decoding_strategies.html) by Maxime Labonne: Provide code and a visual introduction to the different decoding strategies to generate text.

---

## Pre-Training Models

> **Source:** [Pre-Training Models](https://github.com/mlabonne/llm-course#pre-training-models) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Pre-training is a computationally intensive and expensive process. While it's not the focus of this course, it's important to have a solid understanding of how models are pre-trained, especially in terms of data and parameters. Pre-training can also be performed by hobbyists at a small scale with <1B models.

* **Data preparation**: Pre-training requires massive datasets (e.g., [Llama 3.1](https://arxiv.org/abs/2307.09288) was trained on 15 trillion tokens) that need careful curation, cleaning, deduplication, and tokenization. Modern pre-training pipelines implement sophisticated filtering to remove low-quality or problematic content.
* **Distributed training**: Combine different parallelization strategies: data parallel (batch distribution), pipeline parallel (layer distribution), and tensor parallel (operation splitting). These strategies require optimized network communication and memory management across GPU clusters.
* **Training optimization**: Use adaptive learning rates with warm-up, gradient clipping, and normalization to prevent explosions, mixed-precision training for memory efficiency, and modern optimizers (AdamW, Lion) with tuned hyperparameters.
* **Monitoring**: Track key metrics (loss, gradients, GPU stats) using dashboards, implement targeted logging for distributed training issues, and set up performance profiling to identify bottlenecks in computation and communication across devices.

📚 **References**:
* [FineWeb](https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1) by Penedo et al.: Article to recreate a large-scale dataset for LLM pretraining (15T), including FineWeb-Edu, a high-quality subset.
* [RedPajama v2](https://www.together.ai/blog/redpajama-data-v2) by Weber et al.: Another article and paper about a large-scale pre-training dataset with a lot of interesting quality filters.
* [nanotron](https://github.com/huggingface/nanotron) by Hugging Face: Minimalistic LLM training codebase used to make [SmolLM2](https://github.com/huggingface/smollm).
* [Parallel training](https://www.andrew.cmu.edu/course/11-667/lectures/W10L2%20Scaling%20Up%20Parallel%20Training.pdf) by Chenyan Xiong: Overview of optimization and parallelism techniques.
* [Distributed training](https://arxiv.org/abs/2407.20018) by Duan et al.: A survey about efficient training of LLM on distributed architectures.
* [OLMo 2](https://allenai.org/olmo) by AI2: Open-source language model with model, data, training, and evaluation code.
* [LLM360](https://www.llm360.ai/) by LLM360: A framework for open-source LLMs with training and data preparation code, data, metrics, and models.

---

## Post-Training Datasets

> **Source:** [Post-Training Datasets](https://github.com/mlabonne/llm-course#post-training-datasets) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Post-training datasets have a precise structure with instructions and answers (supervised fine-tuning) or instructions and chosen/rejected answers (preference alignment). Conversational structures are a lot rarer than the raw text used for pre-training, which is why we often need to process seed data and refine it to improve the accuracy, diversity, and complexity of the samples. More information and examples are available in my repo [💾 LLM Datasets](https://github.com/mlabonne/llm-datasets).

* **Storage & chat templates**: Because of the conversational structure, post-training datasets are stored in a specific format like ShareGPT or OpenAI/HF. Then, these formats are mapped to a chat template like ChatML or Alpaca to produce the final samples that the model is trained on.
* **Synthetic data generation**: Create instruction-response pairs based on seed data using frontier models like GPT-4o. This approach allows for flexible and scalable dataset creation with high-quality answers. Key considerations include designing diverse seed tasks and effective system prompts.
* **Data enhancement**: Enhance existing samples using techniques like verified outputs (using unit tests or solvers), multiple answers with rejection sampling, [Auto-Evol](https://arxiv.org/abs/2406.00770), Chain-of-Thought, Branch-Solve-Merge, personas, etc.
* **Quality filtering**: Traditional techniques involve rule-based filtering, removing duplicates or near-duplicates (with MinHash or embeddings), and n-gram decontamination. Reward models and judge LLMs complement this step with fine-grained and customizable quality control.

📚 **References**:
* [Synthetic Data Generator](https://huggingface.co/spaces/argilla/synthetic-data-generator) by Argilla: Beginner-friendly way of building datasets using natural language in a Hugging Face space.
* [LLM Datasets](https://github.com/mlabonne/llm-datasets) by Maxime Labonne: Curated list of datasets and tools for post-training.
* [NeMo-Curator](https://github.com/NVIDIA/NeMo-Curator) by Nvidia: Dataset preparation and curation framework for pre- and post-training data.
* [Distilabel](https://distilabel.argilla.io/dev/sections/pipeline_samples/) by Argilla: Framework to generate synthetic data. It also includes interesting reproductions of papers like UltraFeedback.
* [Semhash](https://github.com/MinishLab/semhash) by MinishLab: Minimalistic library for near-deduplication and decontamination with a distilled embedding model.
* [Chat Template](https://huggingface.co/docs/transformers/main/en/chat_templating) by Hugging Face: Hugging Face's documentation about chat templates.

---

## Supervised Fine-Tuning

> **Source:** [Supervised Fine-Tuning](https://github.com/mlabonne/llm-course#supervised-fine-tuning) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

SFT turns base models into helpful assistants, capable of answering questions and following instructions. During this process, they learn how to structure answers and reactivate a subset of knowledge learned during pre-training. Instilling new knowledge is possible but superficial: it cannot be used to learn a completely new language. Always prioritize data quality over parameter optimization.

- **Training techniques**: Full fine-tuning updates all model parameters but requires significant compute. Parameter-efficient fine-tuning techniques like LoRA and QLoRA reduce memory requirements by training a small number of adapter parameters while keeping base weights frozen. QLoRA combines 4-bit quantization with LoRA to reduce VRAM usage. These techniques are all implemented in the most popular fine-tuning frameworks: [TRL](https://huggingface.co/docs/trl/en/index), [Unsloth](https://docs.unsloth.ai/), and [Axolotl](https://axolotl.ai/).
- **Training parameters**: Key parameters include learning rate with schedulers, batch size, gradient accumulation, number of epochs, optimizer (like 8-bit AdamW), weight decay for regularization, and warmup steps for training stability. LoRA also adds three parameters: rank (typically 16-128), alpha (1-2x rank), and target modules.
- **Distributed training**: Scale training across multiple GPUs using DeepSpeed or FSDP. DeepSpeed provides three ZeRO optimization stages with increasing levels of memory efficiency through state partitioning. Both methods support gradient checkpointing for memory efficiency.
- **Monitoring**: Track training metrics including loss curves, learning rate schedules, and gradient norms. Monitor for common issues like loss spikes, gradient explosions, or performance degradation.

📚 **References**:
* [Fine-tune Llama 3.1 Ultra-Efficiently with Unsloth](https://huggingface.co/blog/mlabonne/sft-llama3) by Maxime Labonne: Hands-on tutorial on how to fine-tune a Llama 3.1 model using Unsloth.
* [Axolotl - Documentation](https://axolotl-ai-cloud.github.io/axolotl/) by Wing Lian: Lots of interesting information related to distributed training and dataset formats.
* [Mastering LLMs](https://parlance-labs.com/education/) by Hamel Husain: Collection of educational resources about fine-tuning (but also RAG, evaluation, applications, and prompt engineering).
* [LoRA insights](https://lightning.ai/pages/community/lora-insights/) by Sebastian Raschka: Practical insights about LoRA and how to select the best parameters.

---

## Preference Alignment

> **Source:** [Preference Alignment](https://github.com/mlabonne/llm-course#preference-alignment) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Preference alignment is a second stage in the post-training pipeline, focused on aligning generated answers with human preferences. This stage was designed to tune the tone of LLMs and reduce toxicity and hallucinations. However, it has become increasingly important to also boost their performance and improve their usefulness. Unlike SFT, there are many preference alignment algorithms. Here, we'll focus on the three most important ones: DPO, GRPO, and PPO.

- **Rejection sampling**: For each prompt, use the trained model to generate multiple responses, and score them to infer chosen/rejected answers. This creates on-policy data, where both responses come from the model being trained, improving alignment stability.
- **[Direct Preference Optimization](https://arxiv.org/abs/2305.18290)** Directly optimizes the policy to maximize the likelihood of chosen responses over rejected ones. It doesn't require reward modeling, which makes it more computationally efficient than RL techniques but slightly worse in terms of quality. Great for creating chat models.
- **Reward model**: Train a reward model with human feedback to predict metrics like human preferences. It can leverage frameworks like [TRL](https://huggingface.co/docs/trl/en/index), [verl](https://github.com/volcengine/verl), and [OpenRLHF](https://github.com/OpenRLHF/OpenRLHF) for scalable training.
- **Reinforcement Learning**: RL techniques like [GRPO](https://arxiv.org/abs/2402.03300) and [PPO](https://arxiv.org/abs/1707.06347) iteratively update a policy to maximize rewards while staying close to the initial behavior. They can use a reward model or reward functions to score responses. They tend to be computationally expensive and require careful tuning of hyperparameters, including learning rate, batch size, and clip range. Ideal for creating reasoning models.

📚 **References**:
* [Illustrating RLHF](https://huggingface.co/blog/rlhf) by Hugging Face: Introduction to RLHF with reward model training and fine-tuning with reinforcement learning.
* [LLM Training: RLHF and Its Alternatives](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives) by Sebastian Raschka: Overview of the RLHF process and alternatives like RLAIF.
* [Preference Tuning LLMs](https://huggingface.co/blog/pref-tuning) by Hugging Face: Comparison of the DPO, IPO, and KTO algorithms to perform preference alignment.
* [Fine-tune with DPO](https://mlabonne.github.io/blog/posts/Fine_tune_Mistral_7b_with_DPO.html) by Maxime Labonne: Tutorial to fine-tune a Mistral-7b model with DPO and reproduce [NeuralHermes-2.5](https://huggingface.co/mlabonne/NeuralHermes-2.5-Mistral-7B).
* [Fine-tune with GRPO](https://huggingface.co/learn/llm-course/en/chapter12/5) by Maxime Labonne: Practical exercise to fine-tune a small model with GRPO.
* [DPO Wandb logs](https://wandb.ai/alexander-vishnevskiy/dpo/reports/TRL-Original-DPO--Vmlldzo1NjI4MTc4) by Alexander Vishnevskiy: It shows you the main DPO metrics to track and the trends you should expect.

---

## Evaluation

> **Source:** [Evaluation](https://github.com/mlabonne/llm-course#evaluation) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Reliably evaluating LLMs is a complex but essential task guiding data generation and training. It provides invaluable feedback about areas of improvement, which can be leveraged to modify the data mixture, quality, and training parameters. However, it's always good to remember Goodhart's law: "When a measure becomes a target, it ceases to be a good measure."

- **Automated benchmarks**: Evaluate models on specific tasks using curated datasets and metrics, like MMLU. It works well for concrete tasks but struggles with abstract and creative capabilities. It is also prone to data contamination.
- **Human evaluation**: It involves humans prompting models and grading responses. Methods range from vibe checks to systematic annotations with specific guidelines and large-scale community voting (arena). It is more suited for subjective tasks and less reliable for factual accuracy.
- **Model-based evaluation**: Use judge and reward models to evaluate model outputs. It highly correlates with human preferences but suffers from bias toward their own outputs and inconsistent scoring.
- **Feedback signal**: Analyze error patterns to identify specific weaknesses, such as limitations in following complex instructions, lack of specific knowledge, or susceptibility to adversarial prompts. This can be improved with better data generation and training parameters.

📚 **References**:
* [LLM evaluation guidebook](https://huggingface.co/spaces/OpenEvals/evaluation-guidebook) by Hugging Face: Comprehensive guide about evaluation with practical insights.
* [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) by Hugging Face: Main leaderboard to compare LLMs in an open and reproducible way (automated benchmarks).
* [Language Model Evaluation Harness](https://github.com/EleutherAI/lm-evaluation-harness) by EleutherAI: A popular framework for evaluating LLMs using automated benchmarks.
* [Lighteval](https://github.com/huggingface/lighteval) by Hugging Face: Alternative evaluation framework that also includes model-based evaluations.
* [Chatbot Arena](https://lmarena.ai/) by LMSYS: Elo rating of general-purpose LLMs, based on comparisons made by humans (human evaluation).

---

## Quantization

> **Source:** [Quantization](https://github.com/mlabonne/llm-course#quantization) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Quantization is the process of converting the parameters and activations of a model to a lower precision. For example, weights stored using 16 bits can be converted into a 4-bit representation. This technique has become increasingly important to reduce the computational and memory costs associated with LLMs.

* **Base techniques**: Learn the different levels of precision (FP32, FP16, INT8, etc.) and how to perform naïve quantization with absmax and zero-point techniques.
* **GGUF & llama.cpp**: Originally designed to run on CPUs, [llama.cpp](https://github.com/ggerganov/llama.cpp) and the GGUF format have become the most popular tools to run LLMs on consumer-grade hardware. It supports storing special tokens, vocabulary, and metadata in a single file.
* **GPTQ & AWQ**: Techniques like [GPTQ](https://arxiv.org/abs/2210.17323)/[EXL2](https://github.com/turboderp/exllamav2) and [AWQ](https://arxiv.org/abs/2306.00978) introduce layer-by-layer calibration that retains performance at extremely low bitwidths. They reduce catastrophic outliers using dynamic scaling, selectively skipping or re-centering the heaviest parameters.
* **SmoothQuant & ZeroQuant**: New quantization-friendly transformations (SmoothQuant) and compiler-based optimizations (ZeroQuant) help mitigate outliers before quantization. They also reduce hardware overhead by fusing certain ops and optimizing dataflow.

📚 **References**:
* [Introduction to quantization](https://mlabonne.github.io/blog/posts/Introduction_to_Weight_Quantization.html) by Maxime Labonne: Overview of quantization, absmax and zero-point quantization, and LLM.int8() with code.
* [Quantize Llama models with llama.cpp](https://mlabonne.github.io/blog/posts/Quantize_Llama_2_models_using_ggml.html) by Maxime Labonne: Tutorial on how to quantize a Llama 2 model using llama.cpp and the GGUF format.
* [4-bit LLM Quantization with GPTQ](https://mlabonne.github.io/blog/posts/4_bit_Quantization_with_GPTQ.html) by Maxime Labonne: Tutorial on how to quantize an LLM using the GPTQ algorithm with AutoGPTQ.
* [Understanding Activation-Aware Weight Quantization](https://medium.com/friendliai/understanding-activation-aware-weight-quantization-awq-boosting-inference-serving-efficiency-in-10bb0faf63a8) by FriendliAI: Overview of the AWQ technique and its benefits.
* [SmoothQuant on Llama 2 7B](https://github.com/mit-han-lab/smoothquant/blob/main/examples/smoothquant_llama_demo.ipynb) by MIT HAN Lab: Tutorial on how to use SmoothQuant with a Llama 2 model in 8-bit precision.
* [DeepSpeed Model Compression](https://www.deepspeed.ai/tutorials/model-compression/) by DeepSpeed: Tutorial on how to use ZeroQuant and extreme compression (XTC) with DeepSpeed Compression.

---

## New Trends

> **Source:** [New Trends](https://github.com/mlabonne/llm-course#new-trends) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Here are notable topics that didn't fit into other categories. Some are established techniques (model merging, multimodal), but others are more experimental (interpretability, test-time compute scaling) and the focus of numerous research papers.

* **Model merging**: Merging trained models has become a popular way of creating performant models without any fine-tuning. The popular [mergekit](https://github.com/cg123/mergekit) library implements the most popular merging methods, like SLERP, [DARE](https://arxiv.org/abs/2311.03099), and [TIES](https://arxiv.org/abs/2311.03099).
* **Multimodal models**: These models (like [CLIP](https://openai.com/research/clip), [Stable Diffusion](https://stability.ai/stable-image), or [LLaVA](https://llava-vl.github.io/)) process multiple types of inputs (text, images, audio, etc.) with a unified embedding space, which unlocks powerful applications like text-to-image.
* **Interpretability**: Mechanistic interpretability techniques like Sparse Autoencoders (SAEs) have made remarkable progress to provide insights about the inner workings of LLMs. This has also been applied with techniques such as abliteration, which allow you to modify the behavior of models without training.
* **Test-time compute**: Reasoning models trained with RL techniques can be further improved by scaling the compute budget during test time. It can involve multiple calls, MCTS, or specialized models like a Process Reward Model (PRM). Iterative steps with precise scoring significantly improve performance for complex reasoning tasks.

📚 **References**:
* [Merge LLMs with mergekit](https://mlabonne.github.io/blog/posts/2024-01-08_Merge_LLMs_with_mergekit.html) by Maxime Labonne: Tutorial about model merging using mergekit.
* [Smol Vision](https://github.com/merveenoyan/smol-vision) by Merve Noyan: Collection of notebooks and scripts dedicated to small multimodal models.
* [Large Multimodal Models](https://huyenchip.com/2023/10/10/multimodal.html) by Chip Huyen: Overview of multimodal systems and the recent history of this field.
* [Unsensor any LLM with abliteration](https://huggingface.co/blog/mlabonne/abliteration) by Maxime Labonne: Direct application of interpretability techniques to modify the style of a model.
* [Intuitive Explanation of SAEs](https://adamkarvonen.github.io/machine_learning/2024/06/11/sae-intuitions.html) by Adam Karvonen: Article about how SAEs work and why they make sense for interpretability.
* [Scaling test-time compute](https://huggingface.co/spaces/HuggingFaceH4/blogpost-scaling-test-time-compute) by Beeching et al.: Tutorial and experiments to outperform Llama 3.1 70B on MATH-500 with a 3B model.
