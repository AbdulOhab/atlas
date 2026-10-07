---
title: "Notebooks"
order: 10
summary: "Hands-on notebooks and tools from the course: automated evaluation and merging, fine-tuning, quantization and other experiments, each runnable in Colab."
category: "AI"
level: Intermediate
---

# Notebooks

Hands-on notebooks and tools from the course: automated evaluation and merging, fine-tuning, quantization and other experiments, each runnable in Colab.

A list of notebooks and articles I wrote about LLMs.

<details>
<summary>Toggle section (optional)</summary>

## Tools

> **Source:** [Tools](https://github.com/mlabonne/llm-course#tools) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

| Notebook | Description | Notebook |
|----------|-------------|----------|
| 🧐 [LLM AutoEval](https://github.com/mlabonne/llm-autoeval) | Automatically evaluate your LLMs using RunPod | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 🥱 LazyMergekit | Easily merge models using MergeKit in one click. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 🦎 LazyAxolotl | Fine-tune models in the cloud using Axolotl in one click. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| ⚡ AutoQuant | Quantize LLMs in GGUF, GPTQ, EXL2, AWQ, and HQQ formats in one click. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 🌳 Model Family Tree | Visualize the family tree of merged models. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 🚀 ZeroSpace | Automatically create a Gradio chat interface using a free ZeroGPU. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| ✂️ AutoAbliteration | Automatically abliteration models with custom datasets. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 🧼 AutoDedup | Automatically deduplicate datasets using the Rensa library. | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |

## Fine-tuning

> **Source:** [Fine-tuning](https://github.com/mlabonne/llm-course#fine-tuning) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

| Notebook | Description | Article | Notebook |
|---------------------------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Fine-tune Llama 3.1 with Unsloth | Ultra-efficient supervised fine-tuning in Google Colab. | [Article](https://mlabonne.github.io/blog/posts/2024-07-29_Finetune_Llama31.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Fine-tune Llama 3 with ORPO | Cheaper and faster fine-tuning in a single stage with ORPO. | [Article](https://mlabonne.github.io/blog/posts/2024-04-19_Fine_tune_Llama_3_with_ORPO.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Fine-tune Mistral-7b with DPO | Boost the performance of supervised fine-tuned models with DPO. | [Article](https://mlabonne.github.io/blog/posts/Fine_tune_Mistral_7b_with_DPO.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Fine-tune Mistral-7b with QLoRA | Supervised fine-tune Mistral-7b in a free-tier Google Colab with TRL. |  | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Fine-tune CodeLlama using Axolotl | End-to-end guide to the state-of-the-art tool for fine-tuning. | [Article](https://mlabonne.github.io/blog/posts/A_Beginners_Guide_to_LLM_Finetuning.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Fine-tune Llama 2 with QLoRA | Step-by-step guide to supervised fine-tune Llama 2 in Google Colab. | [Article](https://mlabonne.github.io/blog/posts/Fine_Tune_Your_Own_Llama_2_Model_in_a_Colab_Notebook.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |

## Quantization

> **Source:** [Quantization](https://github.com/mlabonne/llm-course#quantization) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

| Notebook | Description | Article | Notebook |
|---------------------------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Introduction to Quantization | Large language model optimization using 8-bit quantization. | [Article](https://mlabonne.github.io/blog/posts/Introduction_to_Weight_Quantization.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| 4-bit Quantization using GPTQ | Quantize your own open-source LLMs to run them on consumer hardware. | [Article](https://mlabonne.github.io/blog/4bit_quantization/) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Quantization with GGUF and llama.cpp | Quantize Llama 2 models with llama.cpp and upload GGUF versions to the HF Hub. | [Article](https://mlabonne.github.io/blog/posts/Quantize_Llama_2_models_using_ggml.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| ExLlamaV2: The Fastest Library to Run LLMs | Quantize and run EXL2 models and upload them to the HF Hub. | [Article](https://mlabonne.github.io/blog/posts/ExLlamaV2_The_Fastest_Library_to_Run%C2%A0LLMs.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |

## Other

> **Source:** [Other](https://github.com/mlabonne/llm-course#other) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

| Notebook | Description | Article | Notebook |
|---------------------------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Merge LLMs with MergeKit | Create your own models easily, no GPU required! | [Article](https://mlabonne.github.io/blog/posts/2024-01-08_Merge_LLMs_with_mergekit%20copy.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Create MoEs with MergeKit | Combine multiple experts into a single frankenMoE | [Article](https://mlabonne.github.io/blog/posts/2024-03-28_Create_Mixture_of_Experts_with_MergeKit.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Uncensor any LLM with abliteration | Fine-tuning without retraining | [Article](https://mlabonne.github.io/blog/posts/2024-06-04_Uncensor_any_LLM_with_abliteration.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Improve ChatGPT with Knowledge Graphs | Augment ChatGPT's answers with knowledge graphs. | [Article](https://mlabonne.github.io/blog/posts/Article_Improve_ChatGPT_with_Knowledge_Graphs.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
| Decoding Strategies in Large Language Models | A guide to text generation from beam search to nucleus sampling | [Article](https://mlabonne.github.io/blog/posts/2022-06-07-Decoding_strategies.html) | ![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/colab.svg) |
</details>
