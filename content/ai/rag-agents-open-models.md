---
title: "RAG, Agents and Open Models"
order: 8
summary: "Going further: retrieval augmented generation and vector databases, open-source models, AI agents, fine-tuning, small language models, and the Mistral and Meta model families."
category: "AI"
level: Intermediate
---

# RAG, Agents and Open Models

Going further: retrieval augmented generation and vector databases, open-source models, AI agents, fine-tuning, small language models, and the Mistral and Meta model families.

## Retrieval Augmented Generation (RAG) and Vector Databases

> **Source:** [Retrieval Augmented Generation (RAG) and Vector Databases](https://github.com/microsoft/generative-ai-for-beginners/tree/main/15-rag-and-vector-databases) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

In the search applications lesson, we briefly learned how to integrate your own data into Large Language Models (LLMs). In this lesson, we will delve further into the concepts of grounding your data in your LLM application, the mechanics of the process and the methods for storing data, including both embeddings and text.

### Introduction

In this lesson we will cover the following:

- An introduction to RAG, what it is and why it is used in AI (artificial intelligence).

- Understanding what vector databases are and creating one for our application.

- A practical example on how to integrate RAG into an application.

### Learning Goals

After completing this lesson, you will be able to:

- Explain the significance of RAG in data retrieval and processing.

- Setup RAG application and ground your data to an LLM

- Effective integration of RAG and Vector Databases in LLM Applications.

### Our Scenario: enhancing our LLMs with our own data

For this lesson, we want to add our own notes into the education startup, which allows the chatbot to get more information on the different subjects. Using the notes that we have, learners will be able to study better and understand the different topics, making it easier to revise for their examinations. To create our scenario, we will use:

- `Azure OpenAI:` the LLM we will use to create our chatbot

- `AI for beginners' lesson on Neural Networks`: this will be the data we ground our LLM on

- `Azure AI Search` and `Azure Cosmos DB:` vector database to store our data and create a search index

Users will be able to create practice quizzes from their notes, revision flash cards and summarize it to concise overviews. To get started, let us look at what is RAG and how works:

### Retrieval Augmented Generation (RAG)

An LLM powered chatbot processes user prompts to generate responses. It is designed to be interactive and engages with users on a wide array of topics. However, its responses are limited to the context provided and its foundational training data. For instance, GPT-4 knowledge cutoff is September 2021, meaning, it lacks knowledge of events that have occurred after this period. In addition, the data used to train LLMs excludes confidential information such as personal notes or a company's product manual.

#### How RAGs (Retrieval Augmented Generation) work

![drawing showing how RAGs work](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/15-rag-and-vector-databases/images/how-rag-works.png)

Suppose you want to deploy a chatbot that creates quizzes from your notes, you will require a connection to the knowledge base. This is where RAG comes to the rescue. RAGs operate as follows:

- **Knowledge base:** Before retrieval, these documents need to be ingested and preprocessed, typically breaking down large documents into smaller chunks, transforming them to text embedding and storing them in a database.

- **User Query:** the user asks a question

- **Retrieval:** When a user asks a question, the embedding model retrieves relevant information from our knowledge base to provide more context that will be incorporated into the prompt.

- **Augmented Generation:** the LLM enhances its response based on the data retrieved. It allows the response generated to be not only based on pre-trained data but also relevant information from the added context. The retrieved data is used to augment the LLM's responses. The LLM then returns an answer to the user's question.

![drawing showing how RAGs architecture](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/15-rag-and-vector-databases/images/encoder-decode.png)

The architecture for RAGs is implemented using transformers consisting of two parts: an encoder and a decoder. For example, when a user asks a question, the input text 'encoded' into vectors capturing the meaning of words and the vectors are 'decoded' into our document index and generates new text based on the user query. The LLM uses both an encoder-decoder model to generate the output.

Two approaches when implementing RAG according to the proposed paper: [Retrieval-Augmented Generation for Knowledge intensive NLP (natural language processing software) Tasks](https://arxiv.org/pdf/2005.11401.pdf?WT.mc_id=academic-105485-koreyst) are:

- **_RAG-Sequence_** using retrieved documents to predict the best possible answer to a user query

- **RAG-Token** using documents to generate the next token, then retrieve them to answer the user's query

#### Why would you use RAGs? 

- **Information richness:** ensures text responses are up to date and current. It, therefore, enhances performance on domain specific tasks by accessing the internal knowledge base.

- Reduces fabrication by utilizing **verifiable data** in the knowledge base to provide context to the user queries.

- It is **cost effective** as they are more economical compared to fine-tuning an LLM

### Creating a knowledge base

Our application is based on our personal data i.e., the Neural Network lesson on AI For Beginners curriculum.

#### Vector Databases

A vector database, unlike traditional databases, is a specialized database designed to store, manage and search embedded vectors. It stores numerical representations of documents. Breaking down data to numerical embeddings makes it easier for our AI system to understand and process the data.

We store our embeddings in vector databases as LLMs have a limit of the number of tokens they accept as input. As you cannot pass the entire embeddings to an LLM, we will need to break them down into chunks and when a user asks a question, the embeddings most like the question will be returned together with the prompt. Chunking also reduces costs on the number of tokens passed through an LLM.

Some popular vector databases include Azure Cosmos DB, Clarifyai, Pinecone, Chromadb, ScaNN, Qdrant and DeepLake. You can create an Azure Cosmos DB model using Azure CLI with the following command:

```bash
az login
az group create -n <resource-group-name> -l <location>
az cosmosdb create -n <cosmos-db-name> -r <resource-group-name>
az cosmosdb list-keys -n <cosmos-db-name> -g <resource-group-name>
```

#### From text to embeddings

Before we store our data, we will need to convert it to vector embeddings before it is stored in the database. If you are working with large documents or long texts, you can chunk them based on queries you expect. Chunking can be done at sentence level, or at a paragraph level. As chunking derives meanings from the words around them, you can add some other context to a chunk, for example, by adding the document title or including some text before or after the chunk. You can chunk the data as follows:

```python
def split_text(text, max_length, min_length):
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        if len(' '.join(current_chunk)) < max_length and len(' '.join(current_chunk)) > min_length:
            chunks.append(' '.join(current_chunk))
            current_chunk = []

    # If the last chunk didn't reach the minimum length, add it anyway
    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks
```

Once chunked, we can then embed our text using different embedding models. Some models you can use include: word2vec, ada-002 by OpenAI, Azure Computer Vision and many more. Selecting a model to use will depend on the languages you're using, the type of content encoded (text/images/audio), the size of input it can encode and length of the embedding output.

An example of embedded text using OpenAI's `text-embedding-ada-002` model is:
![an embedding of the word cat](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/15-rag-and-vector-databases/images/cat.png)

### Retrieval and Vector Search

When a user asks a question, the retriever transforms it into a vector using the query encoder, it then searches through our document search index for relevant vectors in the document that are related to the input. Once done, it converts both the input vector and document vectors into text and passes it through the LLM.

#### Retrieval

Retrieval happens when the system tries to quickly find the documents from the index that satisfy the search criteria. The goal of the retriever is to get documents that will be used to provide context and ground the LLM on your data.

There are several ways to perform search within our database such as:

- **Keyword search** - used for text searches

- **Vector search** - converts documents from text to vector representations using embedding models, permitting a **semantic search** using the meaning of words. Retrieval will be done by querying the documents whose vector representations are closest to the user question.

- **Hybrid** - a combination of both keyword and vector search.

A challenge with retrieval comes in when there is no similar response to the query in the database, the system will then return the best information they can get, however, you can use tactics like set up the maximum distance for relevance or use hybrid search that combines both keywords and vector search. In this lesson we will use hybrid search, a combination of both vector and keyword search. We will store our data into a dataframe with columns containing the chunks as well as embeddings.

#### Vector Similarity

The retriever will search through the knowledge database for embeddings that are close together, the closest neighbour, as they are texts that are similar. In the scenario a user asks a query, it is first embedded then matched with similar embeddings. The common measurement that is used to find how similar different vectors are is cosine similarity which is based on the angle between two vectors.

We can measure similarity using other alternatives we can use are Euclidean distance which is the straight line between vector endpoints and dot product which measures the sum of the products of corresponding elements of two vectors.

#### Search index

When doing retrieval, we will need to build a search index for our knowledge base before we perform search. An index will store our embeddings and can quickly retrieve the most similar chunks even in a large database. We can create our index locally using:

```python
from sklearn.neighbors import NearestNeighbors

embeddings = flattened_df['embeddings'].to_list()

# Create the search index
nbrs = NearestNeighbors(n_neighbors=5, algorithm='ball_tree').fit(embeddings)

# To query the index, you can use the kneighbors method
distances, indices = nbrs.kneighbors(embeddings)
```

#### Re-ranking

Once you have queried the database, you might need to sort the results from the most relevant. A reranking LLM utilizes Machine Learning to improve the relevance of search results by ordering them from the most relevant. Using Azure AI Search, reranking is done automatically for you using a semantic reranker. An example of how reranking works using nearest neighbours:

```python
# Find the most similar documents
distances, indices = nbrs.kneighbors([query_vector])

index = []
# Print the most similar documents
for i in range(3):
    index = indices[0][i]
    for index in indices[0]:
        print(flattened_df['chunks'].iloc[index])
        print(flattened_df['path'].iloc[index])
        print(flattened_df['distances'].iloc[index])
    else:
        print(f"Index {index} not found in DataFrame")
```

### Bringing it all together

The last step is adding our LLM into the mix to be able to get responses that are grounded on our data. We can implement it as follows:

```python
user_input = "what is a perceptron?"

def chatbot(user_input):
    # Convert the question to a query vector
    query_vector = create_embeddings(user_input)

    # Find the most similar documents
    distances, indices = nbrs.kneighbors([query_vector])

    # add documents to query  to provide context
    history = []
    for index in indices[0]:
        history.append(flattened_df['chunks'].iloc[index])

    # combine the history and the user input
    history.append(user_input)

    # create a message object
    messages=[
        {"role": "system", "content": "You are an AI assistant that helps with AI questions."},
        {"role": "user", "content": "\n\n".join(history) }
    ]

    # use the Responses API to generate a response
    response = client.responses.create(
        model="gpt-5-mini",
        max_output_tokens=800,
        input=messages,
        store=False,
    )

    return response.output_text

chatbot(user_input)
```

### Evaluating our application

#### Evaluation Metrics

- Quality of responses supplied ensuring it sounds natural, fluent and human-like

- Groundedness of the data: evaluating whether the response that came from supplied docs

- Relevance: evaluating the response matches and is related to the question asked

- Fluency - whether the response makes sense grammatically

### Use Cases for using RAG (Retrieval Augmented Generation) and vector databases

There are many different use cases where function calls can improve your app like:

- Question and Answering: grounding your company data to a chat that can be used by employees to ask questions.

- Recommendation Systems: where you can create a system that matches the most similar values e.g. movies, restaurants and many more.

- Chatbot services: you can store chat history and personalize the conversation based on the user data.

- Image search based on vector embeddings, useful when doing image recognition and anomaly detection.

### Summary

We have covered the fundamental areas of RAG from adding our data to the application, the user query and output. To simplify creation of RAG, you can use frameworks such as Semanti Kernel, Langchain or Autogen.

### Learning does not stop here, continue the Journey

After completing this lesson, check out our [Generative AI Learning collection](https://aka.ms/genai-collection?WT.mc_id=academic-105485-koreyst) to continue leveling up your Generative AI knowledge!

## Open Source Models

> **Source:** [Open Source Models](https://github.com/microsoft/generative-ai-for-beginners/tree/main/16-open-source-models) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

### Introduction

The world of open-source LLMs is exciting and constantly evolving. This lesson aims to provide an in-depth look at open source models. If you are looking for information on how proprietary models compare to open source models, go to the ["Exploring and Comparing Different LLMs" lesson](https://github.com/microsoft/generative-ai-for-beginners/blob/main/02-exploring-and-comparing-different-llms/README.md). This lesson will also cover the topic of fine-tuning but a more detailed explanation can be found in the ["Fine-Tuning LLMs" lesson](https://github.com/microsoft/generative-ai-for-beginners/blob/main/18-fine-tuning/README.md).

### Learning goals

- Gain an understanding of open source Models
- Understanding the benefits of working with open source Models
- Exploring the open models available on Hugging Face and the Microsoft Foundry model catalog

### What are Open Source Models?

Open source software has played a crucial role in the growth of technology across various fields. The Open Source Initiative (OSI) has defined [10 criteria for software](https://web.archive.org/web/20241126001143/https://opensource.org/osd?WT.mc_id=academic-105485-koreyst) to be classified as open source. The source code must be openly shared under a license approved by the OSI.

While the development of LLMs has similar elements to developing software, the process is not exactly the same. This has brought much discussion in the community on the definition of open source in the context of LLMs. For a model to be aligned with the traditional definition of open source the following information should be publicly available:

- Datasets used to train the model.
- Full model weights as a part of the training.
- The evaluation code.
- The fine-tuning code.
- Full model weights and training metrics.

There are currently only a few models that match this criteria. The [OLMo model created by Allen Institute for Artificial Intelligence (AllenAI)](https://huggingface.co/allenai/OLMo-7B?WT.mc_id=academic-105485-koreyst) is one that fits this category.

For this lesson, we will refer to the models as "open models" going forward as they may not match the criteria above at the time of writing.

### Benefits of Open Models

**Highly Customizable** - Since open models are released with detailed training information, researchers and developers can modify the model's internals. This enables the creation of highly specialized models that are fine-tuned for a specific task or area of study. Some examples of this are code generation, mathematical operations and biology.

**Cost** - The cost per token for using and deploying these models is lower than that of proprietary models. When building Generative AI applications, looking at performance vs price when working with these models on your use case should be done.

![Model Cost](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/16-open-source-models/images/model-price.png)
Source: Artificial Analysis

**Flexibility** - Working with open models enables you to be flexible in terms of using different models or combining them. An example of this is the [HuggingChat Assistants ](https://huggingface.co/chat?WT.mc_id=academic-105485-koreyst) where a user can select the model being used directly in the user interface:

![Choose Model](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/16-open-source-models/images/choose-model.png)

### Exploring Different Open Models

#### Llama 2

[LLama2](https://huggingface.co/meta-llama?WT.mc_id=academic-105485-koreyst), developed by Meta is an open model that is optimized for chat based applications. This is due to its fine-tuning method, which included a large amount of dialogue and human feedback. With this method, the model produces more results that are aligned to human expectation which provides a better user experience.

Some examples of fine-tuned versions of Llama include [Japanese Llama](https://huggingface.co/elyza/ELYZA-japanese-Llama-2-7b?WT.mc_id=academic-105485-koreyst), which specializes in Japanese and [Llama Pro](https://huggingface.co/TencentARC/LLaMA-Pro-8B?WT.mc_id=academic-105485-koreyst), which is an enhanced version of the base model.

#### Mistral

[Mistral](https://huggingface.co/mistralai?WT.mc_id=academic-105485-koreyst) is an open model with a strong focus of high performance and efficiency. It uses the Mixture-of-Experts approach which combines a group of specialized expert models into one system where depending on the input, certain models are selected to be used. This makes the computation more effective as models are only addressing the inputs they are specialized in.

Some examples of fine-tuned versions of Mistral include [BioMistral](https://huggingface.co/BioMistral/BioMistral-7B?text=Mon+nom+est+Thomas+et+mon+principal?WT.mc_id=academic-105485-koreyst), which is focused on the medical domain and [OpenMath Mistral](https://huggingface.co/nvidia/OpenMath-Mistral-7B-v0.1-hf?WT.mc_id=academic-105485-koreyst), which performs mathematical computation.

#### Falcon

[Falcon](https://huggingface.co/tiiuae?WT.mc_id=academic-105485-koreyst) is an LLM created by the Technology Innovation Institute (**TII**). The Falcon-40B was trained on 40 billion parameters which has been shown to perform better than GPT-3 with less compute budget. This is due to its use of the FlashAttention algorithm and multiquery attention that enables it to cut down on the memory requirements at inference time. With this reduced inference time, the Falcon-40B is suitable for chat applications.

Some examples of fine-tuned versions of Falcon are the [OpenAssistant](https://huggingface.co/OpenAssistant/falcon-40b-sft-top1-560?WT.mc_id=academic-105485-koreyst), an assistant built on open models and [GPT4ALL](https://huggingface.co/nomic-ai/gpt4all-falcon?WT.mc_id=academic-105485-koreyst), which delivers higher performance than the base model.

### How to Choose

There is no one answer for choosing an open model. A good place to start is by using the Microsoft Foundry model catalog's filter by task feature. This will help you understand what types of tasks the model has been trained for. Hugging Face also maintains an LLM Leaderboard which shows you the best performing models based on certain metrics.

When looking to compare LLMs across the different types, [Artificial Analysis](https://artificialanalysis.ai/?WT.mc_id=academic-105485-koreyst) is another great resource:

![Model Quality](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/16-open-source-models/images/model-quality.png)
Source: Artificial Analysis

If working on a specific use case, searching for fine-tuned versions that are focused on the same area can be effective. Experimenting with multiple open models to see how they perform according to your and your users' expectations is another good practice

### Next Steps

The best part about open models is that you can get started working with them pretty quickly. Check out the [Microsoft Foundry model catalog](https://ai.azure.com?WT.mc_id=academic-105485-koreyst), which features a specific Hugging Face collection with these models we discussed here.

### Learning does not stop here, continue the Journey

After completing this lesson, check out our [Generative AI Learning collection](https://aka.ms/genai-collection?WT.mc_id=academic-105485-koreyst) to continue leveling up your Generative AI knowledge!

## AI Agents

> **Source:** [AI Agents](https://github.com/microsoft/generative-ai-for-beginners/tree/main/17-ai-agents) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

sequential = SequentialBuilder(participants=[researcher, writer, editor]).build()

### Fan out to agents in parallel, then aggregate their responses
concurrent = ConcurrentBuilder(participants=[analyst_a, analyst_b, analyst_c]).build()
```

To install the framework and get started:

```bash
pip install agent-framework-core
# Optional integrations
pip install agent-framework-openai       # OpenAI and Azure OpenAI
pip install agent-framework-foundry      # Microsoft Foundry
```

You can explore more in the [Microsoft Agent Framework repository](https://github.com/microsoft/agent-framework?WT.mc_id=academic-105485-koreyst) and the [official documentation](https://learn.microsoft.com/agent-framework/?WT.mc_id=academic-105485-koreyst).

#### Taskweaver

The next agent framework we will explore is [Taskweaver](https://microsoft.github.io/TaskWeaver/?WT.mc_id=academic-105485-koreyst). It is known as a "code-first" agent because instead of working strictly with `strings` , it can work with DataFrames in Python. This becomes extremely useful for data analysis and generation tasks. This can be things like creating graphs and charts or generating random numbers.

##### State and Tools

To manage the state of the conversation, TaskWeaver uses the concept of a `Planner`. The `Planner` is a LLM that takes the request from the users and maps out the tasks that need to be completed to fulfill this request.

To complete the tasks the `Planner` is exposed to the collection of tools called `Plugins`. This can be Python classes or a general code interpreter. This plugins are stored as embeddings so that the LLM can better search for the correct plugin.

![Taskweaver](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/17-ai-agents/images/taskweaver.png)

Here is an example of a plugin to handle anomaly detection:

```python
class AnomalyDetectionPlugin(Plugin): def __call__(self, df: pd.DataFrame, time_col_name: str, value_col_name: str):
```

The code is verified before executing. Another feature to manage context in Taskweaver is `experience`. Experience allows for the context of a conversation to be stored over to the long term in a YAML file. This can be configured so that the LLM improves over time on certain tasks given that it is exposed to prior conversations.

#### JARVIS

The last agent framework we will explore is [JARVIS](https://github.com/microsoft/JARVIS?tab=readme-ov-file&WT.mc_id=academic-105485-koreyst). What makes JARVIS unique is that it uses an LLM to manage the `state` of the conversation and the `tools`are other AI models. Each of the AI models are specialized models that perform certain tasks such as object detection, transcription or image captioning.

![JARVIS](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/17-ai-agents/images/jarvis.png)

The LLM, being a general purpose model, receives the request from the user and identifies the specific task and any arguments/data that is needed to complete the task.

```python
[{"task": "object-detection", "id": 0, "dep": [-1], "args": {"image": "e1.jpg" }}]
```

The LLM then formats the request in a manner that the specialized AI model can interpret, such as JSON. Once the AI model has returned its prediction based on the task, the LLM receives the response.

If multiple models are required to complete the task, it will also interpret the response from those models before bringing them together to generate to the response to the user.

The example below shows how this would work when a user is requesting a description and count of the objects in a picture:

#### Learning does not stop here, continue the Journey

After completing this lesson, check out our [Generative AI Learning collection](https://aka.ms/genai-collection?WT.mc_id=academic-105485-koreyst) to continue leveling up your Generative AI knowledge!

## Fine-Tuning Your LLM

> **Source:** [Fine-Tuning Your LLM](https://github.com/microsoft/generative-ai-for-beginners/tree/main/18-fine-tuning) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

Using large language models to build generative AI applications comes with new challenges. A key issue is ensuring response quality (accuracy and relevance) in content generated by the model for a given user request. In previous lessons, we discussed techniques like prompt engineering and retrieval-augmented generation that try to solve the problem by _modifying the prompt input_ to the existing model.

In today's lesson, we discuss a third technique, **fine-tuning**, which tries to address the challenge by _retraining the model itself_ with additional data. Let's dive into the details.

### Learning Objectives

This lesson introduces the concept of fine-tuning for pre-trained language models, explores the benefits and challenges of this approach, and provides guidance on when and how to use fine tuning to improve the performance of your generative AI models.

By the end of this lesson, you should be able to answer the following questions:

- What is fine tuning for language models?
- When, and why, is fine tuning useful?
- How can I fine-tune a pre-trained model?
- What are the limitations of fine-tuning?

Ready? Let's get started.

### Illustrated Guide

Want to get the big picture of what we'll cover before we dive in? Check out this illustrated guide that describes the learning journey for this lesson - from learning the core concepts and motivation for fine-tuning, to understanding the process and best practices for executing the fine-tuning task. This is a fascinating topic for exploration, so don't forget to check out the [Resources](https://github.com/microsoft/generative-ai-for-beginners/blob/main/18-fine-tuning/RESOURCES.md) page for additional links to support your self-guided learning journey!

![Illustrated Guide to Fine Tuning Language Models](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/18-fine-tuning/img/18-fine-tuning-sketchnote.png)

### What is fine-tuning for language models?

By definition, large language models are _pre-trained_ on large quantities of text sourced from diverse sources including the internet. As we've learned in previous lessons, we need techniques like _prompt engineering_ and _retrieval-augmented generation_ to improve the quality of the model's responses to the user's questions ("prompts").

A popular prompt-engineering technique involves giving the model more guidance on what is expected in the response either by providing _instructions_ (explicit guidance) or _giving it a few examples_ (implicit guidance). This is referred to as _few-shot learning_ but it has two limitations:

- Model token limits can restrict the number of examples you can give, and limit the effectiveness.
- Model token costs can make it expensive to add examples to every prompt, and limit flexibility.

Fine-tuning is a common practice in machine learning systems where we take a pre-trained model and retrain it with new data to improve its performance on a specific task. In the context of language models, we can fine-tune the pre-trained model _with a curated set of examples for a given task or application domain_ to create a **custom model** that may be more accurate and relevant for that specific task or domain. A side-benefit of fine-tuning is that it can also reduce the number of examples needed for few-shot learning - reducing token usage and related costs.

### When and why should we fine-tune models?

In _this_ context, when we talk about fine-tuning, we are referring to **supervised** fine-tuning where the retraining is done by **adding new data** that was not part of the original training dataset. This is different from an unsupervised fine-tuning approach where the model is retrained on the original data, but with different hyperparameters.

The key thing to remember is that fine-tuning is an advanced technique that requires a certain level of expertise to get the desired results. If done incorrectly, it may not provide the expected improvements, and may even degrade the performance of the model for your targeted domain.

So, before you learn "how" to fine-tune language models, you need to know "why" you should take this route, and "when" to start the process of fine-tuning. Start by asking yourself these questions:

- **Use Case**: What is your _use case_ for fine-tuning? What aspect of the current pre-trained model do you want to improve upon?
- **Alternatives**: Have you tried _other techniques_ to achieve the desired outcomes? Use them to create a baseline for comparison.
  - Prompt engineering: Try techniques like few-shot prompting with examples of relevant prompt responses. Evaluate the quality of responses.
  - Retrieval Augmented Generation: Try augmenting prompts with query results retrieved by searching your data. Evaluate the quality of responses.
- **Costs**: Have you identified the costs for fine-tuning?
  - Tunability - is the pre-trained model available for fine-tuning?
  - Effort - for preparing training data, evaluating & refining model.
  - Compute - for running fine-tuning jobs, and deploying fine-tuned model
  - Data - access to sufficient quality examples for fine-tuning impact
- **Benefits**: Have you confirmed the benefits for fine-tuning?
  - Quality - did fine-tuned model outperform the baseline?
  - Cost - does it reduce token usage by simplifying prompts?
  - Extensibility - can you repurpose the base model for new domains?

By answering these questions, you should be able to decide if fine-tuning is the right approach for your use case. Ideally, the approach is valid only if the benefits outweigh the costs. Once you decide to proceed, it's time to think about _how_ you can fine tune the pre-trained model.

Want to get more insights on the decision-making process? Watch [To fine-tune or not to fine-tune](https://www.youtube.com/watch?v=0Jo-z-MFxJs)

### How can we fine-tune a pre-trained model?

To fine-tune a pre-trained model, you need to have:

- a pre-trained model to fine-tune
- a dataset to use for fine-tuning
- a training environment to run the fine-tuning job
- a hosting environment to deploy fine-tuned model

### Fine-Tuning on Microsoft Foundry

[Microsoft Foundry](https://ai.azure.com?WT.mc_id=academic-105485-koreyst) is where you fine-tune, deploy, and manage custom models on Azure today (it brings together what used to be Azure OpenAI Studio and Azure AI Studio). Before you start a job, it helps to understand the choices Foundry gives you - and the best practices the platform recommends. Under the hood, Foundry uses **LoRA (low-rank adaptation)** to fine-tune models efficiently, which keeps training faster and more affordable than retraining every weight.

#### Step 1: Pick a training technique

Foundry supports three fine-tuning techniques. **Start with SFT** - it covers the widest range of scenarios.

| Technique | What it does | When to use it |
| --- | --- | --- |
| **Supervised Fine-Tuning (SFT)** | Trains on input/output example pairs so the model learns to produce the responses you want. | The default for most tasks: domain specialization, task performance, style and tone, instruction-following, and language adaptation. |
| **Direct Preference Optimization (DPO)** | Learns from _preferred vs. non-preferred_ response pairs to align outputs with human preferences. | Improving response quality, safety, and alignment when you have comparative feedback. |
| **Reinforcement Fine-Tuning (RFT)** | Uses reward signals from _graders_ to optimize complex behaviors with reinforcement learning. | Objective, reasoning-heavy domains (math, chemistry, physics) with clear right/wrong answers. Requires more ML expertise. |

#### Step 2: Pick a training tier

Foundry lets you choose how and where training runs:

- **Standard** - trains in your resource's region and guarantees data residency. Use it when data must stay in a specific region.
- **Global** - cheaper and faster to queue by using capacity beyond your region (data and weights are copied to the training region). A good default when data residency isn't a requirement.
- **Developer** - the lowest cost, using idle capacity with no latency/SLA guarantees (jobs can be preempted and resumed). Ideal for experimentation.

#### Step 3: Choose a base model

Fine-tunable models include OpenAI `gpt-4o-mini`, `gpt-4o`, `gpt-4.1`, `gpt-4.1-mini`, and `gpt-4.1-nano` (SFT; the 4o/4.1 family also supports DPO), the reasoning models `o4-mini` and `gpt-5` (RFT), plus open-source models such as `Ministral-3B`, `Qwen-32B`, `Llama-3.3-70B-Instruct`, and `gpt-oss-20b` (SFT on Foundry resources). Always check the current [Fine-tuning models list](https://learn.microsoft.com/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?WT.mc_id=academic-105485-koreyst#fine-tuning-models) for supported methods, regions, and availability.

> Foundry offers two modalities: **serverless** (consumption-based pricing, no GPU quota to manage, OpenAI and selected models) and **managed compute** (bring-your-own VMs via Azure Machine Learning for the widest model range). Most people should start with serverless.

#### Foundry best practices

- **Baseline first.** Measure the base model with prompt engineering and RAG _before_ you fine-tune, so you can prove the gain.
- **Start small, then scale.** Begin with 50-100 high-quality examples to validate the approach, then grow to 500+ for production. Quality beats quantity - prune low-quality examples.
- **Format data correctly.** Training and validation files must be JSONL, UTF-8 **with a BOM**, under 512 MB, using the chat-completions message format. Always include a validation file so you can watch for overfitting.
- **Keep the training system prompt at inference.** Use the same system message when you call the model that you used during training.
- **Evaluate checkpoints - don't blindly deploy the last one.** Foundry keeps the last three epochs as deployable checkpoints; pick the one that generalizes best by watching `train_loss` / `valid_loss` and token accuracy.
- **Measure token cost alongside quality** when comparing the fine-tuned model to the baseline.
- **Iterate with continuous fine-tuning.** You can fine-tune an already fine-tuned model on new data (supported for OpenAI models).
- **Mind hosting costs.** A deployed custom model bills hourly, and an inactive deployment is removed after 15 days - clean up what you don't need.

Work through the end-to-end walkthrough in [Customize a model with fine-tuning](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/fine-tuning?WT.mc_id=academic-105485-koreyst), and see the guides for [DPO](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/fine-tuning-direct-preference-optimization?WT.mc_id=academic-105485-koreyst) and [RFT](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/reinforcement-fine-tuning?WT.mc_id=academic-105485-koreyst) when you're ready for the other techniques.

### Fine-Tuning In Action

The following resources provide step-by-step tutorials that walk you through a real example on a currently supported model with a curated dataset. To work through them, you need an account on the specific provider, along with access to the relevant model and datasets.

| Provider     | Tutorial                                                                                                                                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAI       | [How to fine-tune chat models](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_finetune_chat_models.ipynb?WT.mc_id=academic-105485-koreyst)                | Learn to fine-tune a recent OpenAI chat model for a specific domain ("recipe assistant") by preparing training data, running the fine-tuning job, and using the fine-tuned model for inference.                                                                                                                                                                                                                                              |
| Microsoft Foundry | [Customize a model with fine-tuning](https://learn.microsoft.com/azure/ai-foundry/openai/tutorials/fine-tune?WT.mc_id=academic-105485-koreyst) | Learn to fine-tune a currently supported model such as `gpt-4.1-mini` **on Azure** with Microsoft Foundry: prepare & upload training and validation data, run the fine-tuning job, then deploy & use the new model.                                                                                                                                                                                                                                                                 |
| Hugging Face | [Fine-tuning LLMs with Hugging Face](https://www.philschmid.de/fine-tune-llms-in-2024-with-trl?WT.mc_id=academic-105485-koreyst)                                               | This blog post walks you fine-tuning an _open LLM_ (ex: `CodeLlama 7B`) using the [transformers](https://huggingface.co/docs/transformers/index?WT.mc_id=academic-105485-koreyst) library & [Transformer Reinforcement Learning (TRL)](https://huggingface.co/docs/trl/index?WT.mc_id=academic-105485-koreyst) with open [datasets](https://huggingface.co/docs/datasets/index?WT.mc_id=academic-105485-koreyst) on Hugging Face. |
|              |                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 🤗 AutoTrain | [Fine-tuning LLMs with AutoTrain](https://github.com/huggingface/autotrain-advanced/?WT.mc_id=academic-105485-koreyst)                                                         | AutoTrain (or AutoTrain Advanced) is a python library developed by Hugging Face that allows finetuning for many different tasks including LLM finetuning. AutoTrain is a no-code solution and finetuning can be done in your own cloud, on Hugging Face Spaces or locally. It supports both a web-based GUI, CLI and training via yaml config files.                                                                               |
|              |                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 🦥 Unsloth | [Fine-tuning LLMs with Unsloth](https://github.com/unslothai/unsloth?WT.mc_id=academic-105485-koreyst)                                                         | Unsloth is an open-source framework that supports LLM fine-tuning and reinforcement learning (RL). Unsloth streamlines local training, evaluation, and deployment with ready to use [notebooks](https://github.com/unslothai/notebooks?WT.mc_id=academic-105485-koreyst). It also supports text-to-speech (TTS), BERT and multimodal models. To get started, read their step-by-step [Fine-tuning LLMs Guide](https://docs.unsloth.ai/get-started/fine-tuning-llms-guide).                                                                          |
|              |                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Small Language Models

> **Source:** [Small Language Models](https://github.com/microsoft/generative-ai-for-beginners/tree/main/19-slm) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

Generative AI is a fascinating field of artificial intelligence that focuses on creating systems capable of generating new content. This content can range from text and images to music and even entire virtual environments. One of the most exciting applications of generative AI is in the realm of language models.

### What Are Small Language Models?

A Small Language Model (SLM) represents a scaled-down variant of a large language model (LLM), leveraging many of the architectural principles and techniques of LLMs, while exhibiting a significantly reduced computational footprint.

SLMs are a subset of language models designed to generate human-like text. Unlike their larger counterparts, such as GPT-4, SLMs are more compact and efficient, making them ideal for applications where computational resources are limited. Despite their smaller size, they can still perform a variety of tasks. Typically, SLMs are constructed by compressing or distilling LLMs, aiming to retain a substantial portion of the original model's functionality and linguistic capabilities. This reduction in model size decreases the overall complexity, making SLMs more efficient in terms of both memory usage and computational requirements. Despite these optimizations, SLMs can still perform a wide range of natural language processing (NLP) tasks:

- Text Generation: Creating coherent and contextually relevant sentences or paragraphs.
- Text Completion: Predicting and completing sentences based on a given prompt.
- Translation: Converting text from one language to another.
- Summarization: Condensing long pieces of text into shorter, more digestible summaries.

Albeit with some trade-offs in performance or depth of understanding compared to their larger counterparts.

### How Do Small Language Models Work?
SLMs are trained on vast amounts of text data. During training, they learn the patterns and structures of language, enabling them to generate text that is both grammatically correct and contextually appropriate. The training process involves:

- Data Collection: Gathering large datasets of text from various sources.
- Preprocessing: Cleaning and organizing the data to make it suitable for training.
- Training: Using machine learning algorithms to teach the model how to understand and generate text.
- Fine-Tuning: Adjusting the model to improve its performance on specific tasks.

The development of SLMs aligns with the increasing need for models that can be deployed in resource-constrained environments, such as mobile devices or edge computing platforms, where full-scale LLMs may be impractical due to their heavy resource demands. By focusing on efficiency, SLMs balance performance with accessibility, enabling broader application across various domains.

![slm](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/19-slm/img/slm.png)

### Learning Objectives

In this lesson, we hope to introduce the knowledge of SLM and combine it with Microsoft Phi-3 to learn different scenarios in text content, vision and MoE.

By the end of this lesson, you should be able to answer the following questions:

- What is SLM?
- What is the difference between SLM and LLM?
- What is the Microsoft Phi-3/3.5 Family?
- How to run inference with the Microsoft Phi-3/3.5 Family?

Ready? Let's get started.

### The Distinctions between Large Language Models (LLMs) and Small Language Models (SLMs)

Both LLMs and SLMs are built upon foundational principles of probabilistic machine learning, following similar approaches in their architectural design, training methodologies, data generation processes, and model evaluation techniques. However, several key factors differentiate these two types of models.

### Applications of Small Language Models

SLMs have a wide range of applications, including:

- Chatbots: Providing customer support and engaging with users in a conversational manner.
- Content Creation: Assisting writers by generating ideas or even drafting entire articles.
- Education: Helping students with writing assignments or learning new languages.
- Accessibility: Creating tools for individuals with disabilities, such as text-to-speech systems.

**Size**

A primary distinction between LLMs and SLMs lies in the scale of the models. LLMs, such as ChatGPT (GPT-4), can comprise an estimated 1.76 trillion parameters, while open-source SLMs like Mistral 7B are designed with significantly fewer parameters—approximately 7 billion. This disparity is primarily due to differences in model architecture and training processes. For instance, ChatGPT employs a self-attention mechanism within an encoder-decoder framework, whereas Mistral 7B uses sliding window attention, which enables more efficient training within a decoder-only model. This architectural variance has profound implications for the complexity and performance of these models.

**Comprehension**

SLMs are typically optimized for performance within specific domains, making them highly specialized but potentially limited in their ability to provide broad contextual understanding across multiple fields of knowledge. In contrast, LLMs aim to simulate human-like intelligence on a more comprehensive level. Trained on vast, diverse datasets, LLMs are designed to perform well across a variety of domains, offering greater versatility and adaptability. Consequently, LLMs are more suitable for a wider range of downstream tasks, such as natural language processing and programming.

**Computing**

The training and deployment of LLMs are resource-intensive processes, often requiring significant computational infrastructure, including large-scale GPU clusters. For example, training a model like ChatGPT from scratch may necessitate thousands of GPUs over extended periods. In contrast, SLMs, with their smaller parameter counts, are more accessible in terms of computational resources. Models like Mistral 7B can be trained and run on local machines equipped with moderate GPU capabilities, although training still demands several hours across multiple GPUs.

**Bias**

Bias is a known issue in LLMs, primarily due to the nature of the training data. These models often rely on raw, openly available data from the internet, which may underrepresent or misrepresent certain groups, introduce erroneous labeling, or reflect linguistic biases influenced by dialect, geographic variations, and grammatical rules. Additionally, the complexity of LLM architectures can inadvertently exacerbate bias, which may go unnoticed without careful fine-tuning. On the other hand, SLMs, being trained on more constrained, domain-specific datasets, are inherently less susceptible to such biases, though they are not immune to them.

**Inference**

The reduced size of SLMs affords them a significant advantage in terms of inference speed, allowing them to generate outputs efficiently on local hardware without the need for extensive parallel processing. In contrast, LLMs, due to their size and complexity, often require substantial parallel computational resources to achieve acceptable inference times. The presence of multiple concurrent users further slows down LLMs' response times, especially when deployed at scale.

In summary, while both LLMs and SLMs share a foundational basis in machine learning, they differ significantly in terms of model size, resource requirements, contextual understanding, susceptibility to bias, and inference speed. These distinctions reflect their respective suitability for different use cases, with LLMs being more versatile but resource-heavy, and SLMs offering more domain-specific efficiency with reduced computational demands.

***Note: In this lesson, we will introduce SLM using Microsoft Phi-3 / 3.5 as an example.***

### Introduce Phi-3 / Phi-3.5 Family

Phi-3 / 3.5 Family mainly targets text, vision, and Agent (MoE) application scenarios:

#### Phi-3 / 3.5 Instruct

Mainly for text generation, chat completion, and content information extraction, etc.

**Phi-3-mini**

The 3.8B language model is available on Microsoft Foundry, Hugging Face, and Ollama. Phi-3 models significantly outperform language models of equal and larger sizes on key benchmarks (see benchmark numbers below, higher numbers are better). Phi-3-mini outperforms models twice its size, while Phi-3-small and Phi-3-medium outperform larger models, including GPT-3.5.

**Phi-3-small & medium**

With just 7B parameters, Phi-3-small beats GPT-3.5T on a variety of language, reasoning, coding, and math benchmarks.

The Phi-3-medium with 14B parameters continues this trend and outperforms the Gemini 1.0 Pro.

**Phi-3.5-mini**

We can think of it as an upgrade of Phi-3-mini. While the parameters remain unchanged, it improves the ability to support multiple languages (support 20+ languages: Arabic, Chinese, Czech, Danish, Dutch, English, Finnish, French, German, Hebrew, Hungarian, Italian, Japanese, Korean, Norwegian, Polish, Portuguese, Russian, Spanish, Swedish, Thai, Turkish, Ukrainian) ​​and adds stronger support for long context.

Phi-3.5-mini with 3.8B parameters outperforms language models of the same size and is on par with models twice its size.

#### Phi-3 / 3.5 Vision

We can think of the Instruct model of Phi-3/3.5 as Phi's ability to understand, and Vision is what gives Phi eyes to understand the world.

**Phi-3-Vision**

Phi-3-vision, with only 4.2B parameters, continues this trend and outperforms larger models such as Claude-3 Haiku and Gemini 1.0 Pro V on general visual reasoning tasks, OCR, and table and diagram comprehension tasks.

**Phi-3.5-Vision**

Phi-3.5-Vision is also an upgrade of Phi-3-Vision, adding support for multiple images. You can think of it as an improvement in vision, not only can you see pictures, but also videos.

Phi-3.5-vision outperforms larger models such as Claude-3.5 Sonnet and Gemini 1.5 Flash across OCR, table and chart understanding tasks and on par on general visual knowledge reasoning tasks. Support multi-frame input, i.e., perform reasoning on multiple input images

#### Phi-3.5-MoE

***Mixture of Experts(MoE)*** enables models to be pretrained with far less compute, which means you can dramatically scale up the model or dataset size with the same compute budget as a dense model. In particular, a MoE model should achieve the same quality as its dense counterpart much faster during pretraining.

Phi-3.5-MoE comprises 16x3.8B expert modules. Phi-3.5-MoE with only 6.6B active parameters achieves a similar level of reasoning, language understanding, and math as much larger models

We can use the Phi-3/3.5 Family model based on different scenarios. Unlike LLM, you can deploy Phi-3/3.5-mini or Phi-3/3.5-Vision on edge devices.

### How to use Phi-3/3.5 Family models

We hope to use Phi-3/3.5 in different scenarios. Next, we will use Phi-3/3.5 based on different scenarios.

![phi3](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/19-slm/img/phi3.png)

#### Inference via Cloud APIs

**Microsoft Foundry Models**

> **Note:** GitHub Models is retiring at the end of July 2026. [Microsoft Foundry Models](https://ai.azure.com/catalog/models?WT.mc_id=academic-105485-koreyst) is the direct replacement.

Microsoft Foundry Models is the most direct way. You can quickly access the Phi-3/3.5-Instruct model through the Foundry model catalog. Combined with the Azure AI Inference SDK / OpenAI SDK, you can access the API through code to complete the Phi-3/3.5-Instruct call. You can also test different effects through the Playground.

- Demo: Comparison of the effects of Phi-3-mini and Phi-3.5-mini in Chinese scenarios

![phi3](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/19-slm/img/gh1.png)

![phi35](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/19-slm/img/gh2.png)

**Microsoft Foundry**

Or if we want to use the vision and MoE models, you can use Microsoft Foundry to complete the call. If you are interested, you can read the Phi-3 Cookbook to learn how to call Phi-3/3.5 Instruct, Vision, MoE through Microsoft Foundry [Click this link](https://github.com/microsoft/PhiCookBook/blob/main/md/02.QuickStart/AzureAIFoundry_QuickStart.md?WT.mc_id=academic-105485-koreyst)

**NVIDIA NIM**

In addition to the cloud-based Microsoft Foundry Models catalog, you can also use [NVIDIA NIM](https://developer.nvidia.com/nim?WT.mc_id=academic-105485-koreyst) to complete related calls. You can visit NVIDIA NIM to complete the API calls of the Phi-3/3.5 Family. NVIDIA NIM (NVIDIA Inference Microservices) is a set of accelerated inference microservices designed to help developers deploy AI models efficiently across various environments, including clouds, data centers, and workstations.

Here are some key features of NVIDIA NIM:

- **Ease of Deployment:** NIM allows for the deployment of AI models with a single command, making it straightforward to integrate into existing workflows.
- **Optimized Performance:** It leverages NVIDIA’s pre-optimized inference engines, such as TensorRT and TensorRT-LLM, to ensure low latency and high throughput.
- **Scalability:** NIM supports autoscaling on Kubernetes, enabling it to handle varying workloads effectively.
- **Security and Control:** Organizations can maintain control over their data and applications by self-hosting NIM microservices on their own managed infrastructure.
- **Standard APIs:** NIM provides industry-standard APIs, making it easy to build and integrate AI applications like chatbots, AI assistants, and more.

NIM is part of NVIDIA AI Enterprise, which aims to simplify the deployment and operationalization of AI models, ensuring they run efficiently on NVIDIA GPUs.

- Demo: Using NVIDIA NIM to call Phi-3.5-Vision-API  [[Click this link](https://github.com/microsoft/generative-ai-for-beginners/blob/main/19-slm/python/Phi-3-Vision-Nividia-NIM.ipynb)]

#### Running Phi-3/3.5 Locally
Inference in relation to Phi-3, or any language model like GPT-3, refers to the process of generating responses or predictions based on the input it receives. When you provide a prompt or question to Phi-3, it uses its trained neural network to infer the most likely and relevant response by analyzing patterns and relationships in the data it was trained on.

**Hugging Face Transformer**
Hugging Face Transformers is a powerful library designed for natural language processing (NLP) and other machine learning tasks. Here are some key points about it:

1. **Pretrained Models**: It provides thousands of pretrained models that can be used for various tasks such as text classification, named entity recognition, question answering, summarization, translation, and text generation.

2. **Framework Interoperability**: The library supports multiple deep learning frameworks, including PyTorch, TensorFlow, and JAX. This allows you to train a model in one framework and use it in another.

3. **Multimodal Capabilities**: Besides NLP, Hugging Face Transformers also supports tasks in computer vision (e.g., image classification, object detection) and audio processing (e.g., speech recognition, audio classification).

4. **Ease of Use**: The library offers APIs and tools to easily download and fine-tune models, making it accessible for both beginners and experts.

5. **Community and Resources**: Hugging Face has a vibrant community and extensive documentation, tutorials, and guides to help users get started and make the most of the library.
[official documentation](https://huggingface.co/docs/transformers/index?WT.mc_id=academic-105485-koreyst) or their [GitHub repository](https://github.com/huggingface/transformers?WT.mc_id=academic-105485-koreyst).

This is the most commonly used method, but it also requires GPU acceleration. After all, scenarios such as Vision and MoE require a lot of calculations, which will be very slow on CPU if they are not quantized.

- Demo: Using Transformer to call Phi-3.5-Instruct [Click this link](https://github.com/microsoft/generative-ai-for-beginners/blob/main/19-slm/python/phi35-instruct-demo.ipynb)

- Demo: Using Transformer to call Phi-3.5-Vision [Click this link](https://github.com/microsoft/generative-ai-for-beginners/blob/main/19-slm/python/phi35-vision-demo.ipynb)

- Demo: Using Transformer to call Phi-3.5-MoE [Click this link](https://github.com/microsoft/generative-ai-for-beginners/blob/main/19-slm/python/phi35_moe_demo.ipynb)

**Ollama**
[Ollama](https://ollama.com/?WT.mc_id=academic-105485-koreyst) is a platform designed to make it easier to run large language models (LLMs) locally on your machine. It supports various models like Llama 3.1, Phi 3, Mistral, and Gemma 2, among others. The platform simplifies the process by bundling model weights, configuration, and data into a single package, making it more accessible for users to customize and create their own models. Ollama is available for macOS, Linux, and Windows. It’s a great tool if you’re looking to experiment with or deploy LLMs without relying on cloud services. Ollama is the most direct way, you just need to execute the following command.

```bash

ollama run phi3.5

```

**Foundry Local**

[Foundry Local](https://foundrylocal.ai?WT.mc_id=academic-105485-koreyst) is Microsoft's offline, on-device runtime for running models like Phi entirely on your own hardware - no Azure subscription, API key, or network connection required. It automatically picks the best execution provider available (NPU, GPU, or CPU) and exposes an OpenAI-compatible endpoint, so existing `openai`/Azure AI Inference SDK code can point at it with minimal changes. See the [Foundry Local documentation](https://learn.microsoft.com/azure/ai-foundry/foundry-local/get-started?WT.mc_id=academic-105485-koreyst) to get started.

```bash

winget install Microsoft.FoundryLocal
foundry model run phi-3.5-mini

```

Or use the SDK directly in Python:

```bash

pip install foundry-local-sdk

```

```python

from foundry_local import FoundryLocalManager

manager = FoundryLocalManager("phi-3.5-mini")
print(manager.endpoint, manager.api_key)

```

**ONNX Runtime for GenAI**

[ONNX Runtime](https://github.com/microsoft/onnxruntime-genai?WT.mc_id=academic-105485-koreyst) is a cross-platform inference and training machine-learning accelerator. ONNX Runtime for Generative AI (GENAI) is a powerful tool that helps you run generative AI models efficiently across various platforms.

### What is ONNX Runtime?
ONNX Runtime is an open-source project that enables high-performance inference of machine learning models. It supports models in the Open Neural Network Exchange (ONNX) format, which is a standard for representing machine learning models.ONNX Runtime inference can enable faster customer experiences and lower costs, supporting models from deep learning frameworks such as PyTorch and TensorFlow/Keras as well as classical machine learning libraries such as scikit-learn, LightGBM, XGBoost, etc. ONNX Runtime is compatible with different hardware, drivers, and operating systems, and provides optimal performance by leveraging hardware accelerators where applicable alongside graph optimizations and transforms.

### What is Generative AI?
Generative AI refers to AI systems that can generate new content, such as text, images, or music, based on the data they have been trained on. Examples include language models like GPT-3 and image generation models like Stable Diffusion. ONNX Runtime for GenAI library provides the generative AI loop for ONNX models, including inference with ONNX Runtime, logits processing, search and sampling, and KV cache management.

### ONNX Runtime for GENAI
ONNX Runtime for GENAI extends the capabilities of ONNX Runtime to support generative AI models. Here are some key features:

- **Broad Platform Support:** It works on various platforms, including Windows, Linux, macOS, Android, and iOS.
- **Model Support:** It supports many popular generative AI models, such as LLaMA, GPT-Neo, BLOOM, and more.
- **Performance Optimization:** It includes optimizations for different hardware accelerators like NVIDIA GPUs, AMD GPUs, and more2.
- **Ease of Use:** It provides APIs for easy integration into applications, allowing you to generate text, images, and other content with minimal code
- Users can call a high level generate() method, or run each iteration of the model in a loop, generating one token at a time, and optionally updating generation parameters inside the loop.
- ONNX runtime also has support for greedy/beam search and TopP, TopK sampling to generate token sequences and built-in logits processing like repetition penalties. You can also easily add custom scoring.

### Getting Started
To get started with ONNX Runtime for GENAI, you can follow these steps:

#### Install ONNX Runtime:
```Python
pip install onnxruntime
```
#### Install the Generative AI Extensions:
```Python
pip install onnxruntime-genai
```

#### Run a Model: Here’s a simple example in Python:
```Python
import onnxruntime_genai as og

model = og.Model('path_to_your_model.onnx')

tokenizer = og.Tokenizer(model)

input_text = "Hello, how are you?"

input_tokens = tokenizer.encode(input_text)

output_tokens = model.generate(input_tokens)

output_text = tokenizer.decode(output_tokens)

print(output_text)
```
#### Demo:Using ONNX Runtime GenAI to call Phi-3.5-Vision

```python

import onnxruntime_genai as og

model_path = './Your Phi-3.5-vision-instruct ONNX Path'

img_path = './Your Image Path'

model = og.Model(model_path)

processor = model.create_multimodal_processor()

tokenizer_stream = processor.create_stream()

text = "Your Prompt"

prompt = "<|user|>\n"

prompt += "<|image_1|>\n"

prompt += f"{text}<|end|>\n"

prompt += "<|assistant|>\n"

image = og.Images.open(img_path)

inputs = processor(prompt, images=image)

params = og.GeneratorParams(model)

params.set_inputs(inputs)

params.set_search_options(max_length=3072)

generator = og.Generator(model, params)

while not generator.is_done():

    generator.compute_logits()

    generator.generate_next_token()

    new_token = generator.get_next_tokens()[0]

    output = tokenizer_stream.decode(new_token)

    print(tokenizer_stream.decode(new_token), end='', flush=True)

```

**Others**

In addition to ONNX Runtime, Ollama, and Foundry Local reference methods, we can also complete the reference of quantitative models based on the model reference methods provided by different manufacturers. Such as Apple MLX framework with Apple Metal, Qualcomm QNN with NPU, Intel OpenVINO with CPU/GPU, etc. You can also get more content from [Phi-3 Cookbook](https://github.com/microsoft/phi-3cookbook?WT.mc_id=academic-105485-koreyst)

### More

We have learned the basics of Phi-3/3.5 Family, but to learn more about SLM we need more knowledge. You can find the answers in the Phi-3 Cookbook. If you want to learn more, please visit the [Phi-3 Cookbook](https://github.com/microsoft/phi-3cookbook?WT.mc_id=academic-105485-koreyst).

## Building with Mistral Models

> **Source:** [Building with Mistral Models](https://github.com/microsoft/generative-ai-for-beginners/tree/main/20-mistral) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

### Introduction

This lesson will cover:
- Exploring the different Mistral Models
- Understanding the use-cases and scenarios for each model
- Exploring code samples that show the unique features of each model.

### The Mistral Models

In this lesson, we will explore 3 different Mistral models:
**Mistral Large**, **Mistral Small** and **Mistral Nemo**.

Each of these models is available free on [Microsoft Foundry Models](https://ai.azure.com/catalog/models?WT.mc_id=academic-105485-koreyst). The code in this notebook will be using these models to run the code.

> **Note:** GitHub Models is retiring at the end of July 2026. Here are more details on using [Microsoft Foundry Models](https://learn.microsoft.com/azure/ai-foundry/model-inference/overview?WT.mc_id=academic-105485-koreyst) to prototype with AI models.

### Mistral Large 2 (2407)
Mistral Large 2 is currently the flagship model from Mistral and is designed for enterprise use.

The model is an upgrade to the original Mistral Large by offering
-  Larger Context Window - 128k vs 32k
-  Better performance on Math and Coding Tasks - 76.9% average accuracy vs 60.4%
-  Increased multilingual performance - languages include: English, French, German, Spanish, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, Arabic, and Hindi.

With these features, Mistral Large excels at
- *Retrieval Augmented Generation (RAG)* - due to the larger context window
- *Function Calling* - this model has native function calling which allows integration with external tools and APIs. These calls can be made both in parallel or one after another in a sequential order.
- *Code Generation* - this model excels on Python, Java, TypeScript and C++ generation.

#### RAG Example using Mistral Large 2

In this example, we are using Mistral Large 2 to run a RAG pattern over a text document. The question is written in Korean and asks about the author's activities before college.

It uses Cohere Embeddings Model to create embeddings of the text document as well as the question. For this sample, it uses the faiss Python package as a vector store.

The prompt sent to the Mistral model includes both the questions and the retrieved chunks that are similar to the question. The Model then provides a natural language response.

```python
pip install faiss-cpu
```

```python
import requests
import numpy as np
import faiss
import os

from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference import EmbeddingsClient

# Get these from your Microsoft Foundry project's "Overview" page
endpoint = os.environ["AZURE_INFERENCE_ENDPOINT"]
model_name = "Mistral-large"
token = os.environ["AZURE_INFERENCE_CREDENTIAL"]

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = requests.get('https://raw.githubusercontent.com/run-llama/llama_index/main/docs/docs/examples/data/paul_graham/paul_graham_essay.txt')
text = response.text

chunk_size = 2048
chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
len(chunks)

embed_model_name = "cohere-embed-v3-multilingual"

embed_client = EmbeddingsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token)
)

embed_response = embed_client.embed(
    input=chunks,
    model=embed_model_name
)

text_embeddings = []
for item in embed_response.data:
    length = len(item.embedding)
    text_embeddings.append(item.embedding)
text_embeddings = np.array(text_embeddings)

d = text_embeddings.shape[1]
index = faiss.IndexFlatL2(d)
index.add(text_embeddings)

question = "저자가 대학에 오기 전에 주로 했던 두 가지 일은 무엇이었나요?"

question_embedding = embed_client.embed(
    input=[question],
    model=embed_model_name
)

question_embeddings = np.array(question_embedding.data[0].embedding)

D, I = index.search(question_embeddings.reshape(1, -1), k=2) # distance, index
retrieved_chunks = [chunks[i] for i in I.tolist()[0]]

prompt = f"""
Context information is below.
---------------------
{retrieved_chunks}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: {question}
Answer:
"""

chat_response = client.complete(
    messages=[
        SystemMessage(content="You are a helpful assistant."),
        UserMessage(content=prompt),
    ],
    temperature=1.0,
    top_p=1.0,
    max_tokens=1000,
    model=model_name
)

print(chat_response.choices[0].message.content)
```

### Mistral Small
Mistral Small is another model in the Mistral family of models under the premier/enterprise category. As the name implies, this model is a Small Language Model (SLM). The advantages of using Mistral Small are that it is:
- Cost Saving compared to Mistral LLMs like Mistral Large and NeMo - 80% price drop
- Low latency - faster response compared to Mistral's LLMs
- Flexible - can be deployed across different environments with less restrictions on required resources.

Mistral Small is great for:
- Text based tasks such as summarization, sentiment analysis and translation.
- Applications where frequent requests are made due to its cost effectiveness
- Low latency code tasks like review and code suggestions

### Comparing Mistral Small and Mistral Large

To show differences in latency between Mistral Small and Large, run the below cells.

You should see a difference in response times between 3-5 seconds. Also note the response lengths and style over the same prompt.

```python

import os
endpoint = os.environ["AZURE_INFERENCE_ENDPOINT"]
model_name = "Mistral-small"
token = os.environ["AZURE_INFERENCE_CREDENTIAL"]

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage(content="You are a helpful coding assistant."),
        UserMessage(content="Can you write a Python function to the fizz buzz test?"),
    ],
    temperature=1.0,
    top_p=1.0,
    max_tokens=1000,
    model=model_name
)

print(response.choices[0].message.content)

```

```python

import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

endpoint = os.environ["AZURE_INFERENCE_ENDPOINT"]
model_name = "Mistral-large"
token = os.environ["AZURE_INFERENCE_CREDENTIAL"]

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage(content="You are a helpful coding assistant."),
        UserMessage(content="Can you write a Python function to the fizz buzz test?"),
    ],
    temperature=1.0,
    top_p=1.0,
    max_tokens=1000,
    model=model_name
)

print(response.choices[0].message.content)

```

### Mistral NeMo

Compared to the other two models discussed in this lesson, Mistral NeMo is the only free model with an Apache2 License.

It is viewed as an upgrade to the earlier open source LLM from Mistral, Mistral 7B.

Some other features of the NeMo model are:

- *More efficient tokenization:* This model uses the Tekken tokenizer over the more commonly used tiktoken. This allows for better performance over more languages and code.

- *Finetuning:* The base model is available for finetuning. This allows for more flexibility for use-cases where finetuning may be needed.

- *Native Function Calling* - Like Mistral Large, this model has been trained on function calling. This makes it unique as being one of the first open source models to do so.

#### Comparing Tokenizers

In this sample, we will look at how Mistral NeMo handles tokenization compared to Mistral Large.

Both samples take the same prompt but you should see that NeMo returns fewer tokens than Mistral Large.

```bash
pip install mistral-common
```

```python
# Import needed packages:
from mistral_common.protocol.instruct.messages import (
    UserMessage,
)
from mistral_common.protocol.instruct.request import ChatCompletionRequest
from mistral_common.protocol.instruct.tool_calls import (
    Function,
    Tool,
)
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer

# Load Mistral tokenizer

model_name = "open-mistral-nemo"

tokenizer = MistralTokenizer.from_model(model_name)

# Tokenize a list of messages
tokenized = tokenizer.encode_chat_completion(
    ChatCompletionRequest(
        tools=[
            Tool(
                function=Function(
                    name="get_current_weather",
                    description="Get the current weather",
                    parameters={
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA",
                            },
                            "format": {
                                "type": "string",
                                "enum": ["celsius", "fahrenheit"],
                                "description": "The temperature unit to use. Infer this from the user's location.",
                            },
                        },
                        "required": ["location", "format"],
                    },
                )
            )
        ],
        messages=[
            UserMessage(content="What's the weather like today in Paris"),
        ],
        model=model_name,
    )
)
tokens, text = tokenized.tokens, tokenized.text

# Count the number of tokens
print(len(tokens))
```

```python
# Import needed packages:
from mistral_common.protocol.instruct.messages import (
    UserMessage,
)
from mistral_common.protocol.instruct.request import ChatCompletionRequest
from mistral_common.protocol.instruct.tool_calls import (
    Function,
    Tool,
)
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer

# Load Mistral tokenizer

model_name = "mistral-large-latest"

tokenizer = MistralTokenizer.from_model(model_name)

# Tokenize a list of messages
tokenized = tokenizer.encode_chat_completion(
    ChatCompletionRequest(
        tools=[
            Tool(
                function=Function(
                    name="get_current_weather",
                    description="Get the current weather",
                    parameters={
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA",
                            },
                            "format": {
                                "type": "string",
                                "enum": ["celsius", "fahrenheit"],
                                "description": "The temperature unit to use. Infer this from the user's location.",
                            },
                        },
                        "required": ["location", "format"],
                    },
                )
            )
        ],
        messages=[
            UserMessage(content="What's the weather like today in Paris"),
        ],
        model=model_name,
    )
)
tokens, text = tokenized.tokens, tokenized.text

# Count the number of tokens
print(len(tokens))
```

### Learning does not stop here, continue the journey

After completing this lesson, check out our [Generative AI Learning collection](https://aka.ms/genai-collection?WT.mc_id=academic-105485-koreyst) to continue leveling up your Generative AI knowledge!

## Building With the Meta Family Models

> **Source:** [Building With the Meta Family Models](https://github.com/microsoft/generative-ai-for-beginners/tree/main/21-meta) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

### Introduction

This lesson will cover:

- Exploring the two main Meta family models - Llama 3.1 and Llama 3.2
- Understanding the use-cases and scenarios for each model
- Code sample to show the unique features of each model

### The Meta Family of Models

In this lesson, we will explore 2 models from the Meta family or "Llama Herd" - Llama 3.1 and Llama 3.2.

These models come in different variants and are available in the [Microsoft Foundry Models catalog](https://ai.azure.com/catalog/models?WT.mc_id=academic-105485-koreyst).

> **Note:** GitHub Models is retiring at the end of July 2026. Here are more details on using [Microsoft Foundry Models](https://learn.microsoft.com/azure/ai-foundry/model-inference/overview?WT.mc_id=academic-105485-koreyst) to prototype with AI models.

Model Variants:
- Llama 3.1 - 70B Instruct
- Llama 3.1 - 405B Instruct
- Llama 3.2 - 11B Vision Instruct
- Llama 3.2 - 90B Vision Instruct

*Note: Llama 3 is also available in Microsoft Foundry Models but won't be covered in this lesson*

### Llama 3.1

At 405 Billion Parameters, Llama 3.1 fits into the open source LLM category.

The model is an upgrade to the earlier release Llama 3 by offering:

- Larger context window - 128k tokens vs 8k tokens
- Larger Max Output Tokens - 4096 vs 2048
- Better Multilingual Support - due to increase in training tokens

These enable Llama 3.1 to handle more complex use cases when building GenAI applications including:
- Native Function Calling - the ability to call external tools and functions outside of the LLM workflow
- Better RAG Performance - due to the higher context window
- Synthetic Data Generation - the ability to create effective data for tasks such as fine-tuning

#### Native Function Calling

Llama 3.1 has been fine-tuned to be more effective at making function or tool calls. It also has two built-in tools that the model can identify as needing to be used based on the prompt from the user. These tools are:

- **Brave Search** - Can be used to get up-to-date information like the weather by performing a web search
- **Wolfram Alpha** - Can be used for more complex mathematical calculations so writing your own functions is not required.

You can also create your own custom tools that the LLM can call.

In the code example below:

- We define the available tools (brave_search, wolfram_alpha) in the system prompt.
- Send a user prompt that asks about the weather in a certain city.
- The LLM will respond with a tool call to the Brave Search tool which will look like this `<|python_tag|>brave_search.call(query="Stockholm weather")`

*Note: This example only makes the tool call, if you would like to get the results, you will need to create a free account on the Brave API page and define the function itself.

```python
import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import AssistantMessage, SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

# Get these from your Microsoft Foundry project's "Overview" page
token = os.environ["AZURE_INFERENCE_CREDENTIAL"]
endpoint = os.environ["AZURE_INFERENCE_ENDPOINT"]
model_name = "Meta-Llama-3.1-405B-Instruct"

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

tool_prompt=f"""
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Environment: ipython
Tools: brave_search, wolfram_alpha
Cutting Knowledge Date: December 2023
Today Date: 23 July 2024

You are a helpful assistant<|eot_id|>
"""

messages = [
    SystemMessage(content=tool_prompt),
    UserMessage(content="What is the weather in Stockholm?"),

]

response = client.complete(messages=messages, model=model_name)

print(response.choices[0].message.content)
```

### Llama 3.2

Despite being an LLM, one limitation of Llama 3.1 is its lack of multimodality. That is, the inability to use different types of input such as images as prompts and provide responses. This ability is one of the main features of Llama 3.2. These features also include:

- Multimodality -  has the ability to evaluate both text and image prompts
- Small to Medium size variations (11B and 90B) - this provides flexible deployment options,
- Text-only variations (1B and 3B) - this allows the model to be deployed on edge / mobile devices and provides low latency

The multimodal support represents a big step in the world of open source models. The code example below takes both an image and text prompt to get an analysis of the image from Llama 3.2 90B.

#### Multimodal Support with Llama 3.2

```python
import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import (
    SystemMessage,
    UserMessage,
    TextContentItem,
    ImageContentItem,
    ImageUrl,
    ImageDetailLevel,
)
from azure.core.credentials import AzureKeyCredential

# Get these from your Microsoft Foundry project's "Overview" page
token = os.environ["AZURE_INFERENCE_CREDENTIAL"]
endpoint = os.environ["AZURE_INFERENCE_ENDPOINT"]
model_name = "Llama-3.2-90B-Vision-Instruct"

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage(
            content="You are a helpful assistant that describes images in details."
        ),
        UserMessage(
            content=[
                TextContentItem(text="What's in this image?"),
                ImageContentItem(
                    image_url=ImageUrl.load(
                        image_file="sample.jpg",
                        image_format="jpg",
                        detail=ImageDetailLevel.LOW)
                ),
            ],
        ),
    ],
    model=model_name,
)

print(response.choices[0].message.content)
```

### Learning does not stop here, continue the journey

After completing this lesson, check out our [Generative AI Learning collection](https://aka.ms/genai-collection?WT.mc_id=academic-105485-koreyst) to continue leveling up your Generative AI knowledge!
