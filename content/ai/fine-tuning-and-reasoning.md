---
title: "Fine-Tuning and Reasoning Models"
order: 5
summary: "Adapting pretrained models: preparing data and training with the Trainer API, chat templates, supervised fine-tuning, LoRA, evaluation, and building reasoning models with reinforcement learning and GRPO."
category: "AI"
level: Intermediate
---

# Fine-Tuning and Reasoning Models

Adapting pretrained models: preparing data and training with the Trainer API, chat templates, supervised fine-tuning, LoRA, evaluation, and building reasoning models with reinforcement learning and GRPO.

## Processing the Data

> **Source:** [Processing the Data](https://huggingface.co/learn/llm-course/chapter3/2) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Continuing with the example from the [previous chapter](https://huggingface.co/course/chapter2), here is how we would train a sequence classifier on one batch:

```python
import torch
from torch.optim import AdamW
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Same as before
checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForSequenceClassification.from_pretrained(checkpoint)
sequences = [
    "I've been waiting for a HuggingFace course my whole life.",
    "This course is amazing!",
]
batch = tokenizer(sequences, padding=True, truncation=True, return_tensors="pt")

# This is new
batch["labels"] = torch.tensor([1, 1])

optimizer = AdamW(model.parameters())
loss = model(**batch).loss
loss.backward()
optimizer.step()
```

Of course, just training the model on two sentences is not going to yield very good results. To get better results, you will need to prepare a bigger dataset.

In this section we will use as an example the MRPC (Microsoft Research Paraphrase Corpus) dataset, introduced in a [paper](https://www.aclweb.org/anthology/I05-5002.pdf) by William B. Dolan and Chris Brockett. The dataset consists of 5,801 pairs of sentences, with a label indicating if they are paraphrases or not (i.e., if both sentences mean the same thing). We've selected it for this chapter because it's a small dataset, so it's easy to experiment with training on it.

#### Loading a dataset from the Hub

The Hub doesn't just contain models; it also has multiple datasets in lots of different languages. You can browse the datasets [here](https://huggingface.co/datasets), and we recommend you try to load and process a new dataset once you have gone through this section (see the general documentation [here](https://huggingface.co/docs/datasets/loading)). But for now, let's focus on the MRPC dataset! This is one of the 10 datasets composing the [GLUE benchmark](https://gluebenchmark.com/), which is an academic benchmark that is used to measure the performance of ML models across 10 different text classification tasks.

The 🤗 Datasets library provides a very simple command to download and cache a dataset on the Hub. We can download the MRPC dataset like this:

> **Tip:**
> 💡 **Additional Resources**: For more dataset loading techniques and examples, check out the [🤗 Datasets documentation](https://huggingface.co/docs/datasets/).

```py
from datasets import load_dataset

raw_datasets = load_dataset("glue", "mrpc")
raw_datasets
```

```python
DatasetDict({
    train: Dataset({
        features: ['sentence1', 'sentence2', 'label', 'idx'],
        num_rows: 3668
    })
    validation: Dataset({
        features: ['sentence1', 'sentence2', 'label', 'idx'],
        num_rows: 408
    })
    test: Dataset({
        features: ['sentence1', 'sentence2', 'label', 'idx'],
        num_rows: 1725
    })
})
```

As you can see, we get a `DatasetDict` object which contains the training set, the validation set, and the test set. Each of those contains several columns (`sentence1`, `sentence2`, `label`, and `idx`) and a variable number of rows, which are the number of elements in each set (so, there are 3,668 pairs of sentences in the training set, 408 in the validation set, and 1,725 in the test set).

> **Tip:**
> This command downloads and caches the dataset, by default in *~/.cache/huggingface/datasets*. Recall from Chapter 2 that you can customize your cache folder by setting the `HF_HOME` environment variable.

We can access each pair of sentences in our `raw_datasets` object by indexing, like with a dictionary:

```py
raw_train_dataset = raw_datasets["train"]
raw_train_dataset[0]
```

```python
{'idx': 0,
 'label': 1,
 'sentence1': 'Amrozi accused his brother , whom he called " the witness " , of deliberately distorting his evidence .',
 'sentence2': 'Referring to him as only " the witness " , Amrozi accused his brother of deliberately distorting his evidence .'}
```

We can see the labels are already integers, so we won't have to do any preprocessing there. To know which integer corresponds to which label, we can inspect the `features` of our `raw_train_dataset`. This will tell us the type of each column:

```py
raw_train_dataset.features
```

```python
{'sentence1': Value(dtype='string', id=None),
 'sentence2': Value(dtype='string', id=None),
 'label': ClassLabel(num_classes=2, names=['not_equivalent', 'equivalent'], names_file=None, id=None),
 'idx': Value(dtype='int32', id=None)}
```

Behind the scenes, `label` is of type `ClassLabel`, and the mapping of integers to label name is stored in the *names* folder. `0` corresponds to `not_equivalent`, and `1` corresponds to `equivalent`.

> **Tip:**
> ✏️ **Try it out!** Look at element 15 of the training set and element 87 of the validation set. What are their labels?

#### Preprocessing a dataset

To preprocess the dataset, we need to convert the text to numbers the model can make sense of. As you saw in the [previous chapter](https://huggingface.co/course/chapter2), this is done with a tokenizer. We can feed the tokenizer one sentence or a list of sentences, so we can directly tokenize all the first sentences and all the second sentences of each pair like this:

```py
from transformers import AutoTokenizer

checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
tokenized_sentences_1 = tokenizer(raw_datasets["train"]["sentence1"])
tokenized_sentences_2 = tokenizer(raw_datasets["train"]["sentence2"])
```

> **Tip:**
> 💡 **Deep Dive**: For more advanced tokenization techniques and understanding how different tokenizers work, explore the [🤗 Tokenizers documentation](https://huggingface.co/docs/transformers/main/en/tokenizer_summary) and the [tokenization guide in the cookbook](https://huggingface.co/learn/cookbook/en/advanced_rag#tokenization-strategies).

However, we can't just pass two sequences to the model and get a prediction of whether the two sentences are paraphrases or not. We need to handle the two sequences as a pair, and apply the appropriate preprocessing. Fortunately, the tokenizer can also take a pair of sequences and prepare it the way our BERT model expects:

```py
inputs = tokenizer("This is the first sentence.", "This is the second one.")
inputs
```

```python
{
  'input_ids': [101, 2023, 2003, 1996, 2034, 6251, 1012, 102, 2023, 2003, 1996, 2117, 2028, 1012, 102],
  'token_type_ids': [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  'attention_mask': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
}
```

We discussed the `input_ids` and `attention_mask` keys in [Chapter 2](https://huggingface.co/course/chapter2), but we put off talking about `token_type_ids`. In this example, this is what tells the model which part of the input is the first sentence and which is the second sentence.

> **Tip:**
> ✏️ **Try it out!** Take element 15 of the training set and tokenize the two sentences separately and as a pair. What's the difference between the two results?

If we decode the IDs inside `input_ids` back to words:

```py
tokenizer.convert_ids_to_tokens(inputs["input_ids"])
```

we will get:

```python
['[CLS]', 'this', 'is', 'the', 'first', 'sentence', '.', '[SEP]', 'this', 'is', 'the', 'second', 'one', '.', '[SEP]']
```

So we see the model expects the inputs to be of the form `[CLS] sentence1 [SEP] sentence2 [SEP]` when there are two sentences. Aligning this with the `token_type_ids` gives us:

```python
['[CLS]', 'this', 'is', 'the', 'first', 'sentence', '.', '[SEP]', 'this', 'is', 'the', 'second', 'one', '.', '[SEP]']
[      0,      0,    0,     0,       0,          0,   0,       0,      1,    1,     1,        1,     1,   1,       1]
```

As you can see, the parts of the input corresponding to `[CLS] sentence1 [SEP]` all have a token type ID of `0`, while the other parts, corresponding to `sentence2 [SEP]`, all have a token type ID of `1`.

Note that if you select a different checkpoint, you won't necessarily have the `token_type_ids` in your tokenized inputs (for instance, they're not returned if you use a DistilBERT model). They are only returned when the model will know what to do with them, because it has seen them during its pretraining.

Here, BERT is pretrained with token type IDs, and on top of the masked language modeling objective we talked about in [Chapter 1](https://huggingface.co/course/chapter1), it has an additional objective called _next sentence prediction_. The goal with this task is to model the relationship between pairs of sentences.

With next sentence prediction, the model is provided pairs of sentences (with randomly masked tokens) and asked to predict whether the second sentence follows the first. To make the task non-trivial, half of the time the sentences follow each other in the original document they were extracted from, and the other half of the time the two sentences come from two different documents.

In general, you don't need to worry about whether or not there are `token_type_ids` in your tokenized inputs: as long as you use the same checkpoint for the tokenizer and the model, everything will be fine as the tokenizer knows what to provide to its model.

Now that we have seen how our tokenizer can deal with one pair of sentences, we can use it to tokenize our whole dataset: like in the [previous chapter](https://huggingface.co/course/chapter2), we can feed the tokenizer a list of pairs of sentences by giving it the list of first sentences, then the list of second sentences. This is also compatible with the padding and truncation options we saw in [Chapter 2](https://huggingface.co/course/chapter2). So, one way to preprocess the training dataset is:

```py
tokenized_dataset = tokenizer(
    raw_datasets["train"]["sentence1"],
    raw_datasets["train"]["sentence2"],
    padding=True,
    truncation=True,
)
```

This works well, but it has the disadvantage of returning a dictionary (with our keys, `input_ids`, `attention_mask`, and `token_type_ids`, and values that are lists of lists). It will also only work if you have enough RAM to store your whole dataset during the tokenization (whereas the datasets from the 🤗 Datasets library are [Apache Arrow](https://arrow.apache.org/) files stored on the disk, so you only keep the samples you ask for loaded in memory).

To keep the data as a dataset, we will use the [`Dataset.map()`](https://huggingface.co/docs/datasets/package_reference/main_classes#datasets.Dataset.map) method. This also allows us some extra flexibility, if we need more preprocessing done than just tokenization. The `map()` method works by applying a function on each element of the dataset, so let's define a function that tokenizes our inputs:

```py
def tokenize_function(example):
    return tokenizer(example["sentence1"], example["sentence2"], truncation=True)
```

This function takes a dictionary (like the items of our dataset) and returns a new dictionary with the keys `input_ids`, `attention_mask`, and `token_type_ids`. Note that it also works if the `example` dictionary contains several samples (each key as a list of sentences) since the `tokenizer` works on lists of pairs of sentences, as seen before. This will allow us to use the option `batched=True` in our call to `map()`, which will greatly speed up the tokenization. The `tokenizer` is backed by a tokenizer written in Rust from the [🤗 Tokenizers](https://github.com/huggingface/tokenizers) library. This tokenizer can be very fast, but only if we give it lots of inputs at once.

Note that we've left the `padding` argument out in our tokenization function for now. This is because padding all the samples to the maximum length is not efficient: it's better to pad the samples when we're building a batch, as then we only need to pad to the maximum length in that batch, and not the maximum length in the entire dataset. This can save a lot of time and processing power when the inputs have very variable lengths!

> **Tip:**
> 📚 **Performance Tips**: Learn more about efficient data processing techniques in the [🤗 Datasets performance guide](https://huggingface.co/docs/datasets/about_arrow).

Here is how we apply the tokenization function on all our datasets at once. We're using `batched=True` in our call to `map` so the function is applied to multiple elements of our dataset at once, and not on each element separately. This allows for faster preprocessing.

```py
tokenized_datasets = raw_datasets.map(tokenize_function, batched=True)
tokenized_datasets
```

The way the 🤗 Datasets library applies this processing is by adding new fields to the datasets, one for each key in the dictionary returned by the preprocessing function:

```python
DatasetDict({
    train: Dataset({
        features: ['attention_mask', 'idx', 'input_ids', 'label', 'sentence1', 'sentence2', 'token_type_ids'],
        num_rows: 3668
    })
    validation: Dataset({
        features: ['attention_mask', 'idx', 'input_ids', 'label', 'sentence1', 'sentence2', 'token_type_ids'],
        num_rows: 408
    })
    test: Dataset({
        features: ['attention_mask', 'idx', 'input_ids', 'label', 'sentence1', 'sentence2', 'token_type_ids'],
        num_rows: 1725
    })
})
```

You can even use multiprocessing when applying your preprocessing function with `map()` by passing along a `num_proc` argument. We didn't do this here because the 🤗 Tokenizers library already uses multiple threads to tokenize our samples faster, but if you are not using a fast tokenizer backed by this library, this could speed up your preprocessing.

Our `tokenize_function` returns a dictionary with the keys `input_ids`, `attention_mask`, and `token_type_ids`, so those three fields are added to all splits of our dataset. Note that we could also have changed existing fields if our preprocessing function returned a new value for an existing key in the dataset to which we applied `map()`.

The last thing we will need to do is pad all the examples to the length of the longest element when we batch elements together — a technique we refer to as *dynamic padding*.

###### Dynamic padding

The function that is responsible for putting together samples inside a batch is called a *collate function*. It's an argument you can pass when you build a `DataLoader`, the default being a function that will just convert your samples to PyTorch tensors and concatenate them (recursively if your elements are lists, tuples, or dictionaries). This won't be possible in our case since the inputs we have won't all be of the same size. We have deliberately postponed the padding, to only apply it as necessary on each batch and avoid having over-long inputs with a lot of padding. This will speed up training by quite a bit, but note that if you're training on a TPU it can cause problems — TPUs prefer fixed shapes, even when that requires extra padding.

> **Tip:**
> 🚀 **Optimization Guide**: For more details on optimizing training performance, including padding strategies and TPU considerations, see the [🤗 Transformers performance documentation](https://huggingface.co/docs/transformers/main/en/performance).

To do this in practice, we have to define a collate function that will apply the correct amount of padding to the items of the dataset we want to batch together. Fortunately, the 🤗 Transformers library provides us with such a function via `DataCollatorWithPadding`. It takes a tokenizer when you instantiate it (to know which padding token to use, and whether the model expects padding to be on the left or on the right of the inputs) and will do everything you need:

```py
from transformers import DataCollatorWithPadding

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
```

To test this new toy, let's grab a few samples from our training set that we would like to batch together. Here, we remove the columns `idx`, `sentence1`, and `sentence2` as they won't be needed and contain strings (and we can't create tensors with strings) and have a look at the lengths of each entry in the batch:

```py
samples = tokenized_datasets["train"][:8]
samples = {k: v for k, v in samples.items() if k not in ["idx", "sentence1", "sentence2"]}
[len(x) for x in samples["input_ids"]]
```

```python
[50, 59, 47, 67, 59, 50, 62, 32]
```

No surprise, we get samples of varying length, from 32 to 67. Dynamic padding means the samples in this batch should all be padded to a length of 67, the maximum length inside the batch. Without dynamic padding, all of the samples would have to be padded to the maximum length in the whole dataset, or the maximum length the model can accept. Let's double-check that our `data_collator` is dynamically padding the batch properly:

```py
batch = data_collator(samples)
{k: v.shape for k, v in batch.items()}
```

```python
{'attention_mask': torch.Size([8, 67]),
 'input_ids': torch.Size([8, 67]),
 'token_type_ids': torch.Size([8, 67]),
 'labels': torch.Size([8])}
```

Looking good! Now that we've gone from raw text to batches our model can deal with, we're ready to fine-tune it!

> **Tip:**
> ✏️ **Try it out!** Replicate the preprocessing on the GLUE SST-2 dataset. It's a little bit different since it's composed of single sentences instead of pairs, but the rest of what we did should look the same. For a harder challenge, try to write a preprocessing function that works on any of the GLUE tasks.
>
> 📖 **Additional Practice**: Check out these hands-on examples from the [🤗 Transformers examples](https://huggingface.co/docs/transformers/main/en/notebooks).

Perfect! Now that we have preprocessed our data with the latest best practices from the 🤗 Datasets library, we're ready to move on to training our model using the modern Trainer API. The next section will show you how to fine-tune your model effectively using the latest features and optimizations available in the Hugging Face ecosystem.

### Section Quiz

Test your understanding of data processing concepts:

#### 1. What is the main advantage of using `Dataset.map()` with `batched=True`?

#### 2. Why do we use dynamic padding instead of padding all sequences to the maximum length in the dataset?

#### 3. What does the `token_type_ids` field represent in BERT tokenization?

#### 4. When loading a dataset with `load_dataset('glue', 'mrpc')`, what does the second argument specify?

#### 5. What is the purpose of removing columns like 'sentence1' and 'sentence2' before training?

> **Tip:**
> 💡 **Key Takeaways:**
> - Use `batched=True` with `Dataset.map()` for significantly faster preprocessing
> - Dynamic padding with `DataCollatorWithPadding` is more efficient than fixed-length padding
> - Always preprocess your data to match what your model expects (numerical tensors, correct column names)
> - The 🤗 Datasets library provides powerful tools for efficient data processing at scale

## Fine-Tuning with the Trainer API

> **Source:** [Fine-Tuning with the Trainer API](https://huggingface.co/learn/llm-course/chapter3/3) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Fine-tuning a model with the Trainer API

🤗 Transformers provides a `Trainer` class to help you fine-tune any of the pretrained models it provides on your dataset with modern best practices. Once you've done all the data preprocessing work in the last section, you have just a few steps left to define the `Trainer`. The hardest part is likely to be preparing the environment to run `Trainer.train()`, as it will run very slowly on a CPU. If you don't have a GPU set up, you can get access to free GPUs or TPUs on [Google Colab](https://colab.research.google.com/).

> **Tip:**
> 📚 **Training Resources**: Before diving into training, familiarize yourself with the comprehensive [🤗 Transformers training guide](https://huggingface.co/docs/transformers/main/en/training) and explore practical examples in the [fine-tuning cookbook](https://huggingface.co/learn/cookbook/en/fine_tuning_code_llm_on_single_gpu).

The code examples below assume you have already executed the examples in the previous section. Here is a short summary recapping what you need:

```py
from datasets import load_dataset
from transformers import AutoTokenizer, DataCollatorWithPadding

raw_datasets = load_dataset("glue", "mrpc")
checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)

def tokenize_function(example):
    return tokenizer(example["sentence1"], example["sentence2"], truncation=True)

tokenized_datasets = raw_datasets.map(tokenize_function, batched=True)
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
```

##### Training

The first step before we can define our `Trainer` is to define a `TrainingArguments` class that will contain all the hyperparameters the `Trainer` will use for training and evaluation. The only argument you have to provide is a directory where the trained model will be saved, as well as the checkpoints along the way. For all the rest, you can leave the defaults, which should work pretty well for a basic fine-tuning.

```py
from transformers import TrainingArguments

training_args = TrainingArguments("test-trainer")
```

If you want to automatically upload your model to the Hub during training, pass along `push_to_hub=True` in the `TrainingArguments`. We will learn more about this in [Chapter 4](https://huggingface.co/course/chapter4/3)

> **Tip:**
> 🚀 **Advanced Configuration**: For detailed information on all available training arguments and optimization strategies, check out the [TrainingArguments documentation](https://huggingface.co/docs/transformers/main/en/main_classes/trainer#transformers.TrainingArguments) and the [training configuration cookbook](https://huggingface.co/learn/cookbook/en/fine_tuning_code_llm_on_single_gpu).

The second step is to define our model. As in the [previous chapter](https://huggingface.co/course/chapter2), we will use the `AutoModelForSequenceClassification` class, with two labels:

```py
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
```

You will notice that unlike in [Chapter 2](https://huggingface.co/course/chapter2), you get a warning after instantiating this pretrained model. This is because BERT has not been pretrained on classifying pairs of sentences, so the head of the pretrained model has been discarded and a new head suitable for sequence classification has been added instead. The warnings indicate that some weights were not used (the ones corresponding to the dropped pretraining head) and that some others were randomly initialized (the ones for the new head). It concludes by encouraging you to train the model, which is exactly what we are going to do now.

Once we have our model, we can define a `Trainer` by passing it all the objects constructed up to now — the `model`, the `training_args`, the training and validation datasets, our `data_collator`, and our `processing_class`. The `processing_class` parameter is a newer addition that tells the Trainer which tokenizer to use for processing:

```py
from transformers import Trainer

trainer = Trainer(
    model,
    training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    data_collator=data_collator,
    processing_class=tokenizer,
)
```

When you pass a tokenizer as the `processing_class`, the default `data_collator` used by the `Trainer` will be a `DataCollatorWithPadding`. You can skip the `data_collator=data_collator` line in this case, but we included it here to show you this important part of the processing pipeline.

> **Tip:**
> 📖 **Learn More**: For comprehensive details on the Trainer class and its parameters, visit the [Trainer API documentation](https://huggingface.co/docs/transformers/main/en/main_classes/trainer) and explore advanced usage patterns in the [training cookbook recipes](https://huggingface.co/learn/cookbook/en/fine_tuning_code_llm_on_single_gpu).

To fine-tune the model on our dataset, we just have to call the `train()` method of our `Trainer`:

```py
trainer.train()
```

This will start the fine-tuning (which should take a couple of minutes on a GPU) and report the training loss every 500 steps. It won't, however, tell you how well (or badly) your model is performing. This is because:

1. We didn't tell the `Trainer` to evaluate during training by setting `eval_strategy` in `TrainingArguments` to either `"steps"` (evaluate every `eval_steps`) or `"epoch"` (evaluate at the end of each epoch).
2. We didn't provide the `Trainer` with a `compute_metrics()` function to calculate a metric during said evaluation (otherwise the evaluation would just have printed the loss, which is not a very intuitive number).

##### Evaluation

Let's see how we can build a useful `compute_metrics()` function and use it the next time we train. The function must take an `EvalPrediction` object (which is a named tuple with a `predictions` field and a `label_ids` field) and will return a dictionary mapping strings to floats (the strings being the names of the metrics returned, and the floats their values). To get some predictions from our model, we can use the `Trainer.predict()` command:

```py
predictions = trainer.predict(tokenized_datasets["validation"])
print(predictions.predictions.shape, predictions.label_ids.shape)
```

```python
(408, 2) (408,)
```

The output of the `predict()` method is another named tuple with three fields: `predictions`, `label_ids`, and `metrics`. The `metrics` field will just contain the loss on the dataset passed, as well as some time metrics (how long it took to predict, in total and on average). Once we complete our `compute_metrics()` function and pass it to the `Trainer`, that field will also contain the metrics returned by `compute_metrics()`.

As you can see, `predictions` is a two-dimensional array with shape 408 x 2 (408 being the number of elements in the dataset we used). Those are the logits for each element of the dataset we passed to `predict()` (as you saw in the [previous chapter](https://huggingface.co/course/chapter2), all Transformer models return logits). To transform them into predictions that we can compare to our labels, we need to take the index with the maximum value on the second axis:

```py
import numpy as np

preds = np.argmax(predictions.predictions, axis=-1)
```

We can now compare those `preds` to the labels. To build our `compute_metric()` function, we will rely on the metrics from the 🤗 [Evaluate](https://github.com/huggingface/evaluate/) library. We can load the metrics associated with the MRPC dataset as easily as we loaded the dataset, this time with the `evaluate.load()` function. The object returned has a `compute()` method we can use to do the metric calculation:

```py
import evaluate

metric = evaluate.load("glue", "mrpc")
metric.compute(predictions=preds, references=predictions.label_ids)
```

```python
{'accuracy': 0.8578431372549019, 'f1': 0.8996539792387542}
```

> **Tip:**
> Learn about different evaluation metrics and strategies in the [🤗 Evaluate documentation](https://huggingface.co/docs/evaluate/).

The exact results you get may vary, as the random initialization of the model head might change the metrics it achieved. Here, we can see our model has an accuracy of 85.78% on the validation set and an F1 score of 89.97. Those are the two metrics used to evaluate results on the MRPC dataset for the GLUE benchmark. The table in the [BERT paper](https://arxiv.org/pdf/1810.04805.pdf) reported an F1 score of 88.9 for the base model. That was the `uncased` model while we are currently using the `cased` model, which explains the better result.

Wrapping everything together, we get our `compute_metrics()` function:

```py
def compute_metrics(eval_preds):
    metric = evaluate.load("glue", "mrpc")
    logits, labels = eval_preds
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)
```

And to see it used in action to report metrics at the end of each epoch, here is how we define a new `Trainer` with this `compute_metrics()` function:

```py
training_args = TrainingArguments("test-trainer", eval_strategy="epoch")
model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)

trainer = Trainer(
    model,
    training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    data_collator=data_collator,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
)
```

Note that we create a new `TrainingArguments` with its `eval_strategy` set to `"epoch"` and a new model — otherwise, we would just be continuing the training of the model we have already trained. To launch a new training run, we execute:

```py
trainer.train()
```

This time, it will report the validation loss and metrics at the end of each epoch on top of the training loss. Again, the exact accuracy/F1 score you reach might be a bit different from what we found, because of the random head initialization of the model, but it should be in the same ballpark.

##### Advanced Training Features

The `Trainer` comes with many built-in features that make modern deep learning best practices accessible:

**Mixed Precision Training**: Use `fp16=True` in your training arguments for faster training and reduced memory usage:

```py
training_args = TrainingArguments(
    "test-trainer",
    eval_strategy="epoch",
    fp16=True,  # Enable mixed precision
)
```

**Gradient Accumulation**: For effective larger batch sizes when GPU memory is limited:

```py
training_args = TrainingArguments(
    "test-trainer",
    eval_strategy="epoch",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,  # Effective batch size = 4 * 4 = 16
)
```

**Learning Rate Scheduling**: The Trainer uses linear decay by default, but you can customize this:

```py
training_args = TrainingArguments(
    "test-trainer",
    eval_strategy="epoch",
    learning_rate=2e-5,
    lr_scheduler_type="cosine",  # Try different schedulers
)
```

> **Tip:**
> 🎯 **Performance Optimization**: For more advanced training techniques including distributed training, memory optimization, and hardware-specific optimizations, explore the [🤗 Transformers performance guide](https://huggingface.co/docs/transformers/main/en/performance).

The `Trainer` will work out of the box on multiple GPUs or TPUs and provides lots of options for distributed training. We will go over everything it supports in Chapter 10.

This concludes the introduction to fine-tuning using the `Trainer` API. An example of doing this for most common NLP tasks will be given in [Chapter 7](https://huggingface.co/course/chapter7), but for now let's look at how to do the same thing with a pure PyTorch training loop.

> **Tip:**
> 📝 **More Examples**: Check out the comprehensive collection of [🤗 Transformers notebooks](https://huggingface.co/docs/transformers/main/en/notebooks).

#### Section Quiz

Test your understanding of the Trainer API and fine-tuning concepts:

##### 1. What is the purpose of the <code>processing_class</code> parameter in the Trainer?

##### 2. Which TrainingArguments parameter controls how often evaluation occurs during training?

##### 3. What does <code>fp16=True</code> in TrainingArguments enable?

##### 4. What is the role of the <code>compute_metrics</code> function in the Trainer?

##### 5. What happens when you don't provide an <code>eval_dataset</code> to the Trainer?

##### 6. What is gradient accumulation and how do you enable it?

> **Tip:**
> 💡 **Key Takeaways:**
> - The `Trainer` API provides a high-level interface that handles most training complexity
> - Use `processing_class` to specify your tokenizer for proper data handling
> - `TrainingArguments` controls all aspects of training: learning rate, batch size, evaluation strategy, and optimizations
> - `compute_metrics` enables custom evaluation metrics beyond just training loss
> - Modern features like mixed precision (`fp16=True`) and gradient accumulation can significantly improve training efficiency

## A Full Training Loop

> **Source:** [A Full Training Loop](https://huggingface.co/learn/llm-course/chapter3/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Now we'll see how to achieve the same results as we did in the last section without using the `Trainer` class, implementing a training loop from scratch with modern PyTorch best practices. Again, we assume you have done the data processing in section 2. Here is a short summary covering everything you will need:

> **Tip:**
> 🏗️ **Training from Scratch**: This section builds on the previous content. For comprehensive guidance on PyTorch training loops and best practices, check out the [🤗 Transformers training documentation](https://huggingface.co/docs/transformers/main/en/training#train-in-native-pytorch) and the [custom training cookbook](https://huggingface.co/learn/cookbook/en/fine_tuning_code_llm_on_single_gpu#model).

```py
from datasets import load_dataset
from transformers import AutoTokenizer, DataCollatorWithPadding

raw_datasets = load_dataset("glue", "mrpc")
checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)

def tokenize_function(example):
    return tokenizer(example["sentence1"], example["sentence2"], truncation=True)

tokenized_datasets = raw_datasets.map(tokenize_function, batched=True)
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
```

#### Prepare for training

Before actually writing our training loop, we will need to define a few objects. The first ones are the dataloaders we will use to iterate over batches. But before we can define those dataloaders, we need to apply a bit of postprocessing to our `tokenized_datasets`, to take care of some things that the `Trainer` did for us automatically. Specifically, we need to:

- Remove the columns corresponding to values the model does not expect (like the `sentence1` and `sentence2` columns).
- Rename the column `label` to `labels` (because the model expects the argument to be named `labels`).
- Set the format of the datasets so they return PyTorch tensors instead of lists.

Our `tokenized_datasets` has one method for each of those steps:

```py
tokenized_datasets = tokenized_datasets.remove_columns(["sentence1", "sentence2", "idx"])
tokenized_datasets = tokenized_datasets.rename_column("label", "labels")
tokenized_datasets.set_format("torch")
tokenized_datasets["train"].column_names
```

We can then check that the result only has columns that our model will accept:

```python
["attention_mask", "input_ids", "labels", "token_type_ids"]
```

Now that this is done, we can easily define our dataloaders:

```py
from torch.utils.data import DataLoader

train_dataloader = DataLoader(
    tokenized_datasets["train"], shuffle=True, batch_size=8, collate_fn=data_collator
)
eval_dataloader = DataLoader(
    tokenized_datasets["validation"], batch_size=8, collate_fn=data_collator
)
```

To quickly check there is no mistake in the data processing, we can inspect a batch like this:

```py
for batch in train_dataloader:
    break
{k: v.shape for k, v in batch.items()}
```

```python
{'attention_mask': torch.Size([8, 65]),
 'input_ids': torch.Size([8, 65]),
 'labels': torch.Size([8]),
 'token_type_ids': torch.Size([8, 65])}
```

Note that the actual shapes will probably be slightly different for you since we set `shuffle=True` for the training dataloader and we are padding to the maximum length inside the batch.

Now that we're completely finished with data preprocessing (a satisfying yet elusive goal for any ML practitioner), let's turn to the model. We instantiate it exactly as we did in the previous section:

```py
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
```

To make sure that everything will go smoothly during training, we pass our batch to this model:

```py
outputs = model(**batch)
print(outputs.loss, outputs.logits.shape)
```

```python
tensor(0.5441, grad_fn=<NllLossBackward>) torch.Size([8, 2])
```

All 🤗 Transformers models will return the loss when `labels` are provided, and we also get the logits (two for each input in our batch, so a tensor of size 8 x 2).

We're almost ready to write our training loop! We're just missing two things: an optimizer and a learning rate scheduler. Since we are trying to replicate what the `Trainer` was doing by hand, we will use the same defaults. The optimizer used by the `Trainer` is `AdamW`, which is the same as Adam, but with a twist for weight decay regularization (see ["Decoupled Weight Decay Regularization"](https://arxiv.org/abs/1711.05101) by Ilya Loshchilov and Frank Hutter):

```py
from torch.optim import AdamW

optimizer = AdamW(model.parameters(), lr=5e-5)
```

> **Tip:**
> 💡 **Modern Optimization Tips**: For even better performance, you can try:
> - **AdamW with weight decay**: `AdamW(model.parameters(), lr=5e-5, weight_decay=0.01)`
> - **8-bit Adam**: Use `bitsandbytes` for memory-efficient optimization
> - **Different learning rates**: Lower learning rates (1e-5 to 3e-5) often work better for large models
>
> 🚀 **Optimization Resources**: Learn more about optimizers and training strategies in the [🤗 Transformers optimization guide](https://huggingface.co/docs/transformers/main/en/performance#optimizer).

Finally, the learning rate scheduler used by default is just a linear decay from the maximum value (5e-5) to 0. To properly define it, we need to know the number of training steps we will take, which is the number of epochs we want to run multiplied by the number of training batches (which is the length of our training dataloader). The `Trainer` uses three epochs by default, so we will follow that:

```py
from transformers import get_scheduler

num_epochs = 3
num_training_steps = num_epochs * len(train_dataloader)
lr_scheduler = get_scheduler(
    "linear",
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=num_training_steps,
)
print(num_training_steps)
```

```python
1377
```

#### The training loop

One last thing: we will want to use the GPU if we have access to one (on a CPU, training might take several hours instead of a couple of minutes). To do this, we define a `device` we will put our model and our batches on:

```py
import torch

device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
model.to(device)
device
```

```python
device(type='cuda')
```

We are now ready to train! To get some sense of when training will be finished, we add a progress bar over our number of training steps, using the `tqdm` library:

```py
from tqdm.auto import tqdm

progress_bar = tqdm(range(num_training_steps))

model.train()
for epoch in range(num_epochs):
    for batch in train_dataloader:
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(**batch)
        loss = outputs.loss
        loss.backward()

        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()
        progress_bar.update(1)
```

> **Tip:**
> 💡 **Modern Training Optimizations**: To make your training loop even more efficient, consider:
>
> - **Gradient Clipping**: Add `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` before `optimizer.step()`
> - **Mixed Precision**: Use `torch.cuda.amp.autocast()` and `GradScaler` for faster training
> - **Gradient Accumulation**: Accumulate gradients over multiple batches to simulate larger batch sizes
> - **Checkpointing**: Save model checkpoints periodically to resume training if interrupted
>
> 🔧 **Implementation Guide**: For detailed examples of these optimizations, see the [🤗 Transformers efficient training guide](https://huggingface.co/docs/transformers/main/en/perf_train_gpu_one) and the [range of optimizers](https://huggingface.co/docs/transformers/main/en/optimizers).

You can see that the core of the training loop looks a lot like the one in the introduction. We didn't ask for any reporting, so this training loop will not tell us anything about how the model fares. We need to add an evaluation loop for that.

#### The evaluation loop

As we did earlier, we will use a metric provided by the 🤗 Evaluate library. We've already seen the `metric.compute()` method, but metrics can actually accumulate batches for us as we go over the prediction loop with the method `add_batch()`. Once we have accumulated all the batches, we can get the final result with `metric.compute()`. Here's how to implement all of this in an evaluation loop:

> **Tip:**
> 📊 **Evaluation Best Practices**: For more sophisticated evaluation strategies and metrics, explore the [🤗 Evaluate documentation](https://huggingface.co/docs/evaluate/) and the [comprehensive evaluation cookbook](https://github.com/huggingface/evaluation-guidebook).

```py
import evaluate

metric = evaluate.load("glue", "mrpc")
model.eval()
for batch in eval_dataloader:
    batch = {k: v.to(device) for k, v in batch.items()}
    with torch.no_grad():
        outputs = model(**batch)

    logits = outputs.logits
    predictions = torch.argmax(logits, dim=-1)
    metric.add_batch(predictions=predictions, references=batch["labels"])

metric.compute()
```

```python
{'accuracy': 0.8431372549019608, 'f1': 0.8907849829351535}
```

Again, your results will be slightly different because of the randomness in the model head initialization and the data shuffling, but they should be in the same ballpark.

> **Tip:**
> ✏️ **Try it out!** Modify the previous training loop to fine-tune your model on the SST-2 dataset.

#### Supercharge your training loop with 🤗 Accelerate

The training loop we defined earlier works fine on a single CPU or GPU. But using the [🤗 Accelerate](https://github.com/huggingface/accelerate) library, with just a few adjustments we can enable distributed training on multiple GPUs or TPUs. 🤗 Accelerate handles the complexity of distributed training, mixed precision, and device placement automatically. Starting from the creation of the training and validation dataloaders, here is what our manual training loop looks like:

> **Tip:**
> ⚡ **Accelerate Deep Dive**: Learn everything about distributed training, mixed precision, and hardware optimization in the [🤗 Accelerate documentation](https://huggingface.co/docs/accelerate/) and explore practical examples in the [transformers documentation](https://huggingface.co/docs/transformers/main/en/accelerate).

```py
from accelerate import Accelerator
from torch.optim import AdamW
from transformers import AutoModelForSequenceClassification, get_scheduler

accelerator = Accelerator()

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
optimizer = AdamW(model.parameters(), lr=3e-5)

train_dl, eval_dl, model, optimizer = accelerator.prepare(
    train_dataloader, eval_dataloader, model, optimizer
)

num_epochs = 3
num_training_steps = num_epochs * len(train_dl)
lr_scheduler = get_scheduler(
    "linear",
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=num_training_steps,
)

progress_bar = tqdm(range(num_training_steps))

model.train()
for epoch in range(num_epochs):
    for batch in train_dl:
        outputs = model(**batch)
        loss = outputs.loss
        accelerator.backward(loss)

        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()
        progress_bar.update(1)
```

The first line to add is the import line. The second line instantiates an `Accelerator` object that will look at the environment and initialize the proper distributed setup. 🤗 Accelerate handles the device placement for you, so you can remove the lines that put the model on the device (or, if you prefer, change them to use `accelerator.device` instead of `device`).

Then the main bulk of the work is done in the line that sends the dataloaders, the model, and the optimizer to `accelerator.prepare()`. This will wrap those objects in the proper container to make sure your distributed training works as intended. The remaining changes to make are removing the line that puts the batch on the `device` (again, if you want to keep this you can just change it to use `accelerator.device`) and replacing `loss.backward()` with `accelerator.backward(loss)`.

> **Tip:**
> ⚠️ In order to benefit from the speed-up offered by Cloud TPUs, we recommend padding your samples to a fixed length with the `padding="max_length"` and `max_length` arguments of the tokenizer.

If you'd like to copy and paste it to play around, here's what the complete training loop looks like with 🤗 Accelerate:

```py
from accelerate import Accelerator
from torch.optim import AdamW
from transformers import AutoModelForSequenceClassification, get_scheduler

accelerator = Accelerator()

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
optimizer = AdamW(model.parameters(), lr=3e-5)

train_dl, eval_dl, model, optimizer = accelerator.prepare(
    train_dataloader, eval_dataloader, model, optimizer
)

num_epochs = 3
num_training_steps = num_epochs * len(train_dl)
lr_scheduler = get_scheduler(
    "linear",
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=num_training_steps,
)

progress_bar = tqdm(range(num_training_steps))

model.train()
for epoch in range(num_epochs):
    for batch in train_dl:
        outputs = model(**batch)
        loss = outputs.loss
        accelerator.backward(loss)

        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()
        progress_bar.update(1)
```

Putting this in a `train.py` script will make that script runnable on any kind of distributed setup. To try it out in your distributed setup, run the command:

```bash
accelerate config
```

which will prompt you to answer a few questions and dump your answers in a configuration file used by this command:

```
accelerate launch train.py
```

which will launch the distributed training.

If you want to try this in a Notebook (for instance, to test it with TPUs on Colab), just paste the code in a `training_function()` and run a last cell with:

```python
from accelerate import notebook_launcher

notebook_launcher(training_function)
```

You can find more examples in the [🤗 Accelerate repo](https://github.com/huggingface/accelerate/tree/main/examples).

> **Tip:**
> 🌐 **Distributed Training**: For comprehensive coverage of multi-GPU and multi-node training, check out the [🤗 Transformers distributed training guide](https://huggingface.co/docs/transformers/main/en/perf_train_gpu_many) and the [scaling training cookbook](https://huggingface.co/docs/transformers/main/en/accelerate).

#### Next Steps and Best Practices

Now that you've learned how to implement training from scratch, here are some additional considerations for production use:

**Model Evaluation**: Always evaluate your model on multiple metrics, not just accuracy. Use the 🤗 Evaluate library for comprehensive evaluation.

**Hyperparameter Tuning**: Consider using libraries like Optuna or Ray Tune for systematic hyperparameter optimization.

**Model Monitoring**: Track training metrics, learning curves, and validation performance throughout training.

**Model Sharing**: Once trained, share your model on the Hugging Face Hub to make it available to the community.

**Efficiency**: For large models, consider techniques like gradient checkpointing, parameter-efficient fine-tuning (LoRA, AdaLoRA), or quantization methods.

This concludes our deep dive into fine-tuning with custom training loops. The skills you've learned here will serve you well when you need full control over the training process or want to implement custom training logic that goes beyond what the `Trainer` API offers.

### Section Quiz

Test your understanding of custom training loops and advanced training techniques:

#### 1. What is the main difference between Adam and AdamW optimizers?

#### 2. In a training loop, what is the correct order of operations?

#### 3. What does the 🤗 Accelerate library primarily help with?

#### 4. Why do we move batches to the device in a training loop?

#### 5. What does `model.eval()` do before evaluation?

#### 6. What is the purpose of `torch.no_grad()` during evaluation?

#### 7. What changes when you use 🤗 Accelerate in your training loop?

> **Tip:**
> 💡 **Key Takeaways:**
> - Manual training loops give you complete control but require understanding of the proper sequence: forward → backward → optimizer step → scheduler step → zero gradients
> - AdamW with weight decay is the recommended optimizer for transformer models
> - Always use `model.eval()` and `torch.no_grad()` during evaluation for correct behavior and efficiency
> - 🤗 Accelerate makes distributed training accessible with minimal code changes
> - Device management (moving tensors to GPU/CPU) is crucial for PyTorch operations
> - Modern techniques like mixed precision, gradient accumulation, and gradient clipping can significantly improve training efficiency

## Understanding Learning Curves

> **Source:** [Understanding Learning Curves](https://huggingface.co/learn/llm-course/chapter3/5) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Now that you've learned how to implement fine-tuning using both the `Trainer` API and custom training loops, it's crucial to understand how to interpret the results. Learning curves are invaluable tools that help you evaluate your model's performance during training and identify potential issues before they reduce performance.

In this section, we'll explore how to read and interpret accuracy and loss curves, understand what different curve shapes tell us about our model's behavior, and learn how to address common training issues.

### What are Learning Curves?

Learning curves are visual representations of your model's performance metrics over time during training. The two most important curves to monitor are:

- **Loss curves**: Show how the model's error (loss) changes over training steps or epochs
- **Accuracy curves**: Show the percentage of correct predictions over training steps or epochs

These curves help us understand whether our model is learning effectively and can guide us in making adjustments to improve performance. In Transformers, these metrics are individually computed for each batch and then logged to the disk. We can then use libraries like [Weights & Biases](https://wandb.ai/) to visualize these curves and track our model's performance over time.

#### Loss Curves

The loss curve shows how the model's error decreases over time. In a typical successful training run, you'll see a curve similar to the one below:

![Loss Curve](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/1.png)

- **High initial loss**: The model starts without optimization, so predictions are initially poor
- **Decreasing loss**: As training progresses, the loss should generally decrease
- **Convergence**: Eventually, the loss stabilizes at a low value, indicating that the model has learned the patterns in the data

As in previous chapters, we can use the `Trainer` API to track these metrics and visualize them in a dashboard. Below is an example of how to do this with Weights & Biases.

```python
# Example of tracking loss during training with the Trainer
from transformers import Trainer, TrainingArguments
import wandb

# Initialize Weights & Biases for experiment tracking
wandb.init(project="transformer-fine-tuning", name="bert-mrpc-analysis")

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="steps",
    eval_steps=50,
    save_steps=100,
    logging_steps=10,  # Log metrics every 10 steps
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    report_to="wandb",  # Send logs to Weights & Biases
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    data_collator=data_collator,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
)

# Train and automatically log metrics
trainer.train()
```

#### Accuracy Curves

The accuracy curve shows the percentage of correct predictions over time. Unlike loss curves, accuracy curves should generally increase as the model learns and can typically include more steps than the loss curve.

![Accuracy Curve](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/2.png)

- **Start low**: Initial accuracy should be low, as the model has not yet learned the patterns in the data
- **Increase with training**: Accuracy should generally improve as the model learns if it is able to learn the patterns in the data
- **May show plateaus**: Accuracy often increases in discrete jumps rather than smoothly, as the model makes predictions that are close to the true labels

> **Tip:**
> 💡 **Why Accuracy Curves Are "Steppy"**: Unlike loss, which is continuous, accuracy is calculated by comparing discrete predictions to true labels. Small improvements in model confidence might not change the final prediction, causing accuracy to remain flat until a threshold is crossed.

#### Convergence

Convergence occurs when the model's performance stabilizes and the loss and accuracy curves level off. This is a sign that the model has learned the patterns in the data and is ready to be used. In simple terms, we are aiming for the model to converge to a stable performance every time we train it.

![Convergence](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/4.png)

Once models have converged, we can use them to make predictions on new data and refer to evaluation metrics to understand how well the model is performing.

### Interpreting Learning Curve Patterns

Different curve shapes reveal different aspects of your model's training. Let's examine the most common patterns and what they mean.

#### Healthy Learning Curves

A well-behaved training run typically shows curve shapes similar to the one below:

![Healthy Loss Curve](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/5.png)

Let's look at the illustration above. It displays both the loss curve (on the left) and the corresponding accuracy curve (on the right). These curves have distinct characteristics.

The loss curve shows the value of the model's loss over time. Initially, the loss is high and then it gradually decreases, indicating that the model is improving. A decrease in the loss value suggests that the model is making better predictions, as the loss represents the error between the predicted output and the true output.

Now let's shift our focus to the accuracy curve. It represents the model's accuracy over time. The accuracy curve begins at a low value and increases as training progresses. Accuracy measures the proportion of correctly classified instances. So, as the accuracy curve rises, it signifies that the model is making more correct predictions.

One notable difference between the curves is the smoothness and the presence of "plateaus" on the accuracy curve. While the loss decreases smoothly, the plateaus on the accuracy curve indicate discrete jumps in accuracy instead of a continuous increase. This behavior is attributed to how accuracy is measured. The loss can improve if the model's output gets closer to the target, even if the final prediction is still incorrect. Accuracy, however, only improves when the prediction crosses the threshold to be correct.

For example, in a binary classifier distinguishing cats (0) from dogs (1), if the model predicts 0.3 for an image of a dog (true value 1), this is rounded to 0 and is an incorrect classification. If in the next step it predicts 0.4, it's still incorrect. The loss will have decreased because 0.4 is closer to 1 than 0.3, but the accuracy remains unchanged, creating a plateau. The accuracy will only jump up when the model predicts a value greater than 0.5 that gets rounded to 1.

> **Tip:**
> **Characteristics of healthy curves:**
> - **Smooth decline in loss**: Both training and validation loss decrease steadily
> - **Close training/validation performance**: Small gap between training and validation metrics
> - **Convergence**: Curves level off, indicating the model has learned the patterns

#### Practical Examples

Let's work through some practical examples of learning curves. First, we will highlight some approaches to monitor the learning curves during training. Below, we will break down the different patterns that can be observed in the learning curves.

##### During Training

During the training process (after you've hit `trainer.train()`), you can monitor these key indicators:

1. **Loss convergence**: Is the loss still decreasing or has it plateaued?
2. **Overfitting signs**: Is validation loss starting to increase while training loss decreases?
3. **Learning rate**: Are the curves too erratic (LR too high) or too flat (LR too low)?
4. **Stability**: Are there sudden spikes or drops that indicate problems?

##### After Training

After the training process is complete, you can analyze the complete curves to understand the model's performance.

1. **Final performance**: Did the model reach acceptable performance levels?
2. **Efficiency**: Could the same performance be achieved with fewer epochs?
3. **Generalization**: How close are training and validation performance?
4. **Trends**: Would additional training likely improve performance?

> **Tip:**
> 🔍 **W&B Dashboard Features**: Weights & Biases automatically creates beautiful, interactive plots of your learning curves. You can:
> - Compare multiple runs side by side
> - Add custom metrics and visualizations
> - Set up alerts for anomalous behavior
> - Share results with your team
>
> Learn more in the [Weights & Biases documentation](https://docs.wandb.ai/).

##### Overfitting

Overfitting occurs when the model learns too much from the training data and is unable to generalize to different data (represented by the validation set).

![Overfitting](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/10.png)

**Symptoms:**

- Training loss continues to decrease while validation loss increases or plateaus
- Large gap between training and validation accuracy
- Training accuracy much higher than validation accuracy

**Solutions for overfitting:**
- **Regularization**: Add dropout, weight decay, or other regularization techniques
- **Early stopping**: Stop training when validation performance stops improving
- **Data augmentation**: Increase training data diversity
- **Reduce model complexity**: Use a smaller model or fewer parameters

In the sample below, we use early stopping to prevent overfitting. We set the `early_stopping_patience` to 3, which means that if the validation loss does not improve for 3 consecutive epochs, the training will be stopped.

```python
# Example of detecting overfitting with early stopping
from transformers import EarlyStoppingCallback

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="steps",
    eval_steps=100,
    save_strategy="steps",
    save_steps=100,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    num_train_epochs=10,  # Set high, but we'll stop early
)

# Add early stopping to prevent overfitting
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    data_collator=data_collator,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
)
```

##### 2. Underfitting

Underfitting occurs when the model is too simple to capture the underlying patterns in the data. This can happen for several reasons:

- The model is too small or lacks capacity to learn the patterns
- The learning rate is too low, causing slow learning
- The dataset is too small or not representative of the problem
- The model is not properly regularized

![Underfitting](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/7.png)

**Symptoms:**
- Both training and validation loss remain high
- Model performance plateaus early in training
- Training accuracy is lower than expected

**Solutions for underfitting:**
- **Increase model capacity**: Use a larger model or more parameters
- **Train longer**: Increase the number of epochs
- **Adjust learning rate**: Try different learning rates
- **Check data quality**: Ensure your data is properly preprocessed

In the sample below, we train for more epochs to see if the model can learn the patterns in the data.

```python
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    -num_train_epochs=5,
    +num_train_epochs=10,
)
```

##### 3. Erratic Learning Curves

Erratic learning curves occur when the model is not learning effectively. This can happen for several reasons:

- The learning rate is too high, causing the model to overshoot the optimal parameters
- The batch size is too small, causing the model to learn slowly
- The model is not properly regularized, causing it to overfit to the training data
- The dataset is not properly preprocessed, causing the model to learn from noise

![Erratic Learning Curves](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/3.png)

**Symptoms:**
- Frequent fluctuations in loss or accuracy
- Curves show high variance or instability
- Performance oscillates without clear trend

Both training and validation curves show erratic behavior.

![Erratic Learning Curves](https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter3/9.png)

**Solutions for erratic curves:**
- **Lower learning rate**: Reduce step size for more stable training
- **Increase batch size**: Larger batches provide more stable gradients
- **Gradient clipping**: Prevent exploding gradients
- **Better data preprocessing**: Ensure consistent data quality

In the sample below, we lower the learning rate and increase the batch size.

```python
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    -learning_rate=1e-5,
    +learning_rate=1e-4,
    -per_device_train_batch_size=16,
    +per_device_train_batch_size=32,
)
```

### Key Takeaways

Understanding learning curves is crucial for becoming an effective machine learning practitioner. These visual tools provide immediate feedback about your model's training progress and help you make informed decisions about when to stop training, adjust hyperparameters, or try different approaches. With practice, you'll develop an intuitive understanding of what healthy learning curves look like and how to address issues when they arise.

> **Tip:**
> 💡 **Key Takeaways:**
> - Learning curves are essential tools for understanding model training progress
> - Monitor both loss and accuracy curves, but remember they have different characteristics
> - Overfitting shows as diverging training/validation performance
> - Underfitting shows as poor performance on both training and validation data
> - Tools like Weights & Biases make it easy to track and analyze learning curves
> - Early stopping and proper regularization can address most common training issues
>
> 🔬 **Next Steps**: Practice analyzing learning curves on your own fine-tuning experiments. Try different hyperparameters and observe how they affect the curve shapes. This hands-on experience is the best way to develop intuition for reading training progress.

### Section Quiz

Test your understanding of learning curves and training analysis:

#### 1. What does it typically mean when training loss decreases but validation loss starts increasing?

#### 2. Why do accuracy curves often show a "steppy" or plateau-like pattern rather than smooth increases?

#### 3. What is the best approach when you observe erratic, highly fluctuating learning curves?

#### 4. When should you consider using early stopping?

#### 5. What indicates that your model might be underfitting?

## Chat Templates

> **Source:** [Chat Templates](https://huggingface.co/learn/llm-course/chapter11/2) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Chat Templates

#### Introduction

Chat templates are essential for structuring interactions between language models and users. Whether you're building a simple chatbot or a complex AI agent, understanding how to properly format your conversations is crucial for getting the best results from your model. In this guide, we'll explore what chat templates are, why they matter, and how to use them effectively.

> **Tip:**
> Chat templates are crucial for:
> - Maintaining consistent conversation structure
> - Ensuring proper role identification
> - Managing context across multiple turns
> - Supporting advanced features like tool use

#### Model Types and Templates

##### Base Models vs Instruct Models
A base model is trained on raw text data to predict the next token, while an instruct model is fine-tuned specifically to follow instructions and engage in conversations. For example, [`SmolLM2-135M`](https://huggingface.co/HuggingFaceTB/SmolLM2-135M) is a base model, while [`SmolLM2-135M-Instruct`](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct) is its instruction-tuned variant.

Instruction tuned models are trained to follow a specific conversational structure, making them more suitable for chatbot applications. Moreover, instruct models can handle complex interactions, including tool use, multimodal inputs, and function calling.

To make a base model behave like an instruct model, we need to format our prompts in a consistent way that the model can understand. This is where chat templates come in. ChatML is one such template format that structures conversations with clear role indicators (system, user, assistant). Here's a guide on [ChatML](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct/blob/e2c3f7557efbdec707ae3a336371d169783f1da1/tokenizer_config.json#L146).

> **Warning:**
> When using an instruct model, always verify you're using the correct chat template format. Using the wrong template can result in poor model performance or unexpected behavior. The easiest way to ensure this is to check the model tokenizer configuration on the Hub. For example, the `SmolLM2-135M-Instruct` model uses <a href="https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct/blob/e2c3f7557efbdec707ae3a336371d169783f1da1/tokenizer_config.json#L146">this configuration</a>.

##### Common Template Formats

Before diving into specific implementations, it's important to understand how different models expect their conversations to be formatted. Let's explore some common template formats using a simple example conversation:

We'll use the following conversation structure for all examples:

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi! How can I help you today?"},
    {"role": "user", "content": "What's the weather?"},
]
```

This is the ChatML template used in models like SmolLM2 and Qwen 2:

```sh
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
Hello!<|im_end|>
<|im_start|>assistant
Hi! How can I help you today?<|im_end|>
<|im_start|>user
What's the weather?<|im_start|>assistant
```

This is using the `mistral` template format:

```sh
<s>[INST] You are a helpful assistant. [/INST]
Hi! How can I help you today?</s>
[INST] Hello! [/INST]
```

Key differences between these formats include:
1. **System Message Handling**:
   - Llama 2 wraps system messages in `<>` tags
   - Llama 3 uses `<|system|>` tags with `</s>` endings
   - Mistral includes system message in the first instruction
   - Qwen uses explicit `system` role with `<|im_start|>` tags
   - ChatGPT uses `SYSTEM:` prefix

2. **Message Boundaries**:
   - Llama 2 uses `[INST]` and `[/INST]` tags
   - Llama 3 uses role-specific tags (`<|system|>`, `<|user|>`, `<|assistant|>`) with `</s>` endings
   - Mistral uses `[INST]` and `[/INST]` with `<s>` and `</s>`
   - Qwen uses role-specific start/end tokens

3. **Special Tokens**:
   - Llama 2 uses `<s>` and `</s>` for conversation boundaries
   - Llama 3 uses `</s>` to end each message
   - Mistral uses `<s>` and `</s>` for turn boundaries
   - Qwen uses role-specific start/end tokens

Understanding these differences is key to working with various models. Let's look at how the transformers library helps us handle these variations automatically:

```python
from transformers import AutoTokenizer

# These will use different templates automatically
mistral_tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1")
qwen_tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen-7B-Chat")
smol_tokenizer = AutoTokenizer.from_pretrained("HuggingFaceTB/SmolLM2-135M-Instruct")

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
]

# Each will format according to its model's template
mistral_chat = mistral_tokenizer.apply_chat_template(messages, tokenize=False)
qwen_chat = qwen_tokenizer.apply_chat_template(messages, tokenize=False)
smol_chat = smol_tokenizer.apply_chat_template(messages, tokenize=False)
```

<details>
<summary>Click to see template examples</summary>

Qwen 2 and SmolLM2 ChatML template:

```sh
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
Hello!<|im_end|>
<|im_start|>assistant
Hi! How can I help you today?<|im_end|>
<|im_start|>user
What's the weather?<|im_start|>assistant
```

Mistral template:

```sh
<s>[INST] You are a helpful assistant. [/INST]
Hi! How can I help you today?</s>
[INST] Hello! [/INST]
```

</details>

##### Advanced Features
Chat templates can handle more complex scenarios beyond just conversational interactions, including:

1. **Tool Use**: When models need to interact with external tools or APIs
2. **Multimodal Inputs**: For handling images, audio, or other media types
3. **Function Calling**: For structured function execution
4. **Multi-turn Context**: For maintaining conversation history

> **Tip:**
> When implementing advanced features:
> - Test thoroughly with your specific model. Vision and tool use template are particularly diverse.
> - Monitor token usage carefully between each feature and model.
> - Document the expected format for each feature

For multimodal conversations, chat templates can include image references or base64-encoded images:

```python
messages = [
    {
        "role": "system",
        "content": "You are a helpful vision assistant that can analyze images.",
    },
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image", "image_url": "https://example.com/image.jpg"},
        ],
    },
]
```

Here's an example of a chat template with tool use:

```python
messages = [
    {
        "role": "system",
        "content": "You are an AI assistant that can use tools. Available tools: calculator, weather_api",
    },
    {"role": "user", "content": "What's 123 * 456 and is it raining in Paris?"},
    {
        "role": "assistant",
        "content": "Let me help you with that.",
        "tool_calls": [
            {
                "tool": "calculator",
                "parameters": {"operation": "multiply", "x": 123, "y": 456},
            },
            {"tool": "weather_api", "parameters": {"city": "Paris", "country": "France"}},
        ],
    },
    {"role": "tool", "tool_name": "calculator", "content": "56088"},
    {
        "role": "tool",
        "tool_name": "weather_api",
        "content": "{'condition': 'rain', 'temperature': 15}",
    },
]
```

#### Best Practices

##### General Guidelines
When working with chat templates, follow these key practices:

1. **Consistent Formatting**: Always use the same template format throughout your application
2. **Clear Role Definition**: Clearly specify roles (system, user, assistant, tool) for each message
3. **Context Management**: Be mindful of token limits when maintaining conversation history
4. **Error Handling**: Include proper error handling for tool calls and multimodal inputs
5. **Validation**: Validate message structure before sending to the model

> **Warning:**
> Common pitfalls to avoid:
> - Mixing different template formats in the same application
> - Exceeding token limits with long conversation histories
> - Not properly escaping special characters in messages
> - Forgetting to validate input message structure
> - Ignoring model-specific template requirements

#### Hands-on Exercise

Let's practice implementing chat templates with a real-world example.

> **Tip:**
> Follow these steps to convert the `HuggingFaceTB/smoltalk` dataset into chatml format:
>
> 1. Load the dataset:
> ```python
> from datasets import load_dataset
>
> dataset = load_dataset("HuggingFaceTB/smoltalk")
> ```
>
> 2. Create a processing function:
> ```python
> def convert_to_chatml(example):
>     return {
>         "messages": [
>             {"role": "user", "content": example["input"]},
>             {"role": "assistant", "content": example["output"]},
>         ]
>     }
> ```
>
> 3. Apply the chat template using your chosen model's tokenizer
>
> Remember to validate your output format matches your target model's requirements!

#### Additional Resources

- [Hugging Face Chat Templating Guide](https://huggingface.co/docs/transformers/main/en/chat_templating)
- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [Chat Templates Examples Repository](https://github.com/chujiezheng/chat_templates)

## Fine-Tuning with SFTTrainer

> **Source:** [Fine-Tuning with SFTTrainer](https://huggingface.co/learn/llm-course/chapter11/3) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### Supervised Fine-Tuning

Supervised Fine-Tuning (SFT) is a process primarily used to adapt pre-trained language models to follow instructions, engage in dialogue, and use specific output formats. While pre-trained models have impressive general capabilities, SFT helps transform them into assistant-like models that can better understand and respond to user prompts. This is typically done by training on datasets of human-written conversations and instructions.

This page provides a step-by-step guide to fine-tuning the [`deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B) model using the [`SFTTrainer`](https://huggingface.co/docs/trl/en/sft_trainer). By following these steps, you can adapt the model to perform specific tasks more effectively.

#### When to Use SFT

Before diving into implementation, it's important to understand when SFT is the right choice for your project. As a first step, you should consider whether using an existing instruction-tuned model with well-crafted prompts would suffice for your use case. SFT involves significant computational resources and engineering effort, so it should only be pursued when prompting existing models proves insufficient.

> **Tip:**
> Consider SFT only if you:
> - Need additional performance beyond what prompting can achieve
> - Have a specific use case where the cost of using a large general-purpose model outweighs the cost of fine-tuning a smaller model
> - Require specialized output formats or domain-specific knowledge that existing models struggle with

If you determine that SFT is necessary, the decision to proceed depends on two primary factors:

##### Template Control
SFT allows precise control over the model's output structure. This is particularly valuable when you need the model to:
1. Generate responses in a specific chat template format
2. Follow strict output schemas
3. Maintain consistent styling across responses

##### Domain Adaptation
When working in specialized domains, SFT helps align the model with domain-specific requirements by:
1. Teaching domain terminology and concepts
2. Enforcing professional standards
3. Handling technical queries appropriately
4. Following industry-specific guidelines

> **Tip:**
> Before starting SFT, evaluate whether your use case requires:
> - Precise output formatting
> - Domain-specific knowledge
> - Consistent response patterns
> - Adherence to specific guidelines
>
> This evaluation will help determine if SFT is the right approach for your needs.

#### Dataset Preparation

The supervised fine-tuning process requires a task-specific dataset structured with input-output pairs. Each pair should consist of:
1. An input prompt
2. The expected model response
3. Any additional context or metadata

The quality of your training data is crucial for successful fine-tuning. Let's look at how to prepare and validate your dataset:

<iframe
  src="https://huggingface.co/datasets/HuggingFaceTB/smoltalk/embed/viewer/all/train?row=0"
  frameborder="0"
  width="100%"
  height="360px"
></iframe>

#### Training Configuration

The success of your fine-tuning depends heavily on choosing the right training parameters. Let's explore each important parameter and how to configure them effectively:

The SFTTrainer configuration requires consideration of several parameters that control the training process. Let's explore each parameter and their purpose:

1. **Training Duration Parameters**:
   - `num_train_epochs`: Controls total training duration
   - `max_steps`: Alternative to epochs, sets maximum number of training steps
   - More epochs allow better learning but risk overfitting

2. **Batch Size Parameters**:
   - `per_device_train_batch_size`: Determines memory usage and training stability
   - `gradient_accumulation_steps`: Enables larger effective batch sizes
   - Larger batches provide more stable gradients but require more memory

3. **Learning Rate Parameters**:
   - `learning_rate`: Controls size of weight updates
   - `warmup_ratio`: Portion of training used for learning rate warmup
   - Too high can cause instability, too low results in slow learning

4. **Monitoring Parameters**:
   - `logging_steps`: Frequency of metric logging
   - `eval_steps`: How often to evaluate on validation data
   - `save_steps`: Frequency of model checkpoint saves

> **Tip:**
> Start with conservative values and adjust based on monitoring:
> - Begin with 1-3 epochs
> - Use smaller batch sizes initially
> - Monitor validation metrics closely
> - Adjust learning rate if training is unstable

#### Implementation with TRL

Now that we understand the key components, let's implement the training with proper validation and monitoring. We will use the `SFTTrainer` class from the Transformers Reinforcement Learning (TRL) library, which is built on top of the `transformers` library. Here's a complete example using the TRL library:

```python
from datasets import load_dataset
from trl import SFTConfig, SFTTrainer
import torch

# Set device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load dataset
dataset = load_dataset("HuggingFaceTB/smoltalk", "all")

# Configure model and tokenizer
model_name = "HuggingFaceTB/SmolLM2-135M"
model = AutoModelForCausalLM.from_pretrained(pretrained_model_name_or_path=model_name).to(
    device
)
tokenizer = AutoTokenizer.from_pretrained(pretrained_model_name_or_path=model_name)
# Setup chat template
model, tokenizer = setup_chat_format(model=model, tokenizer=tokenizer)

# Configure trainer
training_args = SFTConfig(
    output_dir="./sft_output",
    max_steps=1000,
    per_device_train_batch_size=4,
    learning_rate=5e-5,
    logging_steps=10,
    save_steps=100,
    eval_strategy="steps",
    eval_steps=50,
)

# Initialize trainer
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    processing_class=tokenizer,
)

# Start training
trainer.train()
```

> **Tip:**
> When using a dataset with a "messages" field (like the example above), the SFTTrainer automatically applies the model's chat template, which it retrieves from the hub. This means you don't need any additional configuration to handle chat-style conversations - the trainer will format the messages according to the model's expected template format.

#### Packing the Dataset

The SFTTrainer supports example packing to optimize training efficiency. This feature allows multiple short examples to be packed into the same input sequence, maximizing GPU utilization during training. To enable packing, simply set `packing=True` in the SFTConfig constructor. When using packed datasets with `max_steps`, be aware that you may train for more epochs than expected depending on your packing configuration. You can customize how examples are combined using a formatting function - particularly useful when working with datasets that have multiple fields like question-answer pairs. For evaluation datasets, you can disable packing by setting `eval_packing=False` in the SFTConfig. Here's a basic example of customizing the packing configuration:

```python
# Configure packing
training_args = SFTConfig(packing=True)

trainer = SFTTrainer(model=model, train_dataset=dataset, args=training_args)

trainer.train()
```

When packing the dataset with multiple fields, you can define a custom formatting function to combine the fields into a single input sequence. This function should take a list of examples and return a dictionary with the packed input sequence. Here's an example of a custom formatting function:

```python
def formatting_func(example):
    text = f"### Question: {example['question']}\n ### Answer: {example['answer']}"
    return text

training_args = SFTConfig(packing=True)
trainer = SFTTrainer(
    "facebook/opt-350m",
    train_dataset=dataset,
    args=training_args,
    formatting_func=formatting_func,
)
```

#### Monitoring Training Progress

Effective monitoring is crucial for successful fine-tuning. Let's explore what to watch for during training:

##### Understanding Loss Patterns

Training loss typically follows three distinct phases:
1. Initial Sharp Drop: Rapid adaptation to new data distribution
2. Gradual Stabilization: Learning rate slows as model fine-tunes
3. Convergence: Loss values stabilize, indicating training completion

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/nlp_course_sft_loss_graphic.png" alt="SFTTrainer Training" />

##### Metrics to Monitor

Effective monitoring involves tracking quantitative metrics, and evaluating qualitative metrics. Available metrics are:

- Training loss
- Validation loss
- Learning rate progression
- Gradient norms

> **Warning:**
> Watch for these warning signs during training:
> 1. Validation loss increasing while training loss decreases (overfitting)
> 2. No significant improvement in loss values (underfitting)
> 3. Extremely low loss values (potential memorization)
> 4. Inconsistent output formatting (template learning issues)

##### The Path to Convergence

As training progresses, the loss curve should gradually stabilize. The key indicator of healthy training is a small gap between training and validation loss, suggesting
the model is learning generalizable patterns rather than memorizing specific examples. The absolute loss values will vary depending on your task and dataset.

##### Monitoring Training Progress

The graph above shows a typical training progression. Notice how both training and validation loss decrease sharply at first, then gradually level off. This pattern indicates the model is learning effectively while maintaining generalization ability.

##### Warning Signs to Watch For

Several patterns in the loss curves can indicate potential issues. Below we illustrate common warning signs and solutions that we can consider.

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/sft_loss_1.png" alt="SFTTrainer Training" />

If the validation loss decreases at a significantly slower rate than training loss, your model is likely overfitting to the training data. Consider:
- Reducing the training steps
- Increasing the dataset size
- Validating dataset quality and diversity

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/sft_loss_2.png" alt="SFTTrainer Training" />

If the loss doesn't show significant improvement, the model might be:
- Learning too slowly (try increasing the learning rate)
- Struggling with the task (check data quality and task complexity)
- Hitting architecture limitations (consider a different model)

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/sft_loss_3.png" alt="SFTTrainer Training" />

Extremely low loss values could suggest memorization rather than learning. This is particularly concerning if:
- The model performs poorly on new, similar examples
- The outputs lack diversity
- The responses are too similar to training examples

> **Warning:**
> Monitor both the loss values and the model's actual outputs during training. Sometimes the loss can look good while the model develops unwanted behaviors. Regular qualitative evaluation of the model's responses helps catch issues that metrics alone might miss.

We should note that the interpretation of the loss values we outline here is aimed on the most common case, and in fact, loss values can behave on various ways depending on the model, the dataset, the training parameters, etc. If you interested in exploring more about outlined patterns, you should check out this blog post by the people at [Fast AI](https://www.fast.ai/posts/2023-09-04-learning-jumps/).

#### Evaluation after SFT

In section [11.4](https://huggingface.co/en/chapter11/4) we will learn how to evaluate the model using benchmark datasets. For now, we will focus on the qualitative evaluation of the model.

After completing SFT, consider these follow-up actions:

1. Evaluate the model thoroughly on held-out test data
2. Validate template adherence across various inputs
3. Test domain-specific knowledge retention
4. Monitor real-world performance metrics

> **Tip:**
> Document your training process, including:
> - Dataset characteristics
> - Training parameters
> - Performance metrics
> - Known limitations
> This documentation will be valuable for future model iterations.

#### Quiz

##### 1. What parameters control the training duration in SFT?

##### 2. Which pattern in the loss curves indicates potential overfitting?

##### 3. What is gradient_accumulation_steps used for?

##### 4. What should you monitor during SFT training?

##### 5. What indicates healthy convergence during training?

#### 💐 Nice work!

You've learned how to fine-tune models using SFT! To continue your learning:
1. Try the notebook with different parameters
2. Experiment with other datasets
3. Contribute improvements to the course material

#### Additional Resources

- [TRL Documentation](https://huggingface.co/docs/trl)
- [SFT Examples Repository](https://github.com/huggingface/trl/blob/main/trl/scripts/sft.py)
- [Fine-tuning Best Practices](https://huggingface.co/docs/transformers/training)

## LoRA (Low-Rank Adaptation)

> **Source:** [LoRA (Low-Rank Adaptation)](https://huggingface.co/learn/llm-course/chapter11/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

### LoRA (Low-Rank Adaptation)

Fine-tuning large language models is a resource intensive process. LoRA is a technique that allows us to fine-tune large language models with a small number of parameters. It works by adding and optimizing smaller matrices to the attention weights, typically reducing trainable parameters by about 90%.

#### Understanding LoRA

LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that freezes the pre-trained model weights and injects trainable rank decomposition matrices into the model's layers. Instead of training all model parameters during fine-tuning, LoRA decomposes the weight updates into smaller matrices through low-rank decomposition, significantly reducing the number of trainable parameters while maintaining model performance. For example, when applied to GPT-3 175B, LoRA reduced trainable parameters by 10,000x and GPU memory requirements by 3x compared to full fine-tuning. You can read more about LoRA in the [LoRA paper](https://arxiv.org/pdf/2106.09685).

LoRA works by adding pairs of rank decomposition matrices to transformer layers, typically focusing on attention weights. During inference, these adapter weights can be merged with the base model, resulting in no additional latency overhead. LoRA is particularly useful for adapting large language models to specific tasks or domains while keeping resource requirements manageable.

#### Key advantages of LoRA

1. **Memory Efficiency**:
   - Only adapter parameters are stored in GPU memory
   - Base model weights remain frozen and can be loaded in lower precision
   - Enables fine-tuning of large models on consumer GPUs

2. **Training Features**:
   - Native PEFT/LoRA integration with minimal setup
   - Support for QLoRA (Quantized LoRA) for even better memory efficiency

3. **Adapter Management**:
   - Adapter weight saving during checkpoints
   - Features to merge adapters back into base model

#### Loading LoRA Adapters with PEFT

[PEFT](https://github.com/huggingface/peft) is a library that provides a unified interface for loading and managing PEFT methods, including LoRA. It allows you to easily load and switch between different PEFT methods, making it easier to experiment with different fine-tuning techniques.

Adapters can be loaded onto a pretrained model with `load_adapter()`, which is useful for trying out different adapters whose weights aren't merged. Set the active adapter weights with the `set_adapter()` function. To return the base model, you could use unload() to unload all of the LoRA modules. This makes it easy to switch between different task-specific weights.

```python
from peft import PeftModel, PeftConfig

config = PeftConfig.from_pretrained("ybelkada/opt-350m-lora")
model = AutoModelForCausalLM.from_pretrained(config.base_model_name_or_path)
lora_model = PeftModel.from_pretrained(model, "ybelkada/opt-350m-lora")
```

![lora_load_adapter](https://github.com/huggingface/smol-course/raw/main/v1/3_parameter_efficient_finetuning/images/lora_adapter.png)

#### Fine-tune LLM using `trl` and the `SFTTrainer` with LoRA

The [SFTTrainer](https://huggingface.co/docs/trl/sft_trainer) from `trl` provides integration with LoRA adapters through the [PEFT](https://huggingface.co/docs/peft/en/index) library. This means that we can fine-tune a model in the same way as we did with SFT, but use LoRA to reduce the number of parameters we need to train.

We'll use the `LoRAConfig` class from PEFT in our example. The setup requires just a few configuration steps:

1. Define the LoRA configuration (rank, alpha, dropout)
2. Create the SFTTrainer with PEFT config
3. Train and save the adapter weights

#### LoRA Configuration

Let's walk through the LoRA configuration and key parameters.

| Parameter | Description |
|-----------|-------------|
| `r` (rank) | Dimension of the low-rank matrices used for weight updates. Typically between 4-32. Lower values provide more compression but potentially less expressiveness. |
| `lora_alpha` | Scaling factor for LoRA layers, usually set to 2x the rank value. Higher values result in stronger adaptation effects. |
| `lora_dropout` | Dropout probability for LoRA layers, typically 0.05-0.1. Higher values help prevent overfitting during training. |
| `bias` | Controls training of bias terms. Options are "none", "all", or "lora_only". "none" is most common for memory efficiency. |
| `target_modules` | Specifies which model modules to apply LoRA to. Can be "all-linear" or specific modules like "q_proj,v_proj". More modules enable greater adaptability but increase memory usage. |

> **Tip:**
> When implementing PEFT methods, start with small rank values (4-8) for LoRA and monitor training loss. Use validation sets to prevent overfitting and compare results with full fine-tuning baselines when possible. The effectiveness of different methods can vary by task, so experimentation is key.

#### Using TRL with PEFT

PEFT methods can be combined with TRL for fine-tuning to reduce memory requirements. We can pass the  `LoraConfig` to the model when loading it.

```python
from peft import LoraConfig

# r: rank dimension for LoRA update matrices (smaller = more compression)
rank_dimension = 6
# lora_alpha: scaling factor for LoRA layers (higher = stronger adaptation)
lora_alpha = 8
# lora_dropout: dropout probability for LoRA layers (helps prevent overfitting)
lora_dropout = 0.05

peft_config = LoraConfig(
    r=rank_dimension,  # Rank dimension - typically between 4-32
    lora_alpha=lora_alpha,  # LoRA scaling factor - typically 2x rank
    lora_dropout=lora_dropout,  # Dropout probability for LoRA layers
    bias="none",  # Bias type for LoRA. the corresponding biases will be updated during training.
    target_modules="all-linear",  # Which modules to apply LoRA to
    task_type="CAUSAL_LM",  # Task type for model architecture
)
```

Above, we used `device_map="auto"` to automatically assign the model to the correct device. You can also manually assign the model to a specific device using `device_map={"": device_index}`.

We will also need to define the `SFTTrainer` with the LoRA configuration.

```python
# Create SFTTrainer with LoRA configuration
trainer = SFTTrainer(
    model=model,
    args=args,
    train_dataset=dataset["train"],
    peft_config=peft_config,  # LoRA configuration
    max_seq_length=max_seq_length,  # Maximum sequence length
    processing_class=tokenizer,
)
```

> **Tip:**
> ✏️ **Try it out!** Build on your fine-tuned model from the previous section, but fine-tune it with LoRA. Use the `HuggingFaceTB/smoltalk` dataset to fine-tune a `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` model, using the LoRA configuration we defined above.

#### Merging LoRA Adapters

After training with LoRA, you might want to merge the adapter weights back into the base model for easier deployment. This creates a single model with the combined weights, eliminating the need to load adapters separately during inference.

The merging process requires attention to memory management and precision. Since you'll need to load both the base model and adapter weights simultaneously, ensure sufficient GPU/CPU memory is available. Using `device_map="auto"` in `transformers` will find the correct device for the model based on your hardware.

Maintain consistent precision (e.g., float16) throughout the process, matching the precision used during training and saving the merged model in the same format for deployment.

#### Merging Implementation

After training a LoRA adapter, you can merge the adapter weights back into the base model. Here's how to do it:

```python
import torch
from transformers import AutoModelForCausalLM
from peft import PeftModel

# 1. Load the base model
base_model = AutoModelForCausalLM.from_pretrained(
    "base_model_name", torch_dtype=torch.float16, device_map="auto"
)

# 2. Load the PEFT model with adapter
peft_model = PeftModel.from_pretrained(
    base_model, "path/to/adapter", torch_dtype=torch.float16
)

# 3. Merge adapter weights with base model
merged_model = peft_model.merge_and_unload()
```

If you encounter size discrepancies in the saved model, ensure you're also saving the tokenizer:

```python
# Save both model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("base_model_name")
merged_model.save_pretrained("path/to/save/merged_model")
tokenizer.save_pretrained("path/to/save/merged_model")
```

> **Tip:**
> ✏️ **Try it out!** Merge the adapter weights back into the base model. Use the `HuggingFaceTB/smoltalk` dataset to fine-tune a `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` model, using the LoRA configuration we defined above.

### Resources

- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/pdf/2106.09685)
- [PEFT Documentation](https://huggingface.co/docs/peft)
- [Hugging Face blog post on PEFT](https://huggingface.co/blog/peft)

## Evaluating Fine-Tuned Models

> **Source:** [Evaluating Fine-Tuned Models](https://huggingface.co/learn/llm-course/chapter11/5) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

With a finetuned model through either SFT or LoRA SFT, we should evaluate it on standard benchmarks. As machine learning engineers you should maintain a suite of relevant evaluations for your targeted domain of interest. In this page, we will look at some of the most common benchmarks and how to use them to evaluate your model. We'll also look at how to create custom benchmarks for your specific use case.

#### Automatic Benchmarks

Automatic benchmarks serve as standardized tools for evaluating language models across different tasks and capabilities. While they provide a useful starting point for understanding model performance, it's important to recognize that they represent only one piece of a comprehensive evaluation strategy.

#### Understanding Automatic Benchmarks

Automatic benchmarks typically consist of curated datasets with predefined tasks and evaluation metrics. These benchmarks aim to assess various aspects of model capability, from basic language understanding to complex reasoning. The key advantage of using automatic benchmarks is their standardization - they allow for consistent comparison across different models and provide reproducible results.

However, it's crucial to understand that benchmark performance doesn't always translate directly to real-world effectiveness. A model that excels at academic benchmarks may still struggle with specific domain applications or practical use cases.

#### General Knowledge Benchmarks

[MMLU](https://huggingface.co/datasets/cais/mmlu) (Massive Multitask Language Understanding) tests knowledge across 57 subjects, from science to humanities. While comprehensive, it may not reflect the depth of expertise needed for specific domains. TruthfulQA evaluates a model's tendency to reproduce common misconceptions, though it can't capture all forms of misinformation.

#### Reasoning Benchmarks

[BBH](https://huggingface.co/datasets/lukaemon/bbh) (Big Bench Hard) and [GSM8K](https://huggingface.co/datasets/openai/gsm8k) focus on complex reasoning tasks. BBH tests logical thinking and planning, while GSM8K specifically targets mathematical problem-solving. These benchmarks help assess analytical capabilities but may not capture the nuanced reasoning required in real-world scenarios.

#### Language Understanding

[HELM](https://github.com/stanford-crfm/helm) provides a holistic evaluation framework. Benchmarks like HELM offer insights into language processing capabilities on aspects like commonsense, world knowledge, and reasoning. But may not fully represent the complexity of natural conversation or domain-specific terminology.

#### Domain-Specific Benchmarks

Let's look at a few benchmarks that focus on specific domains like math, coding, and chat.

The [MATH benchmark](https://huggingface.co/papers/2103.03874) is another important evaluation tool for mathematical reasoning. It consists of 12,500 problems from mathematics competitions, covering algebra, geometry, number theory, counting, probability, and more. What makes MATH particularly challenging is that it requires multi-step reasoning, formal mathematical notation understanding, and the ability to generate step-by-step solutions. Unlike simpler arithmetic tasks, MATH problems often demand sophisticated problem-solving strategies and mathematical concept applications.

The [HumanEval Benchmark](https://github.com/openai/human-eval) is a coding-focused evaluation dataset consisting of 164 programming problems. The benchmark tests a model's ability to generate functionally correct Python code that solves the given programming tasks. What makes HumanEval particularly valuable is that it evaluates both code generation capabilities and functional correctness through actual test case execution, rather than just superficial similarity to reference solutions. The problems range from basic string manipulation to more complex algorithms and data structures.

[Alpaca Eval](https://tatsu-lab.github.io/alpaca_eval/) is an automated evaluation framework designed to assess the quality of instruction-following language models. It uses GPT-4 as a judge to evaluate model outputs across various dimensions including helpfulness, honesty, and harmlessness. The framework includes a dataset of 805 carefully curated prompts and can evaluate responses against multiple reference models like Claude, GPT-4, and others. What makes Alpaca Eval particularly useful is its ability to provide consistent, scalable evaluations without requiring human annotators, while still capturing nuanced aspects of model performance that traditional metrics might miss.

#### Alternative Evaluation Approaches

Many organizations have developed alternative evaluation methods to address the limitations of standard benchmarks:

##### LLM-as-Judge

Using one language model to evaluate another's outputs has become increasingly popular. This approach can provide more nuanced feedback than traditional metrics, though it comes with its own biases and limitations.

##### Evaluation Arenas

Evaluation arenas like [Chatbot Arena](https://lmarena.ai/) offer a unique approach to LLM assessment through crowdsourced feedback. In these platforms, users engage in anonymous "battles" between two LLMs, asking questions and voting on which model provides better responses. This approach captures real-world usage patterns and preferences through diverse, challenging questions, with studies showing strong agreement between crowd-sourced votes and expert evaluations. While powerful, these platforms have limitations including potential user base bias, skewed prompt distributions, and a primary focus on helpfulness rather than safety considerations.

##### Custom Benchmark Suites

Organizations often develop internal benchmark suites tailored to their specific needs and use cases. These might include domain-specific knowledge tests or evaluation scenarios that mirror actual deployment conditions.

#### Custom Evaluation

While standard benchmarks provide a useful baseline, they shouldn't be your only evaluation method. Here's how to develop a more comprehensive approach:

1. Start with relevant standard benchmarks to establish a baseline and enable comparison with other models.

2. Identify the specific requirements and challenges of your use case. What tasks will your model actually perform? What kinds of errors would be most problematic?

3. Develop custom evaluation datasets that reflect your actual use case. This might include:
   - Real user queries from your domain
   - Common edge cases you've encountered
   - Examples of particularly challenging scenarios

4. Consider implementing a multi-layered evaluation strategy:
   - Automated metrics for quick feedback
   - Human evaluation for nuanced understanding
   - Domain expert review for specialized applications
   - A/B testing in controlled environments

#### Implementing Custom Evaluations

In this section, we will implement evaluation for our finetuned model. We can use [`lighteval`](https://github.com/huggingface/lighteval) to evaluate our finetuned model on standard benchmarks, which contains a wide range of tasks built into the library. We just need to define the tasks we want to evaluate and the parameters for the evaluation.

LightEval tasks are defined using a specific format:

```
{suite}|{task}|{num_few_shot}|{auto_reduce}
```

| Parameter | Description |
|-----------|-------------|
| `suite` | The benchmark suite (e.g., 'mmlu', 'truthfulqa') |
| `task` | Specific task within the suite (e.g., 'abstract_algebra') |
| `num_few_shot` | Number of examples to include in prompt (0 for zero-shot) |
| `auto_reduce` | Whether to automatically reduce few-shot examples if prompt is too long (0 or 1) |

Example: `"mmlu|abstract_algebra|0|0"` evaluates on MMLU's abstract algebra task with zero-shot inference.

#### Example Evaluation Pipeline

Let's set up an evaluation pipeline for our finetuned model. We will evaluate the model on  set of sub tasks that relate to the domain of medicine.

Here's a complete example of evaluating on automatic benchmarks relevant to one specific domain using Lighteval with the VLLM backend:

```bash
lighteval accelerate \
    "pretrained=your-model-name" \
    "mmlu|anatomy|0|0" \
    "mmlu|high_school_biology|0|0" \
    "mmlu|high_school_chemistry|0|0" \
    "mmlu|professional_medicine|0|0" \
    --max_samples 40 \
    --batch_size 1 \
    --output_path "./results" \
    --save_generations true
```

Results are displayed in a tabular format showing:

```
|                  Task                  |Version|Metric|Value |   |Stderr|
|----------------------------------------|------:|------|-----:|---|-----:|
|all                                     |       |acc   |0.3333|±  |0.1169|
|leaderboard:mmlu:_average:5             |       |acc   |0.3400|±  |0.1121|
|leaderboard:mmlu:anatomy:5              |      0|acc   |0.4500|±  |0.1141|
|leaderboard:mmlu:high_school_biology:5  |      0|acc   |0.1500|±  |0.0819|
```

Lighteval also include a python API for more detailed evaluation tasks, which is useful for manipulating the results in a more flexible way. Check out the [Lighteval documentation](https://huggingface.co/docs/lighteval/using-the-python-api) for more information.

> **Tip:**
> ✏️ **Try it out!** Evaluate your finetuned model on a specific task in lighteval.

### End-of-chapter quiz

##### 1. What are the main advantages of using automatic benchmarks for model evaluation?

##### 2. Which benchmark specifically tests knowledge across 57 different subjects?

##### 3. What is LLM-as-Judge?

##### 4. What should be included in a comprehensive evaluation strategy?

##### 5. What is a limitation of automatic benchmarks?

##### 6. What is the purpose of creating custom evaluation datasets?

## Reinforcement Learning on LLMs

> **Source:** [Reinforcement Learning on LLMs](https://huggingface.co/learn/llm-course/chapter12/2) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

Welcome to the first page!

We're going to start our journey into the exciting world of Reinforcement Learning (RL) and discover how it's revolutionizing the way we train Language Models like the ones you might use every day.

> **Tip:**
> In this chapter, we are focusing on reinforcement learning for language models. However, reinforcement learning is a broad field with many applications beyond language models. If you're interested in learning more about reinforcement learning, you should check out the [Deep Reinforcement Learning course](https://huggingface.co/courses/deep-rl-course/en/unit1/introduction).

This page will give you a friendly and clear introduction to RL, even if you've never encountered it before. We'll break down the core ideas and see why RL is becoming so important in the field of Large Language Models (LLMs).

### What is Reinforcement Learning (RL)?

Imagine you're training a dog. You want to teach it to sit. You might say "Sit!" and then, if the dog sits, you give it a treat and praise. If it doesn't sit, you might gently guide it or just try again. Over time, the dog learns to associate sitting with the positive reward (treat and praise) and is more likely to sit when you say "Sit!" again. In reinforcement learning, we refer to this feedback as a **reward**.

That, in a nutshell, is the basic idea behind Reinforcement Learning! Instead of a dog, we have a **language model** (in reinforcement learning, we call it an **agent**), and instead of you, we have the **environment** that gives feedback.

![RL terms Process](https://huggingface.co/reasoning-course/images/resolve/main/grpo/3.jpg)

Let's break down the key pieces of RL:

#### Agent

This is our learner. In the dog example, the dog is the agent. In the context of LLMs, the LLM itself becomes the agent we want to train. The agent is the one making decisions and learning from the environment and its rewards.

#### Environment

This is the world the agent lives in and interacts with. For the dog, the environment is your house and you. For an LLM, the environment is a bit more abstract – it could be the users it interacts with, or a simulated scenario we set up for it. The environment provides feedback to the agent.

#### Action

These are the choices the agent can make in the environment. The dog's actions are things like "sit", "stand", "bark", etc. For an LLM, actions could be generating words in a sentence, choosing which answer to give to a question, or deciding how to respond in a conversation.

#### Reward

This is the feedback the environment gives to the agent after it takes an action. Rewards are usually numbers.

**Positive rewards** are like treats and praise – they tell the agent "good job, you did something right!".

**Negative rewards** (or penalties) are like a gentle "no" – they tell the agent "that wasn't quite right, try something else". For the dog, the treat is the reward.

For an LLM, rewards are designed to reflect how well the LLM is doing at a specific task – maybe it's how helpful, truthful, or harmless its response is.

#### Policy

This is the agent's strategy for choosing actions. It's like the dog's understanding of what it should do when you say "Sit!". In RL, the policy is what we're really trying to learn and improve. It's a set of rules or a function that tells the agent what action to take in different situations. Initially, the policy might be random, but as the agent learns, the policy becomes better at choosing actions that lead to higher rewards.

### The RL Process: Trial and Error

![RL Process](https://huggingface.co/reasoning-course/images/resolve/main/grpo/1.jpg)

Reinforcement Learning happens through a process of trial and error:

| Step | Process | Description |
|------|---------|-------------|
| 1. Observation | The agent observes the environment | The agent takes in information about its current state and surroundings |
| 2. Action | The agent takes an action based on its current policy | Using its learned strategy (policy), the agent decides what to do next |
| 3. Feedback | The environment gives the agent a reward | The agent receives feedback on how good or bad its action was |
| 4. Learning | The agent updates its policy based on the reward | The agent adjusts its strategy - reinforcing actions that led to high rewards and avoiding those that led low rewards |
| 5. Iteration | Repeat the process | This cycle continues, allowing the agent to continuously improve its decision-making |

Think about learning to ride a bike. You might wobble and fall at first (negative reward!). But when you manage to balance and pedal smoothly, you feel good (positive reward!). You adjust your actions based on this feedback – leaning slightly, pedaling faster, etc. – until you learn to ride well. RL is similar – it's about learning through interaction and feedback.

### Role of RL in Large Language Models (LLMs)

Now, why is RL so important for Large Language Models?

Well, training really good LLMs is tricky. We can train them on massive amounts of text from the internet, and they become very good at predicting the next word in a sentence. This is how they learn to generate fluent and grammatically correct text, as we learned in [chapter 2](https://huggingface.co/course/chapter2/1).

However, just being fluent isn't enough. We want our LLMs to be more than just good at stringing words together. We want them to be:

* **Helpful:** Provide useful and relevant information.
* **Harmless:** Avoid generating toxic, biased, or harmful content.
* **Aligned with Human Preferences:** Respond in ways that humans find natural, helpful, and engaging.

Pre-training LLM methods, which mostly rely on predicting the next word from text data, sometimes fall short on these aspects.

Whilst supervised training is excellent at producing structured outputs, it can be less effective at producing helpful, harmless, and aligned responses. We explore supervised training in [chapter 11](https://huggingface.co/course/chapter11/1).

Fine-tuned models might generate fluent and structured text that is still factually incorrect, biased, or doesn't really answer the user's question in a helpful way.

**Enter Reinforcement Learning\!** RL gives us a way to fine-tune these pre-trained LLMs to better achieve these desired qualities. It's like giving our LLM dog extra training to become a well-behaved and helpful companion, not just a dog that knows how to bark fluently\!

### Reinforcement Learning from Human Feedback (RLHF)

A very popular technique for aligning language models is **Reinforcement Learning from Human Feedback (RLHF)**. In RLHF, we use human feedback as a proxy for the "reward" signal in RL. Here's how it works:

1. **Get Human Preferences:** We might ask humans to compare different responses generated by the LLM for the same input prompt and tell us which response they prefer. For example, we might show a human two different answers to the question "What is the capital of France?" and ask them "Which answer is better?".

2. **Train a Reward Model:** We use this human preference data to train a separate model called a **reward model**. This reward model learns to predict what kind of responses humans will prefer. It learns to score responses based on helpfulness, harmlessness, and alignment with human preferences.

3. **Fine-tune the LLM with RL:** Now we use the reward model as the environment for our LLM agent. The LLM generates responses (actions), and the reward model scores these responses (provides rewards). In essence, we're training the LLM to produce text that our reward model (which learned from human preferences) thinks is good.

![RL Basic Concept](https://huggingface.co/reasoning-course/images/resolve/main/grpo/2.jpg)

From a general perspective, let's look at the benefits of using RL in LLMs:

| Benefit | Description |
|---------|-------------|
| Improved Control | RL allows us to have more control over the kind of text LLMs generate. We can guide them to produce text that is more aligned with specific goals, like being helpful, creative, or concise. |
| Enhanced Alignment with Human Values | RLHF, in particular, helps us align LLMs with complex and often subjective human preferences. It's hard to write down rules for "what makes a good answer," but humans can easily judge and compare responses. RLHF lets the model learn from these human judgments. |
| Mitigating Undesirable Behaviors | RL can be used to reduce negative behaviors in LLMs, such as generating toxic language, spreading misinformation, or exhibiting biases. By designing rewards that penalize these behaviors, we can nudge the model to avoid them. |

Reinforcement Learning from Human Feedback has been used to train many of the most popular LLMs today, such as OpenAI's GPT-4, Google's Gemini, and DeepSeek's R1. There are a wide range of techniques for RLHF, with varying degrees of complexity and sophistication. In this chapter, we will focus on Group Relative Policy Optimization (GRPO), which is a technique for RLHF that has been shown to be effective at training LLMs that are helpful, harmless, and aligned with human preferences.

### Why should we care about GRPO (Group Relative Policy Optimization)?

There are many techniques for RLHF but this course is focused on GRPO because it represents a significant advancement in reinforcement learning for language models.

Let's briefly consider two of other popular techniques for RLHF:

- Proximal Policy Optimization (PPO)
- Direct Preference Optimization (DPO)

Proximal Policy Optimization (PPO) was one of the first highly effective techniques for RLHF. It uses a policy gradient method to update the policy based on the reward from a separate reward model.

Direct Preference Optimization (DPO) was later developed as a simpler technique that eliminates the need for a separate reward model using preference data directly. Essentially, framing the problem as a classification task between the chosen and rejected responses.

> **Tip:**
> DPO and PPO are complex reinforcement learning algorithms in their own right, which we will not cover in this course. If you're interested in learning more about them, you can check out the following resources:
>
> - [Proximal Policy Optimization](https://huggingface.co/docs/trl/main/en/ppo_trainer)
> - [Direct Preference Optimization](https://huggingface.co/docs/trl/main/en/dpo_trainer)

Unlike DPO and PPO, GRPO groups similar samples together and compares them as a group. The group-based approach provides more stable gradients and better convergence properties compared to other methods.

GRPO does not use preference data like DPO, but instead compares groups of similar samples using a reward signal from a model or function.

GRPO is flexible in how it obtains reward signals - it can work with a reward model (like PPO does) but doesn't strictly require one. This is because GRPO can incorporate reward signals from any function or model that can evaluate the quality of responses.

For example, we could use a length function to reward shorter responses, a mathematical solver to verify solution correctness, or a factual correctness function to reward responses that are more factually accurate. This flexibility makes GRPO particularly versatile for different types of alignment tasks.

---

Congratulations on completing Module 1\! You've now got a solid introduction to Reinforcement Learning and its crucial role in shaping the future of Large Language Models. You understand the basic concepts of RL, why it's used for LLMs, and you've been introduced to GRPO, a key algorithm in this field.

In the next module, we'll get our hands dirty and dive into the DeepSeek R1 paper to see these concepts in action\!

### Quiz

#### 1. What are the key components of Reinforcement Learning?

#### 2. What is the main advantage of RLHF for training language models?

#### 3. In the context of RL for LLMs, what represents an "action"?

#### 4. What is the role of the reward in RL training of language models?

#### 5. What is a reward in the context of RL for LLMs?

## The Aha Moment in DeepSeek R1

> **Source:** [The Aha Moment in DeepSeek R1](https://huggingface.co/learn/llm-course/chapter12/3) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

This chapter is a crash course paper reading. We will walk through the paper in simple terms, and then we will break down the key concepts and takeaways.

DeepSeek R1 represents a significant advancement in language model training, particularly in developing reasoning capabilities through reinforcement learning. The paper introduces a new reinforcement learning algorithm called Group Relative Policy Optimization (GRPO).

![DeepSeek R1 Overview](https://huggingface.co/reasoning-course/images/resolve/main/grpo/4.png)

In the next chapter, we will build on this knowledge and implement GRPO in practice.

The initial goal of the paper was to explore whether pure reinforcement learning could develop reasoning capabilities without supervised fine-tuning.

> **Tip:**
> Up until that point, all the popular LLMs required some supervised fine-tuning, which we explored in [chapter 11](https://huggingface.co/course/chapter11/1).

### The Breakthrough 'Aha' Moment

![The 'Aha Moment'](https://huggingface.co/reasoning-course/images/resolve/main/grpo/9.png)

One of the most remarkable discoveries in R1-Zero's training was the emergence of a phenomenon known as the "Aha Moment." This phenomenon is somewhat similar to how humans experience sudden realizations while problem-solving. Here's how it works:

1. Initial Attempt: The model makes an initial attempt at solving a problem
2. Recognition: It recognizes potential errors or inconsistencies
3. Self-Correction: It adjusts its approach based on this recognition
4. Explanation: It can explain why the new approach is better

This breakthrough resonates with learners and feels like a "Eureka" moment. It demonstrates learning rather than mere memorization, so let's take a moment to imagine what it feels like to have an "Aha" moment.

For example, imagine you're trying to solve a puzzle:
- First try: "This piece should go here based on the color"
- Recognition: "But wait, the shape doesn't quite fit"
- Correction: "Ah, it actually belongs over there"
- Explanation: "Because both the color and shape pattern match in this position"

This ability emerged naturally from RL training, without being explicitly programmed, demonstrating learning rather than mere memorization of a process from the training data.

The easiest way to understand the 'Aha' moment is to see it in action. Let's take a look at an example. In the chat below, we ask the model to solve a problem and the UI shows the model's thought process as it solves the problem.

<iframe
    src="https://reasoning-course-deepseek-ai-deepseek-r1-distill-0f5fad4.hf.space/"
	frameborder="0"
	width="850"
	height="450"
></iframe>

If you want to try Deepseek's R1, you can also check out [Hugging Chat](https://huggingface.co/chat/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B).

### The Training Process

Training R1 was a multi-phase process. Let's break down the phases and the key innovations in each phase.

The final process results in two models:
- DeepSeek-R1-Zero: A model trained purely using reinforcement learning.
- DeepSeek-R1: A model that builds on the foundation of DeepSeek-R1-Zero and adds supervised fine-tuning.

| Feature | DeepSeek-R1-Zero | DeepSeek-R1 |
|---------|------------------|--------------|
| Training Approach | Pure RL | Multi-phase (SFT + RL) |
| Fine-tuning | None | Supervised fine-tuning |
| Reasoning Capability | Emergent | Enhanced |
| AIME Performance | 71.0% | 79.8% |
| Key Characteristics | Strong reasoning but readability issues | Better language consistency and readability |

While DeepSeek-R1-Zero demonstrates the potential of pure reinforcement learning for developing reasoning capabilities, DeepSeek-R1 builds upon this foundation with a more balanced approach that prioritizes both reasoning performance and usability.

The training process involves four phases:

1. Cold Start Phase
2. Reasoning RL Phase
3. Rejection Sampling Phase
4. Diverse RL Phase

Let's break down each phase:

#### Cold Start Phase (Quality Foundation)

![Cold Start Phase](https://huggingface.co/reasoning-course/images/resolve/main/grpo/5.png)

This phase is designed to establish a strong foundation for the model's readability and response quality. It uses a small dataset of high-quality samples from R1-Zero to fine-tune the V3-Base model. Starting with the DeepSeek-V3-Base model, the team used thousands of validated, high-quality samples from R1-Zero for supervised fine-tuning. This innovative approach uses a small but high quality dataset to establish strong baseline readability and response quality.

#### Reasoning RL Phase (Capability Building)

![Reasoning RL Phase](https://huggingface.co/reasoning-course/images/resolve/main/grpo/6.png)

The Reasoning RL Phase focuses on developing core reasoning capabilities across domains including mathematics, coding, science, and logic. This phase employs rule-based reinforcement learning, with rewards directly tied to solution correctness.

Crucially, all the tasks in this phase are 'verifiable' so we can check if the model's answer is correct or not. For example, in the case of mathematics, we can check if the model's answer is correct by using a mathematical solver.

What makes this phase particularly innovative is its direct optimization approach that eliminates the need for a separate reward model, streamlining the training process.

#### Rejection Sampling Phase (Quality Control)

![Rejection Sampling Phase](https://huggingface.co/reasoning-course/images/resolve/main/grpo/7.png)

During the Rejection Sampling Phase, the model generates samples which are then filtered through a quality control process. DeepSeek-V3 serves as the quality judge, evaluating outputs across a broad scope that extends beyond pure reasoning tasks. The filtered data is then used for supervised fine-tuning. This phase's innovation lies in its ability to combine multiple quality signals to ensure high-standard outputs.

#### Diverse RL Phase (Broad Alignment)

![Diverse RL Phase](https://huggingface.co/reasoning-course/images/resolve/main/grpo/8.png)

The final Diverse RL Phase tackles multiple task types using a sophisticated hybrid approach. For deterministic tasks, it employs rule-based rewards, while subjective tasks are evaluated through LLM feedback. This phase aims to achieve human preference alignment through its innovative hybrid reward approach, combining the precision of rule-based systems with the flexibility of language model evaluation.

### The Algorithm: Group Relative Policy Optimization (GRPO)

Now that we have a good understanding of the training process, let's look at the algorithm that was used to train the model.

The authors describe GRPO as a breakthrough in model fine-tuning:

![GRPO Process](https://huggingface.co/reasoning-course/images/resolve/main/grpo/10.png)

GRPO's novelty lies in its capacity to "directly optimize for preference rectification." This signifies a more direct and efficient route to aligning the model with desired outputs, contrasting with traditional Reinforcement Learning algorithms such as PPO. Let's break down how GRPO works through its three main components.

#### Group Formation: Creating Multiple Solutions

The first step in GRPO is remarkably intuitive - it's similar to how a student might solve a difficult problem by trying multiple approaches. When given a prompt, the model doesn't just generate one response; instead, it creates multiple attempts at solving the same problem (usually 4, 8, or 16 different attempts).

Imagine you're teaching a model to solve math problems. For a question about counting chickens on a farm, the model might generate several different solutions:
- One solution might break down the problem step by step: first counting total chickens, then subtracting roosters, and finally accounting for non-laying hens
- Another might use a different but equally valid approach
- Some attempts might contain mistakes or less efficient solutions

All these attempts are kept together as a group, much like having multiple students' solutions to compare and learn from.

![Group Formation](https://huggingface.co/reasoning-course/images/resolve/main/grpo/11.jpg)

#### Preference Learning: Understanding What Makes a Good Solution

This is where GRPO really shines in its simplicity. Unlike other methods for RLHF that need always require a separate reward model to predict how good a solution might be, GRPO can use any function or model to evaluate the quality of a solution. For example, we could use a length function to reward shorter responses or a mathematical solver to reward accurate mathematical solutions.

The evaluation process looks at various aspects of each solution:
- Is the final answer correct?
- Did the solution follow proper formatting (like using the right XML tags)?
- Does the reasoning match the answer provided?

What makes this approach particularly clever is how it handles the scoring. Instead of just giving absolute scores, GRPO normalizes the rewards within each group. It uses a simple but effective formula for group relative advantage estimation:

```
Advantage = (reward - mean(group_rewards)) / std(group_rewards)
```

![Preference Learning](https://huggingface.co/reasoning-course/images/resolve/main/grpo/12.jpg)

This normalization is like grading on a curve, but for AI. It helps the model understand which solutions within the group were better or worse compared to their peers, rather than just looking at absolute scores.

#### Optimization: Learning from Experience

The final step is where GRPO teaches the model to improve based on what it learned from evaluating the group of solutions. This process is both powerful and stable, using two main principles:

1. It encourages the model to produce more solutions like the successful ones while moving away from less effective approaches
2. It includes a safety mechanism (called KL divergence penalty) that prevents the model from changing too drastically all at once

This approach proves more stable than traditional methods because:
- It looks at multiple solutions together rather than comparing just two at a time
- The group-based normalization helps prevent issues with reward scaling
- The KL penalty acts like a safety net, ensuring the model doesn't forget what it already knows while learning new things

> **Tip:**
> GRPO's key innovations are:
> - Learning directly from any function or model, eliminating the reliance on a separate reward model.
> - Group-based learning, which is more stable and efficient than traditional methods like pairwise comparisons.

This breakdown is complex, but the key takeaway is that GRPO is a more efficient and stable way to train a model to reason.

#### GRPO Algorithm in Pseudocode

Now that we understand the key components of GRPO, let's look at the algorithm in pseudocode. This is a simplified version of the algorithm, but it captures the key ideas.

```
Input:
- initial_policy: Starting model to be trained
- reward_function: Function that evaluates outputs
- training_prompts: Set of training examples
- group_size: Number of outputs per prompt (typically 4-16)

Algorithm GRPO:
1. For each training iteration:
   a. Set reference_policy = initial_policy (snapshot current policy)
   b. For each prompt in batch:
      i. Generate group_size different outputs using initial_policy
      ii. Compute rewards for each output using reward_function
      iii. Normalize rewards within group:
           normalized_advantage = (reward - mean(rewards)) / std(rewards)
      iv. Update policy by maximizing the clipped ratio:
          min(prob_ratio * normalized_advantage,
              clip(prob_ratio, 1-epsilon, 1+epsilon) * normalized_advantage)
          - kl_weight * KL(initial_policy || reference_policy)

          where prob_ratio is current_prob / reference_prob

Output: Optimized policy model
```

This algorithm shows how GRPO combines group-based advantage estimation with policy optimization while maintaining stability through clipping and KL divergence constraints.

### Results and Impact

Now that we've explored the algorithm, let's look at the results. DeepSeek R1 achieves state-of-the-art performance across multiple domains:

| Domain | Key Results |
|--------|-------------|
| Mathematics | • 79.8% on AIME 2024<br>• 97.3% on MATH-500 |
| Coding | • Codeforces Rating: 2029<br>• LiveCodeBench: 65.9% |
| General Knowledge | • MMLU: 90.8%<br>• GPQA Diamond: 71.5% |
| Language Tasks | • AlpacaEval 2.0: 87.6% win rate<br>• FRAMES: 82.5% |

The model's practical impact extends beyond benchmarks through its cost-effective API pricing ($0.14 per million input tokens) and successful model distillation across various sizes (1.5B to 70B parameters). Notably, even the 7B model achieves 55.5% on AIME 2024, while the 70B distilled version approaches o1-mini performance on MATH-500 (94.5%), demonstrating effective capability preservation at different scales.

### Limitations and Challenges of GRPO

While GRPO represents a significant advancement in reinforcement learning for language models, it's important to understand its limitations and challenges:

- **Generation Cost**: Generating multiple completions (4-16) for each prompt increases computational requirements compared to methods that generate only one or two completions.
- **Batch Size Constraints**: The need to process groups of completions together can limit effective batch sizes, adding complexity to the training process and potentially slowing down training.
- **Reward Function Design**: The quality of training heavily depends on well-designed reward functions. Poorly designed rewards can lead to unintended behaviors or optimization for the wrong objectives.
- **Group Size Tradeoffs**: Choosing the optimal group size involves balancing diversity of solutions against computational cost. Too few samples may not provide enough diversity, while too many increase training time and resource requirements.
- **KL Divergence Tuning**: Finding the right balance for the KL divergence penalty requires careful tuning - too high and the model won't learn effectively, too low and it may diverge too far from its initial capabilities.

### Conclusion

The DeepSeek R1 paper represents a significant milestone in language model development. The Group Relative Policy Optimization (GRPO) algorithm has demonstrated that pure reinforcement learning can indeed develop strong reasoning capabilities, challenging previous assumptions about the necessity of supervised fine-tuning.

Perhaps most importantly, DeepSeek R1 has shown that it's possible to balance high performance with practical considerations like cost-effectiveness and accessibility. The successful distillation of the model's capabilities across different sizes, from 1.5B to 70B parameters, demonstrates a path forward for making advanced AI capabilities more widely available.

---

In the next section, we'll explore practical implementations of these concepts, focusing on how to leverage GRPO and RFTrans in your own language model development projects.

### Quiz

#### 1. What is the main innovation of the DeepSeek R1 paper?

#### 2. What are the four phases of the DeepSeek R1 training process?

#### 3. What is the 'Aha Moment' phenomenon in R1-Zero's training?

#### 4. How does GRPO's group formation work?

#### 5. What is the key difference between DeepSeek-R1-Zero and DeepSeek-R1?

## GRPO in DeepSeekMath

> **Source:** [GRPO in DeepSeekMath](https://huggingface.co/learn/llm-course/chapter12/3b) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

> **Tip:**
> This section dives into the technical and mathematical details of GRPO. It was authored by <a href="https://huggingface.com/shirinyamani" target="_blank">Shirin Yamani</a>.

Let's deepen our understanding of GRPO so that we can improve our model's training process.

GRPO directly evaluates the model-generated responses by comparing them within groups of generation to optimize policy model, instead of training a separate value model (Critic). This approach leads to significant reduction in computational cost!

GRPO can be applied to any verifiable task where the correctness of the response can be determined. For instance, in math reasoning, the correctness of the response can be easily verified by comparing it to the ground truth.

Before diving into the technical details, let's visualize how GRPO works at a high level:

![deep](https://huggingface.co/reasoning-course/images/resolve/main/grpo/16.png)

Now that we have a visual overview, let's break down how GRPO works step by step.

### The GRPO Algorithm

The core innovation of GRPO is its approach to evaluating and learning from multiple generated responses simultaneously. Instead of relying on a separate reward model, it compares outputs within the same group to determine which ones should be reinforced.

Let's walk through each step of the algorithm in detail:

#### Step 1: Group Sampling

The first step is to generate multiple possible answers for each question. This creates a diverse set of outputs that can be compared against each other.

For each question \\( q \\), the model will generate  \\( G \\) outputs (group size) from the trained policy: { \\( {o_1, o_2, o_3, \dots, o_G}\pi_{\theta_{\text{old}}} \\) }, \\( G=8 \\) where each \\( o_i \\) represents one completion from the model.

##### Example

To make this concrete, let's look at a simple arithmetic problem:

**Question**

\\( q \\) : \\( \text{Calculate}\space2 + 2 \times 6 \\)

**Outputs**

\\( (G = 8) \\): \\( \{o_1:14 \text{ (correct)}, o_2:16 \text{ (wrong)}, o_3:10 \text{ (wrong)}, \ldots, o_8:14 \text{ (correct)}\} \\)

Notice how some of the generated answers are correct (14) while others are wrong (16 or 10). This diversity is crucial for the next step.

#### Step 2: Advantage Calculation

Once we have multiple responses, we need a way to determine which ones are better than others. This is where the advantage calculation comes in.

##### Reward Distribution

First, we assign a reward score to each generated response. In this example, we'll use a reward model, but as we learnt in the previous section, we can use any reward returning function.

Assign a RM score to each of the generated responses based on the correctness \\( r_i \\) *(e.g. 1 for correct response, 0 for wrong response)* then for each of the \\( r_i \\) calculate the following Advantage value.

##### Advantage Value Formula

The key insight of GRPO is that we don't need absolute measures of quality - we can compare outputs within the same group. This is done using standardization:

$$A_i = \frac{r_i - \text{mean}(\{r_1, r_2, \ldots, r_G\})}{\text{std}(\{r_1, r_2, \ldots, r_G\})}$$

##### Example

Continuing with our arithmetic example for the same example above, imagine we have 8 responses, 4 of which is correct and the rest wrong, therefore;

| Metric | Value |
|--------|-------|
| Group Average | \\( mean(r_i) = 0.5 \\) |
| Standard Deviation | \\( std(r_i) = 0.53 \\) |
| Advantage Value (Correct response) | \\( A_i = \frac{1 - 0.5}{0.53}= 0.94 \\) |
| Advantage Value (Wrong response) | \\( A_i = \frac{0 - 0.5}{0.53}= -0.94 \\) |

##### Interpretation

Now that we have calculated the advantage values, let's understand what they mean:

This standardization (i.e. \\( A_i \\) weighting) allows the model to assess each response's relative performance, guiding the optimization process to favorable responses that are better than average (high reward) and discourage those that are worse.  For instance if \\( A_i > 0 \\), then the \\( o_i \\) is better response than the average level within its group; and if \\( A_i < 0 \\), then the \\( o_i \\) then the quality of the response is less than the average (i.e. poor quality/performance).

For the example above, if \\( A_i = 0.94 \text{(correct output)} \\) then during optimization steps its generation probability will be increased.

With our advantage values calculated, we're now ready to update the policy.

#### Step 3: Policy Update

The final step is to use these advantage values to update our model so that it becomes more likely to generate good responses in the future.

The target function for policy update is:

$$J_{GRPO}(\theta) = \left[\frac{1}{G} \sum_{i=1}^{G} \min \left( \frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)} A_i \text{clip}\left( \frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)}, 1 - \epsilon, 1 + \epsilon \right) A_i \right)\right]- \beta D_{KL}(\pi_{\theta} \|\| \pi_{ref})$$

This formula might look intimidating at first, but it's built from several components that each serve an important purpose. Let's break them down one by one.

### Key Components of the Target Function

The GRPO update function combines several techniques to ensure stable and effective learning. Let's examine each component:

#### 1. Probability Ratio

The probability ratio is defined as:

\\( \left(\frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)}\right) \\)

Intuitively, the formula compares how much the new model's response probability differs from the old model's response probability while incorporating a preference for responses that improve the expected outcome.

##### Interpretation

- If  \\( \text{ratio} > 1 \\), the new model assigns a higher probability to response \\( o_i \\) than the old model.
- If  \\( \text{ratio} < 1 \\), the new model assigns a lower probability to \\( o_i \\)

This ratio allows us to control how much the model changes at each step, which leads us to the next component.

#### 2. Clip Function

The clipping function is defined as:

\\( \text{clip}\left( \frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)}, 1 - \epsilon, 1 + \epsilon\right) \\)

Limit the ratio discussed above to be within \\( [1 - \epsilon, 1 + \epsilon] \\) to avoid/control drastic changes or crazy updates and stepping too far off from the old policy. In other words, it limit how much the probability ratio can increase to help maintaining stability by avoiding updates that push the new model too far from the old one.

##### Example (ε = 0.2)

Let's look at two different scenarios to better understand this clipping function:

- **Case 1**: if the new policy has a probability of 0.9 for a specific response and the old policy has a probabiliy of 0.5, it means this response is getting reinforeced by the new policy to have higher probability, but within a controlled limit which is the clipping to tight up its hands to not get drastic
	- \\( \text{Ratio}: \frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)} = \frac{0.9}{0.5} = 1.8  → \text{Clip}\space1.2 \\) (upper bound limit 1.2)
- **Case 2**: If the new policy is not in favour of a response (lower probability e.g. 0.2), meaning if the response is not beneficial the increase might be incorrect, and the model would be penalized.
	- \\( \text{Ratio}: \frac{\pi_{\theta}(o_i|q)}{\pi_{\theta_{old}}(o_i|q)} = \frac{0.2}{0.5} = 0.4  →\text{Clip}\space0.8 \\) (lower bound limit 0.8)

##### Interpretation

- The formula encourages the new model to favour responses that the old model underweighted **if they improve the outcome**.
- If the old model already favoured a response with a high probability, the new model can still reinforce it **but only within a controlled limit \\( [1 - \epsilon, 1 + \epsilon] \\), \\( \text{(e.g., }\epsilon = 0.2, \space \text{so} \space [0.8-1.2]) \\)**.
- If the old model overestimated a response that performs poorly, the new model is **discouraged** from maintaining that high probability.
- Therefore, intuitively, By incorporating the probability ratio, the objective function ensures that updates to the policy are proportional to the advantage \\( A_i \\) while being moderated to prevent drastic changes. T

While the clipping function helps prevent drastic changes, we need one more safeguard to ensure our model doesn't deviate too far from its original behavior.

#### 3. KL Divergence

The KL divergence term is:

\\( \beta D_{KL}(\pi_{\theta} \|\| \pi_{ref}) \\)

In the KL divergence term, the \\( \pi_{ref} \\) is basically the pre-update model's output, `per_token_logps` and \\( \pi_{\theta} \\) is the new model's output, `new_per_token_logps`. Theoretically, KL divergence is minimized to prevent the model from deviating too far from its original behavior during optimization. This helps strike a balance between improving performance based on the reward signal and maintaining coherence. In this context, minimizing KL divergence reduces the risk of the model generating nonsensical text or, in the case of mathematical reasoning, producing extremely incorrect answers.

##### Interpretation

- A KL divergence penalty keeps the model's outputs close to its original distribution, preventing extreme shifts.
- Instead of drifting towards completely irrational outputs, the model would refine its understanding while still allowing some exploration

##### Math Definition

For those interested in the mathematical details, let's look at the formal definition:

Recall that KL distance is defined as follows:
$$D_{KL}(P \|\| Q) = \sum_{x \in X} P(x) \log \frac{P(x)}{Q(x)}$$
In RLHF, the two distributions of interest are often the distribution of the new model version, P(x), and a distribution of the reference policy, Q(x).

##### The Role of β Parameter

The coefficient \\( \beta \\) controls how strongly we enforce the KL divergence constraint:

-  **Higher β (Stronger KL Penalty)**
    - More constraint on policy updates. The model remains close to its reference distribution.
    - Can slow down adaptation: The model may struggle to explore better responses.
- **Lower β (Weaker KL Penalty)**
    - More freedom to update policy: The model can deviate more from the reference.
    - Faster adaptation but risk of instability: The model might learn reward-hacking behaviors.
	- Over-optimization risk: If the reward model is flawed, the policy might generate nonsensical outputs.
- **Original** [DeepSeekMath](https://arxiv.org/abs/2402.03300) paper set this \\( \beta= 0.04 \\)

Now that we understand the components of GRPO, let's see how they work together in a complete example.

### Worked Example with GRPO

To solidify our understanding of GRPO, let's walk through a complete example from start to finish.

#### Example Problem

$$\text{Q: Calculate}\space2 + 2 \times 6$$

#### Step 1: Group Sampling

First, we generate multiple responses from our model.

Generate   \\( (G = 8) \\) responses, \\( 4 \\) of which are correct answer (\\( 14, \text{reward=} 1 \\)) and \\( 4 \\) incorrect \\( \text{(reward= 0)} \\), Therefore:

$${o_1:14(correct), o_2:10 (wrong), o_3:16 (wrong), ... o_G:14(correct)}$$

#### Step 2: Advantage Calculation

Next, we calculate the advantage values to determine which responses are better than average:

| Statistic | Value |
|-----------|-------|
| Group Average | \\( mean(r_i) = 0.5 \\) |
| Standard Deviation | \\( std(r_i) = 0.53 \\) |
| Advantage Value (Correct response) | \\( A_i = \frac{1 - 0.5}{0.53}= 0.94 \\) |
| Advantage Value (Wrong response) | \\( A_i = \frac{0 - 0.5}{0.53}= -0.94 \\) |

#### Step 3: Policy Update

Finally, we update our model to reinforce the correct responses:

- Assuming the probability of old policy (\\( \pi_{\theta_{old}} \\)) for a correct output \\( o_1 \\) is \\( 0.5 \\) and the new policy increases it to \\( 0.7 \\) then:
$$\text{Ratio}: \frac{0.7}{0.5} = 1.4  →\text{after Clip}\space1.2 \space (\epsilon = 0.2)$$
- Then when the target function is re-weighted, the model tends to reinforce the generation of correct output, and the \\( \text{KL Divergence} \\)  limits the deviation from the reference policy.

With the theoretical understanding in place, let's see how GRPO can be implemented in code.

### Implementation Example

Let's put everything together in a practical example. The following code demonstrates how to implement GRPO in PyTorch.

#### 1. Loading the Model and Generating Responses

First, we need to load a model and generate multiple responses for a given question:

```python
import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load the model and tokenizer
model_name = "Qwen/Qwen2-Math-1.5B"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
model.eval()

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Input prompt
prompt = "Solve y = 2x + 1 for x = 2, y = "  # Correct answer: 5
inputs = tokenizer(prompt, return_tensors="pt", padding=True)
input_ids = inputs["input_ids"].to(device)  # Shape: (1, prompt_len)
attention_mask = inputs["attention_mask"].to(device)

# Step 1: Generate 8 responses (B = 2 groups, G = 4 responses per group)
batch_size, num_generations = 2, 4
outputs = model.generate(
    input_ids=input_ids,  # Shape: (1, prompt_len)
    attention_mask=attention_mask,
    max_new_tokens=1,  # seq_len = 1 (single token per response)
    num_return_sequences=batch_size * num_generations,  # 8 responses total
    do_sample=True,
    top_k=10,
    temperature=0.7,
    pad_token_id=tokenizer.eos_token_id,
    return_dict_in_generate=True,
    output_scores=True,
)
```

this initial Generation (Before Any Steps) will output sth like this:

```text
Output 1: 5.0
Output 2: 6.0
Output 3: 7.0
Output 4: 5.0
Output 5: 10.0
Output 6: 2.0
Output 7: 5.0
Output 8: 5.0
```

#### 2. Calculating Rewards

Now, we need to determine which responses are correct and assign rewards accordingly:

With GRPO, with the same sample prompt, we generate multiple completions. So for instance, for our prompts of `"Solve y = 2x + 1 for x = 2, y = "` and `Solve y = 2x + 1 for x = 4, y = "` we have two group of generated outputs for the given prompt one is say
- `[5, 6, 7, 5]` and the other is
- `[10, 2, 9, 9]` while the correct answer is 5 and 9.

Note that in practice these reward scores are achieved by a rule-based reward function that assigns rewards based on the correctness of the response or a more complex neural network-based model that can be trained to assign rewards based on the correctness of the response or a mixed of both. But for sake of simplicity let's say our reward per response is 1 if the response is correct and 0 if it is wrong, therefore;
```python
reward_1 = [1, 0, 0, 1]
reward_2 = [0, 0, 1, 1]
```
next we get the group_wise mean and std of the rewards;

```python
# Shape: (B * G,) = (8,) bc we have 2 groups of 4 generations that we flatten
rewards = torch.tensor([1, 0, 0, 1, 0, 0, 1, 1], dtype=torch.float32)
num_generations = 4

# Group rewards: Shape (B, G) = 2, 4)
rewards_grouped = rewards.view(-1, num_generations)

# Mean per group: Shape (B,) = (2,)
mean_grouped_rewards = rewards_grouped.mean(dim=1)

# Std per group: Shape (B,) = (2,)
std_grouped_rewards = rewards_grouped.std(dim=1)

# Broadcast to match rewards and normalize: Shape (B * G,) = (8,)
# why we need to broadcast? because we need to calculate the advantage values for each response within the group
mean_grouped_rewards = mean_grouped_rewards.repeat_interleave(num_generations, dim=0)
std_grouped_rewards = std_grouped_rewards.repeat_interleave(num_generations, dim=0)
```
this will output:
```text
Grouped Rewards: tensor([[1., 0., 0., 1.],
                        [0., 0., 1., 1.]])
Mean per group: tensor([0.5000, 0.5000])
Std per group: tensor([0.5774, 0.5774])
Broadcasted Mean: tensor([0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000])
Broadcasted Std: tensor([0.5774, 0.5774, 0.5774, 0.5774, 0.5774, 0.5774, 0.5774, 0.5774])
```
Now we can calculate the advantage values for each response:
```python
# Advantages: Shape (B * G,) = (8,)
advantages = (rewards - mean_grouped_rewards) / (std_grouped_rewards + 1e-8)
```
this will output:
```text
Advantages: tensor([ 0.8659, -0.8660, -0.8660,  0.8659, -0.8660, -0.8660,  0.8659,  0.8659])
```
which is coming from the Advantage formula above, so:
```text
For reward_1 = [1, 0, 0, 1]:
1 - 0.5 / 0.5774 ≈ 0.8659
0 - 0.5 / 0.5774 ≈ -0.8660
For reward_2 = [0, 0, 1, 1]: Same pattern.
```
however, the shape here is `(B*G,) = (8,)` but in practice, we need to have the shape of `(B, G) = (2, 4)` to match the logits shape, right? Therefore, we need to unsqueeze the advantages tensor to have the shape of `(B*G, 1) = (8, 1)` to match the logits shape.
```python
# Shape (B * G, 1) = (8, 1) to match the logits shape
advantages = advantages.unsqueeze(1)
```
which will output:
```text
Advantages: tensor([[ 0.8659],
                    [-0.8660],
                    [-0.8660],
                    [ 0.8659],
                    [-0.8660],
                    [-0.8660],
                    [ 0.8659],
                    [ 0.8659]])
```
now we are good, let's move to the next step of updating the policy model based on the advantage values.

#### 3. Updating the Policy
Finally, we use the advantage values to update our model:

```python
# Compute probability ratio between new and old policies
ratio = torch.exp(
    new_per_token_logps - per_token_logps
)  # Shape: (B*G, seq_len) seq_len is the length of the output i.e. the num of generated tokens so here for simplicity let's assume it is 1 # (8, 1)
```

Note that the `per_token_logps` can be achieved by passing the generated outputs to the model and get the logits and then apply the softmax function to get the probabilities `F.softmax(logits, dim=-1)`.

```python
# Clipping Function
eps = self.cliprange  # e.g. 0.2
pg_losses1 = -advantages * ratio  # Shape: (B*G, seq_len)  #(8, 1)
pg_losses2 = -advantages * torch.clamp(
    ratio, 1.0 - eps, 1.0 + eps
)  # Shape: (B*G, seq_len) #(8, 1)
pg_loss_max = torch.max(pg_losses1, pg_losses2)  # Shape: (B*G, seq_len) #(8, 1)

# Now Combine with KL penalty # Shape: (B*G, seq_len) #(8, 1)
per_token_loss = pg_loss_max + self.beta * per_token_kl
```

`per_token_kl` can also be calculated as follows:

```python
# Shape: (B*G, seq_len) #(8, 1)
per_token_kl = F.kl_div(
    F.log_softmax(new_per_token_logps, dim=-1),
    F.softmax(per_token_logps, dim=-1),
    reduction="none",
).sum(dim=-1, keepdim=True)
```

Complete example can be found [here](https://huggingface.co/learn/llm-course/./basic_example.py). GRPO is also implemented by the excellent TRL team, you can check the implementation [TRL/GRPO_trainer](https://github.com/huggingface/trl/blob/main/trl/trainer/grpo_trainer.py) for more details.

### Summary and Next Steps

Congratulations! You've now learned about Group Relative Policy Optimization (GRPO). To recap what we've covered:

1. GRPO compares multiple outputs within a group to determine which ones are better than others, without requiring a separate value model.
2. The advantage calculation standardizes rewards to identify which responses are above or below average.
3. The policy update uses a clipped objective function with a KL divergence penalty to ensure stable learning.

This approach is particularly powerful for mathematical reasoning tasks, where correctness can be objectively verified. The GRPO method allows for more efficient training compared to traditional RLHF approaches that require a separate critic model.

As you continue exploring GRPO, consider experimenting with different group sizes, reward functions, and KL penalty coefficients to see how they affect your model's performance.

Happy training! 🚀

### References
1. [RLHF Book by Nathan Lambert](https://github.com/natolambert/rlhf-book)
2. [DeepSeek-V3 Technical Report](https://huggingface.co/papers/2412.19437)
3. [DeepSeekMath](https://huggingface.co/papers/2402.03300)

## Implementing GRPO in TRL

> **Source:** [Implementing GRPO in TRL](https://huggingface.co/learn/llm-course/chapter12/4) · [Hugging Face LLM Course](https://github.com/huggingface/course), Apache 2.0

In this page, we'll learn how to implement Group Relative Policy Optimization (GRPO) using the Transformer Reinforcement Learning (TRL) library. We'll focus on practical implementation with minimal code.

We'll explore the core concepts of GRPO as they are embodied in TRL's GRPOTrainer, using snippets from the official TRL documentation to guide us.

> **Tip:**
> This chapter is aimed at TRL beginners. If you are already familiar with TRL, you might want to also check out the [Open R1 implementation](https://github.com/huggingface/open-r1/blob/main/src/open_r1/grpo.py) of GRPO.

First, let's remind ourselves of some of the important concepts of GRPO algorithm:

- Group Formation: The model generates multiple completions for each prompt.
- Preference Learning: The model learns from a reward function that compares groups of completions.
- Training Configuration: The model uses a configuration to control the training process.

What do we need to do to implement GRPO?

- Define a dataset of prompts.
- Define a reward function that takes a list of completions and returns a list of rewards.
- Configure the training process with a GRPOConfig.
- Train the model using the GRPOTrainer.

Here's a minimal example to get started with GRPO training:

```python
from trl import GRPOTrainer, GRPOConfig
from datasets import load_dataset

# 1. Load your dataset
dataset = load_dataset("your_dataset", split="train")

# 2. Define a simple reward function
def reward_func(completions, **kwargs):
    """Example: Reward longer completions"""
    return [float(len(completion)) for completion in completions]

# 3. Configure training
training_args = GRPOConfig(
    output_dir="output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    logging_steps=10,
)

# 4. Initialize and train
trainer = GRPOTrainer(
    model="your_model",  # e.g. "Qwen/Qwen2-0.5B-Instruct"
    args=training_args,
    train_dataset=dataset,
    reward_funcs=reward_func,
)
trainer.train()
```

### Key Components

#### 1. Dataset Format

Your dataset should contain prompts that the model will respond to. The GRPO trainer will generate multiple completions for each prompt and use the reward function to compare them.

#### 2. Reward Function

The reward function is crucial - it determines how the model learns. Here are two practical examples:

```python
# Example 1: Reward based on completion length
def reward_length(completions, **kwargs):
    return [float(len(completion)) for completion in completions]

# Example 2: Reward based on matching a pattern
import re

def reward_format(completions, **kwargs):
    pattern = r"^<think>.*?</think><answer>.*?</answer>$"
    return [1.0 if re.match(pattern, c) else 0.0 for c in completions]
```

#### 3. Training Configuration

Key parameters to consider in `GRPOConfig`:

```python
training_args = GRPOConfig(
    # Essential parameters
    output_dir="output",
    num_train_epochs=3,
    num_generation=4,  # Number of completions to generate for each prompt
    per_device_train_batch_size=4,  # We want to get all generations in one device batch
    # Optional but useful
    gradient_accumulation_steps=2,
    learning_rate=1e-5,
    logging_steps=10,
    # GRPO specific (optional)
    use_vllm=True,  # Speed up generation
)
```

The `num_generation` parameter is particularly important for GRPO as it defines the group size - how many different completions the model will generate for each prompt. This is a key differentiator from other RL methods:

- Too small (e.g., 2-3): May not provide enough diversity for meaningful comparisons
- Recommended (4-16): Provides good balance between diversity and computational efficiency
- Larger values: May improve learning but significantly increases computational cost

The group size should be chosen based on your computational resources and the complexity of your task. For simple tasks, smaller groups (4-8) may be sufficient, while more complex reasoning tasks might benefit from larger groups (8-16).

### Tips for Success

1. **Memory Management**: Adjust `per_device_train_batch_size` and `gradient_accumulation_steps` based on your GPU memory.
2. **Speed**: Enable `use_vllm=True` for faster generation if your model is supported.
3. **Monitoring**: Watch the logged metrics during training:
   - `reward`: Average reward across completions
   - `reward_std`: Standard deviation within reward groups
   - `kl`: KL divergence from reference model

### Reward Function Design

The DeepSeek R1 paper demonstrates several effective approaches to reward function design that you can adapt for your own GRPO implementation:

#### 1. Length-Based Rewards

One of the easiest rewards to implement is a length-based reward. You can reward longer completions:

```python
def reward_len(completions, **kwargs):
    ideal_length = 20
    return [-abs(ideal_length - len(completion)) for completion in completions]
```

This reward function penalizes completions that are too short or too long, encouraging the model to generate completions that are close to the ideal length of 20 tokens.

<!-- # TODO: update links when PR is merged -->

<iframe
    src="https://marimo.app/gh/huggingface/notebooks/main/e?entrypoint=course%2Fen%2Fchapter13%2Fgrpo_length.py&embed=true&show-chrome=false"
    title="Marimo Notebook"
    width="100%"
    height="800px"
    frameBorder="0"
    allow="clipboard-write"
></iframe>

### 2. Rule-Based Rewards for Verifiable Tasks

For tasks with objectively correct answers (like mathematics or coding), you can implement rule-based reward functions:

```python
def problem_reward(completions, answers, **kwargs):
    """Reward function for math problems with verifiable answers
    completions: list of completions to evaluate
    answers: list of answers to the problems from the dataset
    """

    rewards = []
    for completion, correct_answer in zip(completions, answers):
        # Extract the answer from the completion
        try:
            # This is a simplified example - you'd need proper parsing
            answer = extract_final_answer(completion)
            # Binary reward: 1 for correct, 0 for incorrect
            reward = 1.0 if answer == correct_answer else 0.0
            rewards.append(reward)
        except:
            # If we can't parse an answer, give a low reward
            rewards.append(0.0)

    return rewards
```

<!-- # TODO: update links when PR is merged -->

<iframe
    src="https://marimo.app/gh/huggingface/notebooks/main/e?entrypoint=course%2Fen%2Fchapter13%2Fgrpo_math.py&embed=true&show-chrome=false"
    title="Marimo Notebook"
    width="100%"
    height="800px"
    frameBorder="0"
    allow="clipboard-write"
></iframe>

### 3. Format-Based Rewards

You can also reward proper formatting, which was important in the DeepSeek R1 training:

```python
def format_reward(completions, **kwargs):
    """Reward completions that follow the desired format"""
    # Example: Check if the completion follows a think-then-answer format
    pattern = r"<think>(.*?)</think>\s*<answer>(.*?)</answer>"

    rewards = []
    for completion in completions:
        match = re.search(pattern, completion, re.DOTALL)
        if match:
            # Check if there's substantial content in both sections
            think_content = match.group(1).strip()
            answer_content = match.group(2).strip()

            if len(think_content) > 20 and len(answer_content) > 0:
                rewards.append(1.0)
            else:
                rewards.append(
                    0.5
                )  # Partial reward for correct format but limited content
        else:
            rewards.append(0.0)  # No reward for incorrect format

    return rewards
```

<!-- # TODO: update links when PR is merged -->

<iframe
    src="https://marimo.app/gh/huggingface/notebooks/main/e?entrypoint=course%2Fen%2Fchapter13%2Fgrpo_format.py&embed=true&show-chrome=false"
    title="Marimo Notebook"
    width="100%"
    height="800px"
    frameBorder="0"
    allow="clipboard-write"
></iframe>

These examples demonstrate how you can implement reward functions inspired by the DeepSeek R1 training process, focusing on correctness, formatting, and combined signals.

### That's it!

In the next section, you will follow an exercise to implement GRPO in TRL.
