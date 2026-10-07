---
title: "The LLM Engineer"
order: 9
summary: "Building applications with LLMs: running models, vector storage, RAG and advanced RAG, agents, inference optimization, deployment and security."
category: "AI"
level: Intermediate
---

# The LLM Engineer

Building applications with LLMs: running models, vector storage, RAG and advanced RAG, agents, inference optimization, deployment and security.

This section of the course focuses on learning how to build LLM-powered applications that can be used in production, with a focus on augmenting models and deploying them.

![](https://raw.githubusercontent.com/mlabonne/llm-course/main/img/roadmap_engineer.png)

## Running LLMs

> **Source:** [Running LLMs](https://github.com/mlabonne/llm-course#running-llms) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Running LLMs can be difficult due to high hardware requirements. Depending on your use case, you might want to simply consume a model through an API (like GPT-4) or run it locally. In any case, additional prompting and guidance techniques can improve and constrain the output for your applications.

* **LLM APIs**: APIs are a convenient way to deploy LLMs. This space is divided between private LLMs ([OpenAI](https://platform.openai.com/), [Google](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview), [Anthropic](https://docs.anthropic.com/claude/reference/getting-started-with-the-api), etc.) and open-source LLMs ([OpenRouter](https://openrouter.ai/), [Hugging Face](https://huggingface.co/inference-api), [Together AI](https://www.together.ai/), etc.).
* **Open-source LLMs**: The [Hugging Face Hub](https://huggingface.co/models) is a great place to find LLMs. You can directly run some of them in [Hugging Face Spaces](https://huggingface.co/spaces), or download and run them locally in apps like [LM Studio](https://lmstudio.ai/) or through the CLI with [llama.cpp](https://github.com/ggerganov/llama.cpp) or [ollama](https://ollama.ai/).
* **Prompt engineering**: Common techniques include zero-shot prompting, few-shot prompting, chain of thought, and ReAct. They work better with bigger models, but can be adapted to smaller ones.
* **Structuring outputs**: Many tasks require a structured output, like a strict template or a JSON format. Libraries like [Outlines](https://github.com/outlines-dev/outlines) can be used to guide the generation and respect a given structure. Some APIs also support structured output generation natively using JSON schemas.

📚 **References**:
* [Run an LLM locally with LM Studio](https://www.kdnuggets.com/run-an-llm-locally-with-lm-studio) by Nisha Arya: Short guide on how to use LM Studio.
* [Prompt engineering guide](https://www.promptingguide.ai/) by DAIR.AI: Exhaustive list of prompt techniques with examples
* [Outlines - Quickstart](https://dottxt-ai.github.io/outlines/latest/quickstart/): List of guided generation techniques enabled by Outlines.
* [LMQL - Overview](https://lmql.ai/docs/language/overview.html): Introduction to the LMQL language.

---

## Building a Vector Storage

> **Source:** [Building a Vector Storage](https://github.com/mlabonne/llm-course#building-a-vector-storage) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Creating a vector storage is the first step to building a Retrieval Augmented Generation (RAG) pipeline. Documents are loaded, split, and relevant chunks are used to produce vector representations (embeddings) that are stored for future use during inference.

* **Ingesting documents**: Document loaders are convenient wrappers that can handle many formats: PDF, JSON, HTML, Markdown, etc. They can also directly retrieve data from some databases and APIs (GitHub, Reddit, Google Drive, etc.).
* **Splitting documents**: Text splitters break down documents into smaller, semantically meaningful chunks. Instead of splitting text after *n* characters, it's often better to split by header or recursively, with some additional metadata.
* **Embedding models**: Embedding models convert text into vector representations. Picking task-specific models significantly improves performance for semantic search and RAG.
* **Vector databases**: Vector databases (like [Chroma](https://www.trychroma.com/), [Pinecone](https://www.pinecone.io/), [Milvus](https://milvus.io/), [FAISS](https://faiss.ai/), [Annoy](https://github.com/spotify/annoy), etc.) are designed to store embedding vectors. They enable efficient retrieval of data that is 'most similar' to a query based on vector similarity.

📚 **References**:
* [LangChain - Text splitters](https://python.langchain.com/docs/how_to/#text-splitters): List of different text splitters implemented in LangChain.
* [Sentence Transformers library](https://www.sbert.net/): Popular library for embedding models.
* [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard): Leaderboard for embedding models.
* [The Top 7 Vector Databases](https://www.datacamp.com/blog/the-top-5-vector-databases) by Moez Ali: A comparison of the best and most popular vector databases.

---

## Retrieval Augmented Generation

> **Source:** [Retrieval Augmented Generation](https://github.com/mlabonne/llm-course#retrieval-augmented-generation) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

With RAG, LLMs retrieve contextual documents from a database to improve the accuracy of their answers. RAG is a popular way of augmenting the model's knowledge without any fine-tuning.

* **Orchestrators**: Orchestrators like [LangChain](https://python.langchain.com/docs/get_started/introduction) and [LlamaIndex](https://docs.llamaindex.ai/en/stable/) are popular frameworks to connect your LLMs with tools and databases. The Model Context Protocol (MCP) introduces a new standard to pass data and context to models across providers.
* **Retrievers**: Query rewriters and generative retrievers like CoRAG and HyDE enhance search by transforming user queries. Multi-vector and hybrid retrieval methods combine embeddings with keyword signals to improve recall and precision.
* **Memory**: To remember previous instructions and answers, LLMs and chatbots like ChatGPT add this history to their context window. This buffer can be improved with summarization (e.g., using a smaller LLM), a vector store + RAG, etc.
* **Evaluation**: We need to evaluate both the document retrieval (context precision and recall) and the generation stages (faithfulness and answer relevancy). It can be simplified with tools [Ragas](https://github.com/explodinggradients/ragas/tree/main) and [DeepEval](https://github.com/confident-ai/deepeval) (assessing quality).

📚 **References**:
* [Llamaindex - High-level concepts](https://docs.llamaindex.ai/en/stable/getting_started/concepts.html): Main concepts to know when building RAG pipelines.
* [Model Context Protocol](https://modelcontextprotocol.io/introduction): Introduction to MCP with motivate, architecture, and quick starts.
* [Pinecone - Retrieval Augmentation](https://www.pinecone.io/learn/series/langchain/langchain-retrieval-augmentation/): Overview of the retrieval augmentation process.
* [LangChain - Q&A with RAG](https://python.langchain.com/docs/tutorials/rag/): Step-by-step tutorial to build a typical RAG pipeline.
* [LangChain - Memory types](https://python.langchain.com/docs/how_to/chatbots_memory/): List of different types of memories with relevant usage.
* [RAG pipeline - Metrics](https://docs.ragas.io/en/stable/concepts/metrics/index.html): Overview of the main metrics used to evaluate RAG pipelines.

---

## Advanced RAG

> **Source:** [Advanced RAG](https://github.com/mlabonne/llm-course#advanced-rag) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Real-life applications can require complex pipelines, including SQL or graph databases, as well as automatically selecting relevant tools and APIs. These advanced techniques can improve a baseline solution and provide additional features.

* **Query construction**: Structured data stored in traditional databases requires a specific query language like SQL, Cypher, metadata, etc. We can directly translate the user instruction into a query to access the data with query construction.
* **Tools**: Agents augment LLMs by automatically selecting the most relevant tools to provide an answer. These tools can be as simple as using Google or Wikipedia, or more complex, like a Python interpreter or Jira.
* **Post-processing**: Final step that processes the inputs that are fed to the LLM. It enhances the relevance and diversity of documents retrieved with re-ranking, [RAG-fusion](https://github.com/Raudaschl/rag-fusion), and classification.
* **Program LLMs**: Frameworks like [DSPy](https://github.com/stanfordnlp/dspy) allow you to optimize prompts and weights based on automated evaluations in a programmatic way.

📚 **References**:
* [LangChain - Query Construction](https://blog.langchain.dev/query-construction/): Blog post about different types of query construction.
* [LangChain - SQL](https://python.langchain.com/docs/tutorials/sql_qa/): Tutorial on how to interact with SQL databases with LLMs, involving Text-to-SQL and an optional SQL agent.
* [Pinecone - LLM agents](https://www.pinecone.io/learn/series/langchain/langchain-agents/): Introduction to agents and tools with different types.
* [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) by Lilian Weng: A more theoretical article about LLM agents.
* [LangChain - OpenAI's RAG](https://blog.langchain.dev/applying-openai-rag/): Overview of the RAG strategies employed by OpenAI, including post-processing.
* [DSPy in 8 Steps](https://dspy-docs.vercel.app/docs/building-blocks/solving_your_task): General-purpose guide to DSPy introducing modules, signatures, and optimizers.

---

## Agents

> **Source:** [Agents](https://github.com/mlabonne/llm-course#agents) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

An LLM agent can autonomously perform tasks by taking actions based on reasoning about its environment, typically through the use of tools or functions to interact with external systems.

* **Agent fundamentals**: Agents operate using thoughts (internal reasoning to decide what to do next), action (executing tasks, often by interacting with external tools), and observation (analyzing feedback or results to refine the next step).
* **Agent protocols**: [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is the industry standard for connecting agents to external tools and data sources with MCP servers and clients. More recently, [Agent2Agent](https://a2a-protocol.org/) (A2A) tries to standardize a common language for agent interoperability.
* **Vendor frameworks**: Each major cloud model provider has its own agentic framework with [OpenAI SDK](https://openai.github.io/openai-agents-python/), [Google ADK](https://google.github.io/adk-docs/), and [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) if you're particularly tied to one vendor.
* **Other frameworks**: Agent development can be streamlined using different frameworks like [LangGraph](https://www.langchain.com/langgraph) (design and visualization of workflows) [LlamaIndex](https://docs.llamaindex.ai/en/stable/use_cases/agents/) (data-augmented agents with RAG), or custom solutions. More experimental frameworks include collaboration between different agents, such as [CrewAI](https://docs.crewai.com/introduction) (role-based team workflows) and [AutoGen](https://github.com/microsoft/autogen) (conversation-driven multi-agent systems).

📚 **References**:
* [Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction): Popular course about AI agents made by Hugging Face.
* [LangGraph](https://langchain-ai.github.io/langgraph/concepts/why-langgraph/): Overview of how to build AI agents with LangGraph.
* [LlamaIndex Agents](https://docs.llamaindex.ai/en/stable/use_cases/agents/): Uses cases and resources to build agents with LlamaIndex.

---

## Inference optimization

> **Source:** [Inference optimization](https://github.com/mlabonne/llm-course#inference-optimization) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Text generation is a costly process that requires expensive hardware. In addition to quantization, various techniques have been proposed to maximize throughput and reduce inference costs.

* **Flash Attention**: Optimization of the attention mechanism to transform its complexity from quadratic to linear, speeding up both training and inference.
* **Key-value cache**: Understand the key-value cache and the improvements introduced in [Multi-Query Attention](https://arxiv.org/abs/1911.02150) (MQA) and [Grouped-Query Attention](https://arxiv.org/abs/2305.13245) (GQA).
* **Speculative decoding**: Use a small model to produce drafts that are then reviewed by a larger model to speed up text generation. EAGLE-3 is a particularly popular solution.

📚 **References**:
* [GPU Inference](https://huggingface.co/docs/transformers/main/en/perf_infer_gpu_one) by Hugging Face: Explain how to optimize inference on GPUs.
* [LLM Inference](https://www.databricks.com/blog/llm-inference-performance-engineering-best-practices) by Databricks: Best practices for how to optimize LLM inference in production.
* [Optimizing LLMs for Speed and Memory](https://huggingface.co/docs/transformers/main/en/llm_tutorial_optimization) by Hugging Face: Explain three main techniques to optimize speed and memory, namely quantization, Flash Attention, and architectural innovations.
* [Assisted Generation](https://huggingface.co/blog/assisted-generation) by Hugging Face: HF's version of speculative decoding. It's an interesting blog post about how it works with code to implement it.
* [EAGLE-3 paper](https://arxiv.org/abs/2503.01840?utm_source=chatgpt.com): Introduces EAGLE-3 and reports speedups up to 6.5×.
* [Speculators](https://github.com/vllm-project/speculators): Library made by vLLM for building, evaluating, and storing speculative decoding algorithms (e.g., EAGLE-3) for LLM inference.

---

## Deploying LLMs

> **Source:** [Deploying LLMs](https://github.com/mlabonne/llm-course#deploying-llms) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

Deploying LLMs at scale is an engineering feat that can require multiple clusters of GPUs. In other scenarios, demos and local apps can be achieved with much lower complexity.

* **Local deployment**: Privacy is an important advantage that open-source LLMs have over private ones. Local LLM servers ([LM Studio](https://lmstudio.ai/), [Ollama](https://ollama.ai/), [oobabooga](https://github.com/oobabooga/text-generation-webui), [kobold.cpp](https://github.com/LostRuins/koboldcpp), etc.) capitalize on this advantage to power local apps.
* **Demo deployment**: Frameworks like [Gradio](https://www.gradio.app/) and [Streamlit](https://docs.streamlit.io/) are helpful to prototype applications and share demos. You can also easily host them online, for example, using [Hugging Face Spaces](https://huggingface.co/spaces).
* **Server deployment**: Deploying LLMs at scale requires cloud (see also [SkyPilot](https://skypilot.readthedocs.io/en/latest/)) or on-prem infrastructure and often leverages optimized text generation frameworks like [TGI](https://github.com/huggingface/text-generation-inference), [vLLM](https://github.com/vllm-project/vllm/tree/main), etc.
* **Edge deployment**: In constrained environments, high-performance frameworks like [MLC LLM](https://github.com/mlc-ai/mlc-llm) and [mnn-llm](https://github.com/wangzhaode/mnn-llm/blob/master/README_en.md) can deploy LLM in web browsers, Android, and iOS.

📚 **References**:
* [Streamlit - Build a basic LLM app](https://docs.streamlit.io/knowledge-base/tutorials/build-conversational-apps): Tutorial to make a basic ChatGPT-like app using Streamlit.
* [HF LLM Inference Container](https://huggingface.co/blog/sagemaker-huggingface-llm): Deploy LLMs on Amazon SageMaker using Hugging Face's inference container.
* [Philschmid blog](https://www.philschmid.de/) by Philipp Schmid: Collection of high-quality articles about LLM deployment using Amazon SageMaker.
* [Optimizing latence](https://hamel.dev/notes/llm/inference/03_inference.html) by Hamel Husain: Comparison of TGI, vLLM, CTranslate2, and mlc in terms of throughput and latency.

---

## Securing LLMs

> **Source:** [Securing LLMs](https://github.com/mlabonne/llm-course#securing-llms) · [LLM Course by Maxime Labonne](https://github.com/mlabonne/llm-course), Apache 2.0

In addition to traditional security problems associated with software, LLMs have unique weaknesses due to the way they are trained and prompted.

* **Prompt hacking**: Different techniques related to prompt engineering, including prompt injection (additional instruction to hijack the model's answer), data/prompt leaking (retrieve its original data/prompt), and jailbreaking (craft prompts to bypass safety features).
* **Backdoors**: Attack vectors can target the training data itself, by poisoning the training data (e.g., with false information) or creating backdoors (secret triggers to change the model's behavior during inference).
* **Defensive measures**: The best way to protect your LLM applications is to test them against these vulnerabilities (e.g., using red teaming and checks like [garak](https://github.com/leondz/garak/)) and observe them in production (with a framework like [langfuse](https://github.com/langfuse/langfuse)).

📚 **References**:
* [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) by HEGO Wiki: List of the 10 most critical vulnerabilities seen in LLM applications.
* [Prompt Injection Primer](https://github.com/jthack/PIPE) by Joseph Thacker: Short guide dedicated to prompt injection for engineers.
* [LLM Security](https://llmsecurity.net/) by [@llm_sec](https://twitter.com/llm_sec): Extensive list of resources related to LLM security.
* [Red teaming LLMs](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/red-teaming) by Microsoft: Guide on how to perform red teaming with LLMs.

---
