---
title: "Generative AI Foundations"
order: 2
summary: "What generative AI and LLMs are, how the main model families compare, using them responsibly, and the fundamentals of prompting."
category: "AI"
level: Intermediate
---

# Generative AI Foundations

What generative AI and LLMs are, how the main model families compare, using them responsibly, and the fundamentals of prompting.

## Introduction to Generative AI and Large Language Models

> **Source:** [Introduction to Generative AI and Large Language Models](https://github.com/microsoft/generative-ai-for-beginners/tree/main/01-introduction-to-genai) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

_(Click the image above to view video of this lesson)_

Generative AI is artificial intelligence capable of generating text, images and other types of content. What makes it a fantastic technology is that it democratizes AI, anyone can use it with as little as a text prompt, a sentence written in a natural language. There's no need for you to learn a language like Java or SQL to accomplish something worthwhile, all you need is to use your language, state what you want and out comes a suggestion from an AI model. The applications and impact for this are huge, you write or understand reports, write applications and much more, all in seconds.

In this curriculum, we’ll explore how our startup leverages generative AI to unlock new scenarios in the education world and how we address the inevitable challenges associated with the social implications of its application and the technology limitations.

### Introduction

This lesson will cover:

- Introduction to the business scenario: our startup idea and mission.
- Generative AI and how we landed on the current technology landscape.
- Inner working of a large language model.
- Main capabilities and practical use cases of Large Language Models.

### Learning Goals

After completing this lesson, you will understand:

- What generative AI is and how Large Language Models work.
- How you can leverage large language models for different use cases, with a focus on education scenarios.

### Scenario: our educational startup

Generative Artificial Intelligence (AI) represents the pinnacle of AI technology, pushing the boundaries of what was once thought impossible. Generative AI models have several capabilities and applications, but for this curriculum we'll explore how it's revolutionizing education through a fictional startup. We'll refer to this startup as _our startup_. Our startup works in the education domain with the ambitious mission statement of

> _improving accessibility in learning, on a global scale, ensuring equitable access to education and providing personalized learning experiences to every learner, according to their needs_.

Our startup team is aware we’ll not be able to achieve this goal without leveraging one of the most powerful tools of modern times – Large Language Models (LLMs).

Generative AI is expected to revolutionize the way we learn and teach today, with students having at their disposal virtual teachers 24 hours a day who provide vast amounts of information and examples, and teachers able to leverage innovative tools to assess their students and give feedback.

![Five young students looking at a monitor - image by DALLE2](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/students-by-DALLE2.png)

To start, let’s define some basic concepts and terminology we’ll be using throughout the curriculum.

### How did we get Generative AI?

Despite the extraordinary _hype_ created lately by the announcement of generative AI models, this technology is decades in the making, with the first research efforts dating back to the 60s. We're now at a point with AI having human cognitive capabilities, like conversation as shown by for example [OpenAI ChatGPT](https://openai.com/chatgpt) or [Microsoft Copilot](https://copilot.microsoft.com/?WT.mc_id=academic-105485-koreyst), which also uses a GPT model for its conversational web search experience.

Backing up a bit, the very first prototypes of AI consisted of typewritten chatbots, relying on a knowledge base extracted from a group of experts and represented into a computer. The answers in the knowledge base were triggered by keywords appearing in the input text.
However, it soon became clear that such an approach, using typewritten chatbots, did not scale well.

#### A statistical approach to AI: Machine Learning

A turning point arrived during the 90s, with the application of a statistical approach to text analysis. This led to the development of new algorithms – known as machine learning – capable of learning patterns from data without being explicitly programmed. This approach allows machines to simulate human language understanding: a statistical model is trained on text-label pairings, enabling the model to classify unknown input text with a pre-defined label representing the intention of the message.

#### Neural networks and modern virtual assistants

In recent years, the technological evolution of hardware, capable of handling larger amounts of data and more complex computations, encouraged research in AI, leading to the development of advanced machine learning algorithms known as neural networks or deep learning algorithms.

Neural networks (and in particular Recurrent Neural Networks – RNNs) significantly enhanced natural language processing, enabling the representation of the meaning of text in a more meaningful way, valuing the context of a word in a sentence.

This is the technology that powered the virtual assistants born in the first decade of the new century, very proficient in interpreting human language, identifying a need, and performing an action to satisfy it – like answering with a pre-defined script or consuming a 3rd party service.

#### Present day, Generative AI

So that’s how we came to Generative AI today, which can be seen as a subset of deep learning.

![AI, ML, DL and Generative AI](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/AI-diagram.png)

After decades of research in the AI field, a new model architecture – called _Transformer_ – overcame the limits of RNNs, being able to get much longer sequences of text as input. Transformers are based on the attention mechanism, enabling the model to give different weights to the inputs it receives, ‘paying more attention’ where the most relevant information is concentrated, regardless of their order in the text sequence.

Most of the recent generative AI models – also known as Large Language Models (LLMs), since they work with textual inputs and outputs – are indeed based on this architecture. What’s interesting about these models – trained on a huge amount of unlabeled data from diverse sources like books, articles and websites – is that they can be adapted to a wide variety of tasks and generate grammatically correct text with a semblance of creativity. So, not only did they incredibly enhance the capacity of a machine to ‘understand’ an input text, but they enabled their capacity to generate an original response in human language.

### How do large language models work?

In the next chapter we are going to explore different types of Generative AI models, but for now let’s have a look at how large language models work, with a focus on OpenAI GPT (Generative Pre-trained Transformer) models.

- **Tokenizer, text to numbers**: Large Language Models receive a text as input and generate a text as output. However, being statistical models, they work much better with numbers than text sequences. That’s why every input to the model is processed by a tokenizer, before being used by the core model. A token is a chunk of text – consisting of a variable number of characters, so the tokenizer's main task is splitting the input into an array of tokens. Then, each token is mapped with a token index, which is the integer encoding of the original text chunk.

![Example of tokenization](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/tokenizer-example.png)

- **Predicting output tokens**: Given n tokens as input (with max n varying from one model to another), the model is able to predict one token as output. This token is then incorporated into the input of the next iteration, in an expanding window pattern, enabling a better user experience of getting one (or multiple) sentence as an answer. This explains why, if you ever played with ChatGPT, you might have noticed that sometimes it looks like it stops in the middle of a sentence.

- **Selection process, probability distribution**: The output token is chosen by the model according to its probability of occurring after the current text sequence. This is because the model predicts a probability distribution over all possible ‘next tokens’, calculated based on its training. However, not always is the token with the highest probability chosen from the resulting distribution. A degree of randomness is added to this choice, in a way that the model acts in a non-deterministic fashion - we do not get the exact same output for the same input. This degree of randomness is added to simulate the process of creative thinking and it can be tuned using a model parameter called temperature.

### How can our startup leverage Large Language Models?

Now that we have a better understanding of the inner working of a large language model, let’s see some practical examples of the most common tasks they can perform pretty well, with an eye to our business scenario.
We said that the main capability of a Large Language Model is _generating a text from scratch, starting from a textual input, written in natural language_.

But what kind of textual input and output?
The input of a large language model is known as a prompt, while the output is known as a completion, term that refers to the model mechanism of generating the next token to complete the current input. We are going to dive deep into what is a prompt and how to design it in a way to get the most out of our model. But for now, let’s just say that a prompt may include:

- An **instruction** specifying the type of output we expect from the model. This instruction sometimes might embed some examples or some additional data.

  1. Summarization of an article, book, product reviews and more, along with extraction of insights from unstructured data.

    ![Example of summarization](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/summarization-example.png)

  2. Creative ideation and design of an article, an essay, an assignment or more.

     ![Example of creative writing](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/creative-writing-example.png)

- A **question**, asked in the form of a conversation with an agent.

  ![Example of conversation](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/conversation-example.png)

- A chunk of **text to complete**, which implicitly is an ask for writing assistance.

  ![Example of text completion](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/text-completion-example.png)

- A chunk of **code** together with the ask of explaining and documenting it, or a comment asking to generate a piece of code performing a specific task.

  ![Coding example](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/01-introduction-to-genai/images/coding-example.png)

The examples above are quite simple and are not intended to be an exhaustive demonstration of Large Language Models' capabilities. They are meant to show the potential of using generative AI, in particular but not limited to educational contexts.

Also, the output of a generative AI model is not perfect and sometimes the creativity of the model can work against it, resulting in an output which is a combination of words that the human user can interpret as a mystification of reality, or it can be offensive. Generative AI is not intelligent - at least in the more comprehensive definition of intelligence, including critical and creative reasoning or emotional intelligence; it is not deterministic, and it is not trustworthy, since fabrications, such as erroneous references, content, and statements, may be combined with correct information, and presented in a persuasive and confident manner. In the following lessons, we’ll be dealing with all these limitations and we’ll see what we can do to mitigate them.

## Exploring and comparing different LLMs

> **Source:** [Exploring and comparing different LLMs](https://github.com/microsoft/generative-ai-for-beginners/tree/main/02-exploring-and-comparing-different-llms) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

With the previous lesson, we have seen how Generative AI is changing the technology landscape, how Large Language Models (LLMs) work and how a business - like our startup - can apply them to their use cases and grow! In this chapter, we're looking to compare and contrast different types of large language models (LLMs) to understand their pros and cons.

The next step in our startup's journey is exploring the current landscape of LLMs and understanding which are suitable for our use case.

### Introduction

This lesson will cover:

- Different types of LLMs in the current landscape.
- Testing, iterating, and comparing different models for your use case in Azure.
- How to deploy an LLM.

### Learning Goals

After completing this lesson, you will be able to:

- Select the right model for your use case.
- Understand how to test, iterate, and improve the performance of your model.
- Know how businesses deploy models.

### Understand different types of LLMs

LLMs can have multiple categorizations based on their architecture, training data, and use case. Understanding these differences will help our startup select the right model for the scenario, and understand how to test, iterate, and improve performance.

There are many different types of LLM models, your choice of model depends on what you aim to use them for, your data, how much you're ready to pay and more.

Depending on if you aim to use the models for text, audio, video, image generation and so on, you might opt for a different type of model.

- **Audio and speech recognition**. Whisper-style models are still useful general-purpose speech recognition models, but production choices now also include newer speech-to-text models such as `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, and diarization variants. Evaluate language coverage, diarization, real-time support, latency, and cost for your scenario. Learn more in the [OpenAI speech-to-text documentation](https://platform.openai.com/docs/guides/speech-to-text?WT.mc_id=academic-105485-koreyst).

- **Image generation**. DALL-E and Midjourney are well-known image generation options, but current OpenAI image APIs center on GPT Image models such as `gpt-image-2`, while Stable Diffusion, Imagen, Flux, and other model families are also common choices. Compare prompt adherence, editing support, style control, safety requirements, and licensing. Learn more in the [OpenAI image generation guide](https://platform.openai.com/docs/guides/images?WT.mc_id=academic-105485-koreyst) and Chapter 9 of this curriculum.

- **Text generation**. Text models now span frontier models, reasoning models, smaller low-latency models, and open-weight models. Current examples include OpenAI GPT-5.x models, Anthropic Claude 4.x models, Google Gemini 3.x models, Meta Llama 4 models, and Mistral models. Do not choose only by release date or price; compare task quality, latency, context window, tool use, safety behavior, regional availability, and total cost. The [Microsoft Foundry model catalog](https://ai.azure.com/catalog?WT.mc_id=academic-105485-koreyst) is a good place to compare models available on Azure.

- **Multi-modality**. Many current models can process more than text. Some accept image, audio, or video inputs; some can call tools; and specialized models can generate images, audio, or video. For example, current OpenAI models support text and image input, Gemini models can support text, code, image, audio, and video inputs depending on the variant, and Llama 4 Scout and Maverick are open-weight natively multimodal models. Always check each model card for supported input and output modalities before building a workflow around it.

Selecting a model means you get some basic capabilities, that might not be enough however. Often you have company specific data that you somehow need to tell the LLM about. There are a few different choices on how to approach that, more on that in the upcoming sections.

#### Foundation Models versus LLMs

The term Foundation Model was [coined by Stanford researchers](https://arxiv.org/abs/2108.07258?WT.mc_id=academic-105485-koreyst) and defined as an AI model that follows some criteria, such as:

- **They are trained using unsupervised learning or self-supervised learning**, meaning they are trained on unlabeled multi-modal data, and they do not require human annotation or labeling of data for their training process.
- **They are very large models**, based on very deep neural networks trained on billions of parameters.
- **They are normally intended to serve as a ‘foundation’ for other models**, meaning they can be used as a starting point for other models to be built on top of, which can be done by fine-tuning.

![Foundation Models versus LLMs](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/FoundationModel.png)

Image source: [Essential Guide to Foundation Models and Large Language Models | by Babar M Bhatti | Medium
](https://thebabar.medium.com/essential-guide-to-foundation-models-and-large-language-models-27dab58f7404)

To further clarify this distinction, let’s take ChatGPT as a historical example. Early versions of ChatGPT used GPT-3.5 as a foundation model. OpenAI then used chat-specific data and alignment techniques to create a tuned version that performed better in conversational scenarios, such as chatbots. Modern AI services often route between several model variants, so the service name and the underlying model name are not always the same thing.

![Foundation Model](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/Multimodal.png)

Image source: [2108.07258.pdf (arxiv.org)](https://arxiv.org/pdf/2108.07258.pdf?WT.mc_id=academic-105485-koreyst)

#### Open-Weight/Open-Source versus Proprietary Models

Another way to categorize LLMs is whether they are open-weight, open-source, or proprietary.

Open-source and open-weight models make model artifacts available for inspection, download, or customization, but their licenses differ. Some are fully open source, while others are open-weight models with usage restrictions. They can be useful when a business needs more control over deployment, data locality, cost, or customization. However, teams still need to review license terms, serving costs, maintenance, security updates, and evaluation quality before using them in production. Examples include [Meta Llama 4](https://ai.meta.com/blog/llama-4-multimodal-intelligence/?WT.mc_id=academic-105485-koreyst), some [Mistral models](https://docs.mistral.ai/models/overview?WT.mc_id=academic-105485-koreyst), and many models hosted on [Hugging Face](https://huggingface.co/models?WT.mc_id=academic-105485-koreyst).

Proprietary models are owned and hosted by a provider. These models are often optimized for managed production use and can offer strong support, safety systems, tool integration, and scale. However, customers usually cannot inspect or modify the model weights, and they must review provider terms for privacy, retention, compliance, and acceptable use. Examples include [OpenAI models](https://platform.openai.com/docs/models?WT.mc_id=academic-105485-koreyst), [Google Gemini](https://deepmind.google/models/gemini/pro/?WT.mc_id=academic-105485-koreyst), and [Anthropic Claude](https://platform.claude.com/docs/en/about-claude/models/overview?WT.mc_id=academic-105485-koreyst).

#### Embedding versus Image generation versus Text and Code generation

LLMs can also be categorized by the output they generate.

Embeddings are a set of models that can convert text into a numerical form, called embedding, which is a numerical representation of the input text. Embeddings make it easier for machines to understand the relationships between words or sentences and can be consumed as inputs by other models, such as classification models, or clustering models that have better performance on numerical data. Embedding models are often used for transfer learning, where a model is built for a surrogate task for which there’s an abundance of data, and then the model weights (embeddings) are re-used for other downstream tasks. An example of this category is [OpenAI embeddings](https://platform.openai.com/docs/models/embeddings?WT.mc_id=academic-105485-koreyst).

![Embedding](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/Embedding.png)

Image generation models are models that generate images. These models are often used for image editing, image synthesis, and image translation. Image generation models are often trained on large datasets of images, such as [LAION-5B](https://laion.ai/blog/laion-5b/?WT.mc_id=academic-105485-koreyst), and can be used to generate new images or to edit existing images with inpainting, super-resolution, and colorization techniques. Examples include [GPT Image models](https://platform.openai.com/docs/guides/images?WT.mc_id=academic-105485-koreyst), [Stable Diffusion models](https://github.com/Stability-AI/StableDiffusion?WT.mc_id=academic-105485-koreyst), and Imagen models.

![Image generation](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/Image.png)

Text and code generation models are models that generate text or code. These models are often used for text summarization, translation, and question answering. Text generation models are often trained on large datasets of text, such as [BookCorpus](https://www.cv-foundation.org/openaccess/content_iccv_2015/html/Zhu_Aligning_Books_and_ICCV_2015_paper.html?WT.mc_id=academic-105485-koreyst), and can be used to generate new text, or to answer questions. Code generation models, like [CodeParrot](https://huggingface.co/codeparrot?WT.mc_id=academic-105485-koreyst), are often trained on large datasets of code, such as GitHub, and can be used to generate new code, or to fix bugs in existing code.

![Text and code generation](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/Text.png)

#### Encoder-Decoder versus Decoder-only

To talk about the different types of architectures of LLMs, let's use an analogy.

Imagine your manager gave you a task for writing a quiz for the students. You have two colleagues; one oversees creating the content and the other oversees reviewing them.

The content creator is like a decoder-only model: they can look at the topic, see what you already wrote, and then continue generating content based on that context. They are very good at writing engaging and informative content, but they are not always the best choice when the task is only to classify, retrieve, or encode information. Examples of decoder-only model families include GPT and Llama models.

The reviewer is like an Encoder only model, they look at the course written and the answers, noticing the relationship between them and understanding context, but they are not good at generating content. An example of Encoder only model would be BERT.

Imagine that we can have someone as well who could create and review the quiz, this is an Encoder-Decoder model. Some examples would be BART and T5.

#### Service versus Model

Now, let's talk about the difference between a service and a model. A service is a product that is offered by a Cloud Service Provider, and is often a combination of models, data, and other components. A model is the core component of a service, and is often a foundation model, such as an LLM.

Services are often optimized for production use and are often easier to use than models, via a graphical user interface. However, services are not always available for free, and may require a subscription or payment to use, in exchange for leveraging the service owner’s equipment and resources, optimizing expenses and scaling easily. An example of a service is [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-foundry/openai/overview?WT.mc_id=academic-105485-koreyst), which offers a pay-as-you-go rate plan, meaning users are charged proportionally to how much they use the service. Azure OpenAI Service also offers enterprise-grade security and a responsible AI framework on top of the models' capabilities.

Models are the neural network artifacts: parameters, weights, architecture, tokenizer, and supporting configuration. Running a model locally or in a private environment requires suitable hardware, serving infrastructure, monitoring, and either a compatible open-source/open-weight license or a commercial license. Open-weight models such as Llama 4 or Mistral models can be self-hosted, but they still require computational power and operational expertise.

### How to test and iterate with different models to understand performance on Azure

Once our team has explored the current LLMs landscape and identified some good candidates for their scenarios, the next step is testing them on their data and on their workload. This is an iterative process, done by experiments and measures.
Most of the models we mentioned in previous paragraphs (OpenAI models, open-weight models like Llama 4 and Mistral, and Hugging Face models) are available in [Microsoft Foundry Models](https://learn.microsoft.com/azure/foundry/concepts/foundry-models-overview?WT.mc_id=academic-105485-koreyst).

[Microsoft Foundry](https://learn.microsoft.com/azure/foundry/what-is-foundry?WT.mc_id=academic-105485-koreyst), formerly Azure AI Studio/Azure AI Foundry, is a unified Azure platform for building AI apps and agents. It helps developers manage the lifecycle from experimentation and evaluation to deployment, monitoring, and governance. The model catalog in Microsoft Foundry enables the user to:

- Find the foundation model of interest in the catalog, including models sold by Azure and models from partners and community providers. Users can filter by task, provider, license, deployment option, or name.

![Model catalog](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/AzureAIStudioModelCatalog.png)

- Review the model card, including a detailed description of intended use and training data, code samples and evaluation results on the internal evaluations library.

![Model card](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/ModelCard.png)

- Compare benchmarks across models and datasets available in the industry to assess which one meets the business scenario, through the [Model Benchmarks](https://learn.microsoft.com/azure/ai-foundry/concepts/model-benchmarks?WT.mc_id=academic-105485-koreyst) pane.

![Model benchmarks](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/ModelBenchmarks.png)

- Fine-tune supported models on custom training data to improve model performance in a specific workload, leveraging the experimentation and tracking capabilities of Microsoft Foundry.

![Model fine-tuning](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/FineTuning.png)

- Deploy the original pre-trained model or the fine-tuned version to a remote real-time inference endpoint, using managed compute or serverless deployment options, to enable applications to consume it.

![Model deployment](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/ModelDeploy.png)

> **Note:**
> Not all models in the catalog are currently available for fine-tuning and/or pay-as-you-go deployment. Check the model card for details on the model's capabilities and limitations.

### Improving LLM results

We’ve explored with our startup team different kinds of LLMs and a cloud platform (Microsoft Foundry) that enables us to compare different models, evaluate them on test data, improve performance, and deploy them on inference endpoints.

But when shall they consider fine-tuning a model rather than using a pre-trained one? Are there other approaches to improve model performance on specific workloads?

There are several approaches a business can use to get the results they need from an LLM. You can select different types of models with different degrees of training when deploying an LLM in production, with different levels of complexity, cost, and quality. Here are some different approaches:

- **Prompt engineering with context**. The idea is to provide enough context when you prompt to ensure you get the responses you need.

- **Retrieval Augmented Generation, RAG**. Your data might exist in a database or web endpoint for example, to ensure this data, or a subset of it, is included at the time of prompting, you can fetch the relevant data and make that part of the user's prompt.

- **Fine-tuned model**. Here, you trained the model further on your own data which led to the model being more exact and responsive to your needs but might be costly.

![LLMs deployment](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/02-exploring-and-comparing-different-llms/images/Deploy.png)

Img source: [Four Ways that Enterprises Deploy LLMs | Fiddler AI Blog](https://www.fiddler.ai/blog/four-ways-that-enterprises-deploy-llms?WT.mc_id=academic-105485-koreyst)

#### Prompt Engineering with Context

Pre-trained LLMs work very well on generalized natural language tasks, even by calling them with a short prompt, like a sentence to complete or a question – the so-called “zero-shot” learning.

However, the more the user can frame their query, with a detailed request and examples – the Context – the more accurate and closest to user’s expectations the answer will be. In this case, we talk about “one-shot” learning if the prompt includes only one example and “few shot learning” if it includes multiple examples.
Prompt engineering with context is the most cost-effective approach to kick-off with.

#### Retrieval Augmented Generation (RAG)

LLMs have the limitation that they can use only the data that has been used during their training to generate an answer. This means that they don’t know anything about the facts that happened after their training process, and they cannot access non-public information (like company data).
This can be overcome through RAG, a technique that augments prompt with external data in the form of chunks of documents, considering prompt length limits. This is supported by Vector database tools (like [Azure Vector Search](https://learn.microsoft.com/azure/search/vector-search-overview?WT.mc_id=academic-105485-koreyst)) that retrieve the useful chunks from varied pre-defined data sources and add them to the prompt Context.

This technique is very helpful when a business doesn’t have enough data, enough time, or resources to fine-tune an LLM, but still wishes to improve performance on a specific workload and reduce risks of hallucinated, outdated, or unsupported answers.

#### Fine-tuned model

Fine-tuning is a process that leverages transfer learning to ‘adapt’ the model to a downstream task or to solve a specific problem. Differently from few-shot learning and RAG, it results in a new model being generated, with updated weights and biases. It requires a set of training examples consisting of a single input (the prompt) and its associated output (the completion).
This would be the preferred approach if:

- **Using smaller task-specific models**. A business would like to fine-tune a smaller model for a narrow task rather than repeatedly prompt a larger frontier model, resulting in a more cost-effective and faster solution.

- **Considering latency**. Latency is important for a specific use-case, so it’s not possible to use very long prompts or the number of examples that should be learned from the model doesn’t fit with the prompt length limit.

- **Adapting stable behavior**. A business has many high-quality examples and wants the model to consistently follow a task pattern, output format, tone, or domain-specific style. If the main problem is fresh facts or private knowledge that changes often, use RAG instead of relying on fine-tuning alone.

#### Trained model

Training an LLM from scratch is without a doubt the most difficult and the most complex approach to adopt, requiring massive amounts of data, skilled resources, and appropriate computational power. This option should be considered only in a scenario where a business has a domain-specific use case and a large amount of domain-centric data.

## Using Generative AI Responsibly

> **Source:** [Using Generative AI Responsibly](https://github.com/microsoft/generative-ai-for-beginners/tree/main/03-using-generative-ai-responsibly) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

It's easy to be fascinated with AI and generative AI in particular, but you need to consider how you would use it responsibly. You need to consider things like how to ensure the output is fair, non-harmful and more. This chapter aims to provide you with the mentioned context, what to consider, and how to take active steps to improve your AI usage.

### Introduction

This lesson will cover:

- Why you should prioritize Responsible AI when building Generative AI applications.
- Core principles of Responsible AI and how they relate to Generative AI.
- How to put these Responsible AI principles into practice through strategy and tooling.

### Learning Goals

After completing this lesson you will know:

- The importance of Responsible AI when building Generative AI applications.
- When to think and apply the core principles of Responsible AI when building Generative AI applications.
- What tools and strategies are available to you to put the concept of Responsible AI into practice.

### Responsible AI Principles

The excitement of Generative AI has never been higher. This excitement has brought a lot of new developers, attention, and funding to this space. While this is very positive for anyone looking to build products and companies using Generative AI, it is also important we proceed responsibly.

Throughout this course, we are focusing on building our startup and our AI education product. We’ll use the principles of Responsible AI: Fairness, Inclusiveness, Reliability/Safety, Security & Privacy, Transparency and Accountability. With these principles, we will explore how they relate to our use of Generative AI in our products.

### Why Should You Prioritize Responsible AI

When building a product, taking a human-centric approach by keeping your user's best interest in mind leads to the best results.

The uniqueness of Generative AI is its power to create helpful answers, information, guidance, and content for users. This can be done without many manual steps which can lead to very impressive results. Without proper planning and strategies, it can also unfortunately lead to some harmful results for your users, your product, and society as a whole.

Let's look at some (but not all) of these potentially harmful results:

#### Hallucinations

Hallucinations are a term used to describe when an LLM produces content that is either completely nonsensical or something we know is factually wrong based on other sources of information.

Let's take for example we build a feature for our startup that allows students to ask historical questions to a model. A student asks the question `Who was the sole survivor of Titanic?`

The model produces a response such as the one below:

![Prompt saying "Who was the sole survivor of the Titanic"](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/03-using-generative-ai-responsibly/images/ChatGPT-titanic-survivor-prompt.webp)

> _(Source: [Flying bisons](https://flyingbisons.com?WT.mc_id=academic-105485-koreyst))_

This is a very confident and thorough answer. Unfortunately, it is incorrect. Even with a minimal amount of research, one would discover there was more than one survivor of the Titanic disaster. For a student who is just starting to research this topic, this answer can be persuasive enough to not be questioned and treated as fact. The consequences of this can lead to the AI system being unreliable and negatively impact the reputation of our startup.

With each iteration of any given LLM, we have seen performance improvements around minimizing hallucinations. Even with this improvement, we as application builders and users still need to remain aware of these limitations.

#### Harmful Content

We covered in the earlier section when an LLM produces incorrect or nonsensical responses. Another risk we need to be aware of is when a model responds with harmful content.

Harmful content can be defined as:

- Providing instructions or encouraging self-harm or harm to certain groups.
- Hateful or demeaning content.
- Guiding the planning of any type of attack or violent acts.
- Providing instructions on how to find illegal content or commit illegal acts.
- Displaying sexually explicit content.

For our startup, we want to make sure we have the right tools and strategies in place to prevent this type of content from being seen by students.

#### Lack of Fairness

Fairness is defined as “ensuring that an AI system is free from bias and discrimination and that they treat everyone fairly and equally.” In the world of Generative AI, we want to ensure that exclusionary worldviews of marginalized groups are not reinforced by the model’s output.

These types of outputs are not only destructive to building positive product experiences for our users, but they also cause further societal harm. As application builders, we should always keep a wide and diverse user base in mind when building solutions with Generative AI.

### How to Use Generative AI Responsibly

Now that we have identified the importance of Responsible Generative AI, let's look at 4 steps we can take to build our AI solutions responsibly:

![Mitigate Cycle](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/03-using-generative-ai-responsibly/images/mitigate-cycle.png)

#### Measure Potential Harms

In software testing, we test the expected actions of a user on an application. Similarly, testing a diverse set of prompts users are most likely going to use is a good way to measure potential harm.

Since our startup is building an education product, it would be good to prepare a list of education-related prompts. This could be to cover a certain subject, historical facts, and prompts about student life.

#### Mitigate Potential Harms

It is now time to find ways where we can prevent or limit the potential harm caused by the model and its responses. We can look at this in 4 different layers:

![Mitigation Layers](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/03-using-generative-ai-responsibly/images/mitigation-layers.png)

- **Model**. Choosing the right model for the right use case. Larger and more complex models like GPT-4 can cause more of a risk of harmful content when applied to smaller and more specific use cases. Using your training data to fine-tune also reduces the risk of harmful content.

- **Safety System**. A safety system is a set of tools and configurations on the platform serving the model that help mitigate harm. An example of this is the content filtering system on the Azure OpenAI service. Systems should also detect jailbreak attacks and unwanted activity like requests from bots.

- **Metaprompt**. Metaprompts and grounding are ways we can direct or limit the model based on certain behaviors and information. This could be using system inputs to define certain limits of the model. In addition, providing outputs that are more relevant to the scope or domain of the system.

It can also be using techniques like Retrieval Augmented Generation (RAG) to have the model only pull information from a selection of trusted sources. There is a lesson later in this course for [building search applications](https://github.com/microsoft/generative-ai-for-beginners/blob/main/08-building-search-applications/README.md)

- **User Experience**. The final layer is where the user interacts directly with the model through our application’s interface in some way. In this way we can design the UI/UX to limit the user on the types of inputs they can send to the model as well as text or images displayed to the user. When deploying the AI application, we also must be transparent about what our Generative AI application can and can’t do.

We have an entire lesson dedicated to [Designing UX for AI Applications](https://github.com/microsoft/generative-ai-for-beginners/blob/main/12-designing-ux-for-ai-applications/README.md)

- **Evaluate model**. Working with LLMs can be challenging because we don’t always have control over the data the model was trained on. Regardless, we should always evaluate the model’s performance and outputs. It’s still important to measure the model’s accuracy, similarity, groundedness, and relevance of the output. This helps provide transparency and trust to stakeholders and users.

#### Operate a Responsible Generative AI solution

Building an operational practice around your AI applications is the final stage. This includes partnering with other parts of our startup like Legal and Security to ensure we are compliant with all regulatory policies. Before launching, we also want to build plans around delivery, handling incidents, and rollback to prevent any harm to our users from growing.

### Tools

While the work of developing Responsible AI solutions may seem like a lot, it is work well worth the effort. As the area of Generative AI grows, more tooling to help developers efficiently integrate responsibility into their workflows will mature. For example, the [Azure AI Content Safety](https://learn.microsoft.com/azure/ai-services/content-safety/overview?WT.mc_id=academic-105485-koreyst) can help detect harmful content and images via an API request.

## Prompt Engineering Fundamentals

> **Source:** [Prompt Engineering Fundamentals](https://github.com/microsoft/generative-ai-for-beginners/tree/main/04-prompt-engineering-fundamentals) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

### Introduction
This module covers essential concepts and techniques for creating effective prompts in generative AI models. The way you write your prompt to an LLM also matters. A carefully-crafted prompt can achieve a better quality of response. But what exactly do terms like _prompt_ and _prompt engineering_ mean? And how do I improve the prompt _input_ that I send to the LLM? These are the questions we'll try to answer within this chapter and the next.

_Generative AI_ is capable of creating new content (e.g., text, images, audio, code etc.) in response to user requests. It achieves this using _Large Language Models_ like OpenAI's GPT ("Generative Pre-trained Transformer") series that are trained for using natural language and code.

Users can now interact with these models using familiar paradigms like chat, without needing any technical expertise or training. The models are _prompt-based_ - users send a text input (prompt) and get back the AI response (completion). They can then "chat with the AI" iteratively, in multi-turn conversations, refining their prompt until the response matches their expectations.

"Prompts" now become the primary _programming interface_ for generative AI apps, telling the models what to do and influencing the quality of returned responses. "Prompt Engineering" is a fast-growing field of study that focuses on the _design and optimization_ of prompts to deliver consistent and quality responses at scale.

### Learning Goals

In this lesson, we learn what Prompt Engineering is, why it matters, and how we can craft more effective prompts for a given model and application objective. We'll understand core concepts and best practices for prompt engineering - and learn about an interactive Jupyter Notebooks "sandbox" environment where we can see these concepts applied to real examples.

By the end of this lesson we will be able to:

1. Explain what prompt engineering is and why it matters.
2. Describe the components of a prompt and how they are used.
3. Learn best practices and techniques for prompt engineering.
4. Apply learned techniques to real examples, using an OpenAI endpoint.

### Key Terms

Prompt Engineering: The practice of designing and refining inputs to guide AI models toward producing desired outputs.
Tokenization: The process of converting text into smaller units, called tokens, that a model can understand and process.
Instruction-Tuned LLMs: Large Language Models (LLMs) that have been fine-tuned with specific instructions to improve their response accuracy and relevance.

### Learning Sandbox

Prompt engineering is currently more art than science. The best way to improve our intuition for it is to _practice more_ and adopt a trial-and-error approach that combines application domain expertise with recommended techniques and model-specific optimizations.

The Jupyter Notebook accompanying this lesson provides a _sandbox_ environment where you can try out what you learn - as you go or as part of the code challenge at the end. To execute the exercises, you will need:

1. **An Azure OpenAI API key** - the service endpoint for a deployed LLM.
2. **A Python Runtime** - in which the Notebook can be executed.
3. **Local Env Variables** - _complete the [SETUP](https://github.com/microsoft/generative-ai-for-beginners/blob/main/00-course-setup/02-setup-local.md) steps now to get ready_.

The notebook comes with _starter_ exercises - but you are encouraged to add your own _Markdown_ (description) and _Code_ (prompt requests) sections to try out more examples or ideas - and build your intuition for prompt design.

### Illustrated Guide

Want to get the big picture of what this lesson covers before you dive in? Check out this illustrated guide, which gives you a sense of the main topics covered and the key takeaways for you to think about in each one. The lesson roadmap takes you from understanding the core concepts and challenges to addressing them with relevant prompt engineering techniques and best practices. Note that the "Advanced Techniques" section in this guide refers to content covered in the _next_ chapter of this curriculum.

![Illustrated Guide to Prompt Engineering](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-prompt-engineering-sketchnote.png)

### Our Startup

Now, let's talk about how _this topic_ relates to our startup mission to [bring AI innovation to education](https://educationblog.microsoft.com/2023/06/collaborating-to-bring-ai-innovation-to-education?WT.mc_id=academic-105485-koreyst). We want to build AI-powered applications of _personalized learning_ - so let's think about how different users of our application might "design" prompts:

- **Administrators** might ask the AI to _analyze curriculum data to identify gaps in coverage_. The AI can summarize results or visualize them with code.
- **Educators** might ask the AI to _generate a lesson plan for a target audience and topic_. The AI can build the personalized plan in a specified format.
- **Students** might ask the AI to _tutor them in a difficult subject_. The AI can now guide students with lessons, hints & examples tailored to their level.

That's just the tip of the iceberg. Check out [Prompts For Education](https://github.com/microsoft/prompts-for-edu/tree/main?WT.mc_id=academic-105485-koreyst) - an open-source prompts library curated by education experts - to get a broader sense of the possibilities! _Try running some of those prompts in the sandbox or using the OpenAI Playground to see what happens!_

<!--
LESSON TEMPLATE:
This unit should cover core concept #1.
Reinforce the concept with examples and references.

CONCEPT #1:
Prompt Engineering.
Define it and explain why it is needed.
-->

### What is Prompt Engineering?

We started this lesson by defining **Prompt Engineering** as the process of _designing and optimizing_ text inputs (prompts) to deliver consistent and quality responses (completions) for a given application objective and model. We can think of this as a 2-step process:

- _designing_ the initial prompt for a given model and objective
- _refining_ the prompt iteratively to improve the quality of the response

This is necessarily a trial-and-error process that requires user intuition and effort to get optimal results. So why is it important? To answer that question, we first need to understand three concepts:

- _Tokenization_ = how the model "sees" the prompt
- _Base LLMs_ = how the foundation model "processes" a prompt
- _Instruction-Tuned LLMs_ = how the model can now see "tasks"

#### Tokenization

An LLM sees prompts as a _sequence of tokens_ where different models (or versions of a model) can tokenize the same prompt in different ways. Since LLMs are trained on tokens (and not on raw text), the way prompts get tokenized has a direct impact on the quality of the generated response.

To get an intuition for how tokenization works, try tools like the [OpenAI Tokenizer](https://platform.openai.com/tokenizer?WT.mc_id=academic-105485-koreyst) shown below. Copy in your prompt - and see how that gets converted into tokens, paying attention to how whitespace characters and punctuation marks are handled. Note that this example shows an older LLM (GPT-3) - so trying this with a newer model may produce a different result.

![Tokenization](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-tokenizer-example.png)

#### Concept: Foundation Models

Once a prompt is tokenized, the primary function of the ["Base LLM"](https://blog.gopenai.com/an-introduction-to-base-and-instruction-tuned-large-language-models-8de102c785a6?WT.mc_id=academic-105485-koreyst) (or Foundation model) is to predict the token in that sequence. Since LLMs are trained on massive text datasets, they have a good sense of the statistical relationships between tokens and can make that prediction with some confidence. Note that they don't understand the _meaning_ of the words in the prompt or token; they just see a pattern they can "complete" with their next prediction. They can continue predicting the sequence till terminated by user intervention or some pre-established condition.

Want to see how prompt-based completion works? Enter the above prompt into the [Microsoft Foundry playground](https://ai.azure.com?WT.mc_id=academic-105485-koreyst) with the default settings. The system is configured to treat prompts as requests for information - so you should see a completion that satisfies this context.

But what if the user wanted to see something specific that met some criteria or task objective? This is where _instruction-tuned_ LLMs come into the picture.

![Base LLM Chat Completion](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-playground-chat-base.png)

#### Concept: Instruction Tuned LLMs

An [Instruction Tuned LLM](https://blog.gopenai.com/an-introduction-to-base-and-instruction-tuned-large-language-models-8de102c785a6?WT.mc_id=academic-105485-koreyst) starts with the foundation model and fine-tunes it with examples or input/output pairs (e.g., multi-turn "messages") that can contain clear instructions - and the response from the AI attempt to follow that instruction.

This uses techniques like Reinforcement Learning with Human Feedback (RLHF) that can train the model to _follow instructions_ and _learn from feedback_ so that it produces responses that are better-suited to practical applications and more relevant to user objectives.

Let's try it out - revisit the prompt above, but now change the _system message_ to provide the following instruction as context:

> _Summarize content you are provided with for a second-grade student. Keep the result to one paragraph with 3-5 bullet points._

See how the result is now tuned to reflect the desired goal and format? An educator can now directly use this response in their slides for that class.

![Instruction Tuned LLM Chat Completion](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-playground-chat-instructions.png)

### Why do we need Prompt Engineering?

Now that we know how prompts are processed by LLMs, let's talk about _why_ we need prompt engineering. The answer lies in the fact that current LLMs pose a number of challenges that make _reliable and consistent completions_ more challenging to achieve without putting effort into prompt construction and optimization. For instance:

1. **Model responses are stochastic.** The _same prompt_ will likely produce different responses with different models or model versions. And it may even produce different results with the _same model_ at different times. _Prompt engineering techniques can help us minimize these variations by providing better guardrails_.

1. **Models can fabricate responses.** Models are pre-trained with _large but finite_ datasets, meaning they lack knowledge about concepts outside that training scope. As a result, they can produce completions that are inaccurate, imaginary, or directly contradictory to known facts. _Prompt engineering techniques help users identify and mitigate such fabrications e.g., by asking AI for citations or reasoning_.

1. **Models capabilities will vary.** Newer models or model generations will have richer capabilities but also bring unique quirks and tradeoffs in cost & complexity. _Prompt engineering can help us develop best practices and workflows that abstract away differences and adapt to model-specific requirements in scalable, seamless ways_.

Let's see this in action in the OpenAI or Azure OpenAI Playground:

- Use the same prompt with different LLM deployments (e.g, OpenAI, Azure OpenAI, Hugging Face) - did you see the variations?
- Use the same prompt repeatedly with the _same_ LLM deployment (e.g., Azure OpenAI playground) - how did these variations differ?

#### Fabrications Example

In this course, we use the term **"fabrication"** to reference the phenomenon where LLMs sometimes generate factually incorrect information due to limitations in their training or other constraints. You may also have heard this referred to as _"hallucinations"_ in popular articles or research papers. However, we strongly recommend using _"fabrication"_ as the term so we don't accidentally anthropomorphize the behavior by attributing a human-like trait to a machine-driven outcome. This also reinforces [Responsible AI guidelines](https://www.microsoft.com/ai/responsible-ai?WT.mc_id=academic-105485-koreyst) from a terminology perspective, removing terms that may also be considered offensive or non-inclusive in some contexts.

Want to get a sense of how fabrications work? Think of a prompt that instructs the AI to generate content for a non-existent topic (to ensure it is not found in the training dataset). For example - I tried this prompt:

> **Prompt:** generate a lesson plan on the Martian War of 2076.

A web search showed me that there were fictional accounts (e.g., television series or books) on Martian wars - but none in 2076. Commonsense also tells us that 2076 is _in the future_ and thus, cannot be associated with a real event.

So what happens when we run this prompt with different LLM providers?

> **Response 1**: OpenAI Playground (GPT-35)

![Response 1](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-fabrication-oai.png)

> **Response 2**: Azure OpenAI Playground (GPT-35)

![Response 2](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-fabrication-aoai.png)

> **Response 3**: : Hugging Face Chat Playground (LLama-2)

![Response 3](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/images/04-fabrication-huggingchat.png)

As expected, each model (or model version) produces slightly different responses thanks to stochastic behavior and model capability variations. For instance, one model targets an 8th grade audience while the other assumes a high-school student. But all three models did generate responses that could convince an uninformed user that the event was real.

Prompt engineering techniques like _metaprompting_ and _temperature configuration_ may reduce model fabrications to some extent. New prompt engineering _architectures_ also incorporate new tools and techniques seamlessly into the prompt flow, to mitigate or reduce some of these effects.

### Case Study: GitHub Copilot

Let's wrap this section by getting a sense of how prompt engineering is used in real-world solutions by looking at one Case Study: [GitHub Copilot](https://github.com/features/copilot?WT.mc_id=academic-105485-koreyst).

GitHub Copilot is your "AI Pair Programmer" - it converts text prompts into code completions and is integrated into your development environment (e.g., Visual Studio Code) for a seamless user experience. As documented in the series of blogs below, the earliest version was based on the OpenAI Codex model - with engineers quickly realizing the need to fine-tune the model and develop better prompt engineering techniques, to improve code quality. In July, they [debuted an improved AI model that goes beyond Codex](https://github.blog/2023-07-28-smarter-more-efficient-coding-github-copilot-goes-beyond-codex-with-improved-ai-model/?WT.mc_id=academic-105485-koreyst) for even faster suggestions.

Read the posts in order, to follow their learning journey.

- **May 2023** | [GitHub Copilot is Getting Better at Understanding Your Code](https://github.blog/2023-05-17-how-github-copilot-is-getting-better-at-understanding-your-code/?WT.mc_id=academic-105485-koreyst)
- **May 2023** | [Inside GitHub: Working with the LLMs behind GitHub Copilot](https://github.blog/2023-05-17-inside-github-working-with-the-llms-behind-github-copilot/?WT.mc_id=academic-105485-koreyst).
- **Jun 2023** | [How to write better prompts for GitHub Copilot](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/?WT.mc_id=academic-105485-koreyst).
- **Jul 2023** | [.. GitHub Copilot goes beyond Codex with improved AI model](https://github.blog/2023-07-28-smarter-more-efficient-coding-github-copilot-goes-beyond-codex-with-improved-ai-model/?WT.mc_id=academic-105485-koreyst)
- **Jul 2023** | [A Developer's Guide to Prompt Engineering and LLMs](https://github.blog/2023-07-17-prompt-engineering-guide-generative-ai-llms/?WT.mc_id=academic-105485-koreyst)
- **Sep 2023** | [How to build an enterprise LLM app: Lessons from GitHub Copilot](https://github.blog/2023-09-06-how-to-build-an-enterprise-llm-application-lessons-from-github-copilot/?WT.mc_id=academic-105485-koreyst)

You can also browse their [Engineering blog](https://github.blog/category/engineering/?WT.mc_id=academic-105485-koreyst) for more posts like [this one](https://github.blog/2023-09-27-how-i-used-github-copilot-chat-to-build-a-reactjs-gallery-prototype/?WT.mc_id=academic-105485-koreyst) that shows how these models and techniques are _applied_ for driving real-world applications.

---

<!--
LESSON TEMPLATE:
This unit should cover core concept #2.
Reinforce the concept with examples and references.

CONCEPT #2:
Prompt Design.
Illustrated with examples.
-->

### Prompt Construction

We've seen why prompt engineering is important - now let's understand how prompts are _constructed_ so we can evaluate different techniques for more effective prompt design.

#### Basic Prompt

Let's start with the basic prompt: a text input sent to the model with no other context. Here's an example - when we send the first few words of the US national anthem to the OpenAI [Completion API](https://platform.openai.com/docs/api-reference/completions?WT.mc_id=academic-105485-koreyst) it instantly _completes_ the response with the next few lines, illustrating the basic prediction behavior.

| Prompt (Input)     | Completion (Output)                                                                                                                        |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Oh say can you see | It sounds like you're starting the lyrics to "The Star-Spangled Banner," the national anthem of the United States. The full lyrics are ... |

#### Complex Prompt

Now let's add context and instructions to that basic prompt. The [Chat Completion API](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/chatgpt?WT.mc_id=academic-105485-koreyst) lets us construct a complex prompt as a collection of _messages_ with:

- Input/output pairs reflecting _user_ input and _assistant_ response.
- System message setting the context for assistant behavior or personality.

The request is now in the form below, where the _tokenization_ effectively captures relevant information from context and conversation. Now, changing the system context can be as impactful on the quality of completions, as the user inputs provided.

```python
response = client.responses.create(
    model="gpt-5-mini",
    input=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who won the world series in 2020?"},
        {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
        {"role": "user", "content": "Where was it played?"}
    ]
)
```

#### Instruction Prompt

In the above examples, the user prompt was a simple text query that can be interpreted as a request for information. With _instruction_ prompts, we can use that text to specify a task in more detail, providing better guidance to the AI. Here's an example:

| Prompt (Input)                                                                                                                                                                                                                         | Completion (Output)                                                                                                        | Instruction Type    |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| Write a description of the Civil War                                                                                                                                                                                                   | _returned a simple paragraph_                                                                                              | Simple              |
| Write a description of the Civil War. Provide key dates and events and describe their significance                                                                                                                                     | _returned a paragraph followed by a list of key event dates with descriptions_                                             | Complex             |
| Write a description of the Civil War in 1 paragraph. Provide 3 bullet points with key dates and their significance. Provide 3 more bullet points with key historical figures and their contributions. Return the output as a JSON file | _returns more extensive details in a text box, formatted as JSON that you can copy-paste to a file and validate as needed_ | Complex. Formatted. |

### Primary Content

In the above examples, the prompt was still fairly open-ended, allowing the LLM to decide what part of its pre-trained dataset was relevant. With the _primary content_ design pattern, the input text is divided into two parts:

- an instruction (action)
- relevant content (that influences action)

Here's an example where the instruction is to "summarize this in 2 sentences".

| Prompt (Input)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Completion (Output)                                                                                                                                                                                                                                                                             |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus. <br/> **Summarize this in 2 short sentences** | Jupiter, the fifth planet from the Sun, is the largest in the Solar System and is known for being one of the brightest objects in the night sky. Named after the Roman god Jupiter, it's a gas giant whose mass is two-and-a-half times that of all other planets in the Solar System combined. |

The primary content segment can be used in various ways to drive more effective instructions:

- **Examples** - instead of telling the model what to do with an explicit instruction, give it examples of what to do and let it infer the pattern.
- **Cues** - follow the instruction with a "cue" that primes the completion, guiding the model towards more relevant responses.
- **Templates** - these are repeatable 'recipes' for prompts with placeholders (variables) that can be customized with data for specific use cases.

Let's explore these in action.

#### Using Examples

This is an approach where you use the primary content to "feed the model" some examples of the desired output for a given instruction, and let it infer the pattern for the desired output. Based on the number of examples provided, we can have zero-shot prompting, one-shot prompting, few-shot prompting etc.

The prompt now consists of three components:

- A task description
- A few examples of the desired output
- The start of a new example (which becomes an implicit task description)

| Learning Type | Prompt (Input)                                                                                                                                        | Completion (Output)         |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| Zero-shot     | "The Sun is Shining". Translate to Spanish                                                                                                            | "El Sol está brillando".    |
| One-shot      | "The Sun is Shining" => ""El Sol está brillando". <br> "It's a Cold and Windy Day" =>                                                                 | "Es un día frío y ventoso". |
| Few-shot      | The player ran the bases => Baseball <br/> The player hit an ace => Tennis <br/> The player hit a six => Cricket <br/> The player made a slam-dunk => | Basketball                  |
|               |                                                                                                                                                       |                             |

Note how we had to provide explicit instruction ("Translate to Spanish") in zero-shot prompting, but it gets inferred in the one-shot prompting example. The few-shot example shows how adding more examples allows models to make more accurate inferences with no added instructions.

#### Prompt Cues

Another technique for using primary content is to provide _cues_ rather than examples. In this case, we are giving the model a nudge in the right direction by _starting it off_ with a snippet that reflects the desired response format. The model then "takes the cue" to continue in that vein.

| Number of Cues | Prompt (Input)                                                                                                                                                                                                                                                                                                                                                                                                                                               | Completion (Output)                                                                                                                                                                                                                                                                                       |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0              | Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. <br/>**Summarize This**                                       | Jupiter is the largest planet in our Solar System and the fifth one from the Sun. It is a gas giant with a mass 1/1000th of the Sun's, but it is heavier than all the other planets combined. Ancient civilizations have known about Jupiter for a long time, and it is easily visible in the night sky.. |
| 1              | Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. <br/>**Summarize This** <br/> What we learned is that Jupiter | is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets combined. It is easily visible to the naked eye and has been known since ancient times.                        |
| 2              | Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. <br/>**Summarize This** <br/> Top 3 Facts We Learned:         | 1. Jupiter is the fifth planet from the Sun and the largest in the Solar System. <br/> 2. It is a gas giant with a mass one-thousandth that of the Sun...<br/> 3. Jupiter has been visible to the naked eye since ancient times ...                                                                       |
|                |                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                                                           |

#### Prompt Templates

A prompt template is a _pre-defined recipe for a prompt_ that can be stored and reused as needed, to drive more consistent user experiences at scale. In its simplest form, it is simply a collection of prompt examples like [this one from OpenAI](https://cookbook.openai.com/examples/gpt4-1_prompting_guide?WT.mc_id=academic-105485-koreyst) that provides both the interactive prompt components (user and system messages) and the API-driven request format - to support reuse.

In its more complex form like [this example from LangChain](https://python.langchain.com/docs/concepts/prompt_templates/?WT.mc_id=academic-105485-koreyst) it contains _placeholders_ that can be replaced with data from a variety of sources (user input, system context, external data sources etc.) to generate a prompt dynamically. This allows us to create a library of reusable prompts that can be used to drive consistent user experiences **programmatically** at scale.

Finally, the real value of templates lies in the ability to create and publish _prompt libraries_ for vertical application domains - where the prompt template is now _optimized_ to reflect application-specific context or examples that make the responses more relevant and accurate for the targeted user audience. The [Prompts For Edu](https://github.com/microsoft/prompts-for-edu?WT.mc_id=academic-105485-koreyst) repository is a great example of this approach, curating a library of prompts for the education domain with emphasis on key objectives like lesson planning, curriculum design, student tutoring etc.

### Supporting Content

If we think about prompt construction as having a instruction (task) and a target (primary content), then _secondary content_ is like additional context we provide to **influence the output in some way**. It could be tuning parameters, formatting instructions, topic taxonomies etc. that can help the model _tailor_ its response to be suit the desired user objectives or expectations.

For example: Given a course catalog with extensive metadata (name, description, level, metadata tags, instructor etc.) on all the available courses in the curriculum:

- we can define an instruction to "summarize the course catalog for Fall 2023"
- we can use the primary content to provide a few examples of the desired output
- we can use the secondary content to identify the top 5 "tags" of interest.

Now, the model can provide a summary in the format shown by the few examples - but if a result has multiple tags, it can prioritize the 5 tags identified in secondary content.

---

<!--
LESSON TEMPLATE:
This unit should cover core concept #1.
Reinforce the concept with examples and references.

CONCEPT #3:
Prompt Engineering Techniques.
What are some basic techniques for prompt engineering?
Illustrate it with some exercises.
-->

### Prompting Best Practices

Now that we know how prompts can be _constructed_, we can start thinking about how to _design_ them to reflect best practices. We can think about this in two parts - having the right _mindset_ and applying the right _techniques_.

#### Prompt Engineering Mindset

Prompt Engineering is a trial-and-error process so keep three broad guiding factors in mind:

1. **Domain Understanding Matters.** Response accuracy and relevance is a function of the _domain_ in which that application or user operates. Apply your intuition and domain expertise to **customize techniques** further. For instance, define _domain-specific personalities_ in your system prompts, or use _domain-specific templates_ in your user prompts. Provide secondary content that reflects domain-specific contexts, or use _domain-specific cues and examples_ to guide the model towards familiar usage patterns.

2. **Model Understanding Matters.** We know models are stochastic by nature. But model implementations can also vary in terms of the training dataset they use (pre-trained knowledge), the capabilities they provide (e.g., via API or SDK) and the type of content they are optimized for (e.g, code vs. images vs. text). Understand the strengths and limitations of the model you are using, and use that knowledge to _prioritize tasks_ or build _customized templates_ that are optimized for the model's capabilities.

3. **Iteration & Validation Matters.** Models are evolving rapidly, and so are the techniques for prompt engineering. As a domain expert, you may have other context or criteria _your_ specific application, that may not apply to the broader community. Use prompt engineering tools & techniques to "jump start" prompt construction, then iterate and validate the results using your own intuition and domain expertise. Record your insights and create a **knowledge base** (e.g, prompt libraries) that can be used as a new baseline by others, for faster iterations in the future.

### Best Practices

Now let's look at common best practices that are recommended by [OpenAI](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api?WT.mc_id=academic-105485-koreyst) and [Azure OpenAI](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/prompt-engineering#best-practices?WT.mc_id=academic-105485-koreyst) practitioners.

| What                              | Why                                                                                                                                                                                                                                               |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Evaluate the latest models.       | New model generations are likely to have improved features and quality - but may also incur higher costs. Evaluate them for impact, then make migration decisions.                                                                                |
| Separate instructions & context   | Check if your model/provider defines _delimiters_ to distinguish instructions, primary and secondary content more clearly. This can help models assign weights more accurately to tokens.                                                         |
| Be specific and clear             | Give more details about the desired context, outcome, length, format, style etc. This will improve both the quality and consistency of responses. Capture recipes in reusable templates.                                                          |
| Be descriptive, use examples      | Models may respond better to a "show and tell" approach. Start with a `zero-shot` approach where you give it an instruction (but no examples) then try `few-shot` as a refinement, providing a few examples of the desired output. Use analogies. |
| Use cues to jumpstart completions | Nudge it towards a desired outcome by giving it some leading words or phrases that it can use as a starting point for the response.                                                                                                               |
| Double Down                       | Sometimes you may need to repeat yourself to the model. Give instructions before and after your primary content, use an instruction and a cue, etc. Iterate & validate to see what works.                                                         |
| Order Matters                     | The order in which you present information to the model may impact the output, even in the learning examples, thanks to recency bias. Try different options to see what works best.                                                               |
| Give the model an “out”           | Give the model a _fallback_ completion response it can provide if it cannot complete the task for any reason. This can reduce chances of models generating false or fabricated responses.                                                         |
|                                   |                                                                                                                                                                                                                                                   |

As with any best practice, remember that _your mileage may vary_ based on the model, the task and the domain. Use these as a starting point, and iterate to find what works best for you. Constantly re-evaluate your prompt engineering process as new models and tools become available, with a focus on process scalability and response quality.

<!--
LESSON TEMPLATE:
This unit should provide a code challenge if applicable

CHALLENGE:
Link to a Jupyter Notebook with only the code comments in the instructions (code sections are empty).

SOLUTION:
Link to a copy of that Notebook with the prompts filled in and run, showing what one example could be.
-->

## Creating Advanced prompts

> **Source:** [Creating Advanced prompts](https://github.com/microsoft/generative-ai-for-beginners/tree/main/05-advanced-prompts) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

Let's recap some learnings from the previous chapter:

> Prompt _engineering_ is the process by which we **guide the model towards more relevant responses** by providing more useful instructions or context.

There are also two steps to writing prompts: constructing the prompt, by providing relevant context, and _optimization_, how to gradually improve the prompt.

At this point, we have some basic understanding of how to write prompts, but we need to go deeper. In this chapter, you will go from trying out various prompts to understanding why one prompt is better than another. You will learn how to construct prompts following some basic techniques that can be applied to any LLM.

### Introduction

In this chapter, we will cover the following topics:

- Extend your knowledge of prompt engineering by applying different techniques to your prompts.
- Configuring your prompts to vary the output.

### Learning goals

After completing this lesson, you'll be able to:

- Apply prompt engineering techniques that improve the outcome of your prompts.
- Perform prompting that is either varied or deterministic.

### Prompt engineering

Prompt engineering is the process of creating prompts that will produce the desired outcome. There's more to prompt engineering than just writing a text prompt. Prompt engineering is not an engineering discipline, it's more a set of techniques that you can apply to get the desired outcome.

#### An example of a prompt

Let's take a basic prompt like this one:

> Generate 10 questions on geography.

In this prompt, you are actually applying a set of different prompt techniques.

Let's break this down.

- **Context**, you specify it should be about "geography".
- **Limiting the output**, you want no more than 10 questions.

#### Limitations of simple prompting

You may or may not get the desired outcome. You will get your questions generated, but geography is a big topic and you may not get what you want to due the following reasons:

- **Big topic**, you don't know if it's going to be about countries, capitals, rivers and so on.
- **Format**, what if you wanted the questions to be formatted in a certain way?

As you can see, there's a lot to consider when creating prompts.

So far, we've seen a simple prompt example, but generative AI is capable of much more to help people in a variety of roles and industries. Let's explore some basic techniques next.

#### Techniques for prompting

First, we need to understand that prompting is an _emergent_ property of an LLM meaning that this is not a feature that is built into the model but rather something we discover as we use the model.

There are some basic techniques that we can use to prompt an LLM. Let's explore them.

- **Zero-shot prompting**, this is the most basic form of prompting. It's a single prompt requesting a response from the LLM based solely on its training data.
- **Few-shot prompting**, this type of prompting guides the LLM by providing 1 or more examples it can rely on to generate its response.
- **Chain-of-thought**, this type of prompting tells the LLM how to break down a problem into steps.
- **Generated knowledge**, to improve the response of a prompt, you can provide generated facts or knowledge additionally to your prompt.
- **Least to most**, like chain-of-thought, this technique is about breaking down a problem into a series of steps and then ask these steps to be performed in order.
- **Self-refine**, this technique is about critiquing the LLM's output and then asking it to improve.
- **Maieutic prompting**. What you want here is to ensure the LLM answer is correct and you ask it to explain various parts of the answer. This is a form of self-refine.

#### Zero-shot prompting

This style of prompting is very simple, it consists of a single prompt. This technique is probably what you're using as you're starting to learn about LLMs. Here's an example:

- Prompt: "What is Algebra?"
- Answer: "Algebra is a branch of mathematics that studies mathematical symbols and the rules for manipulating these symbols."

#### Few-shot prompting

This style of prompting helps the model by providing a few examples along with the request. It consists of a single prompt with additional task-specific data. Here's an example:

- Prompt: "Write a poem in the style of Shakespeare. Here are a few examples of Shakespearean sonnets.:
  Sonnet 18: 'Shall I compare thee to a summer's day? Thou art more lovely and more temperate...'
  Sonnet 116: 'Let me not to the marriage of true minds Admit impediments. Love is not love Which alters when it alteration finds...'
  Sonnet 132: 'Thine eyes I love, and they, as pitying me, Knowing thy heart torment me with disdain,...'
  Now, write a sonnet about the beauty of the moon."
- Answer: "Upon the sky, the moon doth softly gleam, In silv'ry light that casts its gentle grace,..."

Examples provide the LLM with the context, format or style of the desired output. They help the model understand the specific task and generate more accurate and relevant responses.

#### Chain-of-thought

Chain-of-thought is a very interesting technique as it's about taking the LLM through a series of steps. The idea is to instruct the LLM in such a way that it understands how to do something. Consider the following example, with and without chain-of-thought:

    - Prompt: "Alice has 5 apples, throws 3 apples, gives 2 to Bob and Bob gives one back, how many apples does Alice have?"
    - Answer: 5

LLM answers with 5, which is incorrect. Correct answer is 1 apple, given the calculation (5 -3 -2 + 1 = 1).

So how can we teach the LLM to do this correctly?

Let's try chain-of-thought. Applying chain-of-thought means:

1. Give the LLM a similar example.
1. Show the calculation, and how to calculate it correctly.
1. Provide the original prompt.

Here's how:

- Prompt: "Lisa has 7 apples, throws 1 apple, gives 4 apples to Bart and Bart gives one back:
  7 -1 = 6
  6 -4 = 2
  2 +1 = 3
  Alice has 5 apples, throws 3 apples, gives 2 to Bob and Bob gives one back, how many apples does Alice have?"
  Answer: 1

Note how we write substantially longer prompts with another example, a calculation and then the original prompt and we arrive at the correct answer 1.

As you can see chain-of-thought is a very powerful technique.

#### Generated knowledge

Many times when you want to construct a prompt, you want to do so using your own company's data. You want part of the prompt to be from the company and the other part should be the actual prompt you're interested in.

As an example, this is what your prompt then can look like if you're in the insurance business:

```text
{{company}}: {{company_name}}
{{products}}:
{{products_list}}
Please suggest an insurance given the following budget and requirements:
Budget: {{budget}}
Requirements: {{requirements}}
```

Above, you see how the prompt is constructed using a template. In the template there's a number of variables, denoted by `{{variable}}`, that will be replaced with actual values from a company API.

Here's an example of how the prompt could look like once the variables have been replaced by content from your company:

```text
Insurance company: ACME Insurance
Insurance products (cost per month):
- Car, cheap, 500 USD
- Car, expensive, 1100 USD
- Home, cheap, 600 USD
- Home, expensive, 1200 USD
- Life, cheap, 100 USD

Please suggest an insurance given the following budget and requirements:
Budget: $1000
Requirements: Car, Home, and Life insurance
```

Running this prompt through an LLM will produce a response like this:

```output
Given the budget and requirements, we suggest the following insurance package from ACME Insurance:
- Car, cheap, 500 USD
- Home, cheap, 600 USD
- Life, cheap, 100 USD
Total cost: $1,200 USD
```

As you can see, it also suggests the Life insurance, which it shouldn't. This result is an indication that we need to optimize the prompt by changing the prompt to be clearer on what it can allow. After some _trial and error_, we arrive at the following prompt:

```text
Insurance company: ACME Insurance
Insurance products (cost per month):
- type: Car, cheap, cost: 500 USD
- type: Car, expensive, cost: 1100 USD
- type: Home, cheap, cost: 600 USD
- type: Home, expensive, cost: 1200 USD
- type: Life, cheap, cost: 100 USD

Please suggest an insurance given the following budget and requirements:
Budget: $1000 restrict choice to types: Car, Home
```

Note how adding _type_ and _cost_ and also using the keyword _restrict_ helps the LLM to understand what we want.

Now we get the following response:

```output
Given the budget and requirements, we suggest the Car, Cheap insurance product which costs 500 USD per month.
```

The point of this example was to show that even though we're using a basic technique like _generated knowledge_, we still need to optimize the prompt in most cases to get the desired outcome.

#### Least-to-most

The idea with Least-to-most prompting is to break down a bigger problem into subproblems. That way, you help guide the LLM on how to "conquer" the bigger problem. A good example could be for data science where you can ask the LLM to divide up a problem like so:

> Prompt: How to perform data science in 5 steps?

With your AI assistant answering with:

1. Collect data
1. Clean data
1. Analyze data
1. Plot data
1. Present data

#### Self-refine, critique the results

With generative AIs and LLMs, you can't trust the output. You need to verify it. After all, the LLM is just presenting you what's the next most likely thing to say, not what's correct. Therefore, a good idea is to ask the LLM to critique itself, which leads us to the self-refine technique.

How it works is that you follow the following steps:

1. Initial prompt asking the LLM to solve a problem
1. LLM answers
1. You critique the answer and ask the AI to improve
1. LLM answers again, this time considering the critique and suggest solutions it came up with

You can repeat this process as many times as you want.

Here's an example using this technique:

> Prompt: "Create a Python Web API with routes products and customers"

AI Answer:

```python
import flask
app = Flask(__name__)

@app.route('/products')
def products():
    return 'Products'

@app.route('/customers')
def customers():
    return 'Customers'
```

> Prompt: suggest 3 improvements of the above code

AI Answer:

```text
Sure, here are three suggestions to improve the code:

Import the correct module: The first line should import Flask instead of flask. The correct import statement should be from flask import Flask.

Add a main function: Add a if __name__ == '__main__': block to the end of the file to run the application when the file is executed.

Use f-strings: Use f-strings to format the return statements in the route functions. For example, return 'Products' can be changed to return f'This is the {request.path} page'.
```

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/products')
def products():
    return f'This is the {request.path} page'

@app.route('/customers')
def customers():
    return f'This is the {request.path} page'

if __name__ == '__main__':
    app.run()
```

As you can see, the above AI response is improving the first suggested code thanks to critiquing the first answer.

#### Maieutic prompting

Maieutic prompting is a technique that is similar to self-refine but it's more about asking the LLM to explain itself. The goal is to reduce inconsistencies in the LLM's output so to ensure it arrives at the correct answer. The workflow to follow is:

1. Ask the LLM to answer a question
1. For each part of the answer, ask the LLM to explain it more in depth.
1. If there are inconsistencies, discard the parts that are inconsistent.

Repeat 2 and 3 until you've gone through all the parts and you're satisfied with the answer.

Here's an example prompt:

> prompt: How can I create a crisis plan to mitigate a pandemic in 5 steps?
> LLM answer:

```text
1. Identify the risks
1. Identify the stakeholders
1. Identify the resources
1. Identify the actions
1. Identify the communication channels
```

It's identified 5 steps, but can we determine if this is correct? Let's ask the LLM to explain each step:

> prompt: Explain the first step in more detail, what are the risks in detail with a pandemic?

```text
The risks are the following:

- Loss of life
- Loss of business
- Loss of reputation
- Loss of customers
- Loss of employees
```

At this point, we want to make sure the LLM is correct so we ask it to explain the first risk in more detail and hope it's consistent with the answer above:

> prompt: In a Pandemic, which is the biggest risk and why?

```text
The biggest risk is loss of life because it's the most important thing to protect.
```

> What are the two biggest risks in a pandemic?

```text
The two biggest risks are loss of life and loss of business.
```

At this point, the LLM is consistent and mentions "life" and "business" as the top two risks. We can now continue to the next step and feel fairly confident. However, we shouldn't trust the LLM blindly, we should always verify the output.

### Vary your output

LLMs are nondeterministic by nature, meaning that you will get different results each time you run the same prompt. Try the following prompt for example:

> "Generate code for a Python Web API"

```python
# Import necessary modules
import flask
from flask import request, jsonify

# Create a Flask app
app = flask.Flask(__name__)

# Create a route for the API
@app.route('/api', methods=['GET'])
def api():
    # Get the data from the request
    data = request.args

    # Process the data
    result = process_data(data)

    # Return the result as JSON
    return jsonify(result)

# Function to process the data
def process_data(data):
    # Do something with the data
    result = data + 1

    # Return the result
    return result

# Run the app
if __name__ == '__main__':
    app.run()

```

Running the same prompt again generates a slightly different response:

```python
#import necessary packages
import flask
from flask import request, jsonify

#create the Flask application
app = flask.Flask(__name__)
app.config["DEBUG"] = True

#create a list of books
books = [
    {'id': 0,
     'title': 'A Fire Upon the Deep',
     'author': 'Vernor Vinge',
     'first_sentence': 'The coldsleep itself was dreamless.',
     'year_published': '1992'},
    {'id': 1,
     'title': 'The Ones Who Walk Away From Omelas',
     'author': 'Ursula K. Le Guin',
     'first_sentence': 'With a clamor of bells that set the swallows soaring, the Festival of Summer came to the city Omelas, bright-towered by the sea.',
     'published': '1973'},
    {'id': 2,
     'title': 'Dhalgren',
     'author': 'Samuel R. Delany',
     'first_sentence': 'to wound the autumnal city.',
     'published': '1975'}
]

#create an endpoint for the API
@app.route('/', methods=['GET'])
def home():
    return '''<h1>Books API</h1>
<p>A prototype API for retrieving books.</p>'''

#create an endpoint to return all books
@app.route('/api/v1/resources/books/all', methods=['GET'])
def api_all():
    return jsonify(books)

#create an endpoint to return a single book
@app.route('/api/v1/resources/books', methods=['GET'])
def api_id():
    #check if an ID was provided as part of the URL
    #if ID is provided, assign it to a variable
    #if no ID is provided, display an error
    if 'id' in request.args:
        id = int(request.args['id'])
    else:
        return "Error: No id field provided. Please specify an id."

    #create an empty list for our results
    results = []

    #loop through the data and match results that fit the requested ID
    #IDs are unique, but other fields might return many results
    for book in books:
        if book['id'] == id:
            results.append(book)

    #use the jsonify function from Flask to convert our list of
    #Python dictionaries to the JSON format
    return jsonify(results)

app.run()
```

> So is the varied output a problem?

Depends on what you're trying to do. If you want a specific response then it's a problem. If you're ok with a varied output like "Generate any 3 questions on geography", then it's not a problem.

#### Using temperature to vary your output

Ok, so we've decided we want to limit the output to be more predictable, that is more deterministic. How do we do that?

Temperature is a value between 0 and 1, where 0 is the most deterministic and 1 is the most varied. The default value is 0.7. Let's see what happens with two runs of the same prompt with temperature set to 0.1:

> "Generate code for a Python Web API"

```python
#import necessary libraries
import flask
from flask import request, jsonify

#create an instance of the Flask class
app = flask.Flask(__name__)

#create an endpoint for the API
@app.route('/api/v1/endpoint', methods=['GET'])
def api_endpoint():
    #get the request data
    data = request.get_json()

    #process the data
    result = process_data(data)

    #return the result
    return jsonify(result)

#function to process the data
def process_data(data):
    #process the data
    result = {'result': 'success'}

    #return the result
    return result

#run the Flask app
if __name__ == '__main__':
    app.run()

```

Running the prompt again gives us this outcome:

```python
#import necessary libraries
import flask
from flask import request, jsonify

#create a Flask app
app = flask.Flask(__name__)

#create a route for the API
@app.route('/api', methods=['GET'])
def api_call():
    #get the data from the request
    data = request.get_json()

    #process the data
    result = process_data(data)

    #return the result
    return jsonify(result)

#define the process_data function
def process_data(data):
    #do something with the data
    result = data + 1

    #return the result
    return result

#run the app
if __name__ == '__main__':
    app.run()

```

There's only a tiny difference between these two outputs. Let's do the opposite this time, let's set the temperature to 0.9:

```python
# Import necessary libraries
import flask
from flask import request, jsonify

# Create a Flask app
app = flask.Flask(__name__)

# Create a route for the API
@app.route('/api', methods=['GET'])
def api_call():
    # Get the data from the request
    data = request.args

    # Process the data
    result = process_data(data)

    # Return the result
    return jsonify(result)

# Function to process the data
def process_data(data):
    # Do something with the data
    result = data + 1

    # Return the result
    return result

# Run the app
if __name__ == '__main__':
    app.run()

```

and the second attempt at 0.9 as temperature value:

```python
import flask
from flask import request, jsonify

# create the Flask app
app = flask.Flask(__name__)
app.config['DEBUG'] = True

# create some test data
books = [
    {'id': 0, 'title': 'A Fire Upon The Deep', 'author': 'Vernor Vinge', 'first_sentence': 'The coldsleep itself was dreamless.', 'year_published': '1992'},
    {'id': 1, 'title': 'The Ones Who Walk Away From Omelas', 'author': 'Ursula K. Le Guin', 'first_sentence': 'With a clamor of bells that set the swallows soaring, the Festival of Summer came to the city Omelas, bright-towered by the sea.', 'published': '1973'},
    {'id': 2, 'title': 'Dhalgren', 'author': 'Samuel R. Delany', 'first_sentence': 'to wound the autumnal city.', 'published': '1975'}
]

# create an endpoint
@app.route('/', methods=['GET'])
def home():
    return '''<h1>Welcome to our book API!</h1>'''

@app.route('/api/v1/resources/books

```

As you can see, the results couldn't be more varied.

> Note, that there are more parameters you can change to vary the output, like top-k, top-p, repetition penalty, length penalty and diversity penalty but these are outside the scope of this curriculum.

### Good practices

There are many practices you can apply to try to get what you want. You will find your own style as you use prompting more and more.

Additionally to the techniques we've covered, there are some good practices to consider when prompting an LLM.

Here are some good practices to consider:

- **Specify context**. Context matters, the more you can specify like domain, topic, etc. the better.
- Limit the output. If you want a specific number of items or a specific length, specify it.
- **Specify both what and how**. Remember to mention both what you want and how you want it, for example "Create a Python Web API with routes products and customers, divide it into 3 files".
- **Use templates**. Often, you will want to enrich your prompts with data from your company. Use templates to do this. Templates can have variables that you replace with actual data.
- **Spell correctly**. LLMs might provide you with a correct response, but if you spell correctly, you will get a better response.

### Solution

Please attempt to solve the assignment by adding suitable prompts to the code.

> **Tip:**
> Phrase a prompt to ask it to improve, it's a good idea to limit how many improvements. You can also ask to improve it in a certain way, for example architecture, performance, security, etc.

[Solution](https://github.com/microsoft/generative-ai-for-beginners/blob/main/05-advanced-prompts/python/aoai-solution.py)
