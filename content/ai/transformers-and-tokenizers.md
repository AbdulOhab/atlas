---
title: "Transformers and Tokenizers"
order: 4
summary: "How transformer models work and how to use them with Hugging Face: the architectures, inference with LLMs, models and tokenizers, and the BPE, WordPiece and Unigram algorithms."
category: "AI"
level: Intermediate
---

# Transformers and Tokenizers

How transformer models work and how to use them with Hugging Face: the architectures, inference with LLMs, models and tokenizers, and the BPE, WordPiece and Unigram algorithms.

## Natural Language Processing and LLMs

> **Source:** [Natural Language Processing and LLMs](https://huggingface.co/learn/llm-course/chapter1/2) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Before jumping into Transformer models, let's do a quick overview of what natural language processing is, how large language models have transformed the field, and why we care about it.

### What is NLP?

NLP is a field of linguistics and machine learning focused on understanding everything related to human language. The aim of NLP tasks is not only to understand single words individually, but to be able to understand the context of those words.

The following is a list of common NLP tasks, with some examples of each:

- **Classifying whole sentences**: Getting the sentiment of a review, detecting if an email is spam, determining if a sentence is grammatically correct or whether two sentences are logically related or not
- **Classifying each word in a sentence**: Identifying the grammatical components of a sentence (noun, verb, adjective), or the named entities (person, location, organization)
- **Generating text content**: Completing a prompt with auto-generated text, filling in the blanks in a text with masked words
- **Extracting an answer from a text**: Given a question and a context, extracting the answer to the question based on the information provided in the context
- **Generating a new sentence from an input text**: Translating a text into another language, summarizing a text

NLP isn't limited to written text though. It also tackles complex challenges in speech recognition and computer vision, such as generating a transcript of an audio sample or a description of an image.

### The Rise of Large Language Models (LLMs)

In recent years, the field of NLP has been revolutionized by Large Language Models (LLMs). These models, which include architectures like GPT (Generative Pre-trained Transformer) and [Llama](https://huggingface.co/meta-llama), have transformed what's possible in language processing.

> **Tip:**
> A large language model (LLM) is an AI model trained on massive amounts of text data that can understand and generate human-like text, recognize patterns in language, and perform a wide variety of language tasks without task-specific training. They represent a significant advancement in the field of natural language processing (NLP).

LLMs are characterized by:
- **Scale**: They contain millions, billions, or even hundreds of billions of parameters
- **General capabilities**: They can perform multiple tasks without task-specific training
- **In-context learning**: They can learn from examples provided in the prompt
- **Emergent abilities**: As these models grow in size, they demonstrate capabilities that weren't explicitly programmed or anticipated

The advent of LLMs has shifted the paradigm from building specialized models for specific NLP tasks to using a single, large model that can be prompted or fine-tuned to address a wide range of language tasks. This has made sophisticated language processing more accessible while also introducing new challenges in areas like efficiency, ethics, and deployment.

However, LLMs also have important limitations:
- **Hallucinations**: They can generate incorrect information confidently
- **Lack of true understanding**: They lack true understanding of the world and operate purely on statistical patterns
- **Bias**: They may reproduce biases present in their training data or inputs.
- **Context windows**: They have limited context windows (though this is improving)
- **Computational resources**: They require significant computational resources

### Why is language processing challenging?

Computers don't process information in the same way as humans. For example, when we read the sentence "I am hungry," we can easily understand its meaning. Similarly, given two sentences such as "I am hungry" and "I am sad," we're able to easily determine how similar they are. For machine learning (ML) models, such tasks are more difficult. The text needs to be processed in a way that enables the model to learn from it. And because language is complex, we need to think carefully about how this processing must be done. There has been a lot of research done on how to represent text, and we will look at some methods in the next chapter.

Even with the advances in LLMs, many fundamental challenges remain. These include understanding ambiguity, cultural context, sarcasm, and humor. LLMs address these challenges through massive training on diverse datasets, but still often fall short of human-level understanding in many complex scenarios.

## Transformers, What Can They Do?

> **Source:** [Transformers, What Can They Do?](https://huggingface.co/learn/llm-course/chapter1/3) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

In this section, we will look at what Transformer models can do and use our first tool from the 🤗 Transformers library: the `pipeline()` function.

> **Tip:**
> 👀 See that <em>Open in Colab</em> button on the top right? Click on it to open a Google Colab notebook with all the code samples of this section. This button will be present in any section containing code examples.
>
> If you want to run the examples locally, we recommend taking a look at the <a href="/course/chapter0">setup</a>.

### Transformers are everywhere!

Transformer models are used to solve all kinds of tasks across different modalities, including natural language processing (NLP), computer vision, audio processing, and more. Here are some of the companies and organizations using Hugging Face and Transformer models, who also contribute back to the community by sharing their models:

<img src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/companies.PNG" alt="Companies using Hugging Face" width="100%">

The [🤗 Transformers library](https://github.com/huggingface/transformers) provides the functionality to create and use those shared models. The [Model Hub](https://huggingface.co/models) contains millions of pretrained models that anyone can download and use. You can also upload your own models to the Hub!

> **Tip:**
> ⚠️ The Hugging Face Hub is not limited to Transformer models. Anyone can share any kind of models or datasets they want! <a href="https://huggingface.co/join">Create a huggingface.co</a> account to benefit from all available features!

Before diving into how Transformer models work under the hood, let's look at a few examples of how they can be used to solve some interesting NLP problems.

### Working with pipelines

The most basic object in the 🤗 Transformers library is the `pipeline()` function. It connects a model with its necessary preprocessing and postprocessing steps, allowing us to directly input any text and get an intelligible answer:

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
classifier("I've been waiting for a HuggingFace course my whole life.")
```

```python
[{'label': 'POSITIVE', 'score': 0.9598047137260437}]
```

We can even pass several sentences!

```python
classifier(
    ["I've been waiting for a HuggingFace course my whole life.", "I hate this so much!"]
)
```

```python
[{'label': 'POSITIVE', 'score': 0.9598047137260437},
 {'label': 'NEGATIVE', 'score': 0.9994558095932007}]
```

By default, this pipeline selects a particular pretrained model that has been fine-tuned for sentiment analysis in English. The model is downloaded and cached when you create the `classifier` object. If you rerun the command, the cached model will be used instead and there is no need to download the model again.

There are three main steps involved when you pass some text to a pipeline:

1. The text is preprocessed into a format the model can understand.
2. The preprocessed inputs are passed to the model.
3. The predictions of the model are post-processed, so you can make sense of them.

### Available pipelines for different modalities

The `pipeline()` function supports multiple modalities, allowing you to work with text, images, audio, and even multimodal tasks. In this course we'll focus on text tasks, but it's useful to understand the transformer architecture's potential, so we'll briefly outline it.

Here's an overview of what's available:

> **Tip:**
> For a full and updated list of pipelines, see the [🤗 Transformers documentation](https://huggingface.co/docs/hub/en/models-tasks).

#### Text pipelines

- `text-generation`: Generate text from a prompt
- `text-classification`: Classify text into predefined categories
- `summarization`: Create a shorter version of a text while preserving key information
- `translation`: Translate text from one language to another
- `zero-shot-classification`: Classify text without prior training on specific labels
- `feature-extraction`: Extract vector representations of text

#### Image pipelines

- `image-to-text`: Generate text descriptions of images
- `image-classification`: Identify objects in an image
- `object-detection`: Locate and identify objects in images

#### Audio pipelines

- `automatic-speech-recognition`: Convert speech to text
- `audio-classification`: Classify audio into categories
- `text-to-speech`: Convert text to spoken audio

#### Multimodal pipelines

- `image-text-to-text`: Respond to an image based on a text prompt

Let's explore some of these pipelines in more detail!

### Zero-shot classification

We'll start by tackling a more challenging task where we need to classify texts that haven't been labelled. This is a common scenario in real-world projects because annotating text is usually time-consuming and requires domain expertise. For this use case, the `zero-shot-classification` pipeline is very powerful: it allows you to specify which labels to use for the classification, so you don't have to rely on the labels of the pretrained model. You've already seen how the model can classify a sentence as positive or negative using those two labels — but it can also classify the text using any other set of labels you like.

```python
from transformers import pipeline

classifier = pipeline("zero-shot-classification")
classifier(
    "This is a course about the Transformers library",
    candidate_labels=["education", "politics", "business"],
)
```

```python
{'sequence': 'This is a course about the Transformers library',
 'labels': ['education', 'business', 'politics'],
 'scores': [0.8445963859558105, 0.111976258456707, 0.043427448719739914]}
```

This pipeline is called _zero-shot_ because you don't need to fine-tune the model on your data to use it. It can directly return probability scores for any list of labels you want!

> **Tip:**
> ✏️ **Try it out!** Play around with your own sequences and labels and see how the model behaves.

### Text generation

Now let's see how to use a pipeline to generate some text. The main idea here is that you provide a prompt and the model will auto-complete it by generating the remaining text. This is similar to the predictive text feature that is found on many phones. Text generation involves randomness, so it's normal if you don't get the same results as shown below.

```python
from transformers import pipeline

generator = pipeline("text-generation")
generator("In this course, we will teach you how to")
```

```python
[{'generated_text': 'In this course, we will teach you how to understand and use '
                    'data flow and data interchange when handling user data. We '
                    'will be working with one or more of the most commonly used '
                    'data flows — data flows of various types, as seen by the '
                    'HTTP'}]
```

You can control how many different sequences are generated with the argument `num_return_sequences` and the total length of the output text with the argument `max_length`.

> **Tip:**
> ✏️ **Try it out!** Use the `num_return_sequences` and `max_length` arguments to generate two sentences of 15 words each.

### Using any model from the Hub in a pipeline

The previous examples used the default model for the task at hand, but you can also choose a particular model from the Hub to use in a pipeline for a specific task — say, text generation. Go to the [Model Hub](https://huggingface.co/models) and click on the corresponding tag on the left to display only the supported models for that task. You should get to a page like [this one](https://huggingface.co/models?pipeline_tag=text-generation).

Let's try the [`HuggingFaceTB/SmolLM2-360M`](https://huggingface.co/HuggingFaceTB/SmolLM2-360M) model! Here's how to load it in the same pipeline as before:

```python
from transformers import pipeline

generator = pipeline("text-generation", model="HuggingFaceTB/SmolLM2-360M")
generator(
    "In this course, we will teach you how to",
    max_length=30,
    num_return_sequences=2,
)
```

```python
[{'generated_text': 'In this course, we will teach you how to manipulate the world and '
                    'move your mental and physical capabilities to your advantage.'},
 {'generated_text': 'In this course, we will teach you how to become an expert and '
                    'practice realtime, and with a hands on experience on both real '
                    'time and real'}]
```

You can refine your search for a model by clicking on the language tags, and pick a model that will generate text in another language. The Model Hub even contains checkpoints for multilingual models that support several languages.

Once you select a model by clicking on it, you'll see that there is a widget enabling you to try it directly online. This way you can quickly test the model's capabilities before downloading it.

> **Tip:**
> ✏️ **Try it out!** Use the filters to find a text generation model for another language. Feel free to play with the widget and use it in a pipeline!

#### Inference Providers

All the models can be tested directly through your browser using the Inference Providers, which is available on the Hugging Face [website](https://huggingface.co/docs/inference-providers/en/index). You can play with the model directly on this page by inputting custom text and watching the model process the input data.

Inference Providers that powers the widget is also available as a paid product, which comes in handy if you need it for your workflows. See the [pricing page](https://huggingface.co/docs/inference-providers/en/pricing) for more details.

### Mask filling

The next pipeline you'll try is `fill-mask`. The idea of this task is to fill in the blanks in a given text:

```python
from transformers import pipeline

unmasker = pipeline("fill-mask")
unmasker("This course will teach you all about <mask> models.", top_k=2)
```

```python
[{'sequence': 'This course will teach you all about mathematical models.',
  'score': 0.19619831442832947,
  'token': 30412,
  'token_str': ' mathematical'},
 {'sequence': 'This course will teach you all about computational models.',
  'score': 0.04052725434303284,
  'token': 38163,
  'token_str': ' computational'}]
```

The `top_k` argument controls how many possibilities you want to be displayed. Note that here the model fills in the special `<mask>` word, which is often referred to as a *mask token*. Other mask-filling models might have different mask tokens, so it's always good to verify the proper mask word when exploring other models. One way to check it is by looking at the mask word used in the widget.

> **Tip:**
> ✏️ **Try it out!** Search for the `bert-base-cased` model on the Hub and identify its mask word in the Inference API widget. What does this model predict for the sentence in our `pipeline` example above?

### Named entity recognition

Named entity recognition (NER) is a task where the model has to find which parts of the input text correspond to entities such as persons, locations, or organizations. Let's look at an example:

```python
from transformers import pipeline

ner = pipeline("ner", aggregation_strategy="simple")
ner("My name is Sylvain and I work at Hugging Face in Brooklyn.")
```

```python
[{'entity_group': 'PER', 'score': 0.99816, 'word': 'Sylvain', 'start': 11, 'end': 18},
 {'entity_group': 'ORG', 'score': 0.97960, 'word': 'Hugging Face', 'start': 33, 'end': 45},
 {'entity_group': 'LOC', 'score': 0.99321, 'word': 'Brooklyn', 'start': 49, 'end': 57}
]
```

Here the model correctly identified that Sylvain is a person (PER), Hugging Face an organization (ORG), and Brooklyn a location (LOC).

We pass the option `aggregation_strategy="simple"` in the pipeline creation function to tell the pipeline to regroup together the parts of the sentence that correspond to the same entity: here the model correctly grouped "Hugging" and "Face" as a single organization, even though the name consists of multiple words. In fact, as we will see in the next chapter, the preprocessing even splits some words into smaller parts. For instance, `Sylvain` is split into four pieces: `S`, `##yl`, `##va`, and `##in`. In the post-processing step, the pipeline successfully regrouped those pieces.

> **Tip:**
> ✏️ **Try it out!** Search the Model Hub for a model able to do part-of-speech tagging (usually abbreviated as POS) in English. What does this model predict for the sentence in the example above?

### Question answering

The `question-answering` pipeline answers questions using information from a given context:

```python
from transformers import pipeline

question_answerer = pipeline("question-answering")
question_answerer(
    question="Where do I work?",
    context="My name is Sylvain and I work at Hugging Face in Brooklyn",
)
```

```python
{'score': 0.6385916471481323, 'start': 33, 'end': 45, 'answer': 'Hugging Face'}
```

Note that this pipeline works by extracting information from the provided context; it does not generate the answer.

### Summarization

Summarization is the task of reducing a text into a shorter text while keeping all (or most) of the important aspects referenced in the text. Here's an example:

```python
from transformers import pipeline

summarizer = pipeline("summarization")
summarizer(
    """
    America has changed dramatically during recent years. Not only has the number of
    graduates in traditional engineering disciplines such as mechanical, civil,
    electrical, chemical, and aeronautical engineering declined, but in most of
    the premier American universities engineering curricula now concentrate on
    and encourage largely the study of engineering science. As a result, there
    are declining offerings in engineering subjects dealing with infrastructure,
    the environment, and related issues, and greater concentration on high
    technology subjects, largely supporting increasingly complex scientific
    developments. While the latter is important, it should not be at the expense
    of more traditional engineering.

    Rapidly developing economies such as China and India, as well as other
    industrial countries in Europe and Asia, continue to encourage and advance
    the teaching of engineering. Both China and India, respectively, graduate
    six and eight times as many traditional engineers as does the United States.
    Other industrial countries at minimum maintain their output, while America
    suffers an increasingly serious decline in the number of engineering graduates
    and a lack of well-educated engineers.
"""
)
```

```python
[{'summary_text': ' America has changed dramatically during recent years . The '
                  'number of engineering graduates in the U.S. has declined in '
                  'traditional engineering disciplines such as mechanical, civil '
                  ', electrical, chemical, and aeronautical engineering . Rapidly '
                  'developing economies such as China and India, as well as other '
                  'industrial countries in Europe and Asia, continue to encourage '
                  'and advance engineering .'}]
```

Like with text generation, you can specify a `max_length` or a `min_length` for the result.

### Translation

For translation, you can use a default model if you provide a language pair in the task name (such as `"translation_en_to_fr"`), but the easiest way is to pick the model you want to use on the [Model Hub](https://huggingface.co/models). Here we'll try translating from French to English:

```python
from transformers import pipeline

translator = pipeline("translation", model="Helsinki-NLP/opus-mt-fr-en")
translator("Ce cours est produit par Hugging Face.")
```

```python
[{'translation_text': 'This course is produced by Hugging Face.'}]
```

Like with text generation and summarization, you can specify a `max_length` or a `min_length` for the result.

> **Tip:**
> ✏️ **Try it out!** Search for translation models in other languages and try to translate the previous sentence into a few different languages.

### Image and audio pipelines

Beyond text, Transformer models can also work with images and audio. Here are a few examples:

#### Image classification

```python
from transformers import pipeline

image_classifier = pipeline(
    task="image-classification", model="google/vit-base-patch16-224"
)
result = image_classifier(
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/pipeline-cat-chonk.jpeg"
)
print(result)
```

```python
[{'label': 'lynx, catamount', 'score': 0.43350091576576233},
 {'label': 'cougar, puma, catamount, mountain lion, painter, panther, Felis concolor',
  'score': 0.034796204417943954},
 {'label': 'snow leopard, ounce, Panthera uncia',
  'score': 0.03240183740854263},
 {'label': 'Egyptian cat', 'score': 0.02394474856555462},
 {'label': 'tiger cat', 'score': 0.02288915030658245}]
```

#### Automatic speech recognition

```python
from transformers import pipeline

transcriber = pipeline(
    task="automatic-speech-recognition", model="openai/whisper-large-v3"
)
result = transcriber(
    "https://huggingface.co/datasets/Narsil/asr_dummy/resolve/main/mlk.flac"
)
print(result)
```

```python
{'text': ' I have a dream that one day this nation will rise up and live out the true meaning of its creed.'}
```

### Combining data from multiple sources

One powerful application of Transformer models is their ability to combine and process data from multiple sources. This is especially useful when you need to:

1. Search across multiple databases or repositories
2. Consolidate information from different formats (text, images, audio)
3. Create a unified view of related information

For example, you could build a system that:
- Searches for information across databases in multiple modalities like text and image.
- Combines results from different sources into a single coherent response. For example, from an audio file and text description.
- Presents the most relevant information from a database of documents and metadata.

### Conclusion

The pipelines shown in this chapter are mostly for demonstrative purposes. They were programmed for specific tasks and cannot perform variations of them. In the next chapter, you'll learn what's inside a `pipeline()` function and how to customize its behavior.

## How Do Transformers Work?

> **Source:** [How Do Transformers Work?](https://huggingface.co/learn/llm-course/chapter1/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

In this section, we will take a look at the architecture of Transformer models and dive deeper into the concepts of attention, encoder-decoder architecture, and more.

> **Warning:**
> 🚀 We're taking things up a notch here. This section is detailed and technical, so don't worry if you don't understand everything right away. We'll come back to these concepts later in the course.

### A bit of Transformer history

Here are some reference points in the (short) history of Transformer models:

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/transformers_chrono.svg" alt="A brief chronology of Transformers models.">

</div>

The [Transformer architecture](https://arxiv.org/abs/1706.03762) was introduced in June 2017. The focus of the original research was on translation tasks. This was followed by the introduction of several influential models, including:

- **June 2018**: [GPT](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), the first pretrained Transformer model, used for fine-tuning on various NLP tasks and obtained state-of-the-art results

- **October 2018**: [BERT](https://arxiv.org/abs/1810.04805), another large pretrained model, this one designed to produce better summaries of sentences (more on this in the next chapter!)

- **February 2019**: [GPT-2](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), an improved (and bigger) version of GPT that was not immediately publicly released due to ethical concerns

- **October 2019**: [T5](https://huggingface.co/papers/1910.10683), A multi-task focused implementation of the sequence-to-sequence Transformer architecture.

- **May 2020**, [GPT-3](https://huggingface.co/papers/2005.14165), an even bigger version of GPT-2 that is able to perform well on a variety of tasks without the need for fine-tuning (called _zero-shot learning_)

- **January 2022**: [InstructGPT](https://huggingface.co/papers/2203.02155), a version of GPT-3 that was trained to follow instructions better.

- **January 2023**: [Llama](https://huggingface.co/papers/2302.13971), a large language model that is able to generate text in a variety of languages.

- **March 2023**: [Mistral](https://huggingface.co/papers/2310.06825), a 7-billion-parameter language model that outperforms Llama 2 13B across all evaluated benchmarks, leveraging grouped-query attention for faster inference and sliding window attention to handle sequences of arbitrary length.

- **May 2024**: [Gemma 2](https://huggingface.co/papers/2408.00118), a family of lightweight, state-of-the-art open models ranging from 2B to 27B parameters that incorporate interleaved local-global attentions and group-query attention, with smaller models trained using knowledge distillation to deliver performance competitive with models 2-3 times larger.

- **November 2024**: [SmolLM2](https://huggingface.co/papers/2502.02737), a state-of-the-art small language model (135 million to 1.7 billion parameters) that achieves impressive performance despite its compact size, and unlocking new possibilities for mobile and edge devices.

This list is far from comprehensive, and is just meant to highlight a few of the different kinds of Transformer models. Broadly, they can be grouped into three categories:

- GPT-like (also called _auto-regressive_ Transformer models)
- BERT-like (also called _auto-encoding_ Transformer models)
- T5-like (also called _sequence-to-sequence_ Transformer models)

We will dive into these families in more depth later on.

### Transformers are language models

All the Transformer models mentioned above (GPT, BERT, T5, etc.) have been trained as *language models*. This means they have been trained on large amounts of raw text in a self-supervised fashion.

Self-supervised learning is a type of training in which the objective is automatically computed from the inputs of the model. That means that humans are not needed to label the data!

This type of model develops a statistical understanding of the language it has been trained on, but it's less useful for specific practical tasks. Because of this, the general pretrained model then goes through a process called *transfer learning* or *fine-tuning*. During this process, the model is fine-tuned in a supervised way -- that is, using human-annotated labels -- on a given task.

An example of a task is predicting the next word in a sentence having read the *n* previous words. This is called *causal language modeling* because the output depends on the past and present inputs, but not the future ones.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/causal_modeling.svg" alt="Example of causal language modeling in which the next word from a sentence is predicted.">

</div>

Another example is *masked language modeling*, in which the model predicts a masked word in the sentence.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/masked_modeling.svg" alt="Example of masked language modeling in which a masked word from a sentence is predicted.">

</div>

### Transformers are big models

Apart from a few outliers (like DistilBERT), the general strategy to achieve better performance is by increasing the models' sizes as well as the amount of data they are pretrained on.

<div class="flex justify-center">
<img src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/model_parameters.png" alt="Number of parameters of recent Transformers models" width="90%">
</div>

Unfortunately, training a model, especially a large one, requires a large amount of data. This becomes very costly in terms of time and compute resources. It even translates to environmental impact, as can be seen in the following graph.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/carbon_footprint.svg" alt="The carbon footprint of a large language model.">

</div>

And this is showing a project for a (very big) model led by a team consciously trying to reduce the environmental impact of pretraining. The footprint of running lots of trials to get the best hyperparameters would be even higher.

Imagine if each time a research team, a student organization, or a company wanted to train a model, it did so from scratch. This would lead to huge, unnecessary global costs!

This is why sharing language models is paramount: sharing the trained weights and building on top of already trained weights reduces the overall compute cost and carbon footprint of the community.

By the way, you can evaluate the carbon footprint of your models' training through several tools. For example [ML CO2 Impact](https://mlco2.github.io/impact/) or [Code Carbon]( https://codecarbon.io/) which is integrated in 🤗 Transformers. To learn more about this, you can read this [blog post](https://huggingface.co/blog/carbon-emissions-on-the-hub) which will show you how to generate an `emissions.csv` file with an estimate of the footprint of your training, as well as the [documentation](https://huggingface.co/docs/hub/model-cards-co2) of 🤗 Transformers addressing this topic.

### Transfer Learning

*Pretraining* is the act of training a model from scratch: the weights are randomly initialized, and the training starts without any prior knowledge.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/pretraining.svg" alt="The pretraining of a language model is costly in both time and money.">

</div>

This pretraining is usually done on very large amounts of data. Therefore, it requires a very large corpus of data, and training can take up to several weeks.

*Fine-tuning*, on the other hand, is the training done **after** a model has been pretrained. To perform fine-tuning, you first acquire a pretrained language model, then perform additional training with a dataset specific to your task. Wait -- why not simply train the model for your final use case from the start (**scratch**)? There are a couple of reasons:

*  The pretrained model was already trained on a dataset that has some similarities with the fine-tuning dataset. The fine-tuning process is thus able to take advantage of knowledge acquired by the initial model during pretraining (for instance, with NLP problems, the pretrained model will have some kind of statistical understanding of the language you are using for your task).
*  Since the pretrained model was already trained on lots of data, the fine-tuning requires way less data to get decent results.
*  For the same reason, the amount of time and resources needed to get good results are much lower.

For example, one could leverage a pretrained model trained on the English language and then fine-tune it on an arXiv corpus, resulting in a science/research-based model. The fine-tuning will only require a limited amount of data: the knowledge the pretrained model has acquired is "transferred," hence the term *transfer learning*.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/finetuning.svg" alt="The fine-tuning of a language model is cheaper than pretraining in both time and money.">

</div>

Fine-tuning a model therefore has lower time, data, financial, and environmental costs. It is also quicker and easier to iterate over different fine-tuning schemes, as the training is less constraining than a full pretraining.

This process will also achieve better results than training from scratch (unless you have lots of data), which is why you should always try to leverage a pretrained model -- one as close as possible to the task you have at hand -- and fine-tune it.

### General Transformer architecture

In this section, we'll go over the general architecture of the Transformer model. Don't worry if you don't understand some of the concepts; there are detailed sections later covering each of the components.

The model is primarily composed of two blocks:

* **Encoder (left)**: The encoder receives an input and builds a representation of it (its features). This means that the model is optimized to acquire understanding from the input.
* **Decoder (right)**: The decoder uses the encoder's representation (features) along with other inputs to generate a target sequence. This means that the model is optimized for generating outputs.

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/transformers_blocks.svg" alt="Architecture of a Transformers models">

</div>

Each of these parts can be used independently, depending on the task:

* **Encoder-only models**: Good for tasks that require understanding of the input, such as sentence classification and named entity recognition.
* **Decoder-only models**: Good for generative tasks such as text generation.
* **Encoder-decoder models** or **sequence-to-sequence models**: Good for generative tasks that require an input, such as translation or summarization.

We will dive into those architectures independently in later sections.

### Attention layers

A key feature of Transformer models is that they are built with special layers called *attention layers*. In fact, the title of the paper introducing the Transformer architecture was ["Attention Is All You Need"](https://arxiv.org/abs/1706.03762)! We will explore the details of attention layers later in the course; for now, all you need to know is that this layer will tell the model to pay specific attention to certain words in the sentence you passed it (and more or less ignore the others) when dealing with the representation of each word.

To put this into context, consider the task of translating text from English to French. Given the input "You like this course", a translation model will need to also attend to the adjacent word "You" to get the proper translation for the word "like", because in French the verb "like" is conjugated differently depending on the subject. The rest of the sentence, however, is not useful for the translation of that word. In the same vein, when translating "this" the model will also need to pay attention to the word "course", because "this" translates differently depending on whether the associated noun is masculine or feminine. Again, the other words in the sentence will not matter for the translation of "course". With more complex sentences (and more complex grammar rules), the model would need to pay special attention to words that might appear farther away in the sentence to properly translate each word.

The same concept applies to any task associated with natural language: a word by itself has a meaning, but that meaning is deeply affected by the context, which can be any other word (or words) before or after the word being studied.

Now that you have an idea of what attention layers are all about, let's take a closer look at the Transformer architecture.

### The original architecture

The Transformer architecture was originally designed for translation. During training, the encoder receives inputs (sentences) in a certain language, while the decoder receives the same sentences in the desired target language. In the encoder, the attention layers can use all the words in a sentence (since, as we just saw, the translation of a given word can be dependent on what is after as well as before it in the sentence). The decoder, however, works sequentially and can only pay attention to the words in the sentence that it has already translated (so, only the words before the word currently being generated). For example, when we have predicted the first three words of the translated target, we give them to the decoder  which then uses all the inputs of the encoder to try to predict the fourth word.

To speed things up during training (when the model has access to target sentences), the decoder is fed the whole target, but it is not allowed to use future words (if it had access to the word at position 2 when trying to predict the word at position 2, the problem would not be very hard!). For instance, when trying to predict the fourth word, the attention layer will only have access to the words in positions 1 to 3.

The original Transformer architecture looked like this, with the encoder on the left and the decoder on the right:

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/transformers.svg" alt="Architecture of a Transformers models">

</div>

Note that the first attention layer in a decoder block pays attention to all (past) inputs to the decoder, but the second attention layer uses the output of the encoder. It can thus access the whole input sentence to best predict the current word. This is very useful as different languages can have grammatical rules that put the words in different orders, or some context provided later in the sentence may be helpful to determine the best translation of a given word.

The *attention mask* can also be used in the encoder/decoder to prevent the model from paying attention to some special words -- for instance, the special padding word used to make all the inputs the same length when batching together sentences.

###  Architectures vs. checkpoints

As we dive into Transformer models in this course, you'll see mentions of *architectures* and *checkpoints* as well as *models*. These terms all have slightly different meanings:

* **Architecture**: This is the skeleton of the model -- the definition of each layer and each operation that happens within the model.
* **Checkpoints**: These are the weights that will be loaded in a given architecture.
* **Model**: This is an umbrella term that isn't as precise as "architecture" or "checkpoint": it can mean both. This course will specify *architecture* or *checkpoint* when it matters to reduce ambiguity.

For example, BERT is an architecture while `bert-base-cased`, a set of weights trained by the Google team for the first release of BERT, is a checkpoint. However, one can say "the BERT model" and "the `bert-base-cased` model."

## How Transformers Solve Tasks

> **Source:** [How Transformers Solve Tasks](https://huggingface.co/learn/llm-course/chapter1/5) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

In [Transformers, what can they do?](https://huggingface.co/course/chapter1/3), you learned about natural language processing (NLP), speech and audio, computer vision tasks, and some important applications of them. This page will look closely at how models solve these tasks and explain what's happening under the hood. There are many ways to solve a given task, some models may implement certain techniques or even approach the task from a new angle, but for Transformer models, the general idea is the same. Owing to its flexible architecture, most models are a variant of an encoder, a decoder, or an encoder-decoder structure.

> **Tip:**
> Before diving into specific architectural variants, it's helpful to understand that most tasks follow a similar pattern: input data is processed through a model, and the output is interpreted for a specific task. The differences lie in how the data is prepared, what model architecture variant is used, and how the output is processed.

To explain how tasks are solved, we'll walk through what goes on inside the model to output useful predictions. We'll cover the following models and their corresponding tasks:

- [Wav2Vec2](https://huggingface.co/docs/transformers/model_doc/wav2vec2) for audio classification and automatic speech recognition (ASR)
- [Vision Transformer (ViT)](https://huggingface.co/docs/transformers/model_doc/vit) and [ConvNeXT](https://huggingface.co/docs/transformers/model_doc/convnext) for image classification
- [DETR](https://huggingface.co/docs/transformers/model_doc/detr) for object detection
- [Mask2Former](https://huggingface.co/docs/transformers/model_doc/mask2former) for image segmentation
- [GLPN](https://huggingface.co/docs/transformers/model_doc/glpn) for depth estimation
- [BERT](https://huggingface.co/docs/transformers/model_doc/bert) for NLP tasks like text classification, token classification and question answering that use an encoder
- [GPT2](https://huggingface.co/docs/transformers/model_doc/gpt2) for NLP tasks like text generation that use a decoder
- [BART](https://huggingface.co/docs/transformers/model_doc/bart) for NLP tasks like summarization and translation that use an encoder-decoder

> **Tip:**
> Before you go further, it is good to have some basic knowledge of the original Transformer architecture. Knowing how encoders, decoders, and attention work will aid you in understanding how different Transformer models work. Be sure to check out our [the previous section](https://huggingface.co/course/chapter1/4?fw=pt) for more information!

### Transformer models for language

Language models are at the heart of modern NLP. They're designed to understand and generate human language by learning the statistical patterns and relationships between words or tokens in text.

The Transformer was initially designed for machine translation, and since then, it has become the default architecture for solving all AI tasks. Some tasks lend themselves to the Transformer's encoder structure, while others are better suited for the decoder. Still, other tasks make use of both the Transformer's encoder-decoder structure.

#### How language models work

Language models work by being trained to predict the probability of a word given the context of surrounding words. This gives them a foundational understanding of language that can generalize to other tasks.

There are two main approaches for training a transformer model:

1. **Masked language modeling (MLM)**: Used by encoder models like BERT, this approach randomly masks some tokens in the input and trains the model to predict the original tokens based on the surrounding context. This allows the model to learn bidirectional context (looking at words both before and after the masked word).

2. **Causal language modeling (CLM)**: Used by decoder models like GPT, this approach predicts the next token based on all previous tokens in the sequence. The model can only use context from the left (previous tokens) to predict the next token.

#### Types of language models

In the Transformers library, language models generally fall into three architectural categories:

1. **Encoder-only models** (like BERT): These models use a bidirectional approach to understand context from both directions. They're best suited for tasks that require deep understanding of text, such as classification, named entity recognition, and question answering.

2. **Decoder-only models** (like GPT, Llama): These models process text from left to right and are particularly good at text generation tasks. They can complete sentences, write essays, or even generate code based on a prompt.

3. **Encoder-decoder models** (like T5, BART): These models combine both approaches, using an encoder to understand the input and a decoder to generate output. They excel at sequence-to-sequence tasks like translation, summarization, and question answering.

![transformer-models-for-language](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/transformers_architecture.png)

As we covered in the previous section, language models are typically pretrained on large amounts of text data in a self-supervised manner (without human annotations), then fine-tuned on specific tasks. This approach, known as transfer learning, allows these models to adapt to many different NLP tasks with relatively small amounts of task-specific data.

In the following sections, we'll explore specific model architectures and how they're applied to various tasks across speech, vision, and text domains.

> **Tip:**
> Understanding which part of the Transformer architecture (encoder, decoder, or both) is best suited for a particular NLP task is key to choosing the right model. Generally, tasks requiring bidirectional context use encoders, tasks generating text use decoders, and tasks converting one sequence to another use encoder-decoders.

#### Text generation

Text generation involves creating coherent and contextually relevant text based on a prompt or input.

[GPT-2](https://huggingface.co/docs/transformers/model_doc/gpt2) is a decoder-only model pretrained on a large amount of text. It can generate convincing (though not always true!) text given a prompt and complete other NLP tasks like question answering despite not being explicitly trained to.

<div class="flex justify-center">
    <img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gpt2_architecture.png"/>
</div>

1. GPT-2 uses [byte pair encoding (BPE)](https://huggingface.co/docs/transformers/tokenizer_summary#bytepair-encoding-bpe) to tokenize words and generate a token embedding. Positional encodings are added to the token embeddings to indicate the position of each token in the sequence. The input embeddings are passed through multiple decoder blocks to output some final hidden state. Within each decoder block, GPT-2 uses a *masked self-attention* layer which means GPT-2 can't attend to future tokens. It is only allowed to attend to tokens on the left. This is different from BERT's [`mask`] token because, in masked self-attention, an attention mask is used to set the score to `0` for future tokens.

2. The output from the decoder is passed to a language modeling head, which performs a linear transformation to convert the hidden states into logits. The label is the next token in the sequence, which are created by shifting the logits to the right by one. The cross-entropy loss is calculated between the shifted logits and the labels to output the next most likely token.

GPT-2's pretraining objective is based entirely on [causal language modeling](https://huggingface.co/docs/transformers/glossary#causal-language-modeling), predicting the next word in a sequence. This makes GPT-2 especially good at tasks that involve generating text.

Ready to try your hand at text generation? Check out our complete [causal language modeling guide](https://huggingface.co/docs/transformers/tasks/language_modeling#causal-language-modeling) to learn how to finetune DistilGPT-2 and use it for inference!

> **Tip:**
> For more information about text generation, check out the [text generation strategies](https://huggingface.co/docs/transformers/generation_strategies#generation-strategies) guide!

#### Text classification

Text classification involves assigning predefined categories to text documents, such as sentiment analysis, topic classification, or spam detection.

[BERT](https://huggingface.co/docs/transformers/model_doc/bert) is an encoder-only model and is the first model to effectively implement deep bidirectionality to learn richer representations of the text by attending to words on both sides.

1. BERT uses [WordPiece](https://huggingface.co/docs/transformers/tokenizer_summary#wordpiece) tokenization to generate a token embedding of the text. To tell the difference between a single sentence and a pair of sentences, a special `[SEP]` token is added to differentiate them. A special `[CLS]` token is added to the beginning of every sequence of text. The final output with the `[CLS]` token is used as the input to the classification head for classification tasks. BERT also adds a segment embedding to denote whether a token belongs to the first or second sentence in a pair of sentences.

2. BERT is pretrained with two objectives: masked language modeling and next-sentence prediction. In masked language modeling, some percentage of the input tokens are randomly masked, and the model needs to predict these. This solves the issue of bidirectionality, where the model could cheat and see all the words and "predict" the next word. The final hidden states of the predicted mask tokens are passed to a feedforward network with a softmax over the vocabulary to predict the masked word.

    The second pretraining object is next-sentence prediction. The model must predict whether sentence B follows sentence A. Half of the time sentence B is the next sentence, and the other half of the time, sentence B is a random sentence. The prediction, whether it is the next sentence or not, is passed to a feedforward network with a softmax over the two classes (`IsNext` and `NotNext`).

3. The input embeddings are passed through multiple encoder layers to output some final hidden states.

To use the pretrained model for text classification, add a sequence classification head on top of the base BERT model. The sequence classification head is a linear layer that accepts the final hidden states and performs a linear transformation to convert them into logits. The cross-entropy loss is calculated between the logits and target to find the most likely label.

Ready to try your hand at text classification? Check out our complete [text classification guide](https://huggingface.co/docs/transformers/tasks/sequence_classification) to learn how to finetune DistilBERT and use it for inference!

#### Token classification

Token classification involves assigning a label to each token in a sequence, such as in named entity recognition or part-of-speech tagging.

To use BERT for token classification tasks like named entity recognition (NER), add a token classification head on top of the base BERT model. The token classification head is a linear layer that accepts the final hidden states and performs a linear transformation to convert them into logits. The cross-entropy loss is calculated between the logits and each token to find the most likely label.

Ready to try your hand at token classification? Check out our complete [token classification guide](https://huggingface.co/docs/transformers/tasks/token_classification) to learn how to finetune DistilBERT and use it for inference!

#### Question answering

Question answering involves finding the answer to a question within a given context or passage.

To use BERT for question answering, add a span classification head on top of the base BERT model. This linear layer accepts the final hidden states and performs a linear transformation to compute the `span` start and end logits corresponding to the answer. The cross-entropy loss is calculated between the logits and the label position to find the most likely span of text corresponding to the answer.

Ready to try your hand at question answering? Check out our complete [question answering guide](https://huggingface.co/docs/transformers/tasks/question_answering) to learn how to finetune DistilBERT and use it for inference!

> **Tip:**
> 💡 Notice how easy it is to use BERT for different tasks once it's been pretrained. You only need to add a specific head to the pretrained model to manipulate the hidden states into your desired output!

#### Summarization

Summarization involves condensing a longer text into a shorter version while preserving its key information and meaning.

Encoder-decoder models like [BART](https://huggingface.co/docs/transformers/model_doc/bart) and [T5](https://huggingface.co/learn/llm-course/model_doc/t5) are designed for the sequence-to-sequence pattern of a summarization task. We'll explain how BART works in this section, and then you can try finetuning T5 at the end.

<div class="flex justify-center">
    <img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bart_architecture.png"/>
</div>

1. BART's encoder architecture is very similar to BERT and accepts a token and positional embedding of the text. BART is pretrained by corrupting the input and then reconstructing it with the decoder. Unlike other encoders with specific corruption strategies, BART can apply any type of corruption. The *text infilling* corruption strategy works the best though. In text infilling, a number of text spans are replaced with a **single** [`mask`] token. This is important because the model has to predict the masked tokens, and it teaches the model to predict the number of missing tokens. The input embeddings and masked spans are passed through the encoder to output some final hidden states, but unlike BERT, BART doesn't add a final feedforward network at the end to predict a word.

2. The encoder's output is passed to the decoder, which must predict the masked tokens and any uncorrupted tokens from the encoder's output. This gives additional context to help the decoder restore the original text. The output from the decoder is passed to a language modeling head, which performs a linear transformation to convert the hidden states into logits. The cross-entropy loss is calculated between the logits and the label, which is just the token shifted to the right.

Ready to try your hand at summarization? Check out our complete [summarization guide](https://huggingface.co/docs/transformers/tasks/summarization) to learn how to finetune T5 and use it for inference!

> **Tip:**
> For more information about text generation, check out the [text generation strategies](https://huggingface.co/docs/transformers/generation_strategies) guide!

#### Translation

Translation involves converting text from one language to another while preserving its meaning. Translation is another example of a sequence-to-sequence task, which means you can use an encoder-decoder model like [BART](https://huggingface.co/docs/transformers/model_doc/bart) or [T5](https://huggingface.co/learn/llm-course/model_doc/t5) to do it. We'll explain how BART works in this section, and then you can try finetuning T5 at the end.

BART adapts to translation by adding a separate randomly initialized encoder to map a source language to an input that can be decoded into the target language. This new encoder's embeddings are passed to the pretrained encoder instead of the original word embeddings. The source encoder is trained by updating the source encoder, positional embeddings, and input embeddings with the cross-entropy loss from the model output. The model parameters are frozen in this first step, and all the model parameters are trained together in the second step.
BART has since been followed up by a multilingual version, mBART, intended for translation and pretrained on many different languages.

Ready to try your hand at translation? Check out our complete [translation guide](https://huggingface.co/docs/transformers/tasks/translation) to learn how to finetune T5 and use it for inference!

> **Tip:**
> As you've seen throughout this guide, many models follow similar patterns despite addressing different tasks. Understanding these common patterns can help you quickly grasp how new models work and how to adapt existing models to your specific needs.

### Modalities beyond text

Transformers are not limited to text. They can also be applied to other modalities like speech and audio, images, and video. Of course, on this course we will focus on text, but we can briefly introduce the other modalities.

#### Speech and audio

Let's start by exploring how Transformer models handle speech and audio data, which presents unique challenges compared to text or images.

[Whisper](https://huggingface.co/docs/transformers/main/en/model_doc/whisper) is a encoder-decoder (sequence-to-sequence) transformer pretrained on 680,000 hours of labeled audio data. This amount of pretraining data enables zero-shot performance on audio tasks in English and many other languages. The decoder allows Whisper to map the encoders learned speech representations to useful outputs, such as text, without additional fine-tuning. Whisper just works out of the box.

<div class="flex justify-center">
    <img src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter1/whisper_architecture.png"/>
</div>

Diagram is from [Whisper paper](https://huggingface.co/papers/2212.04356).

This model has two main components:

1. An **encoder** processes the input audio. The raw audio is first converted into a log-Mel spectrogram. This spectrogram is then passed through a Transformer encoder network.

2. A **decoder** takes the encoded audio representation and autoregressively predicts the corresponding text tokens. It's a standard Transformer decoder trained to predict the next text token given the previous tokens and the encoder output. Special tokens are used at the beginning of the decoder input to steer the model towards specific tasks like transcription, translation, or language identification.

Whisper was pretrained on a massive and diverse dataset of 680,000 hours of labeled audio data collected from the web. This large-scale, weakly supervised pretraining is the key to its strong zero-shot performance across many languages and tasks.

Now that Whisper is pretrained, you can use it directly for zero-shot inference or finetune it on your data for improved performance on specific tasks like automatic speech recognition or speech translation!

> **Tip:**
> The key innovation in Whisper is its training on an unprecedented scale of diverse, weakly supervised audio data from the internet. This allows it to generalize remarkably well to different languages, accents, and tasks without task-specific finetuning.

#### Automatic speech recognition

To use the pretrained model for automatic speech recognition, you leverage its full encoder-decoder structure. The encoder processes the audio input, and the decoder autoregressively generates the transcript token by token. When fine-tuning, the model is typically trained using a standard sequence-to-sequence loss (like cross-entropy) to predict the correct text tokens based on the audio input.

The easiest way to use a fine-tuned model for inference is within a `pipeline`.

```python
from transformers import pipeline

transcriber = pipeline(
    task="automatic-speech-recognition", model="openai/whisper-base.en"
)
transcriber("https://huggingface.co/datasets/Narsil/asr_dummy/resolve/main/mlk.flac")
# Output: {'text': ' I have a dream that one day this nation will rise up and live out the true meaning of its creed.'}
```

Ready to try your hand at automatic speech recognition? Check out our complete [automatic speech recognition guide](https://huggingface.co/docs/transformers/tasks/asr) to learn how to finetune Whisper and use it for inference!

#### Computer vision

Now let's move on to computer vision tasks, which deal with understanding and interpreting visual information from images or videos.

There are two ways to approach computer vision tasks:

1. Split an image into a sequence of patches and process them in parallel with a Transformer.
2. Use a modern CNN, like [ConvNeXT](https://huggingface.co/docs/transformers/model_doc/convnext), which relies on convolutional layers but adopts modern network designs.

> **Tip:**
> A third approach mixes Transformers with convolutions (for example, [Convolutional Vision Transformer](https://huggingface.co/docs/transformers/model_doc/cvt) or [LeViT](https://huggingface.co/docs/transformers/model_doc/levit)). We won't discuss those because they just combine the two approaches we examine here.

ViT and ConvNeXT are commonly used for image classification, but for other vision tasks like object detection, segmentation, and depth estimation, we'll look at DETR, Mask2Former and GLPN, respectively; these models are better suited for those tasks.

#### Image classification

Image classification is one of the fundamental computer vision tasks. Let's see how different model architectures approach this problem.

ViT and ConvNeXT can both be used for image classification; the main difference is that ViT uses an attention mechanism while ConvNeXT uses convolutions.

[ViT](https://huggingface.co/docs/transformers/model_doc/vit) replaces convolutions entirely with a pure Transformer architecture. If you're familiar with the original Transformer, then you're already most of the way toward understanding ViT.

<div class="flex justify-center">
    <img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/model_doc/vit_architecture.jpg"/>
</div>

The main change ViT introduced was in how images are fed to a Transformer:

1. An image is split into square non-overlapping patches, each of which gets turned into a vector or *patch embedding*. The patch embeddings are generated from a convolutional 2D layer which creates the proper input dimensions (which for a base Transformer is 768 values for each patch embedding). If you had a 224x224 pixel image, you could split it into 196 16x16 image patches. Just like how text is tokenized into words, an image is "tokenized" into a sequence of patches.

2. A *learnable embedding* - a special `[CLS]` token - is added to the beginning of the patch embeddings just like BERT. The final hidden state of the `[CLS]` token is used as the input to the attached classification head; other outputs are ignored. This token helps the model learn how to encode a representation of the image.

3. The last thing to add to the patch and learnable embeddings are the *position embeddings* because the model doesn't know how the image patches are ordered. The position embeddings are also learnable and have the same size as the patch embeddings. Finally, all of the embeddings are passed to the Transformer encoder.

4. The output, specifically only the output with the `[CLS]` token, is passed to a multilayer perceptron head (MLP). ViT's pretraining objective is simply classification. Like other classification heads, the MLP head converts the output into logits over the class labels and calculates the cross-entropy loss to find the most likely class.

Ready to try your hand at image classification? Check out our complete [image classification guide](https://huggingface.co/docs/transformers/tasks/image_classification) to learn how to fine-tune ViT and use it for inference!

> **Tip:**
> Notice the parallel between ViT and BERT: both use a special token (<code>[CLS]</code>) to capture the overall representation, both add position information to their embeddings, and both use a Transformer encoder to process the sequence of tokens/patches.

## Transformer Architectures

> **Source:** [Transformer Architectures](https://huggingface.co/learn/llm-course/chapter1/6) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Transformer Architectures

In the previous sections, we introduced the general Transformer architecture and explored how these models can solve various tasks. Now, let's take a closer look at the three main architectural variants of Transformer models and understand when to use each one. Then, we look at how those architectures are applied to different language tasks.

In this section, we're going to dive deeper into the three main architectural variants of Transformer models and understand when to use each one.

> **Tip:**
> Remember that most Transformer models use one of three architectures: encoder-only, decoder-only, or encoder-decoder (sequence-to-sequence). Understanding these differences will help you choose the right model for your specific task.

#### Encoder models

Encoder models use only the encoder of a Transformer model. At each stage, the attention layers can access all the words in the initial sentence. These models are often characterized as having "bi-directional" attention, and are often called *auto-encoding models*.

The pretraining of these models usually revolves around somehow corrupting a given sentence (for instance, by masking random words in it) and tasking the model with finding or reconstructing the initial sentence.

Encoder models are best suited for tasks requiring an understanding of the full sentence, such as sentence classification, named entity recognition (and more generally word classification), and extractive question answering.

> **Tip:**
> As we saw in [How 🤗 Transformers solve tasks](https://huggingface.co/learn/llm-course/chapter1/5), encoder models like BERT excel at understanding text because they can look at the entire context in both directions. This makes them perfect for tasks where comprehension of the whole input is important.

Representatives of this family of models include:

- [BERT](https://huggingface.co/docs/transformers/model_doc/bert)
- [DistilBERT](https://huggingface.co/docs/transformers/model_doc/distilbert)
- [ModernBERT](https://huggingface.co/docs/transformers/en/model_doc/modernbert)

#### Decoder models

Decoder models use only the decoder of a Transformer model. At each stage, for a given word the attention layers can only access the words positioned before it in the sentence. These models are often called *auto-regressive models*.

The pretraining of decoder models usually revolves around predicting the next word in the sentence.

These models are best suited for tasks involving text generation.

> **Tip:**
> Decoder models like GPT are designed to generate text by predicting one token at a time. As we explored in [How 🤗 Transformers solve tasks](https://huggingface.co/learn/llm-course/chapter1/5), they can only see previous tokens, which makes them excellent for creative text generation but less ideal for tasks requiring bidirectional understanding.

Representatives of this family of models include:

- [Hugging Face SmolLM Series](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct)
- [Meta's Llama Series](https://huggingface.co/docs/transformers/en/model_doc/llama4)
- [Google's Gemma Series](https://huggingface.co/docs/transformers/main/en/model_doc/gemma3)
- [DeepSeek's V3](https://huggingface.co/deepseek-ai/DeepSeek-V3)

##### Modern Large Language Models (LLMs)

Most modern Large Language Models (LLMs) use the decoder-only architecture. These models have grown dramatically in size and capabilities over the past few years, with some of the largest models containing hundreds of billions of parameters.

Modern LLMs are typically trained in two phases:
1. **Pretraining**: The model learns to predict the next token on vast amounts of text data
2. **Instruction tuning**: The model is fine-tuned to follow instructions and generate helpful responses

This approach has led to models that can understand and generate human-like text across a wide range of topics and tasks.

###### Key capabilities of modern LLMs

Modern decoder-based LLMs have demonstrated impressive capabilities:

| Capability | Description | Example |
|------------|-------------|---------|
| Text generation | Creating coherent and contextually relevant text | Writing essays, stories, or emails |
| Summarization | Condensing long documents into shorter versions | Creating executive summaries of reports |
| Translation | Converting text between languages | Translating English to Spanish |
| Question answering | Providing answers to factual questions | "What is the capital of France?" |
| Code generation | Writing or completing code snippets | Creating a function based on a description |
| Reasoning | Working through problems step by step | Solving math problems or logical puzzles |
| Few-shot learning | Learning from a few examples in the prompt | Classifying text after seeing just 2-3 examples |

You can experiment with decoder-based LLMs directly in your browser via model repo pages on the Hub. Here's an example with the classic [GPT-2](https://huggingface.co/openai-community/gpt2) (OpenAI's finest open source model!):

<a
  href="https://huggingface.co/openai-community/gpt2" target="_blank">
  View GPT-2 model on Hugging Face
</a>

#### Sequence-to-sequence models

Encoder-decoder models (also called *sequence-to-sequence models*) use both parts of the Transformer architecture. At each stage, the attention layers of the encoder can access all the words in the initial sentence, whereas the attention layers of the decoder can only access the words positioned before a given word in the input.

The pretraining of these models can take different forms, but it often involves reconstructing a sentence for which the input has been somehow corrupted (for instance by masking random words). The pretraining of the T5 model consists of replacing random spans of text (that can contain several words) with a single mask special token, and the task is then to predict the text that this mask token replaces.

Sequence-to-sequence models are best suited for tasks revolving around generating new sentences depending on a given input, such as summarization, translation, or generative question answering.

> **Tip:**
> As we saw in [How 🤗 Transformers solve tasks](https://huggingface.co/learn/llm-course/chapter1/5), encoder-decoder models like BART and T5 combine the strengths of both architectures. The encoder provides deep bidirectional understanding of the input, while the decoder generates appropriate output text. This makes them perfect for tasks that transform one sequence into another, like translation or summarization.

##### Practical applications

Sequence-to-sequence models excel at tasks that require transforming one form of text into another while preserving meaning. Some practical applications include:

| Application | Description | Example Model |
|-------------|-------------|---------------|
| Machine translation | Converting text between languages | Marian, T5 |
| Text summarization | Creating concise summaries of longer texts | BART, T5 |
| Data-to-text generation | Converting structured data into natural language | T5 |
| Grammar correction | Fixing grammatical errors in text | T5 |
| Question answering | Generating answers based on context | BART, T5 |

Here's an interactive demo of a sequence-to-sequence model for translation:

<iframe
	src="https://course-demos-speech-to-speech-translation.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>

Representatives of this family of models include:

- [BART](https://huggingface.co/docs/transformers/model_doc/bart)
- [mBART](https://huggingface.co/docs/transformers/model_doc/mbart)
- [Marian](https://huggingface.co/docs/transformers/model_doc/marian)
- [T5](https://huggingface.co/docs/transformers/model_doc/t5)

#### Choosing the right architecture

When working on a specific NLP task, how do you decide which architecture to use? Here's a quick guide:

| Task | Suggested Architecture | Examples |
|------|------------------------|----------|
| Text classification (sentiment, topic) | Encoder | BERT, RoBERTa |
| Text generation (creative writing) | Decoder | GPT, LLaMA |
| Translation | Encoder-Decoder | T5, BART |
| Summarization | Encoder-Decoder | BART, T5 |
| Named entity recognition | Encoder | BERT, RoBERTa |
| Question answering (extractive) | Encoder | BERT, RoBERTa |
| Question answering (generative) | Encoder-Decoder or Decoder | T5, GPT |
| Conversational AI | Decoder | GPT, LLaMA |

> **Tip:**
> When in doubt about which model to use, consider:
>
> 1. What kind of understanding does your task need? (Bidirectional or unidirectional)
> 2. Are you generating new text or analyzing existing text?
> 3. Do you need to transform one sequence into another?
>
> The answers to these questions will guide you toward the right architecture.

#### The evolution of LLMs

Large Language Models have evolved rapidly in recent years, with each generation bringing significant improvements in capabilities.

#### Attention mechanisms

Most transformer models use full attention in the sense that the attention matrix is square. It can be a big
computational bottleneck when you have long texts. Longformer and reformer are models that try to be more efficient and
use a sparse version of the attention matrix to speed up training.

> **Tip:**
> Standard attention mechanisms have a computational complexity of O(n²), where n is the sequence length. This becomes problematic for very long sequences. The specialized attention mechanisms below help address this limitation.

##### LSH attention

[Reformer](https://huggingface.co/docs/transformers/model_doc/reformer) uses LSH attention. In the softmax(QK^t), only the biggest elements (in the softmax dimension) of the matrix QK^t are going to give useful contributions. So for each query q in Q, we can consider only
the keys k in K that are close to q. A hash function is used to determine if q and k are close. The attention mask is
modified to mask the current token (except at the first position), because it will give a query and a key equal (so
very similar to each other). Since the hash can be a bit random, several hash functions are used in practice
(determined by a n_rounds parameter) and then are averaged together.

##### Local attention

[Longformer](https://huggingface.co/docs/transformers/model_doc/longformer) uses local attention: often, the local context (e.g., what are the two tokens to the  left and right?) is enough to take action for a given token. Also, by stacking attention layers that have a small
window, the last layer will have a receptive field of more than just the tokens in the window, allowing them to build a
representation of the whole sentence.

Some preselected input tokens are also given global attention: for those few tokens, the attention matrix can access
all tokens and this process is symmetric: all other tokens have access to those specific tokens (on top of the ones in
their local window). This is shown in Figure 2d of the paper, see below for a sample attention mask:

<div class="flex justify-center">
    <img scale="50 %" align="center" src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/local_attention_mask.png"/>
</div>

Using those attention matrices with less parameters then allows the model to have inputs having a bigger sequence
length.

##### Axial positional encodings

[Reformer](https://huggingface.co/docs/transformers/model_doc/reformer) uses axial positional encodings: in traditional transformer models, the positional encoding
E is a matrix of size \\(l\\) by \\(d\\), \\(l\\) being the sequence length and \\(d\\) the dimension of the
hidden state. If you have very long texts, this matrix can be huge and take way too much space on the GPU. To alleviate
that, axial positional encodings consist of factorizing that big matrix E in two smaller matrices E1 and E2, with
dimensions \\(l_{1} \times d_{1}\\) and \\(l_{2} \times d_{2}\\), such that \\(l_{1} \times l_{2} = l\\) and
\\(d_{1} + d_{2} = d\\) (with the product for the lengths, this ends up being way smaller). The embedding for time
step \\(j\\) in E is obtained by concatenating the embeddings for timestep \\(j \% l1\\) in E1 and \\(j // l1\\)
in E2.

#### Conclusion

In this section, we've explored the three main Transformer architectures and some specialized attention mechanisms. Understanding these architectural differences is crucial for selecting the right model for your specific NLP task.

As we move forward in the course, you'll get hands-on experience with these different architectures and learn how to fine-tune them for your specific needs. In the next section, we'll look at some of the limitations and biases present in these models that you should be aware of when deploying them.

## Inference with LLMs

> **Source:** [Inference with LLMs](https://huggingface.co/learn/llm-course/chapter1/8) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

So far, we've explored the transformer architecture in relation to a range of discrete tasks, like text classification or summarization. However, Large Language Models are most used for text generation, and this is what we'll explore in this chapter.

In this page, we'll explore the core concepts behind LLM inference, providing a comprehensive understanding of how these models generate text and the key components involved in the inference process.

### Understanding the Basics

Let's start with the fundamentals. Inference is the process of using a trained LLM to generate human-like text from a given input prompt. Language models use their knowledge from training to formulate responses one word at a time. The model leverages learned probabilities from billions of parameters to predict and generate the next token in a sequence. This sequential generation is what allows LLMs to produce coherent and contextually relevant text.

### The Role of Attention

The attention mechanism is what gives LLMs their ability to understand context and generate coherent responses. When predicting the next word, not every word in a sentence carries equal weight - for example, in the sentence *"The capital of France is ..."*, the words "France" and "capital" are crucial for determining that "Paris" should come next. This ability to focus on relevant information is what we call attention.

<img src="https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/AttentionSceneFinal.gif" alt="Visual Gif of Attention" width="60%">

This process of identifying the most relevant words to predict the next token has proven to be incredibly effective. Although the basic principle of training LLMs—predicting the next token—has remained generally consistent since BERT and GPT-2, there have been significant advancements in scaling neural networks and making the attention mechanism work for longer and longer sequences, at lower and lower costs.

> **Tip:**
> In short, the attention mechanism is the key to LLMs being able to generate text that is both coherent and context-aware. It sets modern LLMs apart from previous generations of language models.

#### Context Length and Attention Span

Now that we understand attention, let's explore how much context an LLM can actually handle. This brings us to context length, or the model's 'attention span'.

The context length refers to the maximum number of tokens (words or parts of words) that the LLM can process at once. Think of it as the size of the model's working memory.

These capabilities are limited by several practical factors:
- The model's architecture and size
- Available computational resources
- The complexity of the input and desired output

In an ideal world, we could feed unlimited context to the model, but hardware constraints and computational costs make this impractical. This is why different models are designed with different context lengths to balance capability with efficiency.

> **Tip:**
> The context length is the maximum number of tokens the model can consider at once when generating a response.

#### The Art of Prompting

When we pass information to LLMs, we structure our input in a way that guides the generation of the LLM toward the desired output. This is called _prompting_.

Understanding how LLMs process information helps us craft better prompts. Since the model's primary task is to predict the next token by analyzing the importance of each input token, the wording of your input sequence becomes crucial.

> **Tip:**
> Careful design of the prompt makes it easier **to guide the generation of the LLM toward the desired output**.

### The Two-Phase Inference Process

Now that we understand the basic components, let's dive into how LLMs actually generate text. The process can be broken down into two main phases: prefill and decode. These phases work together like an assembly line, each playing a crucial role in producing coherent text.

#### The Prefill Phase

The prefill phase is like the preparation stage in cooking - it's where all the initial ingredients are processed and made ready. This phase involves three key steps:

1. **Tokenization**: Converting the input text into tokens (think of these as the basic building blocks the model understands)
2. **Embedding Conversion**: Transforming these tokens into numerical representations that capture their meaning
3. **Initial Processing**: Running these embeddings through the model's neural networks to create a rich understanding of the context

This phase is computationally intensive because it needs to process all input tokens at once. Think of it as reading and understanding an entire paragraph before starting to write a response.

You can experiment with different tokenizers in the interactive playground below:

<iframe
	src="https://agents-course-the-tokenizer-playground.static.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>

#### The Decode Phase

After the prefill phase has processed the input, we move to the decode phase - this is where the actual text generation happens. The model generates one token at a time in what we call an autoregressive process (where each new token depends on all previous tokens).

The decode phase involves several key steps that happen for each new token:
1. **Attention Computation**: Looking back at all previous tokens to understand context
2. **Probability Calculation**: Determining the likelihood of each possible next token
3. **Token Selection**: Choosing the next token based on these probabilities
4. **Continuation Check**: Deciding whether to continue or stop generation

This phase is memory-intensive because the model needs to keep track of all previously generated tokens and their relationships.

### Sampling Strategies

Now that we understand how the model generates text, let's explore the various ways we can control this generation process. Just like a writer might choose between being more creative or more precise, we can adjust how the model makes its token selections.

You can interact with the basic decoding process yourself with SmolLM2 in this Space (remember, it decodes until reaching an **EOS** token which is  **<|im_end|>** for this model):

<iframe
	src="https://agents-course-decoding-visualizer.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>

#### Understanding Token Selection: From Probabilities to Token Choices

When the model needs to choose the next token, it starts with raw probabilities (called logits) for every word in its vocabulary. But how do we turn these probabilities into actual choices? Let's break down the process:

![image](https://huggingface.co/reasoning-course/images/resolve/main/inference/1.png)

1. **Raw Logits**: Think of these as the model's initial gut feelings about each possible next word
2. **Temperature Control**: Like a creativity dial - higher settings (>1.0) make choices more random and creative, lower settings (<1.0) make them more focused and deterministic
3. **Top-p (Nucleus) Sampling**: Instead of considering all possible words, we only look at the most likely ones that add up to our chosen probability threshold (e.g., top 90%)
4. **Top-k Filtering**: An alternative approach where we only consider the k most likely next words

#### Managing Repetition: Keeping Output Fresh

One common challenge with LLMs is their tendency to repeat themselves - much like a speaker who keeps returning to the same points. To address this, we use two types of penalties:

1. **Presence Penalty**: A fixed penalty applied to any token that has appeared before, regardless of how often. This helps prevent the model from reusing the same words.
2. **Frequency Penalty**: A scaling penalty that increases based on how often a token has been used. The more a word appears, the less likely it is to be chosen again.

![image](https://huggingface.co/reasoning-course/images/resolve/main/inference/2.png)

These penalties are applied early in the token selection process, adjusting the raw probabilities before other sampling strategies are applied. Think of them as gentle nudges encouraging the model to explore new vocabulary.

#### Controlling Generation Length: Setting Boundaries

Just as a good story needs proper pacing and length, we need ways to control how much text our LLM generates. This is crucial for practical applications - whether we're generating a tweet-length response or a full blog post.

We can control generation length in several ways:
1. **Token Limits**: Setting minimum and maximum token counts
2. **Stop Sequences**: Defining specific patterns that signal the end of generation
3. **End-of-Sequence Detection**: Letting the model naturally conclude its response

For example, if we want to generate a single paragraph, we might set a maximum of 100 tokens and use "\n\n" as a stop sequence. This ensures our output stays focused and appropriately sized for its purpose.

![image](https://huggingface.co/reasoning-course/images/resolve/main/inference/3.png)

#### Beam Search: Looking Ahead for Better Coherence

While the strategies we've discussed so far make decisions one token at a time, beam search takes a more holistic approach. Instead of committing to a single choice at each step, it explores multiple possible paths simultaneously - like a chess player thinking several moves ahead.

![image](https://huggingface.co/reasoning-course/images/resolve/main/inference/4.png)

Here's how it works:
1. At each step, maintain multiple candidate sequences (typically 5-10)
2. For each candidate, compute probabilities for the next token
3. Keep only the most promising combinations of sequences and next tokens
4. Continue this process until reaching the desired length or stop condition
5. Select the sequence with the highest overall probability

You can explore beam search visually here:

<iframe
	src="https://agents-course-beam-search-visualizer.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>

This approach often produces more coherent and grammatically correct text, though it requires more computational resources than simpler methods.

### Practical Challenges and Optimization

As we wrap up our exploration of LLM inference, let's look at the practical challenges you'll face when deploying these models, and how to measure and optimize their performance.

#### Key Performance Metrics

When working with LLMs, four critical metrics will shape your implementation decisions:

1. **Time to First Token (TTFT)**: How quickly can you get the first response? This is crucial for user experience and is primarily affected by the prefill phase.
2. **Time Per Output Token (TPOT)**: How fast can you generate subsequent tokens? This determines the overall generation speed.
3. **Throughput**: How many requests can you handle simultaneously? This affects scaling and cost efficiency.
4. **VRAM Usage**: How much GPU memory do you need? This often becomes the primary constraint in real-world applications.

#### The Context Length Challenge

One of the most significant challenges in LLM inference is managing context length effectively. Longer contexts provide more information but come with substantial costs:

- **Memory Usage**: Grows quadratically with context length
- **Processing Speed**: Decreases linearly with longer contexts
- **Resource Allocation**: Requires careful balancing of VRAM usage

Recent models like [Qwen2.5-1M](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M) offer impressive 1M token context windows, but this comes at the cost of significantly slower inference times. The key is finding the right balance for your specific use case.

<div style="max-width: 800px; margin: 20px auto; padding: 20px;
font-family: system-ui;">
    <div style="border: 2px solid #ddd; border-radius: 8px;
    padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center;
        margin-bottom: 15px;">
            <div style="flex: 1; text-align: center; padding:
            10px; background: #f0f0f0; border-radius: 4px;">
                Input Text (Raw)
            </div>
            <div style="margin: 0 10px;">→</div>
            <div style="flex: 1; text-align: center; padding:
            10px; background: #e1f5fe; border-radius: 4px;">
                Tokenized Input
            </div>
        </div>
        <div style="display: flex; margin-bottom: 15px;">
            <div style="flex: 1; border: 1px solid #ccc;
            padding: 10px; margin: 5px; background: #e8f5e9;
            border-radius: 4px; text-align: center;">
                Context Window<br/>(e.g., 4K tokens)
                <div style="display: flex; margin-top: 10px;">
                    <div style="flex: 1; background: #81c784;
                    margin: 2px; height: 20px; border-radius:
                    2px;"></div>
                    <div style="flex: 1; background: #81c784;
                    margin: 2px; height: 20px; border-radius:
                    2px;"></div>
                    <div style="flex: 1; background: #81c784;
                    margin: 2px; height: 20px; border-radius:
                    2px;"></div>
                    <div style="flex: 1; background: #81c784;
                    margin: 2px; height: 20px; border-radius:
                    2px;"></div>
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content:
        space-between; text-align: center; font-size: 0.9em;
        color: #666;">
            <div style="flex: 1;">
                <div style="border: 1px solid #ffcc80; padding:
                8px; margin: 5px; background: #fff3e0;
                border-radius: 4px;">
                    Memory Usage<br/>∝ Length²
                </div>
            </div>
            <div style="flex: 1;">
                <div style="border: 1px solid #90caf9; padding:
                8px; margin: 5px; background: #e3f2fd;
                border-radius: 4px;">
                    Processing Time<br/>∝ Length
                </div>
            </div>
        </div>
    </div>
</div>

#### The KV Cache Optimization

To address these challenges, one of the most powerful optimizations is KV (Key-Value) caching. This technique significantly improves inference speed by storing and reusing intermediate calculations. This optimization:
- Reduces repeated calculations
- Improves generation speed
- Makes long-context generation practical

The trade-off is additional memory usage, but the performance benefits usually far outweigh this cost.

### Conclusion

Understanding LLM inference is crucial for effectively deploying and optimizing these powerful models. We've covered the key components:

- The fundamental role of attention and context
- The two-phase inference process
- Various sampling strategies for controlling generation
- Practical challenges and optimizations

By mastering these concepts, you'll be better equipped to build applications that leverage LLMs effectively and efficiently.

Remember that the field of LLM inference is rapidly evolving, with new techniques and optimizations emerging regularly. Stay curious and keep experimenting with different approaches to find what works best for your specific use cases.

## Bias and Limitations

> **Source:** [Bias and Limitations](https://huggingface.co/learn/llm-course/chapter1/9) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

If your intent is to use a pretrained model or a fine-tuned version in production, please be aware that, while these models are powerful tools, they come with limitations. The biggest of these is that, to enable pretraining on large amounts of data, researchers often scrape all the content they can find, taking the best as well as the worst of what is available on the internet.

To give a quick illustration, let's go back to the example of a `fill-mask` pipeline with the BERT model:

```python
from transformers import pipeline

unmasker = pipeline("fill-mask", model="bert-base-uncased")
result = unmasker("This man works as a [MASK].")
print([r["token_str"] for r in result])

result = unmasker("This woman works as a [MASK].")
print([r["token_str"] for r in result])
```

```python
['lawyer', 'carpenter', 'doctor', 'waiter', 'mechanic']
['nurse', 'waitress', 'teacher', 'maid', 'prostitute']
```

When asked to fill in the missing word in these two sentences, the model gives only one gender-free answer (waiter/waitress). The others are work occupations usually associated with one specific gender -- and yes, prostitute ended up in the top 5 possibilities the model associates with "woman" and "work." This happens even though BERT is one of the rare Transformer models not built by scraping data from all over the internet, but rather using apparently neutral data (it's trained on the [English Wikipedia](https://huggingface.co/datasets/wikipedia) and [BookCorpus](https://huggingface.co/datasets/bookcorpus) datasets).

When you use these tools, you therefore need to keep in the back of your mind that the original model you are using could very easily generate sexist, racist, or homophobic content. Fine-tuning the model on your data won't make this intrinsic bias disappear.

## Behind the Pipeline

> **Source:** [Behind the Pipeline](https://huggingface.co/learn/llm-course/chapter2/2) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Behind the pipeline

Let's start with a complete example, taking a look at what happened behind the scenes when we executed the following code in [Chapter 1](https://huggingface.co/course/chapter1):

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
classifier(
    [
        "I've been waiting for a HuggingFace course my whole life.",
        "I hate this so much!",
    ]
)
```

and obtained:

```python
[{'label': 'POSITIVE', 'score': 0.9598047137260437},
 {'label': 'NEGATIVE', 'score': 0.9994558095932007}]
```

As we saw in [Chapter 1](https://huggingface.co/course/chapter1), this pipeline groups together three steps: preprocessing, passing the inputs through the model, and postprocessing:

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter2/full_nlp_pipeline.svg" alt="The full NLP pipeline: tokenization of text, conversion to IDs, and inference through the Transformer model and the model head."/>

</div>

Let's quickly go over each of these.

#### Preprocessing with a tokenizer

Like other neural networks, Transformer models can't process raw text directly, so the first step of our pipeline is to convert the text inputs into numbers that the model can make sense of. To do this we use a *tokenizer*, which will be responsible for:

- Splitting the input into words, subwords, or symbols (like punctuation) that are called *tokens*
- Mapping each token to an integer
- Adding additional inputs that may be useful to the model

All this preprocessing needs to be done in exactly the same way as when the model was pretrained, so we first need to download that information from the [Model Hub](https://huggingface.co/models). To do this, we use the `AutoTokenizer` class and its `from_pretrained()` method. Using the checkpoint name of our model, it will automatically fetch the data associated with the model's tokenizer and cache it (so it's only downloaded the first time you run the code below).

Since the default checkpoint of the `sentiment-analysis` pipeline is `distilbert-base-uncased-finetuned-sst-2-english` (you can see its model card [here](https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english)), we run the following:

```python
from transformers import AutoTokenizer

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
```

Once we have the tokenizer, we can directly pass our sentences to it and we'll get back a dictionary that's ready to feed to our model! The only thing left to do is to convert the list of input IDs to tensors.

You can use 🤗 Transformers without having to worry about which ML framework is used as a backend; it might be PyTorch or Flax for some models. However, Transformer models only accept *tensors* as input. If this is your first time hearing about tensors, you can think of them as NumPy arrays instead. A NumPy array can be a scalar (0D), a vector (1D), a matrix (2D), or have more dimensions. It's effectively a tensor; other ML frameworks' tensors behave similarly, and are usually as simple to instantiate as NumPy arrays.

To specify the type of tensors we want to get back (PyTorch or plain NumPy), we use the `return_tensors` argument:

```python
raw_inputs = [
    "I've been waiting for a HuggingFace course my whole life.",
    "I hate this so much!",
]
inputs = tokenizer(raw_inputs, padding=True, truncation=True, return_tensors="pt")
print(inputs)
```

Don't worry about padding and truncation just yet; we'll explain those later. The main things to remember here are that you can pass one sentence or a list of sentences, as well as specifying the type of tensors you want to get back (if no type is passed, you will get a list of lists as a result).

Here's what the results look like as PyTorch tensors:

```python
{
    'input_ids': tensor([
        [  101,  1045,  1005,  2310,  2042,  3403,  2005,  1037, 17662, 12172, 2607,  2026,  2878,  2166,  1012,   102],
        [  101,  1045,  5223,  2023,  2061,  2172,   999,   102,     0,     0,     0,     0,     0,     0,     0,     0]
    ]),
    'attention_mask': tensor([
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    ])
}
```

The output itself is a dictionary containing two keys, `input_ids` and `attention_mask`. `input_ids` contains two rows of integers (one for each sentence) that are the unique identifiers of the tokens in each sentence. We'll explain what the `attention_mask` is later in this chapter.

#### Going through the model

We can download our pretrained model the same way we did with our tokenizer. 🤗 Transformers provides an `AutoModel` class which also has a `from_pretrained()` method:

```python
from transformers import AutoModel

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
model = AutoModel.from_pretrained(checkpoint)
```

In this code snippet, we have downloaded the same checkpoint we used in our pipeline before (it should actually have been cached already) and instantiated a model with it.

This architecture contains only the base Transformer module: given some inputs, it outputs what we'll call *hidden states*, also known as *features*. For each model input, we'll retrieve a high-dimensional vector representing the **contextual understanding of that input by the Transformer model**.

If this doesn't make sense, don't worry about it. We'll explain it all later.

While these hidden states can be useful on their own, they're usually inputs to another part of the model, known as the *head*. In [Chapter 1](https://huggingface.co/course/chapter1), the different tasks could have been performed with the same architecture, but each of these tasks will have a different head associated with it.

##### A high-dimensional vector?

The vector output by the Transformer module is usually large. It generally has three dimensions:

- **Batch size**: The number of sequences processed at a time (2 in our example).
- **Sequence length**: The length of the numerical representation of the sequence (16 in our example).
- **Hidden size**: The vector dimension of each model input.

It is said to be "high dimensional" because of the last value. The hidden size can be very large (768 is common for smaller models, and in larger models this can reach 3072 or more).

We can see this if we feed the inputs we preprocessed to our model:

```python
outputs = model(**inputs)
print(outputs.last_hidden_state.shape)
```

```python
torch.Size([2, 16, 768])
```

Note that the outputs of 🤗 Transformers models behave like `namedtuple`s or dictionaries. You can access the elements by attributes (like we did) or by key (`outputs["last_hidden_state"]`), or even by index if you know exactly where the thing you are looking for is (`outputs[0]`).

##### Model heads: Making sense out of numbers

The model heads take the high-dimensional vector of hidden states as input and project them onto a different dimension. They are usually composed of one or a few linear layers:

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter2/transformer_and_head.svg" alt="A Transformer network alongside its head."/>

</div>

The output of the Transformer model is sent directly to the model head to be processed.

In this diagram, the model is represented by its embeddings layer and the subsequent layers. The embeddings layer converts each input ID in the tokenized input into a vector that represents the associated token. The subsequent layers manipulate those vectors using the attention mechanism to produce the final representation of the sentences.

There are many different architectures available in 🤗 Transformers, with each one designed around tackling a specific task. Here is a non-exhaustive list:

- `*Model` (retrieve the hidden states)
- `*ForCausalLM`
- `*ForMaskedLM`
- `*ForMultipleChoice`
- `*ForQuestionAnswering`
- `*ForSequenceClassification`
- `*ForTokenClassification`
- and others 🤗

For our example, we will need a model with a sequence classification head (to be able to classify the sentences as positive or negative). So, we won't actually use the `AutoModel` class, but `AutoModelForSequenceClassification`:

```python
from transformers import AutoModelForSequenceClassification

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)
outputs = model(**inputs)
```

Now if we look at the shape of our outputs, the dimensionality will be much lower: the model head takes as input the high-dimensional vectors we saw before, and outputs vectors containing two values (one per label):

```python
print(outputs.logits.shape)
```

```python
torch.Size([2, 2])
```

Since we have just two sentences and two labels, the result we get from our model is of shape 2 x 2.

#### Postprocessing the output

The values we get as output from our model don't necessarily make sense by themselves. Let's take a look:

```python
print(outputs.logits)
```

```python
tensor([[-1.5607,  1.6123],
        [ 4.1692, -3.3464]], grad_fn=<AddmmBackward>)
```

Our model predicted `[-1.5607, 1.6123]` for the first sentence and `[ 4.1692, -3.3464]` for the second one. Those are not probabilities but *logits*, the raw, unnormalized scores outputted by the last layer of the model. To be converted to probabilities, they need to go through a [SoftMax](https://en.wikipedia.org/wiki/Softmax_function) layer (all 🤗 Transformers models output the logits, as the loss function for training will generally fuse the last activation function, such as SoftMax, with the actual loss function, such as cross entropy):

```py
import torch

predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
print(predictions)
```

```python
tensor([[4.0195e-02, 9.5980e-01],
        [9.9946e-01, 5.4418e-04]], grad_fn=<SoftmaxBackward>)
```

Now we can see that the model predicted `[0.0402, 0.9598]` for the first sentence and `[0.9995,  0.0005]` for the second one. These are recognizable probability scores.

To get the labels corresponding to each position, we can inspect the `id2label` attribute of the model config (more on this in the next section):

```python
model.config.id2label
```

```python
{0: 'NEGATIVE', 1: 'POSITIVE'}
```

Now we can conclude that the model predicted the following:

- First sentence: NEGATIVE: 0.0402, POSITIVE: 0.9598
- Second sentence: NEGATIVE: 0.9995, POSITIVE: 0.0005

We have successfully reproduced the three steps of the pipeline: preprocessing with tokenizers, passing the inputs through the model, and postprocessing! Now let's take some time to dive deeper into each of those steps.

> **Tip:**
> ✏️ **Try it out!** Choose two (or more) texts of your own and run them through the `sentiment-analysis` pipeline. Then replicate the steps you saw here yourself and check that you obtain the same results!

## Models

> **Source:** [Models](https://huggingface.co/learn/llm-course/chapter2/3) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Models

In this section, we'll take a closer look at creating and using models. We'll use the `AutoModel` class, which is handy when you want to instantiate any model from a checkpoint.

#### Creating a Transformer

Let's begin by examining what happens when we instantiate an `AutoModel`:

```py
from transformers import AutoModel

model = AutoModel.from_pretrained("bert-base-cased")
```

Similar to the tokenizer, the `from_pretrained()` method will download and cache the model data from the Hugging Face Hub. As mentioned previously, the checkpoint name corresponds to a specific model architecture and weights, in this case a BERT model with a basic architecture (12 layers, 768 hidden size, 12 attention heads) and cased inputs (meaning that the uppercase/lowercase distinction is important). There are many checkpoints available on the Hub — you can explore them [here](https://huggingface.co/models).

The `AutoModel` class and its associates are actually simple wrappers designed to fetch the appropriate model architecture for a given checkpoint. It's an "auto" class meaning it will guess the appropriate model architecture for you and instantiate the correct model class. However, if you know the type of model you want to use, you can use the class that defines its architecture directly:

```py
from transformers import BertModel

model = BertModel.from_pretrained("bert-base-cased")
```

#### Loading and saving

Saving a model is as simple as saving a tokenizer. In fact, the models actually have the same `save_pretrained()` method, which saves the model's weights and architecture configuration:

```py
model.save_pretrained("directory_on_my_computer")
```

This will save two files to your disk:

```
ls directory_on_my_computer

config.json model.safetensors
```

If you look inside the *config.json* file, you'll see all the necessary attributes needed to build the model architecture. This file also contains some metadata, such as where the checkpoint originated and what 🤗 Transformers version you were using when you last saved the checkpoint.

The *pytorch_model.safetensors* file is known as the state dictionary; it contains all your model's weights. The two files work together: the configuration file is needed to know about the model architecture, while the model weights are the parameters of the model.

To reuse a saved model, use the `from_pretrained()` method again:

```py
from transformers import AutoModel

model = AutoModel.from_pretrained("directory_on_my_computer")
```

A wonderful feature of the 🤗 Transformers library is the ability to easily share models and tokenizers with the community. To do this, make sure you have an account on [Hugging Face](https://huggingface.co). If you're using a notebook, you can easily log in with this:

```python
from huggingface_hub import notebook_login

notebook_login()
```

Otherwise, at your terminal run:

```bash
huggingface-cli login
```

Then you can push the model to the Hub with the `push_to_hub()` method:

```py
model.push_to_hub("my-awesome-model")
```

This will upload the model files to the Hub, in a repository under your namespace named *my-awesome-model*. Then, anyone can load your model with the `from_pretrained()` method!

```py
from transformers import AutoModel

model = AutoModel.from_pretrained("your-username/my-awesome-model")
```

You can do a lot more with the Hub API:
- Push a model from a local repository
- Update specific files without re-uploading everything
- Add model cards to document the model's abilities, limitations, known biases, etc.

See [the documentation](https://huggingface.co/docs/huggingface_hub/how-to-upstream) for a complete tutorial on this, or check out the advanced [Chapter 4](https://huggingface.co/course/chapter4).

#### Encoding text

Transformer models handle text by turning the inputs into numbers. Here we will look at exactly what happens when your text is processed by the tokenizer. We've already seen in [Chapter 1](https://huggingface.co/course/chapter1) that tokenizers split the text into tokens and then convert these tokens into numbers. We can see this conversion through a simple tokenizer:

```py
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")

encoded_input = tokenizer("Hello, I'm a single sentence!")
print(encoded_input)
```

```python
{'input_ids': [101, 8667, 117, 1000, 1045, 1005, 1049, 2235, 17662, 12172, 1012, 102],
 'token_type_ids': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 'attention_mask': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
```

We get a dictionary with the following fields:
- input_ids: numerical representations of your tokens
- token_type_ids: these tell the model which part of the input is sentence A and which is sentence B (discussed more in the next section)
- attention_mask: this indicates which tokens should be attended to and which should not (discussed more in a bit)

We can decode the input IDs to get back the original text:

```py
tokenizer.decode(encoded_input["input_ids"])
```

```python
"[CLS] Hello, I'm a single sentence! [SEP]"
```

You'll notice that the tokenizer has added special tokens — `[CLS]` and `[SEP]` — required by the model. Not all models need special tokens; they're utilized when a model was pretrained with them, in which case the tokenizer needs to add them as that model expects these tokens.

You can encode multiple sentences at once, either by batching them together (we'll discuss this soon) or by passing a list:

```py
encoded_input = tokenizer("How are you?", "I'm fine, thank you!")
print(encoded_input)
```

```python
{'input_ids': [[101, 1731, 1132, 1128, 136, 102], [101, 1045, 1005, 1049, 2503, 117, 5763, 1128, 136, 102]],
 'token_type_ids': [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
 'attention_mask': [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]}
```

Note that when passing multiple sentences, the tokenizer returns a list for each sentence for each dictionary value. We can also ask the tokenizer to return tensors directly from PyTorch:

```py
encoded_input = tokenizer("How are you?", "I'm fine, thank you!", return_tensors="pt")
print(encoded_input)
```

```python
{'input_ids': tensor([[  101,  1731,  1132,  1128,   136,   102],
         [  101,  1045,  1005,  1049,  2503,   117,  5763,  1128,   136,   102]]),
 'token_type_ids': tensor([[0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]),
 'attention_mask': tensor([[1, 1, 1, 1, 1, 1],
         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]])}
```

But there's a problem: the two lists don't have the same length! Arrays and tensors need to be rectangular, so we can't simply convert these lists to a PyTorch tensor (or NumPy array). The tokenizer provides an option for that: padding.

##### Padding inputs

If we ask the tokenizer to pad the inputs, it will make all sentences the same length by adding a special padding token to the sentences that are shorter than the longest one:

```py
encoded_input = tokenizer(
    ["How are you?", "I'm fine, thank you!"], padding=True, return_tensors="pt"
)
print(encoded_input)
```

```python
{'input_ids': tensor([[  101,  1731,  1132,  1128,   136,   102,     0,     0,     0,     0],
         [  101,  1045,  1005,  1049,  2503,   117,  5763,  1128,   136,   102]]),
 'token_type_ids': tensor([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]),
 'attention_mask': tensor([[1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]])}
```

Now we have rectangular tensors! Note that the padding tokens have been encoded into input IDs with ID 0, and they have an attention mask value of 0 as well. This is because those padding tokens shouldn't be analyzed by the model: they're not part of the actual sentence.

##### Truncating inputs

The tensors might get too big to be processed by the model. For instance, BERT was only pretrained with sequences up to 512 tokens, so it cannot process longer sequences. If you have sequences longer than the model can handle, you'll need to truncate them with the `truncation` parameter:

```py
encoded_input = tokenizer(
    "This is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long sentence.",
    truncation=True,
)
print(encoded_input["input_ids"])
```

```python
[101, 1188, 1110, 170, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1505, 1179, 5650, 119, 102]
```

By combining the padding and truncation arguments, you can make sure your tensors have the exact size you need:

```py
encoded_input = tokenizer(
    ["How are you?", "I'm fine, thank you!"],
    padding=True,
    truncation=True,
    max_length=5,
    return_tensors="pt",
)
print(encoded_input)
```

```python
{'input_ids': tensor([[  101,  1731,  1132,  1128,   102],
         [  101,  1045,  1005,  1049,   102]]),
 'token_type_ids': tensor([[0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0]]),
 'attention_mask': tensor([[1, 1, 1, 1, 1],
         [1, 1, 1, 1, 1]])}
```

##### Adding special tokens

Special tokens (or at least the concept of them) is particularly important to BERT and derived models. These tokens are added to better represent the sentence boundaries, such as the beginning of a sentence (`[CLS]`) or separator between sentences (`[SEP]`). Let's look at a simple example:

```py
encoded_input = tokenizer("How are you?")
print(encoded_input["input_ids"])
tokenizer.decode(encoded_input["input_ids"])
```

```python
[101, 1731, 1132, 1128, 136, 102]
'[CLS] How are you? [SEP]'
```

These special tokens are automatically added by the tokenizer. Not all models need special tokens; they are primarily used when a model was pretrained with them, in which case the tokenizer will add them since the model expects them.

##### Why is all of this necessary?

Here's a concrete example. Consider these encoded sequences:

```py
sequences = [
    "I've been waiting for a HuggingFace course my whole life.",
    "I hate this so much!",
]
```

Once tokenized, we have:

```python
encoded_sequences = [
    [
        101,
        1045,
        1005,
        2310,
        2042,
        3403,
        2005,
        1037,
        17662,
        12172,
        2607,
        2026,
        2878,
        2166,
        1012,
        102,
    ],
    [101, 1045, 5223, 2023, 2061, 2172, 999, 102],
]
```

This is a list of encoded sequences: a list of lists. Tensors only accept rectangular shapes (think matrices). This "array" is already of rectangular shape, so converting it to a tensor is easy:

```py
import torch

model_inputs = torch.tensor(encoded_sequences)
```

##### Using the tensors as inputs to the model

Making use of the tensors with the model is extremely simple — we just call the model with the inputs:

```py
output = model(model_inputs)
```

While the model accepts a lot of different arguments, only the input IDs are necessary. We'll explain what the other arguments do and when they are required later,
but first we need to take a closer look at the tokenizers that build the inputs that a Transformer model can understand.

## Tokenizers

> **Source:** [Tokenizers](https://huggingface.co/learn/llm-course/chapter2/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Tokenizers

Tokenizers are one of the core components of the NLP pipeline. They serve one purpose: to translate text into data that can be processed by the model. Models can only process numbers, so tokenizers need to convert our text inputs to numerical data. In this section, we'll explore exactly what happens in the tokenization pipeline.

In NLP tasks, the data that is generally processed is raw text. Here's an example of such text:

```
Jim Henson was a puppeteer
```

However, models can only process numbers, so we need to find a way to convert the raw text to numbers. That's what the tokenizers do, and there are a lot of ways to go about this. The goal is to find the most meaningful representation — that is, the one that makes the most sense to the model — and, if possible, the smallest representation.

Let's take a look at some examples of tokenization algorithms, and try to answer some of the questions you may have about tokenization.

#### Word-based

The first type of tokenizer that comes to mind is _word-based_. It's generally very easy to set up and use with only a few rules, and it often yields decent results. For example, in the image below, the goal is to split the raw text into words and find a numerical representation for each of them:

<div class="flex justify-center">
  <img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter2/word_based_tokenization.svg" alt="An example of word-based tokenization."/>

</div>

There are different ways to split the text. For example, we could use whitespace to tokenize the text into words by applying Python's `split()` function:

```py
tokenized_text = "Jim Henson was a puppeteer".split()
print(tokenized_text)
```

```python
['Jim', 'Henson', 'was', 'a', 'puppeteer']
```

There are also variations of word tokenizers that have extra rules for punctuation. With this kind of tokenizer, we can end up with some pretty large "vocabularies," where a vocabulary is defined by the total number of independent tokens that we have in our corpus.

Each word gets assigned an ID, starting from 0 and going up to the size of the vocabulary. The model uses these IDs to identify each word.

If we want to completely cover a language with a word-based tokenizer, we'll need to have an identifier for each word in the language, which will generate a huge amount of tokens. For example, there are over 500,000 words in the English language, so to build a map from each word to an input ID we'd need to keep track of that many IDs. Furthermore, words like "dog" are represented differently from words like "dogs", and the model will initially have no way of knowing that "dog" and "dogs" are similar: it will identify the two words as unrelated. The same applies to other similar words, like "run" and "running", which the model will not see as being similar initially.

Finally, we need a custom token to represent words that are not in our vocabulary. This is known as the "unknown" token, often represented as "[UNK]" or "&lt;unk&gt;". It's generally a bad sign if you see that the tokenizer is producing a lot of these tokens, as it wasn't able to retrieve a sensible representation of a word and you're losing information along the way. The goal when crafting the vocabulary is to do it in such a way that the tokenizer tokenizes as few words as possible into the unknown token.

One way to reduce the amount of unknown tokens is to go one level deeper, using a _character-based_ tokenizer.

#### Character-based

Character-based tokenizers split the text into characters, rather than words. This has two primary benefits:

- The vocabulary is much smaller.
- There are much fewer out-of-vocabulary (unknown) tokens, since every word can be built from characters.

But here too some questions arise concerning spaces and punctuation:

<div class="flex justify-center">
  <img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter2/character_based_tokenization.svg" alt="An example of character-based tokenization."/>

</div>

This approach isn't perfect either. Since the representation is now based on characters rather than words, one could argue that, intuitively, it's less meaningful: each character doesn't mean a lot on its own, whereas that is the case with words. However, this again differs according to the language; in Chinese, for example, each character carries more information than a character in a Latin language.

Another thing to consider is that we'll end up with a very large amount of tokens to be processed by our model: whereas a word would only be a single token with a word-based tokenizer, it can easily turn into 10 or more tokens when converted into characters.

To get the best of both worlds, we can use a third technique that combines the two approaches: *subword tokenization*.

#### Subword tokenization

Subword tokenization algorithms rely on the principle that frequently used words should not be split into smaller subwords, but rare words should be decomposed into meaningful subwords.

For instance, "annoyingly" might be considered a rare word and could be decomposed into "annoying" and "ly". These are both likely to appear more frequently as standalone subwords, while at the same time the meaning of "annoyingly" is kept by the composite meaning of "annoying" and "ly".

Here is an example showing how a subword tokenization algorithm would tokenize the sequence "Let's do tokenization!":

<div class="flex justify-center">
  <img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter2/bpe_subword.svg" alt="A subword tokenization algorithm."/>

</div>

These subwords end up providing a lot of semantic meaning: for instance, in the example above "tokenization" was split into "token" and "ization", two tokens that have a semantic meaning while being space-efficient (only two tokens are needed to represent a long word). This allows us to have relatively good coverage with small vocabularies, and close to no unknown tokens.

This approach is especially useful in agglutinative languages such as Turkish, where you can form (almost) arbitrarily long complex words by stringing together subwords.

##### And more!

Unsurprisingly, there are many more techniques out there. To name a few:

- Byte-level BPE, as used in GPT-2
- WordPiece, as used in BERT
- SentencePiece or Unigram, as used in several multilingual models

You should now have sufficient knowledge of how tokenizers work to get started with the API.

#### Loading and saving

Loading and saving tokenizers is as simple as it is with models. Actually, it's based on the same two methods: `from_pretrained()` and `save_pretrained()`. These methods will load or save the algorithm used by the tokenizer (a bit like the *architecture* of the model) as well as its vocabulary (a bit like the *weights* of the model).

Loading the BERT tokenizer trained with the same checkpoint as BERT is done the same way as loading the model, except we use the `BertTokenizer` class:

```py
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-cased")
```

Similar to `AutoModel`, the `AutoTokenizer` class will grab the proper tokenizer class in the library based on the checkpoint name, and can be used directly with any checkpoint:

```py
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")
```

We can now use the tokenizer as shown in the previous section:

```python
tokenizer("Using a Transformer network is simple")
```

```python
{'input_ids': [101, 7993, 170, 11303, 1200, 2443, 1110, 3014, 102],
 'token_type_ids': [0, 0, 0, 0, 0, 0, 0, 0, 0],
 'attention_mask': [1, 1, 1, 1, 1, 1, 1, 1, 1]}
```

Saving a tokenizer is identical to saving a model:

```py
tokenizer.save_pretrained("directory_on_my_computer")
```

We'll talk more about `token_type_ids` in [Chapter 3](https://huggingface.co/course/chapter3), and we'll explain the `attention_mask` key a little later. First, let's see how the `input_ids` are generated. To do this, we'll need to look at the intermediate methods of the tokenizer.

#### Encoding

Translating text to numbers is known as _encoding_. Encoding is done in a two-step process: the tokenization, followed by the conversion to input IDs.

As we've seen, the first step is to split the text into words (or parts of words, punctuation symbols, etc.), usually called *tokens*. There are multiple rules that can govern that process, which is why we need to instantiate the tokenizer using the name of the model, to make sure we use the same rules that were used when the model was pretrained.

The second step is to convert those tokens into numbers, so we can build a tensor out of them and feed them to the model. To do this, the tokenizer has a *vocabulary*, which is the part we download when we instantiate it with the `from_pretrained()` method. Again, we need to use the same vocabulary used when the model was pretrained.

To get a better understanding of the two steps, we'll explore them separately. Note that we will use some methods that perform parts of the tokenization pipeline separately to show you the intermediate results of those steps, but in practice, you should call the tokenizer directly on your inputs (as shown in the section 2).

##### Tokenization

The tokenization process is done by the `tokenize()` method of the tokenizer:

```py
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")

sequence = "Using a Transformer network is simple"
tokens = tokenizer.tokenize(sequence)

print(tokens)
```

The output of this method is a list of strings, or tokens:

```python
['Using', 'a', 'transform', '##er', 'network', 'is', 'simple']
```

This tokenizer is a subword tokenizer: it splits the words until it obtains tokens that can be represented by its vocabulary. That's the case here with `transformer`, which is split into two tokens: `transform` and `##er`.

##### From tokens to input IDs

The conversion to input IDs is handled by the `convert_tokens_to_ids()` tokenizer method:

```py
ids = tokenizer.convert_tokens_to_ids(tokens)

print(ids)
```

```python
[7993, 170, 11303, 1200, 2443, 1110, 3014]
```

These outputs, once converted to the appropriate framework tensor, can then be used as inputs to a model as seen earlier in this chapter.

> **Tip:**
> ✏️ **Try it out!** Replicate the two last steps (tokenization and conversion to input IDs) on the input sentences we used in section 2 ("I've been waiting for a HuggingFace course my whole life." and "I hate this so much!"). Check that you get the same input IDs we got earlier!

#### Decoding

*Decoding* is going the other way around: from vocabulary indices, we want to get a string. This can be done with the `decode()` method as follows:

```py
decoded_string = tokenizer.decode([7993, 170, 11303, 1200, 2443, 1110, 3014])
print(decoded_string)
```

```python
'Using a Transformer network is simple'
```

Note that the `decode` method not only converts the indices back to tokens, but also groups together the tokens that were part of the same words to produce a readable sentence. This behavior will be extremely useful when we use models that predict new text (either text generated from a prompt, or for sequence-to-sequence problems like translation or summarization).

By now you should understand the atomic operations a tokenizer can handle: tokenization, conversion to IDs, and converting IDs back to a string. However, we've just scraped the tip of the iceberg. In the following section, we'll take our approach to its limits and take a look at how to overcome them.

## Handling Multiple Sequences

> **Source:** [Handling Multiple Sequences](https://huggingface.co/learn/llm-course/chapter2/5) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Handling multiple sequences

In the previous section, we explored the simplest of use cases: doing inference on a single sequence of a small length. However, some questions emerge already:

- How do we handle multiple sequences?
- How do we handle multiple sequences *of different lengths*?
- Are vocabulary indices the only inputs that allow a model to work well?
- Is there such a thing as too long a sequence?

Let's see what kinds of problems these questions pose, and how we can solve them using the 🤗 Transformers API.

#### Models expect a batch of inputs

In the previous exercise you saw how sequences get translated into lists of numbers. Let's convert this list of numbers to a tensor and send it to the model:

```py
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)

sequence = "I've been waiting for a HuggingFace course my whole life."

tokens = tokenizer.tokenize(sequence)
ids = tokenizer.convert_tokens_to_ids(tokens)
input_ids = torch.tensor(ids)
# This line will fail.
model(input_ids)
```

```python
IndexError: Dimension out of range (expected to be in range of [-1, 0], but got 1)
```

Oh no! Why did this fail? We followed the steps from the pipeline in section 2.

The problem is that we sent a single sequence to the model, whereas 🤗 Transformers models expect multiple sentences by default. Here we tried to do everything the tokenizer did behind the scenes when we applied it to a `sequence`. But if you look closely, you'll see that the tokenizer didn't just convert the list of input IDs into a tensor, it added a dimension on top of it:

```py
tokenized_inputs = tokenizer(sequence, return_tensors="pt")
print(tokenized_inputs["input_ids"])
```

```python
tensor()
```

Let's try again and add a new dimension:

```py
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)

sequence = "I've been waiting for a HuggingFace course my whole life."

tokens = tokenizer.tokenize(sequence)
ids = tokenizer.convert_tokens_to_ids(tokens)

input_ids = torch.tensor([ids])
print("Input IDs:", input_ids)

output = model(input_ids)
print("Logits:", output.logits)
```

We print the input IDs as well as the resulting logits — here's the output:

```python
Input IDs:
Logits:
```

*Batching* is the act of sending multiple sentences through the model, all at once. If you only have one sentence, you can just build a batch with a single sequence:

```
batched_ids = [ids, ids]
```

This is a batch of two identical sequences!

> **Tip:**
> ✏️ **Try it out!** Convert this `batched_ids` list into a tensor and pass it through your model. Check that you obtain the same logits as before (but twice)!

Batching allows the model to work when you feed it multiple sentences. Using multiple sequences is just as simple as building a batch with a single sequence. There's a second issue, though. When you're trying to batch together two (or more) sentences, they might be of different lengths. If you've ever worked with tensors before, you know that they need to be of rectangular shape, so you won't be able to convert the list of input IDs into a tensor directly. To work around this problem, we usually *pad* the inputs.

#### Padding the inputs

The following list of lists cannot be converted to a tensor:

```py
batched_ids = [
    [200, 200, 200],
    [200, 200]
]
```

In order to work around this, we'll use *padding* to make our tensors have a rectangular shape. Padding makes sure all our sentences have the same length by adding a special word called the *padding token* to the sentences with fewer values. For example, if you have 10 sentences with 10 words and 1 sentence with 20 words, padding will ensure all the sentences have 20 words. In our example, the resulting tensor looks like this:

```py
padding_id = 100

batched_ids = [
    [200, 200, 200],
    [200, 200, padding_id],
]
```

The padding token ID can be found in `tokenizer.pad_token_id`. Let's use it and send our two sentences through the model individually and batched together:

```py
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)

sequence1_ids =
sequence2_ids =
batched_ids = [
    [200, 200, 200],
    [200, 200, tokenizer.pad_token_id],
]

print(model(torch.tensor(sequence1_ids)).logits)
print(model(torch.tensor(sequence2_ids)).logits)
print(model(torch.tensor(batched_ids)).logits)
```

```python
tensor(, grad_fn=<AddmmBackward>)
tensor(, grad_fn=<AddmmBackward>)
tensor([[ 1.5694, -1.3895],
        [ 1.3373, -1.2163]], grad_fn=<AddmmBackward>)
```

There's something wrong with the logits in our batched predictions: the second row should be the same as the logits for the second sentence, but we've got completely different values!

This is because the key feature of Transformer models is attention layers that *contextualize* each token. These will take into account the padding tokens since they attend to all of the tokens of a sequence. To get the same result when passing individual sentences of different lengths through the model or when passing a batch with the same sentences and padding applied, we need to tell those attention layers to ignore the padding tokens. This is done by using an attention mask.

#### Attention masks

*Attention masks* are tensors with the exact same shape as the input IDs tensor, filled with 0s and 1s: 1s indicate the corresponding tokens should be attended to, and 0s indicate the corresponding tokens should not be attended to (i.e., they should be ignored by the attention layers of the model).

Let's complete the previous example with an attention mask:

```py
batched_ids = [
    [200, 200, 200],
    [200, 200, tokenizer.pad_token_id],
]

attention_mask = [
    [1, 1, 1],
    [1, 1, 0],
]

outputs = model(torch.tensor(batched_ids), attention_mask=torch.tensor(attention_mask))
print(outputs.logits)
```

```python
tensor([[ 1.5694, -1.3895],
        [ 0.5803, -0.4125]], grad_fn=<AddmmBackward>)
```

Now we get the same logits for the second sentence in the batch.

Notice how the last value of the second sequence is a padding ID, which is a 0 value in the attention mask.

> **Tip:**
> ✏️ **Try it out!** Apply the tokenization manually on the two sentences used in section 2 ("I've been waiting for a HuggingFace course my whole life." and "I hate this so much!"). Pass them through the model and check that you get the same logits as in section 2. Now batch them together using the padding token, then create the proper attention mask. Check that you obtain the same results when going through the model!

#### Longer sequences

With Transformer models, there is a limit to the lengths of the sequences we can pass the models. Most models handle sequences of up to 512 or 1024 tokens, and will crash when asked to process longer sequences. There are two solutions to this problem:

- Use a model with a longer supported sequence length.
- Truncate your sequences.

Models have different supported sequence lengths, and some specialize in handling very long sequences. [Longformer](https://huggingface.co/docs/transformers/model_doc/longformer) is one example, and another is [LED](https://huggingface.co/docs/transformers/model_doc/led). If you're working on a task that requires very long sequences, we recommend you take a look at those models.

Otherwise, we recommend you truncate your sequences by specifying the `max_sequence_length` parameter:

```py
sequence = sequence[:max_sequence_length]
```

## Putting It All Together

> **Source:** [Putting It All Together](https://huggingface.co/learn/llm-course/chapter2/6) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Putting it all together

In the last few sections, we've been trying our best to do most of the work by hand. We've explored how tokenizers work and looked at tokenization, conversion to input IDs, padding, truncation, and attention masks.

However, as we saw in section 2, the 🤗 Transformers API can handle all of this for us with a high-level function that we'll dive into here. When you call your `tokenizer` directly on the sentence, you get back inputs that are ready to pass through your model:

```py
from transformers import AutoTokenizer

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)

sequence = "I've been waiting for a HuggingFace course my whole life."

model_inputs = tokenizer(sequence)
```

Here, the `model_inputs` variable contains everything that's necessary for a model to operate well. For DistilBERT, that includes the input IDs as well as the attention mask. Other models that accept additional inputs will also have those output by the `tokenizer` object.

As we'll see in some examples below, this method is very powerful. First, it can tokenize a single sequence:

```py
sequence = "I've been waiting for a HuggingFace course my whole life."

model_inputs = tokenizer(sequence)
```

It also handles multiple sequences at a time, with no change in the API:

```py
sequences = ["I've been waiting for a HuggingFace course my whole life.", "So have I!"]

model_inputs = tokenizer(sequences)
```

It can pad according to several objectives:

```py
# Will pad the sequences up to the maximum sequence length
model_inputs = tokenizer(sequences, padding="longest")

# Will pad the sequences up to the model max length
# (512 for BERT or DistilBERT)
model_inputs = tokenizer(sequences, padding="max_length")

# Will pad the sequences up to the specified max length
model_inputs = tokenizer(sequences, padding="max_length", max_length=8)
```

It can also truncate sequences:

```py
sequences = ["I've been waiting for a HuggingFace course my whole life.", "So have I!"]

# Will truncate the sequences that are longer than the model max length
# (512 for BERT or DistilBERT)
model_inputs = tokenizer(sequences, truncation=True)

# Will truncate the sequences that are longer than the specified max length
model_inputs = tokenizer(sequences, max_length=8, truncation=True)
```

The `tokenizer` object can handle the conversion to specific framework tensors, which can then be directly sent to the model. For example, in the following code sample we are prompting the tokenizer to return tensors from the different frameworks — `"pt"` returns PyTorch tensors and `"np"` returns NumPy arrays:

```py
sequences = ["I've been waiting for a HuggingFace course my whole life.", "So have I!"]

# Returns PyTorch tensors
model_inputs = tokenizer(sequences, padding=True, return_tensors="pt")

# Returns NumPy arrays
model_inputs = tokenizer(sequences, padding=True, return_tensors="np")
```

#### Special tokens

If we take a look at the input IDs returned by the tokenizer, we will see they are a tiny bit different from what we had earlier:

```py
sequence = "I've been waiting for a HuggingFace course my whole life."

model_inputs = tokenizer(sequence)
print(model_inputs["input_ids"])

tokens = tokenizer.tokenize(sequence)
ids = tokenizer.convert_tokens_to_ids(tokens)
print(ids)
```

```python
[101, 1045, 1005, 2310, 2042, 3403, 2005, 1037, 17662, 12172, 2607, 2026, 2878, 2166, 1012, 102]
[1045, 1005, 2310, 2042, 3403, 2005, 1037, 17662, 12172, 2607, 2026, 2878, 2166, 1012]
```

One token ID was added at the beginning, and one at the end. Let's decode the two sequences of IDs above to see what this is about:

```py
print(tokenizer.decode(model_inputs["input_ids"]))
print(tokenizer.decode(ids))
```

```python
"[CLS] i've been waiting for a huggingface course my whole life. [SEP]"
"i've been waiting for a huggingface course my whole life."
```

The tokenizer added the special word `[CLS]` at the beginning and the special word `[SEP]` at the end. This is because the model was pretrained with those, so to get the same results for inference we need to add them as well. Note that some models don't add special words, or add different ones; models may also add these special words only at the beginning, or only at the end. In any case, the tokenizer knows which ones are expected and will deal with this for you.

#### Wrapping up: From tokenizer to model

Now that we've seen all the individual steps the `tokenizer` object uses when applied on texts, let's see one final time how it can handle multiple sequences (padding!), very long sequences (truncation!), and multiple types of tensors with its main API:

```py
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)
sequences = ["I've been waiting for a HuggingFace course my whole life.", "So have I!"]

tokens = tokenizer(sequences, padding=True, truncation=True, return_tensors="pt")
output = model(**tokens)
```

## Optimized Inference Deployment

> **Source:** [Optimized Inference Deployment](https://huggingface.co/learn/llm-course/chapter2/8) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

In this section, we'll explore advanced frameworks for optimizing LLM deployments: Text Generation Inference (TGI), vLLM, and llama.cpp. These applications are primarily used in production environments to serve LLMs to users. This section focuses on how to deploy these frameworks in production rather than how to use them for inference on a single machine.

We'll cover how these tools maximize inference efficiency and simplify production deployments of Large Language Models.

### Framework Selection Guide

TGI, vLLM, and llama.cpp serve similar purposes but have distinct characteristics that make them better suited for different use cases. Let's look at the key differences between them, focusing on performance and integration.

#### Memory Management and Performance

**TGI** is designed to be stable and predictable in production, using fixed sequence lengths to keep memory usage consistent. TGI manages memory using Flash Attention 2 and continuous batching techniques. This means it can process attention calculations very efficiently and keep the GPU busy by constantly feeding it work. The system can move parts of the model between CPU and GPU when needed, which helps handle larger models.

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/tgi/flash-attn.png" alt="Flash Attention" />

Flash Attention is a technique that optimizes the attention mechanism in transformer models by addressing memory bandwidth bottlenecks. As discussed earlier in [Chapter 1.8](https://huggingface.co/course/chapter1/8), the attention mechanism has quadratic complexity and memory usage, making it inefficient for long sequences.

The key innovation is in how it manages memory transfers between High Bandwidth Memory (HBM) and faster SRAM cache. Traditional attention repeatedly transfers data between HBM and SRAM, creating bottlenecks by leaving the GPU idle. Flash Attention loads data once into SRAM and performs all calculations there, minimizing expensive memory transfers.

While the benefits are most significant during training, Flash Attention's reduced VRAM usage and improved efficiency make it valuable for inference as well, enabling faster and more scalable LLM serving.

**vLLM** takes a different approach by using PagedAttention. Just like how a computer manages its memory in pages, vLLM splits the model's memory into smaller blocks. This clever system means it can handle different-sized requests more flexibly and doesn't waste memory space. It's particularly good at sharing memory between different requests and reduces memory fragmentation, which makes the whole system more efficient.

PagedAttention is a technique that addresses another critical bottleneck in LLM inference: KV cache memory management. As discussed in [Chapter 1.8](https://huggingface.co/course/chapter1/8), during text generation, the model stores attention keys and values (KV cache) for each generated token to reduce redundant computations. The KV cache can become enormous, especially with long sequences or multiple concurrent requests.

vLLM's key innovation lies in how it manages this cache:

1. **Memory Paging**: Instead of treating the KV cache as one large block, it's divided into fixed-size "pages" (similar to virtual memory in operating systems).
2. **Non-contiguous Storage**: Pages don't need to be stored contiguously in GPU memory, allowing for more flexible memory allocation.
3. **Page Table Management**: A page table tracks which pages belong to which sequence, enabling efficient lookup and access.
4. **Memory Sharing**: For operations like parallel sampling, pages storing the KV cache for the prompt can be shared across multiple sequences.

The PagedAttention approach can lead to up to 24x higher throughput compared to traditional methods, making it a game-changer for production LLM deployments. If you want to go really deep into how PagedAttention works, you can read the [the guide from the vLLM documentation](https://docs.vllm.ai/en/latest/design/kernel/paged_attention.html).

**llama.cpp** is a highly optimized C/C++ implementation originally designed for running LLaMA models on consumer hardware. It focuses on CPU efficiency with optional GPU acceleration and is ideal for resource-constrained environments. llama.cpp uses quantization techniques to reduce model size and memory requirements while maintaining good performance. It implements optimized kernels for various CPU architectures and supports basic KV cache management for efficient token generation.

Quantization in llama.cpp reduces the precision of model weights from 32-bit or 16-bit floating point to lower precision formats like 8-bit integers (INT8), 4-bit, or even lower. This significantly reduces memory usage and improves inference speed with minimal quality loss.

Key quantization features in llama.cpp include:
1. **Multiple Quantization Levels**: Supports 8-bit, 4-bit, 3-bit, and even 2-bit quantization
2. **GGML/GGUF Format**: Uses custom tensor formats optimized for quantized inference
3. **Mixed Precision**: Can apply different quantization levels to different parts of the model
4. **Hardware-Specific Optimizations**: Includes optimized code paths for various CPU architectures (AVX2, AVX-512, NEON)

This approach enables running billion-parameter models on consumer hardware with limited memory, making it perfect for local deployments and edge devices.

#### Deployment and Integration

Let's move on to the deployment and integration differences between the frameworks.

**TGI** excels in enterprise-level deployment with its production-ready features. It comes with built-in Kubernetes support and includes everything you need for running in production, like monitoring through Prometheus and Grafana, automatic scaling, and comprehensive safety features. The system also includes enterprise-grade logging and various protective measures like content filtering and rate limiting to keep your deployment secure and stable.

**vLLM** takes a more flexible, developer-friendly approach to deployment. It's built with Python at its core and can easily replace OpenAI's API in your existing applications. The framework focuses on delivering raw performance and can be customized to fit your specific needs. It works particularly well with Ray for managing clusters, making it a great choice when you need high performance and adaptability.

**llama.cpp** prioritizes simplicity and portability. Its server implementation is lightweight and can run on a wide range of hardware, from powerful servers to consumer laptops and even some high-end mobile devices. With minimal dependencies and a simple C/C++ core, it's easy to deploy in environments where installing Python frameworks would be challenging. The server provides an OpenAI-compatible API while maintaining a much smaller resource footprint than other solutions.

### Getting Started

Let's explore how to use these frameworks for deploying LLMs, starting with installation and basic setup.

#### Installation and Basic Setup

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

TGI is easy to install and use, with deep integration into the Hugging Face ecosystem.

First, launch the TGI server using Docker:

```sh
docker run --gpus all \
    --shm-size 1g \
    -p 8080:80 \
    -v ~/.cache/huggingface:/data \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id HuggingFaceTB/SmolLM2-360M-Instruct
```

Then interact with it using Hugging Face's InferenceClient:

```python
from huggingface_hub import InferenceClient

# Initialize client pointing to TGI endpoint
client = InferenceClient(
    model="http://localhost:8080",  # URL to the TGI server
)

# Text generation
response = client.text_generation(
    "Tell me a story",
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.95,
    details=True,
    stop_sequences=[],
)
print(response.generated_text)

# For chat format
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

Alternatively, you can use the OpenAI client:

```python
from openai import OpenAI

# Initialize client pointing to TGI endpoint
client = OpenAI(
    base_url="http://localhost:8080/v1",  # Make sure to include /v1
    api_key="not-needed",  # TGI doesn't require an API key by default
)

# Chat completion
response = client.chat.completions.create(
    model="HuggingFaceTB/SmolLM2-360M-Instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

llama.cpp is easy to install and use, requiring minimal dependencies and supporting both CPU and GPU inference.

First, install and build llama.cpp:

```sh
# Clone the repository
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Build the project
make

# Download the SmolLM2-1.7B-Instruct-GGUF model
curl -L -O https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF/resolve/main/smollm2-1.7b-instruct.Q4_K_M.gguf
```

Then, launch the server (with OpenAI API compatibility):

```sh
# Start the server
./server \
    -m smollm2-1.7b-instruct.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 4096 \
    --n-gpu-layers 0  # Set to a higher number to use GPU
```

Interact with the server using Hugging Face's InferenceClient:

```python
from huggingface_hub import InferenceClient

# Initialize client pointing to llama.cpp server
client = InferenceClient(
    model="http://localhost:8080/v1",  # URL to the llama.cpp server
    token="sk-no-key-required",  # llama.cpp server requires this placeholder
)

# Text generation
response = client.text_generation(
    "Tell me a story",
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.95,
    details=True,
)
print(response.generated_text)

# For chat format
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

Alternatively, you can use the OpenAI client:

```python
from openai import OpenAI

# Initialize client pointing to llama.cpp server
client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="sk-no-key-required",  # llama.cpp server requires this placeholder
)

# Chat completion
response = client.chat.completions.create(
    model="smollm2-1.7b-instruct",  # Model identifier can be anything as server only loads one model
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

</hfoption>

<hfoption value="vllm" label="vLLM">

vLLM is easy to install and use, with both OpenAI API compatibility and a native Python interface.

First, launch the vLLM OpenAI-compatible server:

```sh
python -m vllm.entrypoints.openai.api_server \
    --model HuggingFaceTB/SmolLM2-360M-Instruct \
    --host 0.0.0.0 \
    --port 8000
```

Then interact with it using Hugging Face's InferenceClient:

```python
from huggingface_hub import InferenceClient

# Initialize client pointing to vLLM endpoint
client = InferenceClient(
    model="http://localhost:8000/v1",  # URL to the vLLM server
)

# Text generation
response = client.text_generation(
    "Tell me a story",
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.95,
    details=True,
)
print(response.generated_text)

# For chat format
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

Alternatively, you can use the OpenAI client:

```python
from openai import OpenAI

# Initialize client pointing to vLLM endpoint
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed",  # vLLM doesn't require an API key by default
)

# Chat completion
response = client.chat.completions.create(
    model="HuggingFaceTB/SmolLM2-360M-Instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    max_tokens=100,
    temperature=0.7,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

</hfoption>

</hfoptions>

#### Basic Text Generation

Let's look at examples of text generation with the frameworks:

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

First, deploy TGI with advanced parameters:
```sh
docker run --gpus all \
    --shm-size 1g \
    -p 8080:80 \
    -v ~/.cache/huggingface:/data \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id HuggingFaceTB/SmolLM2-360M-Instruct \
    --max-total-tokens 4096 \
    --max-input-length 3072 \
    --max-batch-total-tokens 8192 \
    --waiting-served-ratio 1.2
```

Use the InferenceClient for flexible text generation:

```python
from huggingface_hub import InferenceClient

client = InferenceClient(model="http://localhost:8080")

# Advanced parameters example
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,
    max_tokens=200,
    top_p=0.95,
)
print(response.choices[0].message.content)

# Raw text generation
response = client.text_generation(
    "Write a creative story about space exploration",
    max_new_tokens=200,
    temperature=0.8,
    top_p=0.95,
    repetition_penalty=1.1,
    do_sample=True,
    details=True,
)
print(response.generated_text)
```

Or use the OpenAI client:
```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8080/v1", api_key="not-needed")

# Advanced parameters example
response = client.chat.completions.create(
    model="HuggingFaceTB/SmolLM2-360M-Instruct",
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,  # Higher for more creativity
)
print(response.choices[0].message.content)
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

For llama.cpp, you can set advanced parameters when launching the server:

```sh
./server \
    -m smollm2-1.7b-instruct.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 4096 \            # Context size
    --threads 8 \        # CPU threads to use
    --batch-size 512 \   # Batch size for prompt evaluation
    --n-gpu-layers 0     # GPU layers (0 = CPU only)
```

Use the InferenceClient:

```python
from huggingface_hub import InferenceClient

client = InferenceClient(model="http://localhost:8080/v1", token="sk-no-key-required")

# Advanced parameters example
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,
    max_tokens=200,
    top_p=0.95,
)
print(response.choices[0].message.content)

# For direct text generation
response = client.text_generation(
    "Write a creative story about space exploration",
    max_new_tokens=200,
    temperature=0.8,
    top_p=0.95,
    repetition_penalty=1.1,
    details=True,
)
print(response.generated_text)
```

Or use the OpenAI client for generation with control over the sampling parameters:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8080/v1", api_key="sk-no-key-required")

# Advanced parameters example
response = client.chat.completions.create(
    model="smollm2-1.7b-instruct",
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,  # Higher for more creativity
    top_p=0.95,  # Nucleus sampling probability
    frequency_penalty=0.5,  # Reduce repetition of frequent tokens
    presence_penalty=0.5,  # Reduce repetition by penalizing tokens already present
    max_tokens=200,  # Maximum generation length
)
print(response.choices[0].message.content)
```

You can also use llama.cpp's native library for even more control:

```python
# Using llama-cpp-python package for direct model access
from llama_cpp import Llama

# Load the model
llm = Llama(
    model_path="smollm2-1.7b-instruct.Q4_K_M.gguf",
    n_ctx=4096,  # Context window size
    n_threads=8,  # CPU threads
    n_gpu_layers=0,  # GPU layers (0 = CPU only)
)

# Format prompt according to the model's expected format
prompt = """<|im_start|>system
You are a creative storyteller.
<|im_end|>
<|im_start|>user
Write a creative story
<|im_end|>
<|im_start|>assistant
"""

# Generate response with precise parameter control
output = llm(
    prompt,
    max_tokens=200,
    temperature=0.8,
    top_p=0.95,
    frequency_penalty=0.5,
    presence_penalty=0.5,
    stop=["<|im_end|>"],
)

print(output["choices"][0]["text"])
```

</hfoption>

<hfoption value="vllm" label="vLLM">

For advanced usage with vLLM, you can use the InferenceClient:

```python
from huggingface_hub import InferenceClient

client = InferenceClient(model="http://localhost:8000/v1")

# Advanced parameters example
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,
    max_tokens=200,
    top_p=0.95,
)
print(response.choices[0].message.content)

# For direct text generation
response = client.text_generation(
    "Write a creative story about space exploration",
    max_new_tokens=200,
    temperature=0.8,
    top_p=0.95,
    details=True,
)
print(response.generated_text)
```

You can also use the OpenAI client:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")

# Advanced parameters example
response = client.chat.completions.create(
    model="HuggingFaceTB/SmolLM2-360M-Instruct",
    messages=[
        {"role": "system", "content": "You are a creative storyteller."},
        {"role": "user", "content": "Write a creative story"},
    ],
    temperature=0.8,
    top_p=0.95,
    max_tokens=200,
)
print(response.choices[0].message.content)
```

vLLM also provides a native Python interface with fine-grained control:

```python
from vllm import LLM, SamplingParams

# Initialize the model with advanced parameters
llm = LLM(
    model="HuggingFaceTB/SmolLM2-360M-Instruct",
    gpu_memory_utilization=0.85,
    max_num_batched_tokens=8192,
    max_num_seqs=256,
    block_size=16,
)

# Configure sampling parameters
sampling_params = SamplingParams(
    temperature=0.8,  # Higher for more creativity
    top_p=0.95,  # Consider top 95% probability mass
    max_tokens=100,  # Maximum length
    presence_penalty=1.1,  # Reduce repetition
    frequency_penalty=1.1,  # Reduce repetition
    stop=["\n\n", "###"],  # Stop sequences
)

# Generate text
prompt = "Write a creative story"
outputs = llm.generate(prompt, sampling_params)
print(outputs[0].outputs[0].text)

# For chat-style interactions
chat_prompt = [
    {"role": "system", "content": "You are a creative storyteller."},
    {"role": "user", "content": "Write a creative story"},
]
formatted_prompt = llm.get_chat_template()(chat_prompt)  # Uses model's chat template
outputs = llm.generate(formatted_prompt, sampling_params)
print(outputs[0].outputs[0].text)
```

</hfoption>

</hfoptions>

### Advanced Generation Control

#### Token Selection and Sampling

The process of generating text involves selecting the next token at each step. This selection process can be controlled through various parameters:

1. **Raw Logits**: The initial output probabilities for each token
2. **Temperature**: Controls randomness in selection (higher = more creative)
3. **Top-p (Nucleus) Sampling**: Filters to top tokens making up X% of probability mass
4. **Top-k Filtering**: Limits selection to k most likely tokens

Here's how to configure these parameters:

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

```python
client.generate(
    "Write a creative story",
    temperature=0.8,  # Higher for more creativity
    top_p=0.95,  # Consider top 95% probability mass
    top_k=50,  # Consider top 50 tokens
    max_new_tokens=100,  # Maximum length
    repetition_penalty=1.1,  # Reduce repetition
)
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

```python
# Via OpenAI API compatibility
response = client.completions.create(
    model="smollm2-1.7b-instruct",  # Model name (can be any string for llama.cpp server)
    prompt="Write a creative story",
    temperature=0.8,  # Higher for more creativity
    top_p=0.95,  # Consider top 95% probability mass
    frequency_penalty=1.1,  # Reduce repetition
    presence_penalty=0.1,  # Reduce repetition
    max_tokens=100,  # Maximum length
)

# Via llama-cpp-python direct access
output = llm(
    "Write a creative story",
    temperature=0.8,
    top_p=0.95,
    top_k=50,
    max_tokens=100,
    repeat_penalty=1.1,
)
```

</hfoption>

<hfoption value="vllm" label="vLLM">

```python
params = SamplingParams(
    temperature=0.8,  # Higher for more creativity
    top_p=0.95,  # Consider top 95% probability mass
    top_k=50,  # Consider top 50 tokens
    max_tokens=100,  # Maximum length
    presence_penalty=0.1,  # Reduce repetition
)
llm.generate("Write a creative story", sampling_params=params)
```

</hfoption>

</hfoptions>

#### Controlling Repetition

Both frameworks provide ways to prevent repetitive text generation:

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

```python
client.generate(
    "Write a varied text",
    repetition_penalty=1.1,  # Penalize repeated tokens
    no_repeat_ngram_size=3,  # Prevent 3-gram repetition
)
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

```python
# Via OpenAI API
response = client.completions.create(
    model="smollm2-1.7b-instruct",
    prompt="Write a varied text",
    frequency_penalty=1.1,  # Penalize frequent tokens
    presence_penalty=0.8,  # Penalize tokens already present
)

# Via direct library
output = llm(
    "Write a varied text",
    repeat_penalty=1.1,  # Penalize repeated tokens
    frequency_penalty=0.5,  # Additional frequency penalty
    presence_penalty=0.5,  # Additional presence penalty
)
```

</hfoption>

<hfoption value="vllm" label="vLLM">

```python
params = SamplingParams(
    presence_penalty=0.1,  # Penalize token presence
    frequency_penalty=0.1,  # Penalize token frequency
)
```

</hfoption>

</hfoptions>

#### Length Control and Stop Sequences

You can control generation length and specify when to stop:

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

```python
client.generate(
    "Generate a short paragraph",
    max_new_tokens=100,
    min_new_tokens=10,
    stop_sequences=["\n\n", "###"],
)
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

```python
# Via OpenAI API
response = client.completions.create(
    model="smollm2-1.7b-instruct",
    prompt="Generate a short paragraph",
    max_tokens=100,
    stop=["\n\n", "###"],
)

# Via direct library
output = llm("Generate a short paragraph", max_tokens=100, stop=["\n\n", "###"])
```

</hfoption>

<hfoption value="vllm" label="vLLM">

```python
params = SamplingParams(
    max_tokens=100,
    min_tokens=10,
    stop=["###", "\n\n"],
    ignore_eos=False,
    skip_special_tokens=True,
)
```

</hfoption>

</hfoptions>

### Memory Management

Both frameworks implement advanced memory management techniques for efficient inference.

<hfoptions id="inference-frameworks" >

<hfoption value="tgi" label="TGI">

TGI uses Flash Attention 2 and continuous batching:

```sh
# Docker deployment with memory optimization
docker run --gpus all -p 8080:80 \
    --shm-size 1g \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id HuggingFaceTB/SmolLM2-1.7B-Instruct \
    --max-batch-total-tokens 8192 \
    --max-input-length 4096
```

</hfoption>

<hfoption value="llama.cpp" label="llama.cpp">

llama.cpp uses quantization and optimized memory layout:

```sh
# Server with memory optimizations
./server \
    -m smollm2-1.7b-instruct.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 2048 \               # Context size
    --threads 4 \           # CPU threads
    --n-gpu-layers 32 \     # Use more GPU layers for larger models
    --mlock \               # Lock memory to prevent swapping
    --cont-batching         # Enable continuous batching
```

For models too large for your GPU, you can use CPU offloading:

```sh
./server \
    -m smollm2-1.7b-instruct.Q4_K_M.gguf \
    --n-gpu-layers 20 \     # Keep first 20 layers on GPU
    --threads 8             # Use more CPU threads for CPU layers
```

</hfoption>

<hfoption value="vllm" label="vLLM">

vLLM uses PagedAttention for optimal memory management:

```python
from vllm.engine.arg_utils import AsyncEngineArgs

engine_args = AsyncEngineArgs(
    model="HuggingFaceTB/SmolLM2-1.7B-Instruct",
    gpu_memory_utilization=0.85,
    max_num_batched_tokens=8192,
    block_size=16,
)

llm = LLM(engine_args=engine_args)
```

</hfoption>

</hfoptions>

### Resources

- [Text Generation Inference Documentation](https://huggingface.co/docs/text-generation-inference)
- [TGI GitHub Repository](https://github.com/huggingface/text-generation-inference)
- [vLLM Documentation](https://vllm.readthedocs.io/)
- [vLLM GitHub Repository](https://github.com/vllm-project/vllm)
- [PagedAttention Paper](https://arxiv.org/abs/2309.06180)
- [llama.cpp GitHub Repository](https://github.com/ggerganov/llama.cpp)
- [llama-cpp-python Repository](https://github.com/abetlen/llama-cpp-python)

## Normalization and Pre-tokenization

> **Source:** [Normalization and Pre-tokenization](https://huggingface.co/learn/llm-course/chapter6/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Before we dive more deeply into the three most common subword tokenization algorithms used with Transformer models (Byte-Pair Encoding [BPE], WordPiece, and Unigram), we'll first take a look at the preprocessing that each tokenizer applies to text. Here's a high-level overview of the steps in the tokenization pipeline:

<div class="flex justify-center">
<img  src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter6/tokenization_pipeline.svg" alt="The tokenization pipeline.">

</div>

Before splitting a text into subtokens (according to its model), the tokenizer performs two steps: _normalization_ and _pre-tokenization_.

### Normalization

The normalization step involves some general cleanup, such as removing needless whitespace, lowercasing, and/or removing accents. If you're familiar with [Unicode normalization](http://www.unicode.org/reports/tr15/) (such as NFC or NFKC), this is also something the tokenizer may apply.

The 🤗 Transformers `tokenizer` has an attribute called `backend_tokenizer` that provides access to the underlying tokenizer from the 🤗 Tokenizers library:

```py
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
print(type(tokenizer.backend_tokenizer))
```

```python
<class 'tokenizers.Tokenizer'>
```

The `normalizer` attribute of the `tokenizer` object has a `normalize_str()` method that we can use to see how the normalization is performed:

```py
print(tokenizer.backend_tokenizer.normalizer.normalize_str("Héllò hôw are ü?"))
```

```python
'hello how are u?'
```

In this example, since we picked the `bert-base-uncased` checkpoint, the normalization applied lowercasing and removed the accents.

> **Tip:**
> ✏️ **Try it out!** Load a tokenizer from the `bert-base-cased` checkpoint and pass the same example to it. What are the main differences you can see between the cased and uncased versions of the tokenizer?

### Pre-tokenization

As we will see in the next sections, a tokenizer cannot be trained on raw text alone. Instead, we first need to split the texts into small entities, like words. That's where the pre-tokenization step comes in. As we saw in [Chapter 2](https://huggingface.co/course/chapter2), a word-based tokenizer can simply split a raw text into words on whitespace and punctuation. Those words will be the boundaries of the subtokens the tokenizer can learn during its training.

To see how a fast tokenizer performs pre-tokenization, we can use the `pre_tokenize_str()` method of the `pre_tokenizer` attribute of the `tokenizer` object:

```py
tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str("Hello, how are  you?")
```

```python
[('Hello', (0, 5)), (',', (5, 6)), ('how', (7, 10)), ('are', (11, 14)), ('you', (16, 19)), ('?', (19, 20))]
```

Notice how the tokenizer is already keeping track of the offsets, which is how it can give us the offset mapping we used in the previous section. Here the tokenizer ignores the two spaces and replaces them with just one, but the offset jumps between `are` and `you` to account for that.

Since we're using a BERT tokenizer, the pre-tokenization involves splitting on whitespace and punctuation. Other tokenizers can have different rules for this step. For example, if we use the GPT-2 tokenizer:

```py
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str("Hello, how are  you?")
```

it will split on whitespace and punctuation as well, but it will keep the spaces and replace them with a `Ġ` symbol, enabling it to recover the original spaces if we decode the tokens:

```python
[('Hello', (0, 5)), (',', (5, 6)), ('Ġhow', (6, 10)), ('Ġare', (10, 14)), ('Ġ', (14, 15)), ('Ġyou', (15, 19)),
 ('?', (19, 20))]
```

Also note that unlike the BERT tokenizer, this tokenizer does not ignore the double space.

For a last example, let's have a look at the T5 tokenizer, which is based on the SentencePiece algorithm:

```py
tokenizer = AutoTokenizer.from_pretrained("t5-small")
tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str("Hello, how are  you?")
```

```python
[('▁Hello,', (0, 6)), ('▁how', (7, 10)), ('▁are', (11, 14)), ('▁you?', (16, 20))]
```

Like the GPT-2 tokenizer, this one keeps spaces and replaces them with a specific token (`_`), but the T5 tokenizer only splits on whitespace, not punctuation. Also note that it added a space by default at the beginning of the sentence (before `Hello`) and ignored the double space between `are` and `you`.

Now that we've seen a little of how some different tokenizers process text, we can start to explore the underlying algorithms themselves. We'll begin with a quick look at the broadly widely applicable SentencePiece; then, over the next three sections, we'll examine how the three main algorithms used for subword tokenization work.

### SentencePiece

[SentencePiece](https://github.com/google/sentencepiece) is a tokenization algorithm for the preprocessing of text that you can use with any of the models we will see in the next three sections. It considers the text as a sequence of Unicode characters, and replaces spaces with a special character, `▁`. Used in conjunction with the Unigram algorithm (see [section 7](https://huggingface.co/course/chapter6/7)), it doesn't even require a pre-tokenization step, which is very useful for languages where the space character is not used (like Chinese or Japanese).

The other main feature of SentencePiece is *reversible tokenization*: since there is no special treatment of spaces, decoding the tokens is done simply by concatenating them and replacing the `_`s with spaces -- this results in the normalized text. As we saw earlier, the BERT tokenizer removes repeating spaces, so its tokenization is not reversible.

### Algorithm overview

In the following sections, we'll dive into the three main subword tokenization algorithms: BPE (used by GPT-2 and others), WordPiece (used for example by BERT), and Unigram (used by T5 and others). Before we get started, here's a quick overview of how they each work. Don't hesitate to come back to this table after reading each of the next sections if it doesn't make sense to you yet.

Model | BPE | WordPiece | Unigram
:----:|:---:|:---------:|:------:
Training | Starts from a small vocabulary and learns rules to merge tokens |  Starts from a small vocabulary and learns rules to merge tokens | Starts from a large vocabulary and learns rules to remove tokens
Training step | Merges the tokens corresponding to the most common pair | Merges the tokens corresponding to the pair with the best score based on the frequency of the pair, privileging pairs where each individual token is less frequent | Removes all the tokens in the vocabulary that will minimize the loss computed on the whole corpus
Learns | Merge rules and a vocabulary | Just a vocabulary | A vocabulary with a score for each token
Encoding | Splits a word into characters and applies the merges learned during training | Finds the longest subword starting from the beginning that is in the vocabulary, then does the same for the rest of the word | Finds the most likely split into tokens, using the scores learned during training

Now let's dive into BPE!

## Byte-Pair Encoding Tokenization

> **Source:** [Byte-Pair Encoding Tokenization](https://huggingface.co/learn/llm-course/chapter6/5) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Byte-Pair Encoding (BPE) was initially developed as an algorithm to compress texts, and then used by OpenAI for tokenization when pretraining the GPT model. It's used by a lot of Transformer models, including GPT, GPT-2, RoBERTa, BART, and DeBERTa.

> **Tip:**
> 💡 This section covers BPE in depth, going as far as showing a full implementation. You can skip to the end if you just want a general overview of the tokenization algorithm.

### Training algorithm

BPE training starts by computing the unique set of words used in the corpus (after the normalization and pre-tokenization steps are completed), then building the vocabulary by taking all the symbols used to write those words. As a very simple example, let's say our corpus uses these five words:

```
"hug", "pug", "pun", "bun", "hugs"
```

The base vocabulary will then be `["b", "g", "h", "n", "p", "s", "u"]`. For real-world cases, that base vocabulary will contain all the ASCII characters, at the very least, and probably some Unicode characters as well. If an example you are tokenizing uses a character that is not in the training corpus, that character will be converted to the unknown token. That's one reason why lots of NLP models are very bad at analyzing content with emojis, for instance.

> **Tip:**
> The GPT-2 and RoBERTa tokenizers (which are pretty similar) have a clever way to deal with this: they don't look at words as being written with Unicode characters, but with bytes. This way the base vocabulary has a small size (256), but every character you can think of will still be included and not end up being converted to the unknown token. This trick is called *byte-level BPE*.

After getting this base vocabulary, we add new tokens until the desired vocabulary size is reached by learning *merges*, which are rules to merge two elements of the existing vocabulary together into a new one. So, at the beginning these merges will create tokens with two characters, and then, as training progresses, longer subwords.

At any step during the tokenizer training, the BPE algorithm will search for the most frequent pair of existing tokens (by "pair," here we mean two consecutive tokens in a word). That most frequent pair is the one that will be merged, and we rinse and repeat for the next step.

Going back to our previous example, let's assume the words had the following frequencies:

```
("hug", 10), ("pug", 5), ("pun", 12), ("bun", 4), ("hugs", 5)
```

meaning `"hug"` was present 10 times in the corpus, `"pug"` 5 times, `"pun"` 12 times, `"bun"` 4 times, and `"hugs"` 5 times. We start the training by splitting each word into characters (the ones that form our initial vocabulary) so we can see each word as a list of tokens:

```
("h" "u" "g", 10), ("p" "u" "g", 5), ("p" "u" "n", 12), ("b" "u" "n", 4), ("h" "u" "g" "s", 5)
```

Then we look at pairs. The pair `("h", "u")` is present in the words `"hug"` and `"hugs"`, so 15 times total in the corpus. It's not the most frequent pair, though: that honor belongs to `("u", "g")`, which is present in `"hug"`, `"pug"`, and `"hugs"`, for a grand total of 20 times in the vocabulary.

Thus, the first merge rule learned by the tokenizer is `("u", "g") -> "ug"`, which means that `"ug"` will be added to the vocabulary, and the pair should be merged in all the words of the corpus. At the end of this stage, the vocabulary and corpus look like this:

```
Vocabulary: ["b", "g", "h", "n", "p", "s", "u", "ug"]
Corpus: ("h" "ug", 10), ("p" "ug", 5), ("p" "u" "n", 12), ("b" "u" "n", 4), ("h" "ug" "s", 5)
```

Now we have some pairs that result in a token longer than two characters: the pair `("h", "ug")`, for instance (present 15 times in the corpus). The most frequent pair at this stage is `("u", "n")`, however, present 16 times in the corpus, so the second merge rule learned is `("u", "n") -> "un"`. Adding that to the vocabulary and merging all existing occurrences leads us to:

```
Vocabulary: ["b", "g", "h", "n", "p", "s", "u", "ug", "un"]
Corpus: ("h" "ug", 10), ("p" "ug", 5), ("p" "un", 12), ("b" "un", 4), ("h" "ug" "s", 5)
```

Now the most frequent pair is `("h", "ug")`, so we learn the merge rule `("h", "ug") -> "hug"`, which gives us our first three-letter token. After the merge, the corpus looks like this:

```
Vocabulary: ["b", "g", "h", "n", "p", "s", "u", "ug", "un", "hug"]
Corpus: ("hug", 10), ("p" "ug", 5), ("p" "un", 12), ("b" "un", 4), ("hug" "s", 5)
```

And we continue like this until we reach the desired vocabulary size.

> **Tip:**
> ✏️ **Now your turn!** What do you think the next merge rule will be?

### Tokenization algorithm

Tokenization follows the training process closely, in the sense that new inputs are tokenized by applying the following steps:

1. Normalization
2. Pre-tokenization
3. Splitting the words into individual characters
4. Applying the merge rules learned in order on those splits

Let's take the example we used during training, with the three merge rules learned:

```
("u", "g") -> "ug"
("u", "n") -> "un"
("h", "ug") -> "hug"
```

The word `"bug"` will be tokenized as `["b", "ug"]`. `"mug"`, however, will be tokenized as `["[UNK]", "ug"]` since the letter `"m"` was not in the base vocabulary. Likewise, the word `"thug"` will be tokenized as `["[UNK]", "hug"]`: the letter `"t"` is not in the base vocabulary, and applying the merge rules results first in `"u"` and `"g"` being merged and then `"h"` and `"ug"` being merged.

> **Tip:**
> ✏️ **Now your turn!** How do you think  the word `"unhug"` will be tokenized?

### Implementing BPE

Now let's take a look at an implementation of the BPE algorithm. This won't be an optimized version you can actually use on a big corpus; we just want to show you the code so you can understand the algorithm a little bit better.

First we need a corpus, so let's create a simple one with a few sentences:

```python
corpus = [
    "This is the Hugging Face Course.",
    "This chapter is about tokenization.",
    "This section shows several tokenizer algorithms.",
    "Hopefully, you will be able to understand how they are trained and generate tokens.",
]
```

Next, we need to pre-tokenize that corpus into words. Since we are replicating a BPE tokenizer (like GPT-2), we will use the `gpt2` tokenizer for the pre-tokenization:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
```

Then we compute the frequencies of each word in the corpus as we do the pre-tokenization:

```python
from collections import defaultdict

word_freqs = defaultdict(int)

for text in corpus:
    words_with_offsets = tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str(text)
    new_words = [word for word, offset in words_with_offsets]
    for word in new_words:
        word_freqs[word] += 1

print(word_freqs)
```

```python
defaultdict(int, {'This': 3, 'Ġis': 2, 'Ġthe': 1, 'ĠHugging': 1, 'ĠFace': 1, 'ĠCourse': 1, '.': 4, 'Ġchapter': 1,
    'Ġabout': 1, 'Ġtokenization': 1, 'Ġsection': 1, 'Ġshows': 1, 'Ġseveral': 1, 'Ġtokenizer': 1, 'Ġalgorithms': 1,
    'Hopefully': 1, ',': 1, 'Ġyou': 1, 'Ġwill': 1, 'Ġbe': 1, 'Ġable': 1, 'Ġto': 1, 'Ġunderstand': 1, 'Ġhow': 1,
    'Ġthey': 1, 'Ġare': 1, 'Ġtrained': 1, 'Ġand': 1, 'Ġgenerate': 1, 'Ġtokens': 1})
```

The next step is to compute the base vocabulary, formed by all the characters used in the corpus:

```python
alphabet = []

for word in word_freqs.keys():
    for letter in word:
        if letter not in alphabet:
            alphabet.append(letter)
alphabet.sort()

print(alphabet)
```

```python
[ ',', '.', 'C', 'F', 'H', 'T', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's',
  't', 'u', 'v', 'w', 'y', 'z', 'Ġ']
```

We also add the special tokens used by the model at the beginning of that vocabulary. In the case of GPT-2, the only special token is `"<|endoftext|>"`:

```python
vocab = ["<|endoftext|>"] + alphabet.copy()
```

We now need to split each word into individual characters, to be able to start training:

```python
splits = {word: [c for c in word] for word in word_freqs.keys()}
```

Now that we are ready for training, let's write a function that computes the frequency of each pair. We'll need to use this at each step of the training:

```python
def compute_pair_freqs(splits):
    pair_freqs = defaultdict(int)
    for word, freq in word_freqs.items():
        split = splits[word]
        if len(split) == 1:
            continue
        for i in range(len(split) - 1):
            pair = (split[i], split[i + 1])
            pair_freqs[pair] += freq
    return pair_freqs
```

Let's have a look at a part of this dictionary after the initial splits:

```python
pair_freqs = compute_pair_freqs(splits)

for i, key in enumerate(pair_freqs.keys()):
    print(f"{key}: {pair_freqs[key]}")
    if i >= 5:
        break
```

```python
('T', 'h'): 3
('h', 'i'): 3
('i', 's'): 5
('Ġ', 'i'): 2
('Ġ', 't'): 7
('t', 'h'): 3
```

Now, finding the most frequent pair only takes a quick loop:

```python
best_pair = ""
max_freq = None

for pair, freq in pair_freqs.items():
    if max_freq is None or max_freq < freq:
        best_pair = pair
        max_freq = freq

print(best_pair, max_freq)
```

```python
('Ġ', 't') 7
```

So the first merge to learn is `('Ġ', 't') -> 'Ġt'`, and we add `'Ġt'` to the vocabulary:

```python
merges = {("Ġ", "t"): "Ġt"}
vocab.append("Ġt")
```

To continue, we need to apply that merge in our `splits` dictionary. Let's write another function for this:

```python
def merge_pair(a, b, splits):
    for word in word_freqs:
        split = splits[word]
        if len(split) == 1:
            continue

        i = 0
        while i < len(split) - 1:
            if split[i] == a and split[i + 1] == b:
                split = split[:i] + [a + b] + split[i + 2 :]
            else:
                i += 1
        splits[word] = split
    return splits
```

And we can have a look at the result of the first merge:

```py
splits = merge_pair("Ġ", "t", splits)
print(splits["Ġtrained"])
```

```python
['Ġt', 'r', 'a', 'i', 'n', 'e', 'd']
```

Now we have everything we need to loop until we have learned all the merges we want. Let's aim for a vocab size of 50:

```python
vocab_size = 50

while len(vocab) < vocab_size:
    pair_freqs = compute_pair_freqs(splits)
    best_pair = ""
    max_freq = None
    for pair, freq in pair_freqs.items():
        if max_freq is None or max_freq < freq:
            best_pair = pair
            max_freq = freq
    splits = merge_pair(*best_pair, splits)
    merges[best_pair] = best_pair[0] + best_pair[1]
    vocab.append(best_pair[0] + best_pair[1])
```

As a result, we've learned 19 merge rules (the initial vocabulary had a size of 31 -- 30 characters in the alphabet, plus the special token):

```py
print(merges)
```

```python
{('Ġ', 't'): 'Ġt', ('i', 's'): 'is', ('e', 'r'): 'er', ('Ġ', 'a'): 'Ġa', ('Ġt', 'o'): 'Ġto', ('e', 'n'): 'en',
 ('T', 'h'): 'Th', ('Th', 'is'): 'This', ('o', 'u'): 'ou', ('s', 'e'): 'se', ('Ġto', 'k'): 'Ġtok',
 ('Ġtok', 'en'): 'Ġtoken', ('n', 'd'): 'nd', ('Ġ', 'is'): 'Ġis', ('Ġt', 'h'): 'Ġth', ('Ġth', 'e'): 'Ġthe',
 ('i', 'n'): 'in', ('Ġa', 'b'): 'Ġab', ('Ġtoken', 'i'): 'Ġtokeni'}
```

And the vocabulary is composed of the special token, the initial alphabet, and all the results of the merges:

```py
print(vocab)
```

```python
['<|endoftext|>', ',', '.', 'C', 'F', 'H', 'T', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o',
 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', 'Ġ', 'Ġt', 'is', 'er', 'Ġa', 'Ġto', 'en', 'Th', 'This', 'ou', 'se',
 'Ġtok', 'Ġtoken', 'nd', 'Ġis', 'Ġth', 'Ġthe', 'in', 'Ġab', 'Ġtokeni']
```

> **Tip:**
> 💡 Using `train_new_from_iterator()` on the same corpus won't result in the exact same vocabulary. This is because when there is a choice of the most frequent pair, we selected the first one encountered, while the 🤗 Tokenizers library selects the first one based on its inner IDs.

To tokenize a new text, we pre-tokenize it, split it, then apply all the merge rules learned:

```python
def tokenize(text):
    pre_tokenize_result = tokenizer._tokenizer.pre_tokenizer.pre_tokenize_str(text)
    pre_tokenized_text = [word for word, offset in pre_tokenize_result]
    splits = [[l for l in word] for word in pre_tokenized_text]
    for pair, merge in merges.items():
        for idx, split in enumerate(splits):
            i = 0
            while i < len(split) - 1:
                if split[i] == pair[0] and split[i + 1] == pair[1]:
                    split = split[:i] + [merge] + split[i + 2 :]
                else:
                    i += 1
            splits[idx] = split

    return sum(splits, [])
```

We can try this on any text composed of characters in the alphabet:

```py
tokenize("This is not a token.")
```

```python
['This', 'Ġis', 'Ġ', 'n', 'o', 't', 'Ġa', 'Ġtoken', '.']
```

> **Warning:**
> ⚠️ Our implementation will throw an error if there is an unknown character since we didn't do anything to handle them. GPT-2 doesn't actually have an unknown token (it's impossible to get an unknown character when using byte-level BPE), but this could happen here because we did not include all the possible bytes in the initial vocabulary. This aspect of BPE is beyond the scope of this section, so we've left the details out.

That's it for the BPE algorithm! Next, we'll have a look at WordPiece.

## WordPiece Tokenization

> **Source:** [WordPiece Tokenization](https://huggingface.co/learn/llm-course/chapter6/6) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

WordPiece is the tokenization algorithm Google developed to pretrain BERT. It has since been reused in quite a few Transformer models based on BERT, such as DistilBERT, MobileBERT, Funnel Transformers, and MPNET. It's very similar to BPE in terms of the training, but the actual tokenization is done differently.

> **Tip:**
> 💡 This section covers WordPiece in depth, going as far as showing a full implementation. You can skip to the end if you just want a general overview of the tokenization algorithm.

### Training algorithm

> **Warning:**
> ⚠️ Google never open-sourced its implementation of the training algorithm of WordPiece, so what follows is our best guess based on the published literature. It may not be 100% accurate.

Like BPE, WordPiece starts from a small vocabulary including the special tokens used by the model and the initial alphabet. Since it identifies subwords by adding a prefix (like `##` for BERT), each word is initially split by adding that prefix to all the characters inside the word. So, for instance, `"word"` gets split like this:

```
w ##o ##r ##d
```

Thus, the initial alphabet contains all the characters present at the beginning of a word and the characters present inside a word preceded by the WordPiece prefix.

Then, again like BPE, WordPiece learns merge rules. The main difference is the way the pair to be merged is selected. Instead of selecting the most frequent pair, WordPiece computes a score for each pair, using the following formula:

$$\mathrm{score} = (\mathrm{freq\_of\_pair}) / (\mathrm{freq\_of\_first\_element} \times \mathrm{freq\_of\_second\_element})$$

By dividing the frequency of the pair by the product of the frequencies of each of its parts, the algorithm prioritizes the merging of pairs where the individual parts are less frequent in the vocabulary. For instance, it won't necessarily merge `("un", "##able")` even if that pair occurs very frequently in the vocabulary, because the two pairs `"un"` and `"##able"` will likely each appear in a lot of other words and have a high frequency. In contrast, a pair like `("hu", "##gging")` will probably be merged faster (assuming the word "hugging" appears often in the vocabulary) since `"hu"` and `"##gging"` are likely to be less frequent individually.

Let's look at the same vocabulary we used in the BPE training example:

```
("hug", 10), ("pug", 5), ("pun", 12), ("bun", 4), ("hugs", 5)
```

The splits here will be:

```
("h" "##u" "##g", 10), ("p" "##u" "##g", 5), ("p" "##u" "##n", 12), ("b" "##u" "##n", 4), ("h" "##u" "##g" "##s", 5)
```

so the initial vocabulary will be `["b", "h", "p", "##g", "##n", "##s", "##u"]` (if we forget about special tokens for now). The most frequent pair is `("##u", "##g")` (present 20 times), but the individual frequency of `"##u"` is very high, so its score is not the highest (it's 1 / 36). All pairs with a `"##u"` actually have that same score (1 / 36), so the best score goes to the pair `("##g", "##s")` -- the only one without a `"##u"` -- at 1 / 20, and the first merge learned is `("##g", "##s") -> ("##gs")`.

Note that when we merge, we remove the `##` between the two tokens, so we add `"##gs"` to the vocabulary and apply the merge in the words of the corpus:

```
Vocabulary: ["b", "h", "p", "##g", "##n", "##s", "##u", "##gs"]
Corpus: ("h" "##u" "##g", 10), ("p" "##u" "##g", 5), ("p" "##u" "##n", 12), ("b" "##u" "##n", 4), ("h" "##u" "##gs", 5)
```

At this point, `"##u"` is in all the possible pairs, so they all end up with the same score. Let's say that in this case, the first pair is merged, so `("h", "##u") -> "hu"`. This takes us to:

```
Vocabulary: ["b", "h", "p", "##g", "##n", "##s", "##u", "##gs", "hu"]
Corpus: ("hu" "##g", 10), ("p" "##u" "##g", 5), ("p" "##u" "##n", 12), ("b" "##u" "##n", 4), ("hu" "##gs", 5)
```

Then the next best score is shared by `("hu", "##g")` and `("hu", "##gs")` (with 1/15, compared to 1/21 for all the other pairs), so the first pair with the biggest score is merged:

```
Vocabulary: ["b", "h", "p", "##g", "##n", "##s", "##u", "##gs", "hu", "hug"]
Corpus: ("hug", 10), ("p" "##u" "##g", 5), ("p" "##u" "##n", 12), ("b" "##u" "##n", 4), ("hu" "##gs", 5)
```

and we continue like this until we reach the desired vocabulary size.

> **Tip:**
> ✏️ **Now your turn!** What will the next merge rule be?

### Tokenization algorithm

Tokenization differs in WordPiece and BPE in that WordPiece only saves the final vocabulary, not the merge rules learned. Starting from the word to tokenize, WordPiece finds the longest subword that is in the vocabulary, then splits on it. For instance, if we use the vocabulary learned in the example above, for the word `"hugs"` the longest subword starting from the beginning that is inside the vocabulary is `"hug"`, so we split there and get `["hug", "##s"]`. We then continue with `"##s"`, which is in the vocabulary, so the tokenization of `"hugs"` is `["hug", "##s"]`.

With BPE, we would have applied the merges learned in order and tokenized this as `["hu", "##gs"]`, so the encoding is different.

As another example, let's see how the word `"bugs"` would be tokenized. `"b"` is the longest subword starting at the beginning of the word that is in the vocabulary, so we split there and get `["b", "##ugs"]`. Then `"##u"` is the longest subword starting at the beginning of `"##ugs"` that is in the vocabulary, so we split there and get `["b", "##u, "##gs"]`. Finally, `"##gs"` is in the vocabulary, so this last list is the tokenization of `"bugs"`.

When the tokenization gets to a stage where it's not possible to find a subword in the vocabulary, the whole word is tokenized as unknown -- so, for instance, `"mug"` would be tokenized as `["[UNK]"]`, as would `"bum"` (even if we can begin with `"b"` and `"##u"`, `"##m"` is not the vocabulary, and the resulting tokenization will just be `["[UNK]"]`, not `["b", "##u", "[UNK]"]`). This is another difference from BPE, which would only classify the individual characters not in the vocabulary as unknown.

> **Tip:**
> ✏️ **Now your turn!** How will the word `"pugs"` be tokenized?

### Implementing WordPiece

Now let's take a look at an implementation of the WordPiece algorithm. Like with BPE, this is just pedagogical, and you won't able to use this on a big corpus.

We will use the same corpus as in the BPE example:

```python
corpus = [
    "This is the Hugging Face Course.",
    "This chapter is about tokenization.",
    "This section shows several tokenizer algorithms.",
    "Hopefully, you will be able to understand how they are trained and generate tokens.",
]
```

First, we need to pre-tokenize the corpus into words. Since we are replicating a WordPiece tokenizer (like BERT), we will use the `bert-base-cased` tokenizer for the pre-tokenization:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")
```

Then we compute the frequencies of each word in the corpus as we do the pre-tokenization:

```python
from collections import defaultdict

word_freqs = defaultdict(int)
for text in corpus:
    words_with_offsets = tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str(text)
    new_words = [word for word, offset in words_with_offsets]
    for word in new_words:
        word_freqs[word] += 1

word_freqs
```

```python
defaultdict(
    int, {'This': 3, 'is': 2, 'the': 1, 'Hugging': 1, 'Face': 1, 'Course': 1, '.': 4, 'chapter': 1, 'about': 1,
    'tokenization': 1, 'section': 1, 'shows': 1, 'several': 1, 'tokenizer': 1, 'algorithms': 1, 'Hopefully': 1,
    ',': 1, 'you': 1, 'will': 1, 'be': 1, 'able': 1, 'to': 1, 'understand': 1, 'how': 1, 'they': 1, 'are': 1,
    'trained': 1, 'and': 1, 'generate': 1, 'tokens': 1})
```

As we saw before, the alphabet is the unique set composed of all the first letters of words, and all the other letters that appear in words prefixed by `##`:

```python
alphabet = []
for word in word_freqs.keys():
    if word[0] not in alphabet:
        alphabet.append(word[0])
    for letter in word[1:]:
        if f"##{letter}" not in alphabet:
            alphabet.append(f"##{letter}")

alphabet.sort()
alphabet

print(alphabet)
```

```python
['##a', '##b', '##c', '##d', '##e', '##f', '##g', '##h', '##i', '##k', '##l', '##m', '##n', '##o', '##p', '##r', '##s',
 '##t', '##u', '##v', '##w', '##y', '##z', ',', '.', 'C', 'F', 'H', 'T', 'a', 'b', 'c', 'g', 'h', 'i', 's', 't', 'u',
 'w', 'y']
```

We also add the special tokens used by the model at the beginning of that vocabulary. In the case of BERT, it's the list `["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]`:

```python
vocab = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] + alphabet.copy()
```

Next we need to split each word, with all the letters that are not the first prefixed by `##`:

```python
splits = {
    word: [c if i == 0 else f"##{c}" for i, c in enumerate(word)]
    for word in word_freqs.keys()
}
```

Now that we are ready for training, let's write a function that computes the score of each pair. We'll need to use this at each step of the training:

```python
def compute_pair_scores(splits):
    letter_freqs = defaultdict(int)
    pair_freqs = defaultdict(int)
    for word, freq in word_freqs.items():
        split = splits[word]
        if len(split) == 1:
            letter_freqs[split[0]] += freq
            continue
        for i in range(len(split) - 1):
            pair = (split[i], split[i + 1])
            letter_freqs[split[i]] += freq
            pair_freqs[pair] += freq
        letter_freqs[split[-1]] += freq

    scores = {
        pair: freq / (letter_freqs[pair[0]] * letter_freqs[pair[1]])
        for pair, freq in pair_freqs.items()
    }
    return scores
```

Let's have a look at a part of this dictionary after the initial splits:

```python
pair_scores = compute_pair_scores(splits)
for i, key in enumerate(pair_scores.keys()):
    print(f"{key}: {pair_scores[key]}")
    if i >= 5:
        break
```

```python
('T', '##h'): 0.125
('##h', '##i'): 0.03409090909090909
('##i', '##s'): 0.02727272727272727
('i', '##s'): 0.1
('t', '##h'): 0.03571428571428571
('##h', '##e'): 0.011904761904761904
```

Now, finding the pair with the best score only takes a quick loop:

```python
best_pair = ""
max_score = None
for pair, score in pair_scores.items():
    if max_score is None or max_score < score:
        best_pair = pair
        max_score = score

print(best_pair, max_score)
```

```python
('a', '##b') 0.2
```

So the first merge to learn is `('a', '##b') -> 'ab'`, and we add `'ab'` to the vocabulary:

```python
vocab.append("ab")
```

To continue, we need to apply that merge in our `splits` dictionary. Let's write another function for this:

```python
def merge_pair(a, b, splits):
    for word in word_freqs:
        split = splits[word]
        if len(split) == 1:
            continue
        i = 0
        while i < len(split) - 1:
            if split[i] == a and split[i + 1] == b:
                merge = a + b[2:] if b.startswith("##") else a + b
                split = split[:i] + [merge] + split[i + 2 :]
            else:
                i += 1
        splits[word] = split
    return splits
```

And we can have a look at the result of the first merge:

```py
splits = merge_pair("a", "##b", splits)
splits["about"]
```

```python
['ab', '##o', '##u', '##t']
```

Now we have everything we need to loop until we have learned all the merges we want. Let's aim for a vocab size of 70:

```python
vocab_size = 70
while len(vocab) < vocab_size:
    scores = compute_pair_scores(splits)
    best_pair, max_score = "", None
    for pair, score in scores.items():
        if max_score is None or max_score < score:
            best_pair = pair
            max_score = score
    splits = merge_pair(*best_pair, splits)
    new_token = (
        best_pair[0] + best_pair[1][2:]
        if best_pair[1].startswith("##")
        else best_pair[0] + best_pair[1]
    )
    vocab.append(new_token)
```

We can then look at the generated vocabulary:

```py
print(vocab)
```

```python
['[PAD]', '[UNK]', '[CLS]', '[SEP]', '[MASK]', '##a', '##b', '##c', '##d', '##e', '##f', '##g', '##h', '##i', '##k',
 '##l', '##m', '##n', '##o', '##p', '##r', '##s', '##t', '##u', '##v', '##w', '##y', '##z', ',', '.', 'C', 'F', 'H',
 'T', 'a', 'b', 'c', 'g', 'h', 'i', 's', 't', 'u', 'w', 'y', 'ab', '##fu', 'Fa', 'Fac', '##ct', '##ful', '##full', '##fully',
 'Th', 'ch', '##hm', 'cha', 'chap', 'chapt', '##thm', 'Hu', 'Hug', 'Hugg', 'sh', 'th', 'is', '##thms', '##za', '##zat',
 '##ut']
```

As we can see, compared to BPE, this tokenizer learns parts of words as tokens a bit faster.

> **Tip:**
> 💡 Using `train_new_from_iterator()` on the same corpus won't result in the exact same vocabulary. This is because the 🤗 Tokenizers library does not implement WordPiece for the training (since we are not completely sure of its internals), but uses BPE instead.

To tokenize a new text, we pre-tokenize it, split it, then apply the tokenization algorithm on each word. That is, we look for the biggest subword starting at the beginning of the first word and split it, then we repeat the process on the second part, and so on for the rest of that word and the following words in the text:

```python
def encode_word(word):
    tokens = []
    while len(word) > 0:
        i = len(word)
        while i > 0 and word[:i] not in vocab:
            i -= 1
        if i == 0:
            return ["[UNK]"]
        tokens.append(word[:i])
        word = word[i:]
        if len(word) > 0:
            word = f"##{word}"
    return tokens
```

Let's test it on one word that's in the vocabulary, and another that isn't:

```python
print(encode_word("Hugging"))
print(encode_word("HOgging"))
```

```python
['Hugg', '##i', '##n', '##g']
['[UNK]']
```

Now, let's write a function that tokenizes a text:

```python
def tokenize(text):
    pre_tokenize_result = tokenizer._tokenizer.pre_tokenizer.pre_tokenize_str(text)
    pre_tokenized_text = [word for word, offset in pre_tokenize_result]
    encoded_words = [encode_word(word) for word in pre_tokenized_text]
    return sum(encoded_words, [])
```

We can try it on any text:

```python
tokenize("This is the Hugging Face course!")
```

```python
['Th', '##i', '##s', 'is', 'th', '##e', 'Hugg', '##i', '##n', '##g', 'Fac', '##e', 'c', '##o', '##u', '##r', '##s',
 '##e', '[UNK]']
```

That's it for the WordPiece algorithm! Now let's take a look at Unigram.

## Unigram Tokenization

> **Source:** [Unigram Tokenization](https://huggingface.co/learn/llm-course/chapter6/7) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

The Unigram algorithm is used in combination with [SentencePiece](https://huggingface.co/papers/1808.06226), which is the tokenization algorithm used by models like AlBERT, T5, mBART, Big Bird, and XLNet.

SentencePiece addresses the fact that not all languages use spaces to separate words. Instead, SentencePiece treats the input as a raw input stream which includes the space in the set of characters to use. Then it can use the Unigram algorithm to construct the appropriate vocabulary.

> **Tip:**
> 💡 This section covers Unigram in depth, going as far as showing a full implementation. You can skip to the end if you just want a general overview of the tokenization algorithm.

### Training algorithm

Compared to BPE and WordPiece, Unigram works in the other direction: it starts from a big vocabulary and removes tokens from it until it reaches the desired vocabulary size. There are several options to use to build that base vocabulary: we can take the most common substrings in pre-tokenized words, for instance, or apply BPE on the initial corpus with a large vocabulary size.

At each step of the training, the Unigram algorithm computes a loss over the corpus given the current vocabulary. Then, for each symbol in the vocabulary, the algorithm computes how much the overall loss would increase if the symbol was removed, and looks for the symbols that would increase it the least. Those symbols have a lower effect on the overall loss over the corpus, so in a sense they are "less needed" and are the best candidates for removal.

This is all a very costly operation, so we don't just remove the single symbol associated with the lowest loss increase, but the \\(p\\) (\\(p\\) being a hyperparameter you can control, usually 10 or 20) percent of the symbols associated with the lowest loss increase. This process is then repeated until the vocabulary has reached the desired size.

Note that we never remove the base characters, to make sure any word can be tokenized.

Now, this is still a bit vague: the main part of the algorithm is to compute a loss over the corpus and see how it changes when we remove some tokens from the vocabulary, but we haven't explained how to do this yet. This step relies on the tokenization algorithm of a Unigram model, so we'll dive into this next.

We'll reuse the corpus from the previous examples:

```
("hug", 10), ("pug", 5), ("pun", 12), ("bun", 4), ("hugs", 5)
```

and for this example, we will take all strict substrings for the initial vocabulary :

```
["h", "u", "g", "hu", "ug", "p", "pu", "n", "un", "b", "bu", "s", "hug", "gs", "ugs"]
```

### Tokenization algorithm

A Unigram model is a type of language model that considers each token to be independent of the tokens before it. It's the simplest language model, in the sense that the probability of token X given the previous context is just the probability of token X. So, if we used a Unigram language model to generate text, we would always predict the most common token.

The probability of a given token is its frequency (the number of times we find it) in the original corpus, divided by the sum of all frequencies of all tokens in the vocabulary (to make sure the probabilities sum up to 1). For instance, `"ug"` is present in `"hug"`, `"pug"`, and `"hugs"`, so it has a frequency of 20 in our corpus.

Here are the frequencies of all the possible subwords in the vocabulary:

```
("h", 15) ("u", 36) ("g", 20) ("hu", 15) ("ug", 20) ("p", 17) ("pu", 17) ("n", 16)
("un", 16) ("b", 4) ("bu", 4) ("s", 5) ("hug", 15) ("gs", 5) ("ugs", 5)
```

So, the sum of all frequencies is 210, and the probability of the subword `"ug"` is thus 20/210.

> **Tip:**
> ✏️ **Now your turn!** Write the code to compute the frequencies above and double-check that the results shown are correct, as well as the total sum.

Now, to tokenize a given word, we look at all the possible segmentations into tokens and compute the probability of each according to the Unigram model. Since all tokens are considered independent, this probability is just the product of the probability of each token. For instance, the tokenization `["p", "u", "g"]` of `"pug"` has the probability:

$$P([``p", ``u", ``g"]) = P(``p") \times P(``u") \times P(``g") = \frac{5}{210} \times \frac{36}{210} \times \frac{20}{210} = 0.000389$$

Comparatively, the tokenization `["pu", "g"]` has the probability:

$$P([``pu", ``g"]) = P(``pu") \times P(``g") = \frac{5}{210} \times \frac{20}{210} = 0.0022676$$

so that one is way more likely. In general, tokenizations with the least tokens possible will have the highest probability (because of that division by 210 repeated for each token), which corresponds to what we want intuitively: to split a word into the least number of tokens possible.

The tokenization of a word with the Unigram model is then the tokenization with the highest probability. In the example of `"pug"`, here are the probabilities we would get for each possible segmentation:

```
["p", "u", "g"] : 0.000389
["p", "ug"] : 0.0022676
["pu", "g"] : 0.0022676
```

So, `"pug"` would be tokenized as `["p", "ug"]` or `["pu", "g"]`, depending on which of those segmentations is encountered first (note that in a larger corpus, equality cases like this will be rare).

In this case, it was easy to find all the possible segmentations and compute their probabilities, but in general it's going to be a bit harder. There is a classic algorithm used for this, called the *Viterbi algorithm*. Essentially, we can build a graph to detect the possible segmentations of a given word by saying there is a branch from character _a_ to character _b_ if the subword from _a_ to _b_ is in the vocabulary, and attribute to that branch the probability of the subword.

To find the path in that graph that is going to have the best score the Viterbi algorithm determines, for each position in the word, the segmentation with the best score that ends at that position. Since we go from the beginning to the end, that best score can be found by looping through all subwords ending at the current position and then using the best tokenization score from the position this subword begins at. Then, we just have to unroll the path taken to arrive at the end.

Let's take a look at an example using our vocabulary and the word `"unhug"`. For each position, the subwords with the best scores ending there are the following:

```
Character 0 (u): "u" (score 0.171429)
Character 1 (n): "un" (score 0.076191)
Character 2 (h): "un" "h" (score 0.005442)
Character 3 (u): "un" "hu" (score 0.005442)
Character 4 (g): "un" "hug" (score 0.005442)
```

Thus `"unhug"` would be tokenized as `["un", "hug"]`.

> **Tip:**
> ✏️ **Now your turn!** Determine the tokenization of the word `"huggun"`, and its score.

### Back to training

Now that we have seen how the tokenization works, we can dive a little more deeply into the loss used during training. At any given stage, this loss is computed by tokenizing every word in the corpus, using the current vocabulary and the Unigram model determined by the frequencies of each token in the corpus (as seen before).

Each word in the corpus has a score, and the loss is the negative log likelihood of those scores -- that is, the sum for all the words in the corpus of all the `-log(P(word))`.

Let's go back to our example with the following corpus:

```
("hug", 10), ("pug", 5), ("pun", 12), ("bun", 4), ("hugs", 5)
```

The tokenization of each word with their respective scores is:

```
"hug": ["hug"] (score 0.071428)
"pug": ["pu", "g"] (score 0.007710)
"pun": ["pu", "n"] (score 0.006168)
"bun": ["bu", "n"] (score 0.001451)
"hugs": ["hug", "s"] (score 0.001701)
```

So the loss is:

```
10 * (-log(0.071428)) + 5 * (-log(0.007710)) + 12 * (-log(0.006168)) + 4 * (-log(0.001451)) + 5 * (-log(0.001701)) = 169.8
```

Now we need to compute how removing each token affects the loss. This is rather tedious, so we'll just do it for two tokens here and save the whole process for when we have code to help us. In this (very) particular case, we had two equivalent tokenizations of all the words: as we saw earlier, for example, `"pug"` could be tokenized `["p", "ug"]` with the same score. Thus, removing the `"pu"` token from the vocabulary will give the exact same loss.

On the other hand, removing `"hug"` will make the loss worse, because the tokenization of `"hug"` and `"hugs"` will become:

```
"hug": ["hu", "g"] (score 0.006802)
"hugs": ["hu", "gs"] (score 0.001701)
```

These changes will cause the loss to rise by:

```
- 10 * (-log(0.071428)) + 10 * (-log(0.006802)) = 23.5
```

Therefore, the token `"pu"` will probably be removed from the vocabulary, but not `"hug"`.

### Implementing Unigram

Now let's implement everything we've seen so far in code. Like with BPE and WordPiece, this is not an efficient implementation of the Unigram algorithm (quite the opposite), but it should help you understand it a bit better.

We will use the same corpus as before as an example:

```python
corpus = [
    "This is the Hugging Face Course.",
    "This chapter is about tokenization.",
    "This section shows several tokenizer algorithms.",
    "Hopefully, you will be able to understand how they are trained and generate tokens.",
]
```

This time, we will use `xlnet-base-cased` as our model:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("xlnet-base-cased")
```

Like for BPE and WordPiece, we begin by counting the number of occurrences of each word in the corpus:

```python
from collections import defaultdict

word_freqs = defaultdict(int)
for text in corpus:
    words_with_offsets = tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str(text)
    new_words = [word for word, offset in words_with_offsets]
    for word in new_words:
        word_freqs[word] += 1

word_freqs
```

Then, we need to initialize our vocabulary to something larger than the vocab size we will want at the end. We have to include all the basic characters (otherwise we won't be able to tokenize every word), but for the bigger substrings we'll only keep the most common ones, so we sort them by frequency:

```python
char_freqs = defaultdict(int)
subwords_freqs = defaultdict(int)
for word, freq in word_freqs.items():
    for i in range(len(word)):
        char_freqs[word[i]] += freq
        # Loop through the subwords of length at least 2
        for j in range(i + 2, len(word) + 1):
            subwords_freqs[word[i:j]] += freq

# Sort subwords by frequency
sorted_subwords = sorted(subwords_freqs.items(), key=lambda x: x[1], reverse=True)
sorted_subwords[:10]
```

```python
[('▁t', 7), ('is', 5), ('er', 5), ('▁a', 5), ('▁to', 4), ('to', 4), ('en', 4), ('▁T', 3), ('▁Th', 3), ('▁Thi', 3)]
```

We group the characters with the best subwords to arrive at an initial vocabulary of size 300:

```python
token_freqs = list(char_freqs.items()) + sorted_subwords[: 300 - len(char_freqs)]
token_freqs = {token: freq for token, freq in token_freqs}
```

> **Tip:**
> 💡 SentencePiece uses a more efficient algorithm called Enhanced Suffix Array (ESA) to create the initial vocabulary.

Next, we compute the sum of all frequencies, to convert the frequencies into probabilities. For our model we will store the logarithms of the probabilities, because it's more numerically stable to add logarithms than to multiply small numbers, and this will simplify the computation of the loss of the model:

```python
from math import log

total_sum = sum([freq for token, freq in token_freqs.items()])
model = {token: -log(freq / total_sum) for token, freq in token_freqs.items()}
```

Now the main function is the one that tokenizes words using the Viterbi algorithm. As we saw before, that algorithm computes the best segmentation of each substring of the word, which we will store in a variable named `best_segmentations`. We will store one dictionary per position in the word (from 0 to its total length), with two keys: the index of the start of the last token in the best segmentation, and the score of the best segmentation. With the index of the start of the last token, we will be able to retrieve the full segmentation once the list is completely populated.

Populating the list is done with just two loops: the main loop goes over each start position, and the second loop tries all substrings beginning at that start position. If the substring is in the vocabulary, we have a new segmentation of the word up until that end position, which we compare to what is in `best_segmentations`.

Once the main loop is finished, we just start from the end and hop from one start position to the next, recording the tokens as we go, until we reach the start of the word:

```python
def encode_word(word, model):
    best_segmentations = [{"start": 0, "score": 1}] + [
        {"start": None, "score": None} for _ in range(len(word))
    ]
    for start_idx in range(len(word)):
        # This should be properly filled by the previous steps of the loop
        best_score_at_start = best_segmentations[start_idx]["score"]
        for end_idx in range(start_idx + 1, len(word) + 1):
            token = word[start_idx:end_idx]
            if token in model and best_score_at_start is not None:
                score = model[token] + best_score_at_start
                # If we have found a better segmentation ending at end_idx, we update
                if (
                    best_segmentations[end_idx]["score"] is None
                    or best_segmentations[end_idx]["score"] > score
                ):
                    best_segmentations[end_idx] = {"start": start_idx, "score": score}

    segmentation = best_segmentations[-1]
    if segmentation["score"] is None:
        # We did not find a tokenization of the word -> unknown
        return ["<unk>"], None

    score = segmentation["score"]
    start = segmentation["start"]
    end = len(word)
    tokens = []
    while start != 0:
        tokens.insert(0, word[start:end])
        next_start = best_segmentations[start]["start"]
        end = start
        start = next_start
    tokens.insert(0, word[start:end])
    return tokens, score
```

We can already try our initial model on some words:

```python
print(encode_word("Hopefully", model))
print(encode_word("This", model))
```

```python
(['H', 'o', 'p', 'e', 'f', 'u', 'll', 'y'], 41.5157494601402)
(['This'], 6.288267030694535)
```

Now it's easy to compute the loss of the model on the corpus!

```python
def compute_loss(model):
    loss = 0
    for word, freq in word_freqs.items():
        _, word_loss = encode_word(word, model)
        loss += freq * word_loss
    return loss
```

We can check it works on the model we have:

```python
compute_loss(model)
```

```python
413.10377642940875
```

Computing the scores for each token is not very hard either; we just have to compute the loss for the models obtained by deleting each token:

```python
import copy

def compute_scores(model):
    scores = {}
    model_loss = compute_loss(model)
    for token, score in model.items():
        # We always keep tokens of length 1
        if len(token) == 1:
            continue
        model_without_token = copy.deepcopy(model)
        _ = model_without_token.pop(token)
        scores[token] = compute_loss(model_without_token) - model_loss
    return scores
```

We can try it on a given token:

```python
scores = compute_scores(model)
print(scores["ll"])
print(scores["his"])
```

Since `"ll"` is used in the tokenization of `"Hopefully"`, and removing it will probably make us use the token `"l"` twice instead, we expect it will have a positive loss. `"his"` is only used inside the word `"This"`, which is tokenized as itself, so we expect it to have a zero loss. Here are the results:

```python
6.376412403623874
0.0
```

> **Tip:**
> 💡 This approach is very inefficient, so SentencePiece uses an approximation of the loss of the model without token X: instead of starting from scratch, it just replaces token X by its segmentation in the vocabulary that is left. This way, all the scores can be computed at once at the same time as the model loss.

With all of this in place, the last thing we need to do is add the special tokens used by the model to the vocabulary, then loop until we have pruned enough tokens from the vocabulary to reach our desired size:

```python
percent_to_remove = 0.1
while len(model) > 100:
    scores = compute_scores(model)
    sorted_scores = sorted(scores.items(), key=lambda x: x[1])
    # Remove percent_to_remove tokens with the lowest scores.
    for i in range(int(len(model) * percent_to_remove)):
        _ = token_freqs.pop(sorted_scores[i][0])

    total_sum = sum([freq for token, freq in token_freqs.items()])
    model = {token: -log(freq / total_sum) for token, freq in token_freqs.items()}
```

Then, to tokenize some text, we just need to apply the pre-tokenization and then use our `encode_word()` function:

```python
def tokenize(text, model):
    words_with_offsets = tokenizer.backend_tokenizer.pre_tokenizer.pre_tokenize_str(text)
    pre_tokenized_text = [word for word, offset in words_with_offsets]
    encoded_words = [encode_word(word, model)[0] for word in pre_tokenized_text]
    return sum(encoded_words, [])

tokenize("This is the Hugging Face course.", model)
```

```python
['▁This', '▁is', '▁the', '▁Hugging', '▁Face', '▁', 'c', 'ou', 'r', 's', 'e', '.']
```

> **Tip:**
> The XLNetTokenizer uses SentencePiece which is why the `"_"` character is included. To decode with SentencePiece, concatenate all the tokens and replace `"_"` with a space.

That's it for Unigram! Hopefully by now you're feeling like an expert in all things tokenizer. In the next section, we will delve into the building blocks of the 🤗 Tokenizers library, and show you how you can use them to build your own tokenizer.
