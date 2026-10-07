---
title: "Building Generative AI Apps"
order: 7
summary: "Turning models into products: text generation, chat and search apps, image generation, low-code tools, function calling, UX for AI, security and the application lifecycle."
category: "AI"
level: Intermediate
---

# Building Generative AI Apps

Turning models into products: text generation, chat and search apps, image generation, low-code tools, function calling, UX for AI, security and the application lifecycle.

## Building Text Generation Applications

> **Source:** [Building Text Generation Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/06-text-generation-apps) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

> _(Click the image above to view video of this lesson)_

You've seen so far through this curriculum that there are core concepts like prompts and even a whole discipline called "prompt engineering". Many tools you can interact with like ChatGPT, Office 365, Microsoft Power Platform and more, support you using prompts to accomplish something.

For you to add such an experience to an app, you need to understand concepts like prompts, completions and choose a library to work with. That's exactly what you'll learn in this chapter.

### Introduction

In this chapter, you will:

- Learn about the openai library and its core concepts.
- Build a text generation app using openai.
- Understand how to use concepts like prompt, temperature, and tokens to build a text generation app.

### Learning goals

At the end of this lesson, you'll be able to:

- Explain what a text generation app is.
- Build a text generation app using openai.
- Configure your app to use more or less tokens and also change the temperature, for a varied output.

### What is a text generation app?

Normally when you build an app it has some kind of interface like the following:

- Command-based. Console apps are typical apps where you type a command and it carries out a task. For example, `git` is a command-based app.
- User interface (UI). Some apps have graphical user interfaces (GUIs) where you click buttons, input text, select options and more.

#### Console and UI apps are limited

Compare it to a command-based app where you type a command:

- **It's limited**. You can't just type any command, only the ones that the app supports.
- **Language specific**. Some apps support many languages, but by default the app is built for a specific language, even if you can add more language support.

#### Benefits of text generation apps

So how is a text generation app different?

In a text generation app, you have more flexibility, you're not limited to a set of commands or a specific input language. Instead, you can use natural language to interact with the app. Another benefit is that you're already interacting with a data source that has been trained on a vast corpus of information, whereas a traditional app might be limited on what's in a database.

#### What can I build with a text generation app?

There are many things you can build. For example:

- **A chatbot**. A chatbot answering questions about topics, like your company and its products could be a good match.
- **Helper**. LLMs are great at things like summarizing text, getting insights from text, producing text like resumes and more.
- **Code assistant**. Depending on the language model you use, you can build a code assistant that helps you write code. For example, you can use a product like GitHub Copilot as well as ChatGPT to help you write code.

### How can I get started?

Well, you need to find a way to integrate with an LLM which usually entails the following two approaches:

- Use an API. Here you're constructing web requests with your prompt and get generated text back.
- Use a library. Libraries help encapsulate the API calls and make them easier to use.

### Libraries/SDKs

There are a few well known libraries for working with LLMs like:

- **openai**, this library makes it easy to connect to your model and send in prompts.

Then there are libraries that operate on a higher level like:

- **Langchain**. Langchain is well known and supports Python.
- **Semantic Kernel**. Semantic Kernel is a library by Microsoft supporting the languages C#, Python, and Java.

### First app using openai

Let's see how we can build our first app, what libraries we need, how much is required and so on.

#### Install openai

There are many libraries out there for interacting with OpenAI or Azure OpenAI. It's possible to use numerous programming languages as well like C#, Python, JavaScript, Java and more. We've chosen to use the `openai` Python library, so we'll use `pip` to install it.

```bash
pip install openai
```

#### Create a resource

You need to carry out the following steps:

- Create an account on Azure [https://azure.microsoft.com/free/](https://azure.microsoft.com/free/?WT.mc_id=academic-105485-koreyst).
- Gain access to Azure OpenAI. Go to [https://learn.microsoft.com/azure/ai-foundry/openai/overview#how-do-i-get-access-to-azure-openai](https://learn.microsoft.com/azure/ai-foundry/openai/overview#how-do-i-get-access-to-azure-openai?WT.mc_id=academic-105485-koreyst) and request access.

  > [!NOTE]
  > At the time of writing, you need to apply for access to Azure OpenAI.

- Install Python <https://www.python.org/>
- Have created an Azure OpenAI Service resource. See this guide for how to [create a resource](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/create-resource?pivots=web-portal?WT.mc_id=academic-105485-koreyst).

#### Locate API key and endpoint

At this point, you need to tell your `openai` library what API key to use. To find your API key, go to "Keys and Endpoint" section of your Azure OpenAI resource and copy the "Key 1" value.

![Keys and Endpoint resource blade in Azure Portal](https://learn.microsoft.com/azure/ai-foundry/openai/media/quickstarts/endpoint.png?WT.mc_id=academic-105485-koreyst)

Now that you have this information copied, let's instruct the libraries to use it.

> **Note:**
> It's worth separating your API key from your code. You can do so by using environment variables.
>
> - Set the environment variable `OPENAI_API_KEY` to your API key.
>   `export OPENAI_API_KEY='sk-...'`

#### Setup configuration Azure

If you're using Azure OpenAI (now part of Microsoft Foundry), here's how you setup configuration. We use the standard `OpenAI` client pointed at the Azure OpenAI `/openai/v1/` endpoint, which works with the Responses API and needs no `api_version`:

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    base_url=f"{os.environ['AZURE_OPENAI_ENDPOINT'].rstrip('/')}/openai/v1/",
)
```

Above we're setting the following:

- `api_key`, this is your API key found in the Azure Portal or Microsoft Foundry portal.
- `base_url`, this is your Foundry resource endpoint with `/openai/v1/` appended. The stable v1 endpoint works across OpenAI and Azure OpenAI with no `api_version` management.

> [!NOTE] > `os.environ` reads environment variables. You can use it to read environment variables like `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`. Set these environment variables in your terminal or by using a library like `dotenv`.

### Generate text

The way to generate text is to use the Responses API via the `responses.create` method. Here's an example:

```python
prompt = "Complete the following: Once upon a time there was a"

response = client.responses.create(
    model="gpt-5-mini",  # this is your model deployment name
    input=prompt,
    store=False,
)
print(response.output_text)
```

In the above code, we create a response and pass in the model we want to use and the prompt. Then we print the generated text via `response.output_text`.

#### Multi-turn conversations

The Responses API is well suited for both single-turn text generation and multi-turn chatbots - you provide a list of messages in `input` to build up a conversation:

```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")

response = client.responses.create(model="gpt-5-mini", input="Hello world", store=False)
print(response.output_text)
```

More on this functionality in an upcoming chapter.

### Exercise - your first text generation app

Now that we learned how to set up and configure openai, it's time to build your first text generation app. To build your app, follow these steps:

1. Create a virtual environment and install openai:

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install openai
   ```

   > [!NOTE]
   > If you're using Windows type `venv\Scripts\activate` instead of `source venv/bin/activate`.

   > [!NOTE]
   > Locate your Azure OpenAI key by going to [https://portal.azure.com/](https://portal.azure.com/?WT.mc_id=academic-105485-koreyst) and search for `Open AI` and select the `Open AI resource` and then select `Keys and Endpoint` and copy the `Key 1` value.

1. Create an _app.py_ file and give it the following code:

   ```python
   import os
   from openai import OpenAI

   client = OpenAI(
       api_key="<replace this value with your Azure OpenAI key>",
       base_url="<endpoint found in Azure Portal>/openai/v1/",
   )
   deployment_name = "<deployment name>"

   # add your completion code
   prompt = "Complete the following: Once upon a time there was a"

   # make a request using the Responses API
   response = client.responses.create(model=deployment_name, input=prompt, store=False)

   # print response
   print(response.output_text)
   ```

   > [!NOTE]
   > If you're using plain OpenAI (not Azure), use `client = OpenAI(api_key="<replace this value with your OpenAI key>")` (no `base_url`) and pass a model name like `gpt-5-mini` instead of a deployment name.

   You should see an output like the following:

   ```output
    very unhappy _____.

   Once upon a time there was a very unhappy mermaid.
   ```

### Different types of prompts, for different things

Now you've seen how to generate text using a prompt. You even have a program up and running that you can modify and change to generate different types of text.

Prompts can be used for all sorts of tasks. For example:

- **Generate a type of text**. For example, you can generate a poem, questions for a quiz etc.
- **Lookup information**. You can use prompts to look for information like the following example 'What does CORS mean in web development?'.
- **Generate code**. You can use prompts to generate code, for example developing a regular expression used to validate emails or why not generate an entire program, like a web app?

### A more practical use case: a recipe generator

Imagine you have ingredients at home and you want to cook something. For that, you need a recipe. A way to find recipes is to use a search engine or you could use an LLM to do so.

You could write a prompt like so:

> "Show me 5 recipes for a dish with the following ingredients: chicken, potatoes, and carrots. Per recipe, list all the ingredients used"

Given the above prompt, you might get a response similar to:

```output
1. Roasted Chicken and Vegetables:
Ingredients:
- 4 chicken thighs
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 2 tablespoons olive oil
- 2 cloves garlic, minced
- 1 teaspoon dried thyme
- 1 teaspoon dried oregano
- Salt and pepper, to taste

2. Chicken and Potato Stew:
Ingredients:
- 2 tablespoons olive oil
- 1 onion, diced
- 2 cloves garlic, minced
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 1 cup chicken broth
- Salt and pepper, to taste

3. Chicken and Potato Bake:
Ingredients:
- 2 tablespoons olive oil
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 onion, diced
- 2 cloves garlic, minced
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 1 cup chicken broth
- Salt and pepper, to taste

4. Chicken and Potato Soup:
Ingredients:
- 2 tablespoons olive oil
- 1 onion, diced
- 2 cloves garlic, minced
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 4 cups chicken broth
- Salt and pepper, to taste

5. Chicken and Potato Hash:
Ingredients:
- 2 tablespoons olive oil
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 onion, diced
- 2 cloves garlic, minced
- 1 teaspoon dried oregano
```

This outcome is great, I know what to cook. At this point, what could be useful improvements are:

- Filtering out ingredients I don't like or am allergic to.
- Produce a shopping list, in case I don't have all the ingredients at home.

For the above cases, let's add an additional prompt:

> "Please remove recipes with garlic as I'm allergic and replace it with something else. Also, please produce a shopping list for the recipes, considering I already have chicken, potatoes and carrots at home."

Now you have a new result, namely:

```output
1. Roasted Chicken and Vegetables:
Ingredients:
- 4 chicken thighs
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 2 tablespoons olive oil
- 1 teaspoon dried thyme
- 1 teaspoon dried oregano
- Salt and pepper, to taste

2. Chicken and Potato Stew:
Ingredients:
- 2 tablespoons olive oil
- 1 onion, diced
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 1 cup chicken broth
- Salt and pepper, to taste

3. Chicken and Potato Bake:
Ingredients:
- 2 tablespoons olive oil
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 onion, diced
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 1 cup chicken broth
- Salt and pepper, to taste

4. Chicken and Potato Soup:
Ingredients:
- 2 tablespoons olive oil
- 1 onion, diced
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 teaspoon dried oregano
- 1 teaspoon dried thyme
- 4 cups chicken broth
- Salt and pepper, to taste

5. Chicken and Potato Hash:
Ingredients:
- 2 tablespoons olive oil
- 2 chicken breasts, cut into cubes
- 2 potatoes, cut into cubes
- 2 carrots, cut into cubes
- 1 onion, diced
- 1 teaspoon dried oregano

Shopping List:
- Olive oil
- Onion
- Thyme
- Oregano
- Salt
- Pepper
```

That's your five recipes, with no garlic mentioned and you also have a shopping list considering what you already have at home.

### Exercise - build a recipe generator

Now that we have played out a scenario, let's write code to match the demonstrated scenario. To do so, follow these steps:

1. Use the existing _app.py_ file as a starting point
1. Locate the `prompt` variable and change its code to the following:

   ```python
   prompt = "Show me 5 recipes for a dish with the following ingredients: chicken, potatoes, and carrots. Per recipe, list all the ingredients used"
   ```

   If you now run the code, you should see an output similar to:

   ```output
   -Chicken Stew with Potatoes and Carrots: 3 tablespoons oil, 1 onion, chopped, 2 cloves garlic, minced, 1 carrot, peeled and chopped, 1 potato, peeled and chopped, 1 bay leaf, 1 thyme sprig, 1/2 teaspoon salt, 1/4 teaspoon black pepper, 1 1/2 cups chicken broth, 1/2 cup dry white wine, 2 tablespoons chopped fresh parsley, 2 tablespoons unsalted butter, 1 1/2 pounds boneless, skinless chicken thighs, cut into 1-inch pieces
   -Oven-Roasted Chicken with Potatoes and Carrots: 3 tablespoons extra-virgin olive oil, 1 tablespoon Dijon mustard, 1 tablespoon chopped fresh rosemary, 1 tablespoon chopped fresh thyme, 4 cloves garlic, minced, 1 1/2 pounds small red potatoes, quartered, 1 1/2 pounds carrots, quartered lengthwise, 1/2 teaspoon salt, 1/4 teaspoon black pepper, 1 (4-pound) whole chicken
   -Chicken, Potato, and Carrot Casserole: cooking spray, 1 large onion, chopped, 2 cloves garlic, minced, 1 carrot, peeled and shredded, 1 potato, peeled and shredded, 1/2 teaspoon dried thyme leaves, 1/4 teaspoon salt, 1/4 teaspoon black pepper, 2 cups fat-free, low-sodium chicken broth, 1 cup frozen peas, 1/4 cup all-purpose flour, 1 cup 2% reduced-fat milk, 1/4 cup grated Parmesan cheese

   -One Pot Chicken and Potato Dinner: 2 tablespoons olive oil, 1 pound boneless, skinless chicken thighs, cut into 1-inch pieces, 1 large onion, chopped, 3 cloves garlic, minced, 1 carrot, peeled and chopped, 1 potato, peeled and chopped, 1 bay leaf, 1 thyme sprig, 1/2 teaspoon salt, 1/4 teaspoon black pepper, 2 cups chicken broth, 1/2 cup dry white wine

   -Chicken, Potato, and Carrot Curry: 1 tablespoon vegetable oil, 1 large onion, chopped, 2 cloves garlic, minced, 1 carrot, peeled and chopped, 1 potato, peeled and chopped, 1 teaspoon ground coriander, 1 teaspoon ground cumin, 1/2 teaspoon ground turmeric, 1/2 teaspoon ground ginger, 1/4 teaspoon cayenne pepper, 2 cups chicken broth, 1/2 cup dry white wine, 1 (15-ounce) can chickpeas, drained and rinsed, 1/2 cup raisins, 1/2 cup chopped fresh cilantro
   ```

   > NOTE, your LLM is nondeterministic, so you might get different results every time you run the program.

   Great, let's see how we can improve things. To improve things, we want to make sure the code is flexible, so ingredients and number of recipes can be improved and changed.

1. Let's change the code in the following way:

   ```python
   no_recipes = input("No of recipes (for example, 5): ")

   ingredients = input("List of ingredients (for example, chicken, potatoes, and carrots): ")

   # interpolate the number of recipes into the prompt an ingredients
   prompt = f"Show me {no_recipes} recipes for a dish with the following ingredients: {ingredients}. Per recipe, list all the ingredients used"
   ```

   Taking the code for a test run, could look like this:

   ```output
   No of recipes (for example, 5): 3
   List of ingredients (for example, chicken, potatoes, and carrots): milk,strawberries

   -Strawberry milk shake: milk, strawberries, sugar, vanilla extract, ice cubes
   -Strawberry shortcake: milk, flour, baking powder, sugar, salt, unsalted butter, strawberries, whipped cream
   -Strawberry milk: milk, strawberries, sugar, vanilla extract
   ```

#### Improve by adding filter and shopping list

We now have a working app capable of producing recipes and it's flexible as it relies on inputs from the user, both on the number of recipes but also the ingredients used.

To further improve it, we want to add the following:

- **Filter out ingredients**. We want to be able to filter out ingredients we don't like or are allergic to. To accomplish this change, we can edit our existing prompt and add a filter condition to the end of it like so:

  ```python
  filter = input("Filter (for example, vegetarian, vegan, or gluten-free): ")

  prompt = f"Show me {no_recipes} recipes for a dish with the following ingredients: {ingredients}. Per recipe, list all the ingredients used, no {filter}"
  ```

  Above, we add `{filter}` to the end of the prompt and we also capture the filter value from the user.

  An example input of running the program can now look like so:

  ```output
  No of recipes (for example, 5): 3
  List of ingredients (for example, chicken, potatoes, and carrots): onion,milk
  Filter (for example, vegetarian, vegan, or gluten-free): no milk

  1. French Onion Soup

  Ingredients:

  -1 large onion, sliced
  -3 cups beef broth
  -1 cup milk
  -6 slices french bread
  -1/4 cup shredded Parmesan cheese
  -1 tablespoon butter
  -1 teaspoon dried thyme
  -1/4 teaspoon salt
  -1/4 teaspoon black pepper

  Instructions:

  1. In a large pot, sauté onions in butter until golden brown.
  2. Add beef broth, milk, thyme, salt, and pepper. Bring to a boil.
  3. Reduce heat and simmer for 10 minutes.
  4. Place french bread slices on soup bowls.
  5. Ladle soup over bread.
  6. Sprinkle with Parmesan cheese.

  2. Onion and Potato Soup

  Ingredients:

  -1 large onion, chopped
  -2 cups potatoes, diced
  -3 cups vegetable broth
  -1 cup milk
  -1/4 teaspoon black pepper

  Instructions:

  1. In a large pot, sauté onions in butter until golden brown.
  2. Add potatoes, vegetable broth, milk, and pepper. Bring to a boil.
  3. Reduce heat and simmer for 10 minutes.
  4. Serve hot.

  3. Creamy Onion Soup

  Ingredients:

  -1 large onion, chopped
  -3 cups vegetable broth
  -1 cup milk
  -1/4 teaspoon black pepper
  -1/4 cup all-purpose flour
  -1/2 cup shredded Parmesan cheese

  Instructions:

  1. In a large pot, sauté onions in butter until golden brown.
  2. Add vegetable broth, milk, and pepper. Bring to a boil.
  3. Reduce heat and simmer for 10 minutes.
  4. In a small bowl, whisk together flour and Parmesan cheese until smooth.
  5. Add to soup and simmer for an additional 5 minutes, or until soup has thickened.
  ```

  As you can see, any recipes with milk in it has been filtered out. But, if you're lactose intolerant, you might want to filter out recipes with cheese in them as well, so there's a need to be clear.

- **Produce a shopping list**. We want to produce a shopping list, considering what we already have at home.

  For this functionality, we could either try to solve everything in one prompt or we could split it up into two prompts. Let's try the latter approach. Here we're suggesting adding an additional prompt, but for that to work, we need to add the result of the former prompt as context to the latter prompt.

  Locate the part in the code that prints out the result from the first prompt and add the following code below:

  ```python
  old_prompt_result = response.output_text
  prompt = "Produce a shopping list for the generated recipes and please don't include ingredients that I already have."

  new_prompt = f"{old_prompt_result} {prompt}"
  response = client.responses.create(model=deployment_name, input=new_prompt, max_output_tokens=1200, store=False)

  # print response
  print("Shopping list:")
  print(response.output_text)
  ```

  Note the following:

  1. We're constructing a new prompt by adding the result from the first prompt to the new prompt:

     ```python
     new_prompt = f"{old_prompt_result} {prompt}"
     ```

  1. We make a new request, but also considering the number of tokens we asked for in the first prompt, so this time we say `max_output_tokens` is 1200.

     ```python
     response = client.responses.create(model=deployment_name, input=new_prompt, max_output_tokens=1200, store=False)
     ```

     Taking this code for a spin, we now arrive at the following output:

     ```output
     No of recipes (for example, 5): 2
     List of ingredients (for example, chicken, potatoes, and carrots): apple,flour
     Filter (for example, vegetarian, vegan, or gluten-free): sugar

     -Apple and flour pancakes: 1 cup flour, 1/2 tsp baking powder, 1/2 tsp baking soda, 1/4 tsp salt, 1 tbsp sugar, 1 egg, 1 cup buttermilk or sour milk, 1/4 cup melted butter, 1 Granny Smith apple, peeled and grated
     -Apple fritters: 1-1/2 cups flour, 1 tsp baking powder, 1/4 tsp salt, 1/4 tsp baking soda, 1/4 tsp nutmeg, 1/4 tsp cinnamon, 1/4 tsp allspice, 1/4 cup sugar, 1/4 cup vegetable shortening, 1/4 cup milk, 1 egg, 2 cups shredded, peeled apples
     Shopping list:
     -Flour, baking powder, baking soda, salt, sugar, egg, buttermilk, butter, apple, nutmeg, cinnamon, allspice
     ```

### Improve your setup

What we have so far is code that works, but there are some tweaks we should be doing to improve things further. Some things we should do are:

- **Separate secrets from code**, like the API key. Secrets do not belong in code and should be stored in a secure location. To separate secrets from code, we can use environment variables and libraries like `python-dotenv` to load them from a file. Here's how that would look like in code:

  1. Create a `.env` file with the following content:

     ```bash
     OPENAI_API_KEY=sk-...
     ```

     > Note, for Azure OpenAI in Microsoft Foundry, you need to set the following environment variables instead:

     ```bash
     AZURE_OPENAI_API_KEY=<replace>
     AZURE_OPENAI_ENDPOINT=<replace>
     AZURE_OPENAI_API_VERSION=2024-10-21
     ```

     In code, you would load the environment variables like so:

     ```python
     import os
     from dotenv import load_dotenv
     from openai import OpenAI

     load_dotenv()

     client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
     ```

- **A word on token length**. We should consider how many tokens we need to generate the text we want. Tokens cost money, so where possible, we should try to be economical with the number of tokens we use. For example, can we phrase the prompt so that we can use less tokens?

  To change the tokens used, you can use the `max_output_tokens` parameter. For example, if you want to use 100 tokens, you would do:

  ```python
  response = client.responses.create(model=deployment, input=prompt, max_output_tokens=100, store=False)
  ```

- **Experimenting with temperature**. Temperature is something we haven't mentioned so far but is an important context for how our program performs. The higher the temperature value the more random the output will be. Conversely the lower the temperature value the more predictable the output will be. Consider whether you want variation in your output or not.

  To alter the temperature, you can use the `temperature` parameter. For example, if you want to use a temperature of 0.5, you would do:

  ```python
  response = client.responses.create(model=deployment, input=prompt, temperature=0.5, store=False)
  ```

  > Note, the closer to 1.0, the more varied the output.

- **Reasoning models don't use `temperature`**. This is an important 2026 shift. The current, non-deprecated models on Microsoft Foundry are **reasoning models** (the GPT-5 family, o-series) - and they **don't support `temperature` or `top_p`** (nor `max_tokens`; use `max_output_tokens`). If you send `temperature` to `gpt-5-mini` you'll get a "parameter not supported" error. So to try the temperature example above, point it at a model that still supports sampling controls - for example an open **Llama** model such as `Llama-3.3-70B-Instruct` from the [Microsoft Foundry model catalog](https://ai.azure.com/catalog/models?WT.mc_id=academic-105485-koreyst), called via the Foundry Models / Azure AI Inference endpoint (the same way as the `githubmodels-*` samples). For reasoning models like GPT-5, you steer output differently:
  - **Prompt engineering** - clear instructions, examples, and structured output (see lesson [04 - Prompt Engineering](https://github.com/microsoft/generative-ai-for-beginners/blob/main/04-prompt-engineering-fundamentals/README.md)) do the work that sampling knobs used to.
  - **Reasoning controls** - parameters like reasoning effort/verbosity trade depth of reasoning against latency and cost.

  In short: `temperature`/`top_p` are still valid on many models (Llama, Mistral, Phi, and the GPT-4.x family - though GPT-4.x is deprecating), but the direction of travel is prompt engineering + reasoning controls on reasoning models like GPT-5.

### Solution

#### Study buddy

Below is a starter prompt, see how you can use it and tweak it to your liking.

```text
- "You're an expert on the Python language

    Suggest a beginner lesson for Python in the following format:

    Format:
    - concepts:
    - brief explanation of the lesson:
    - exercise in code with solutions"
```

#### History bot

Here are some prompts you could be using:

```text
- "You are Abe Lincoln, tell me about yourself in 3 sentences, and respond using grammar and words like Abe would have used"
- "You are Abe Lincoln, respond using grammar and words like Abe would have used:

   Tell me about your greatest accomplishments, in 300 words"
```

## Building Generative AI-Powered Chat Applications

> **Source:** [Building Generative AI-Powered Chat Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/07-building-chat-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

> _(Click the image above to view video of this lesson)_

Now that we've seen how we can build text-generation apps, let's look into chat applications.

Chat applications have become integrated into our daily lives, offering more than just a means of casual conversation. They're integral parts of customer service, technical support, and even sophisticated advisory systems. It's likely that you've gotten some help from a chat application not too long ago. As we integrate more advanced technologies like generative AI into these platforms, the complexity increases and so do the challenges.

Some questions we need to be answered are:

- **Building the app**. How do we efficiently build and seamlessly integrate these AI-powered applications for specific use cases?
- **Monitoring**. Once deployed, how can we monitor and ensure that the applications are operating at the highest level of quality, both in terms of functionality and adhering to the [six principles of responsible AI](https://www.microsoft.com/ai/responsible-ai?WT.mc_id=academic-105485-koreyst)?

As we move further into an age defined by automation and seamless human-machine interactions, understanding how generative AI transforms the scope, depth, and adaptability of chat applications becomes essential. This lesson will investigate the aspects of architecture that support these intricate systems, delve into the methodologies for fine-tuning them for domain-specific tasks, and evaluate the metrics and considerations pertinent to ensuring responsible AI deployment.

### Introduction

This lesson covers:

- Techniques for efficiently building and integrating chat applications.
- How to apply customization and fine-tuning to applications.
- Strategies and considerations to effectively monitor chat applications.

### Learning Goals

By the end of this lesson, you'll be able to:

- Describe considerations for building and integrating chat applications into existing systems.
- Customize chat applications for specific use-cases.
- Identify key metrics and considerations to effectively monitor and maintain the quality of AI-powered chat applications.
- Ensure chat applications leverage AI responsibly.

### Integrating Generative AI into Chat Applications

Elevating chat applications through generative AI isn't only centered around making them smarter; it's about optimizing their architecture, performance, and user interface to deliver a quality user experience. This involves investigating the architectural foundations, API integrations, and user interface considerations. This section aims to offer you a comprehensive roadmap for navigating these complex landscapes, whether you're plugging them into existing systems or building them as stand-alone platforms.

By the end of this section, you'll be equipped with the expertise needed to efficiently construct and incorporate chat applications.

#### Chatbot or Chat application?

Before we dive into building chat applications, let's compare 'chatbots' against 'AI-powered chat applications,' which serve distinct roles and functionalities. A chatbot's main purpose is to automate specific conversational tasks, such as answering frequently asked questions or tracking a package. It's typically governed by rule-based logic or complex AI algorithms. In contrast, an AI-powered chat application is a far more expansive environment designed to facilitate various forms of digital communication, such as text, voice, and video chats among human users. Its defining feature is the integration of a generative AI model that simulates nuanced, human-like conversations, generating responses based on a wide variety of input and contextual cues. A generative AI powered chat application can engage in open-domain discussions, adapt to evolving conversational contexts, and even produce creative or complex dialogue.

The table below outlines the key differences and similarities to help us understand their unique roles in digital communication.

| Chatbot                               | Generative AI-Powered Chat Application |
| ------------------------------------- | -------------------------------------- |
| Task-Focused and rule based           | Context-aware                          |
| Often integrated into larger systems  | May host one or multiple chatbots      |
| Limited to programmed functions       | Incorporates generative AI models      |
| Specialized & structured interactions | Capable of open-domain discussions     |

#### Leveraging pre-built functionalities with SDKs and APIs

When building a chat application, a great first step is to assess what is already out there. Using SDKs and APIs to build chat applications is an advantageous strategy for a variety of reasons. By integrating well-documented SDKs and APIs, you're strategically positioning your application for long-term success, addressing scalability and maintenance concerns.

- **Expedites the development process and reduces overhead**: Relying on pre-built functionalities instead of the expensive process of building them yourself allows you to focus on other aspects of your application that you may find more important, such as business logic.
- **Better performance**: When building functionality from scratch, you'll eventually ask yourself "How does it scale? Is this application capable of handling a sudden influx of users?" Well maintained SDK and APIs often have built in solutions for these concerns.
- **Easier maintenance**: Updates and improvements are easier to manage as most APIs and SDKs simply require an update to a library when a newer version is released.
- **Access to cutting edge technology**: Leveraging models that have been fined tuned and trained on extensive datasets provides your application with natural language capabilities.

Accessing functionality of an SDK or API typically involves obtaining permission to use the provided services, which is often through the use of a unique key or authentication token. We'll use the OpenAI Python Library to explore what this looks like. You can also try it out on your own in the following [notebook for OpenAI](https://github.com/microsoft/generative-ai-for-beginners/blob/main/07-building-chat-applications/python/oai-assignment.ipynb) or [notebook for Azure OpenAI Services](https://github.com/microsoft/generative-ai-for-beginners/blob/main/07-building-chat-applications/python/aoai-assignment.ipynb) for this lesson.

```python
import os
from openai import OpenAI

API_KEY = os.getenv("OPENAI_API_KEY","")

client = OpenAI(
    api_key=API_KEY
    )

response = client.responses.create(model="gpt-5-mini", input="Suggest two titles for an instructional lesson on chat applications for generative AI.", store=False)
print(response.output_text)
```

The above example uses the GPT-5 mini model with the Responses API to complete the prompt, but notice that the API key is set prior to doing so. You'd receive an error if you didn't set the key.

### User Experience (UX)

General UX principles apply to chat applications, but here are some additional considerations that become particularly important due to the machine learning components involved.

- **Mechanism for addressing ambiguity**: Generative AI models occasionally generate ambiguous answers. A feature that allows users to ask for clarification can be helpful should they come across this problem.
- **Context retention**: Advanced generative AI models have the ability to remember context within a conversation, which can be a necessary asset to the user experience. Giving users the ability to control and manage context improves the user experience, but introduces the risk of retaining sensitive user information. Considerations for how long this information is stored, such as introducing a retention policy, can balance the need for context against privacy.
- **Personalization**: With the ability to learn and adapt, AI models offer an individualized experience for a user. Tailoring the user experience through features like user profiles not only makes the user feel understood, but it also helps their pursuit of finding specific answers, creating a more efficient and satisfying interaction.

One such example of personalization is the "Custom instructions" settings in OpenAI's ChatGPT. It allows you to provide information about yourself that may be important context for your prompts. Here's an example of a custom instruction.

![Custom Instructions Settings in ChatGPT](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/07-building-chat-applications/images/custom-instructions.png)

This "profile" prompts ChatGPT to create a lesson plan on linked lists. Notice that ChatGPT takes into account that the user may want a more in depth lesson plan based on her experience.

![A prompt in ChatGPT for a lesson plan about linked lists](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/07-building-chat-applications/images/lesson-plan-prompt.png)

#### Microsoft's System Message Framework for Large Language Models

[Microsoft has provided guidance](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/system-message#define-the-models-output-format?WT.mc_id=academic-105485-koreyst) for writing effective system messages when generating responses from LLMs broken down into 4 areas:

1. Defining who the model is for, as well as its capabilities and limitations.
2. Defining the model's output format.
3. Providing specific examples that demonstrate intended behavior of the model.
4. Providing additional behavioral guardrails.

#### Accessibility

Whether a user has visual, auditory, motor, or cognitive impairments, a well-designed chat application should be usable by all. The following list breaks down specific features aimed at enhancing accessibility for various user impairments.

- **Features for Visual Impairment**: High contrast themes and resizable text, screen reader compatibility.
- **Features for Auditory Impairment**: Text-to-speech and speech-to-text functions, visual cues for audio notifications.
- **Features for Motor Impairment**: Keyboard navigation support, voice commands.
- **Features for Cognitive Impairment**: Simplified language options.

### Customization and Fine-tuning for Domain-Specific Language Models

Imagine a chat application that understands your company's jargon and anticipates the specific queries its user base commonly has. There are a couple of approaches worth mentioning:

- **Leveraging DSL models**. DSL stands for domain specific language. You can leverage a so called DSL model trained on a specific domain to understand its concepts and scenarios.
- **Apply fine-tuning**. Fine-tuning is the process of further training your model with specific data.

### Customization: Using a DSL

Leveraging a domain-specific language models (DSL Models) can enhance user engagement and by providing specialized, contextually relevant interactions. It's a model that is trained or fine-tuned to understand and generate text related to a specific field, industry, or subject. Options for using a DSL model can vary from training one from scratch, to using pre-existing ones through SDKs and APIs. Another option is fine-tuning, which involves taking an existing pre-trained model and adapting it for a specific domain.

### Customization: Apply fine-tuning

Fine-tuning is often considered when a pre-trained model falls short in a specialized domain or specific task.

For instance, medical queries are complex and require a lot of context. When a medical professional diagnoses a patient it's based on a variety of factors such as lifestyle or pre-existing conditions, and may even rely on recent medical journals to validate their diagnosis. In such nuanced scenarios, a general-purpose AI chat application cannot be a reliable source.

#### Scenario: a medical application

Consider a chat application designed to assist medical practitioners by providing quick references to treatment guidelines, drug interactions, or recent research findings.

A general-purpose model might be adequate for answering basic medical questions or providing general advice, but it may struggle with the following:

- **Highly specific or complex cases**. For example, a neurologist might ask the application, "What are the current best practices for managing drug-resistant epilepsy in pediatric patients?"
- **Lacking recent advancements**. A general-purpose model could struggle to provide a current answer that incorporates the most recent advancements in neurology and pharmacology.

In instances such as these, fine-tuning the model with a specialized medical dataset can significantly improve its ability to handle these intricate medical inquiries more accurately and reliably. This requires access to a large and relevant dataset that represents the domain-specific challenges and questions that need to be addressed.

### Considerations for a High Quality AI-Driven Chat Experience

This section outlines the criteria for "high-quality" chat applications, which include the capture of actionable metrics and adherence to a framework that responsibly leverages AI technology.

#### Key Metrics

To maintain the high-quality performance an application, it's essential to keep track of key metrics and considerations. These measurements not only ensure the functionality of the application but also assess the quality of the AI model and user experience. Below is a list that covers basic, AI, and user experience metrics to consider.

| Metric                        | Definition                                                                                                             | Considerations for Chat Developer                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Uptime**                    | Measures the time the application is operational and accessible by users.                                              | How will you minimize downtime?                                           |
| **Response Time**             | The time taken by the application to reply to a user's query.                                                          | How can you optimize query processing to improve response time?           |
| **Precision**                 | The ratio of true positive predictions to the total number of positive predictions                                     | How will you validate the precision of your model?                        |
| **Recall (Sensitivity)**      | The ratio of true positive predictions to the actual number of positives                                               | How will you measure and improve recall?                                  |
| **F1 Score**                  | The harmonic mean of precision and recall, that balances the trade-off between both.                                   | What is your target F1 Score? How will you balance precision and recall?  |
| **Perplexity**                | Measures how well the probability distribution predicted by the model aligns with the actual distribution of the data. | How will you minimize perplexity?                                         |
| **User Satisfaction Metrics** | Measures the user's perception of the application. Often captured through surveys.                                     | How often will you collect user feedback? How will you adapt based on it? |
| **Error Rate**                | The rate at which the model makes mistakes in understanding or output.                                                 | What strategies do you have in place to reduce error rates?               |
| **Retraining Cycles**         | The frequency with which the model is updated to incorporate new data and insights.                                    | How often will you retrain the model? What triggers a retraining cycle?   |
| **Anomaly Detection**         | Tools and techniques for identifying unusual patterns that do not conform to expected behavior.                        | How will you respond to anomalies?                                        |

#### Implementing Responsible AI Practices in Chat Applications

Microsoft's approach to Responsible AI has identified six principles that should guide AI development and use. Below are the principles, their definition, and things a chat developer should consider and why they should take them seriously.

| Principles             | Microsoft's Definition                                | Considerations for Chat Developer                                      | Why It's Important                                                                     |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Fairness               | AI systems should treat all people fairly.            | Ensure the chat application does not discriminate based on user data.  | To build trust and inclusivity among users; avoids legal ramifications.                |
| Reliability and Safety | AI systems should perform reliably and safely.        | Implement testing and fail-safes to minimize errors and risks.         | Ensures user satisfaction and prevents potential harm.                                 |
| Privacy and Security   | AI systems should be secure and respect privacy.      | Implement strong encryption and data protection measures.              | To safeguard sensitive user data and comply with privacy laws.                         |
| Inclusiveness          | AI systems should empower everyone and engage people. | Design UI/UX that is accessible and easy-to-use for diverse audiences. | Ensures a wider range of people can use the application effectively.                   |
| Transparency           | AI systems should be understandable.                  | Provide clear documentation and reasoning for AI responses.            | Users are more likely to trust a system if they can understand how decisions are made. |
| Accountability         | People should be accountable for AI systems.          | Establish a clear process for auditing and improving AI decisions.     | Enables ongoing improvement and corrective measures in case of mistakes.               |

## Building a Search Applications

> **Source:** [Building a Search Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/08-building-search-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

> > _Click the image above to view video of this lesson_

There's more to LLMs than chatbots and text generation. It's also possible to build search applications using Embeddings. Embeddings are numerical representations of data also known as vectors, and can be used for semantic search for data.

In this lesson, you are going to build a search application for our education startup. Our startup is a non-profit organization that provides free education to students in developing countries. Our startup has a large number of YouTube videos that students can use to learn about AI. Our startup wants to build a search application that allows students to search for a YouTube video by typing a question.

For example, a student might type in 'What are Jupyter Notebooks?' or 'What is Azure ML' and the search application will return a list of YouTube videos that are relevant to the question, and better still, the search application will return a link to the place in the video where the answer to the question is located.

### Introduction

In this lesson, we will cover:

- Semantic vs Keyword search.
- What are Text Embeddings.
- Creating a Text Embeddings Index.
- Searching a Text Embeddings Index.

### Learning Goals

After completing this lesson, you will be able to:

- Tell the difference between semantic and keyword search.
- Explain what Text Embeddings are.
- Create an application using Embeddings to search for data.

### Why build a search application?

Creating a search application will help you understand how to use Embeddings to search for data. You will also learn how to build a search application that can be used by students to find information quickly.

The lesson includes an Embedding Index of the YouTube transcripts for the Microsoft [AI Show](https://www.youtube.com/playlist?list=PLlrxD0HtieHi0mwteKBOfEeOYf0LJU4O1) YouTube channel. The AI Show is a YouTube channel that teaches you about AI and machine learning. The Embedding Index contains the Embeddings for each of the YouTube transcripts up until Oct 2023. You will use the Embedding Index to build a search application for our startup. The search application returns a link to the place in the video where the answer to the question is located. This is a great way for students to find the information they need quickly.

The following is an example of a semantic query for the question 'can you use rstudio with azure ml?'. Check out the YouTube url, you'll see the url contains a timestamp that takes you to the place in the video where the answer to the question is located.

![Semantic query for the question "can you use rstudio with Azure ML"](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/08-building-search-applications/images/query-results.png)

### What is semantic search?

Now you might be wondering, what is semantic search? Semantic search is a search technique that uses the semantics, or meaning, of the words in a query to return relevant results.

Here is an example of a semantic search. Let's say you were looking to buy a car, you might search for 'my dream car', semantic search understands that you are not `dreaming` about a car, but rather you are looking to buy your `ideal` car. Semantic search understands your intention and returns relevant results. The alternative is `keyword search` which would literally search for dreams about cars and often returns irrelevant results.

### What are Text Embeddings?

[Text embeddings](https://en.wikipedia.org/wiki/Word_embedding?WT.mc_id=academic-105485-koreyst) are a text representation technique used in [natural language processing](https://en.wikipedia.org/wiki/Natural_language_processing?WT.mc_id=academic-105485-koreyst). Text embeddings are semantic numerical representations of text. Embeddings are used to represent data in a way that is easy for a machine to understand. There are many models for building text embeddings, in this lesson, we will focus on generating embeddings using the OpenAI Embedding Model.

Here's an example, imagine the following text is in a transcript from one of the episodes on the AI Show YouTube channel:

```text
Today we are going to learn about Azure Machine Learning.
```

We'd pass the text to the OpenAI Embedding API and it would return the following embedding consisting of 1536 numbers aka a vector. Each number in the vector represents a different aspect of the text. For brevity, here are the first 10 numbers in the vector.

```python
[-0.006655829958617687, 0.0026128944009542465, 0.008792596869170666, -0.02446001023054123, -0.008540431968867779, 0.022071078419685364, -0.010703742504119873, 0.003311325330287218, -0.011632772162556648, -0.02187200076878071, ...]
```

### How is the Embedding index created?

The Embedding index for this lesson was created with a series of Python scripts. You'll find the scripts along with instructions in the [README](https://github.com/microsoft/generative-ai-for-beginners/blob/main/08-building-search-applications/scripts/README.md) in the 'scripts` folder for this lesson. You don't need to run these scripts to complete this lesson as the Embedding Index is provided for you.

The scripts perform the following operations:

1. The transcript for each YouTube video in the [AI Show](https://www.youtube.com/playlist?list=PLlrxD0HtieHi0mwteKBOfEeOYf0LJU4O1) playlist is downloaded.
2. Using [OpenAI Functions](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/function-calling?WT.mc_id=academic-105485-koreyst), an attempt is made to extract the speaker name from the first 3 minutes of the YouTube transcript. The speaker name for each video is stored in the Embedding Index named `embedding_index_3m.json`.
3. The transcript text is then chunked into **3 minute text segments**. The segment includes about 20 words overlapping from the next segment to ensure that the Embedding for the segment is not cut off and to provide better search context.
4. Each text segment is then passed to the OpenAI Chat API to summarize the text into 60 words. The summary is also stored in the Embedding Index `embedding_index_3m.json`.
5. Finally, the segment text is passed to the OpenAI Embedding API. The Embedding API returns a vector of 1536 numbers that represent the semantic meaning of the segment. The segment along with the OpenAI Embedding vector is stored in an Embedding Index `embedding_index_3m.json`.

#### Vector Databases

For lesson simplicity, the Embedding Index is stored in a JSON file named `embedding_index_3m.json` and loaded into a Pandas DataFrame. However, in production, the Embedding Index would be stored in a vector database such as [Azure Cognitive Search](https://learn.microsoft.com/training/modules/improve-search-results-vector-search?WT.mc_id=academic-105485-koreyst), [Redis](https://cookbook.openai.com/examples/vector_databases/redis/readme?WT.mc_id=academic-105485-koreyst), [Pinecone](https://cookbook.openai.com/examples/vector_databases/pinecone/readme?WT.mc_id=academic-105485-koreyst), [Weaviate](https://cookbook.openai.com/examples/vector_databases/weaviate/readme?WT.mc_id=academic-105485-koreyst), to name but a few.

### Understanding cosine similarity

We've learned about text embeddings, the next step is to learn how to use text embeddings to search for data and in particular find the most similar embeddings to a given query using cosine similarity.

#### What is cosine similarity?

Cosine similarity is a measure of similarity between two vectors, you'll also hear this referred to as `nearest neighbor search`. To perform a cosine similarity search you need to _vectorize_ for _query_ text using the OpenAI Embedding API. Then calculate the _cosine similarity_ between the query vector and each vector in the Embedding Index. Remember, the Embedding Index has a vector for each YouTube transcript text segment. Finally, sort the results by cosine similarity and the text segments with the highest cosine similarity are the most similar to the query.

From a mathematic perspective, cosine similarity measures the cosine of the angle between two vectors projected in a multidimensional space. This measurement is beneficial, because if two documents are far apart by Euclidean distance because of size, they could still have a smaller angle between them and therefore higher cosine similarity. For more information about cosine similarity equations, see [Cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity?WT.mc_id=academic-105485-koreyst).

### Building your first search application

Next, we're going to learn how to build a search application using Embeddings. The search application will allow students to search for a video by typing a question. The search application will return a list of videos that are relevant to the question. The search application will also return a link to the place in the video where the answer to the question is located.

This solution was built and tested on Windows 11, macOS, and Ubuntu 22.04 using Python 3.10 or later. You can download Python from [python.org](https://www.python.org/downloads/?WT.mc_id=academic-105485-koreyst).

### Solution

Open the [solution notebook](https://github.com/microsoft/generative-ai-for-beginners/blob/main/08-building-search-applications/python/aoai-solution.ipynb) in GitHub Codespaces and follow the instructions in the Jupyter Notebook.

When you run the notebook, you'll be prompted to enter a query. The input box will look like this:

![Input box for the user to input a query](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/08-building-search-applications/images/notebook-search.png)

## Building Image Generation Applications

> **Source:** [Building Image Generation Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/09-building-image-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

There's more to LLMs than text generation. You can also generate images from text descriptions. Images as a modality are useful across MedTech, architecture, tourism, game development, marketing, and more. In this lesson we look at today's **GPT Image** models and build an image generation app.

### Introduction

Image generation lets you turn a natural-language prompt into a picture. In this lesson we work with the **`gpt-image`** family of models from OpenAI - the current generation of image models available on **[Microsoft Foundry](https://ai.azure.com?WT.mc_id=academic-105485-koreyst)** and the OpenAI platform. These models replace the older DALL·E models (DALL·E 2/3 are legacy).

Throughout the lesson we use a fictitious startup, **Edu4All**, that builds learning tools. The team wants to generate illustrations for assignments and study materials.

### Learning goals

By the end of this lesson you'll be able to:

- Explain what image generation is and where it's useful.
- Understand the `gpt-image` model family and how it differs from the legacy DALL·E models.
- Build an image generation app in Python (and TypeScript / .NET).
- Edit images and apply safety guardrails with metaprompts.

### What is image generation?

Image generation models create images from a text prompt. Modern models such as `gpt-image` are built on transformer + diffusion techniques: the model learns the relationship between text and images during training, then, given a prompt, iteratively "denoises" random noise into an image that matches the description.

Two well-known families of image models are:

- **`gpt-image` (OpenAI)** - the current generation, used in this lesson. It supports text-to-image generation and image editing (inpainting with a mask).
- **Midjourney** - a popular third-party model with its own service and Discord-based workflow.

> Older OpenAI image models - **DALL·E 2** and **DALL·E 3** - are legacy. DALL·E 3 is no longer available for new deployments, and features like `create_variation` only existed in DALL·E 2. Use the `gpt-image` models for new applications.

#### Which `gpt-image` model should I use?

On Microsoft Foundry the following are **Generally Available**:

| Model | Notes |
| --- | --- |
| **`gpt-image-2`** | The latest and most capable image model - recommended default. |
| `gpt-image-1.5` | Generally available; strong quality at lower cost. |
| `gpt-image-1-mini` | Generally available; fastest / lowest cost. |
| `gpt-image-1` | Preview only. |

Always check the current [Foundry image models list](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/models?WT.mc_id=academic-105485-koreyst) for availability and regions.

> **Important:** `gpt-image` models return the generated image as **base64** (`b64_json`), not as a URL. Your code decodes the base64 string to bytes and saves it - there's no image URL to download.

### Setup

You can run the samples against **Azure OpenAI in Microsoft Foundry** (the `aoai-*` samples) or the **OpenAI platform** (the `oai-*` samples).

#### 1. Create and deploy a model

Follow the [create a resource](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/create-resource?pivots=web-portal&WT.mc_id=academic-105485-koreyst) guide to create a Microsoft Foundry resource, then deploy an image model - **`gpt-image-2`** is recommended.

#### 2. Configure your `.env`

```text
AZURE_OPENAI_ENDPOINT=<your endpoint>
AZURE_OPENAI_API_KEY=<your key>
AZURE_OPENAI_DEPLOYMENT="gpt-image-2"
```

Find these values on the **Deployments** page of your resource in the [Foundry portal](https://ai.azure.com?WT.mc_id=academic-105485-koreyst).

#### 3. Install the libraries

Create a `requirements.txt`:

```text
python-dotenv
openai
pillow
```

Then create and activate a virtual environment and install:

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Build the app

Create `app.py` with the following code. It generates an image and saves it as a PNG.

```python
import os
import base64
from openai import AzureOpenAI
from PIL import Image
import dotenv

dotenv.load_dotenv()

# Point the client at your Azure OpenAI (Microsoft Foundry) resource.
# Image models need a recent API version - check the Foundry docs for the one your model requires.
client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2025-04-01-preview",
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
)

deployment = os.environ["AZURE_OPENAI_DEPLOYMENT"]  # e.g. "gpt-image-2"

result = client.images.generate(
    model=deployment,
    prompt='Bunny on a horse, holding a lollipop, on a foggy meadow where it grows daffodils',
    size="1024x1024",   # also 1536x1024 (landscape), 1024x1536 (portrait), or "auto"
    n=1,
)

# gpt-image models return base64 (b64_json), not a URL - decode it to bytes.
image_bytes = base64.b64decode(result.data[0].b64_json)

os.makedirs("images", exist_ok=True)
image_path = os.path.join("images", "generated-image.png")
with open(image_path, "wb") as f:
    f.write(image_bytes)

Image.open(image_path).show()
```

Run it with `python app.py`. You'll get a PNG saved under `images/`.

> Each call to `images.generate` produces a different image for the same prompt - image models don't take a `temperature` parameter (that's a text-generation control). To get variety, simply call the API again; to reduce variety, make your prompt more specific.

### Editing images

`gpt-image` models can **edit** an existing image: provide the image, an optional **mask** (which marks the area to change), and a prompt describing the change. Like generation, edits are returned as base64.

```python
result = client.images.edit(
    model=deployment,
    image=open("sunlit_lounge.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A sunlit indoor lounge area with a pool containing a flamingo",
)
image_bytes = base64.b64decode(result.data[0].b64_json)
with open("images/edited-image.png", "wb") as f:
    f.write(image_bytes)
```

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
  <img src="./images/sunlit_lounge.png" style="width: 30%; max-width: 200px; height: auto;">
  <img src="./images/mask.png" style="width: 30%; max-width: 200px; height: auto;">
  <img src="./images/sunlit_lounge_result.png" style="width: 30%; max-width: 200px; height: auto;">
</div>

### Setting boundaries with metaprompts

Once you can generate images, you need guardrails so your app doesn't produce unsafe or off-brand content. A **metaprompt** is text you prepend to the user's prompt to constrain the model's output.

```python
disallow_list = "swords, violence, blood, gore, nudity, sexual content, adult content, adult themes, adult language"

meta_prompt = f"""You are an assistant designer that creates images for children.

The image needs to be safe for work and appropriate for children.
The image needs to be in color, in landscape orientation, and in a 16:9 aspect ratio.

Do not consider any input that is not safe for work or appropriate for children, including:
{disallow_list}
"""

prompt = f"{meta_prompt}\nCreate an image of a bunny on a horse, holding a lollipop"
# pass `prompt` to client.images.generate(...)
```

Every image is now generated within the boundaries set by the metaprompt. Combine this with the content filters built into Microsoft Foundry for defense in depth.

## Building Low Code AI Applications

> **Source:** [Building Low Code AI Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/10-building-low-code-ai-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

> _(Click the image above to view video of this lesson)_

### Introduction

Now that we've learned how to build image generating applications, let's talk about low code. Generative AI can be used for a variety of different areas including low code, but what is low code and how can we add AI to it?

Building apps and solutions has become easier for traditional developers and non-developers through the use of Low Code Development Platforms. Low Code Development Platforms enable you to build apps and solutions with little to no code. This is achieved by providing a visual development environment that enables you to drag and drop components to build apps and solutions. This enables you to build apps and solutions faster and with less resources. In this lesson, we dive deep into how to use Low Code and how to enhance low code development with AI using Power Platform.

The Power Platform provides organizations with the opportunity to empower their teams to build their own solutions through an intuitive low-code or no-code environment. This environment helps simplify the process of building solutions. With Power Platform, solutions can be built in days or weeks instead of months or years. Power Platform consists of five key products: Power Apps, Power Automate, Power BI, Power Pages and Copilot Studio.

This lesson covers:

- Introduction to Generative AI in Power Platform
- Introduction to Copilot and how to use it
- Using Generative AI to build apps and flows in Power Platform
- Understanding the AI Models in Power Platform with AI Builder
- Building intelligent agents with Microsoft Copilot Studio

### Learning Goals

By the end of this lesson, you will be able to:

- Understand how Copilot works in Power Platform.

- Build a Student Assignment Tracker App for our education startup.

- Build an Invoice Processing Flow that uses AI to extract information from invoices.

- Apply best practices when using the Create Text with GPT AI Model.

- Understand what Microsoft Copilot Studio is and how to build intelligent agents with it.

The tools and technologies that you will use in this lesson are:

- **Power Apps**, for the Student Assignment Tracker app, which provides a low-code development environment for building apps to track, manage and interact with data.

- **Dataverse**, for storing the data for the Student Assignment Tracker app where Dataverse will provide a low-code data platform for storing the app's data.

- **Power Automate**, for the Invoice Processing flow where you will have low-code development environment for building workflows to automate the Invoice Processing process.

- **AI Builder**, for the Invoice Processing AI Model where you will use prebuilt AI Models to process the invoices for our startup.

### Generative AI in Power Platform

Enhancing low-code development and application with generative AI is a key focus area for Power Platform. The goal is to enable everyone to build AI-powered apps, sites, dashboards and automate processes with AI, _without requiring any data science expertise_. This goal is achieved by integrating generative AI into the low-code development experience in Power Platform in the form of Copilot and AI Builder.

#### How does this work?

Copilot is an AI assistant that enables you to build Power Platform solutions by describing your requirements in a series of conversational steps using natural language. You can for example instruct your AI assistant to state what fields your app will use and it will create both the app and the underlying data model or you could specify how to set up a flow in Power Automate.

You can use Copilot driven functionalities as a feature in your app screens to enable users to uncover insights through conversational interactions.

AI Builder is a low-code AI capability available in Power Platform that enables you to use AI Models to help you to automate processes and predict outcomes. With AI Builder you can bring AI to your apps and flows that connect to your data in Dataverse or in various cloud data sources, such as SharePoint, OneDrive or Azure.

Copilot is available in all of the Power Platform products: Power Apps, Power Automate, Power BI, Power Pages and Copilot Studio (formerly Power Virtual Agents). AI Builder is available in Power Apps and Power Automate. In this lesson, we will focus on how to use Copilot and AI Builder in Power Apps and Power Automate to build a solution for our education startup.

#### Copilot in Power Apps

As part of the Power Platform, Power Apps provides a low-code development environment for building apps to track, manage and interact with data. It's a suite of app development services with a scalable data platform and the ability to connect to cloud services and on-premises data. Power Apps allows you to build apps that run on browsers, tablets, and phones, and can be shared with co-workers. Power Apps eases users into app development with a simple interface, so that every business user or pro developer can build custom apps. The app development experience is also enhanced with Generative AI through Copilot.

The copilot AI assistant feature in Power Apps enables you to describe what kind of app you need and what information you want your app to track, collect, or show. Copilot then generates a responsive Canvas app based on your description. You can then customize the app to meet your needs. The AI Copilot also generates and suggests a Dataverse Table with the fields you need to store the data you want to track and some sample data. We will look at what Dataverse is and how you can use it in Power Apps in this lesson later. You can then customize the table to meet your needs using the AI Copilot assistant feature through conversational steps. This feature is readily available from the Power Apps home screen.

#### Copilot in Power Automate

As part of the Power Platform, Power Automate lets users create automated workflows between applications and services. It helps automate repetitive business processes such as communication, data collection, and decision approvals. Its simple interface allows users with every technical competence (from beginners to seasoned developers) to automate work tasks. The workflow development experience is also enhanced with Generative AI through Copilot.

The copilot AI assistant feature in Power Automate enables you to describe what kind of flow you need and what actions you want your flow to perform. Copilot then generates a flow based on your description. You can then customize the flow to meet your needs. The AI Copilot also generates and suggests the actions you need to perform the task you want to automate. We will look at what flows are and how you can use them in Power Automate in this lesson later. You can then customize the actions to meet your needs using the AI Copilot assistant feature through conversational steps. This feature is readily available from the Power Automate home screen.

### Building Intelligent Agents with Microsoft Copilot Studio

[Microsoft Copilot Studio](https://learn.microsoft.com/microsoft-copilot-studio/fundamentals-what-is-copilot-studio?WT.mc_id=academic-105485-koreyst) (formerly Power Virtual Agents) is the low-code member of the Power Platform for building **AI agents** — conversational copilots that can answer questions, take actions, and automate tasks on behalf of your users. Just like the rest of Power Platform, you build these agents in a visual, natural-language-first experience: you describe what you want the agent to do, and Copilot Studio helps scaffold its instructions, knowledge, and actions.

For our education startup, you could build an agent that answers student questions about courses, checks assignment deadlines, and even emails an instructor — all without writing code.

Here are some of the latest capabilities that make Copilot Studio powerful:

- **Generative answers from your knowledge**. Instead of hand-authoring every conversation, you can connect **knowledge sources** — public websites, SharePoint, OneDrive, Dataverse, uploaded files, or enterprise data through connectors — and the agent generates grounded answers from them.

- **Generative orchestration**. Rather than relying on rigid trigger phrases, the agent uses AI to understand a request and dynamically decide which knowledge, topics, and actions to combine to fulfil it, including chaining several steps together.

- **Actions and connectors**. Agents can *do* things, not just chat. You can give an agent actions backed by the 1,500+ prebuilt Power Platform connectors, Power Automate flows, custom REST APIs, prompts, or **Model Context Protocol (MCP)** servers.

- **Autonomous agents**. Agents aren't limited to responding in a chat window. You can build **autonomous agents** that are triggered by events — such as a new email, a new record in Dataverse, or a file being uploaded — and then act in the background to complete a task.

- **Multi-agent orchestration**. Agents can call other agents. A Copilot Studio agent can hand off to, or be extended by, other agents, including agents published to Microsoft 365 Copilot and agents built in Microsoft Foundry.

- **Model choice**. Beyond the built-in models, you can bring models from the Microsoft Foundry model catalog to tailor how your agent reasons and responds.

- **Publish anywhere**. Once built, an agent can be published to multiple channels — Microsoft Teams, Microsoft 365 Copilot, a website or custom app, and more — with security, authentication, and analytics managed through the Power Platform admin experience.

You can start building your first agent at [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com?WT.mc_id=academic-105485-koreyst) and learn more in the [Microsoft Copilot Studio documentation](https://learn.microsoft.com/microsoft-copilot-studio/?WT.mc_id=academic-105485-koreyst).

### AI Models in Power Platform with AI Builder

AI Builder is a low-code AI capability available in Power Platform that enables you to use AI Models to help you to automate processes and predict outcomes. With AI Builder you can bring AI to your apps and flows that connect to your data in Dataverse or in various cloud data sources, such as SharePoint, OneDrive or Azure.

### Prebuilt AI Models vs Custom AI Models

AI Builder provides two types of AI Models: Prebuilt AI Models and Custom AI Models. Prebuilt AI Models are ready-to-use AI Models that are trained by Microsoft and available in Power Platform. These help you add intelligence to your apps and flows without having to gather data and then build, train and publish your own models. You can use these models to automate processes and predict outcomes.

Some of the Prebuilt AI Models available in Power Platform include:

- **Key Phrase Extraction**: This model extracts key phrases from text.
- **Language Detection**: This model detects the language of a text.
- **Sentiment Analysis**: This model detects positive, negative, neutral, or mixed sentiment in text.
- **Business Card Reader**: This model extracts information from business cards.
- **Text Recognition**: This model extracts text from images.
- **Object Detection**: This model detects and extracts objects from images.
- **Document processing**: This model extracts information from forms.
- **Invoice Processing**: This model extracts information from invoices.

With Custom AI Models you can bring your own model into AI Builder so that it can function like any AI Builder custom model, allowing you to train the model using your own data. You can use these models to automate processes and predict outcomes in both Power Apps and Power Automate. When using your own model there are limitations that apply. Read more on these [limitations](https://learn.microsoft.com/ai-builder/byo-model#limitations?WT.mc_id=academic-105485-koreyst).

![AI builder models](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/10-building-low-code-ai-applications/images/ai-builder-models.png)

### Use a Text Generation AI Model in Power Automate

The Create Text with GPT AI Model in AI Builder enables you to generate text based on a prompt and is powered by the Microsoft Azure OpenAI Service. With this capability, you can incorporate GPT (Generative Pre-Trained Transformer) technology into your apps and flows to build a variety of automated flows and insightful applications.

GPT models undergo extensive training on vast amounts of data, enabling them to produce text that closely resembles human language when provided with a prompt. When integrated with workflow automation, AI models like GPT can be harnessed to streamline and automate a wide range of tasks.

For example, you can build flows to automatically generate text for a variety of use cases, such as: drafts of emails, product descriptions, and more. You can also use the model to generate text for a variety of apps, such as chatbots and customer service apps that enable customer service agents to respond effectively and efficiently to customer inquiries.

![create a prompt](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/10-building-low-code-ai-applications/images/create-prompt-gpt.png)

To learn how to use this AI Model in Power Automate, go through the [Add intelligence with AI Builder and GPT](https://learn.microsoft.com/training/modules/ai-builder-text-generation/?WT.mc_id=academic-109639-somelezediko) module.

## Integrating with function calling

> **Source:** [Integrating with function calling](https://github.com/microsoft/generative-ai-for-beginners/tree/main/11-integrating-with-function-calling) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

You've learned a fair bit so far in the previous lessons. However, we can improve further. Some things we can address are how we can get a more consistent response format to make it easier to work with the response downstream. Also, we might want to add data from other sources to further enrich our application.

The above-mentioned problems are what this chapter is looking to address.

### Introduction

This lesson will cover:

- Explain what function calling is and its use cases.
- Creating a function call using Azure OpenAI.
- How to integrate a function call into an application.

### Learning Goals

By the end of this lesson, you will be able to:

- Explain the purpose of using function calling.
- Setup Function Call using the Azure OpenAI Service.
- Design effective function calls for your application's use case.

### Scenario: Improving our chatbot with functions

For this lesson, we want to build a feature for our education startup that allows users to use a chatbot to find technical courses. We will recommend courses that fit their skill level, current role and technology of interest.

To complete this scenario, we will use a combination of:

- `Azure OpenAI` to create a chat experience for the user.
- `Microsoft Learn Catalog API` to help users find courses based on the request of the user.
- `Function Calling` to take the user's query and send it to a function to make the API request.

To get started, let's look at why we would want to use function calling in the first place:

### Why Function Calling

Before function calling, responses from an LLM were unstructured and inconsistent. Developers were required to write complex validation code to make sure they were able to handle each variation of a response. Users could not get answers like "What is the current weather in Stockholm?". This is because models were limited to the time the data was trained on.

Function Calling is a feature of the Azure OpenAI Service to overcome the following limitations:

- **Consistent response format**. If we can better control the response format we can more easily integrate the response downstream to other systems.
- **External data**. Ability to use data from other sources of an application in a chat context.

### Illustrating the problem through a scenario

> We recommend you to use the [included notebook](https://github.com/microsoft/generative-ai-for-beginners/blob/main/11-integrating-with-function-calling/python/aoai-assignment.ipynb) if you want to run the below scenario. You can also just read along as we're trying to illustrate a problem where functions can help to address the problem.

Let's look at the example that illustrates the response format problem:

Let's say we want to create a database of student data so we can suggest the right course to them. Below we have two descriptions of students that are very similar in the data they contain.

1. Create a connection to our Azure OpenAI resource:

   ```python
   import os
   import json
   from openai import OpenAI
   from dotenv import load_dotenv
   load_dotenv()

   # The Responses API is served from the Azure OpenAI (Microsoft Foundry) v1
   # endpoint, so we point the OpenAI client at <your-endpoint>/openai/v1/.
   endpoint = os.environ['AZURE_OPENAI_ENDPOINT']
   client = OpenAI(
   api_key=os.environ['AZURE_OPENAI_API_KEY'],
   base_url=f"{endpoint.rstrip('/')}/openai/v1/",
   )

   deployment=os.environ['AZURE_OPENAI_DEPLOYMENT']
   ```

   Below is some Python code for configuring our connection to Azure OpenAI. Because we use the v1 endpoint, we only need to set the `api_key` and `base_url` (no `api_version` is required).

1. Creating two student descriptions using variables `student_1_description` and `student_2_description`.

   ```python
   student_1_description="Emily Johnson is a sophomore majoring in computer science at Duke University. She has a 3.7 GPA. Emily is an active member of the university's Chess Club and Debate Team. She hopes to pursue a career in software engineering after graduating."

   student_2_description = "Michael Lee is a sophomore majoring in computer science at Stanford University. He has a 3.8 GPA. Michael is known for his programming skills and is an active member of the university's Robotics Club. He hopes to pursue a career in artificial intelligence after finishing his studies."
   ```

   We want to send the above student descriptions to an LLM to parse the data. This data can later be used in our application and be sent to an API or stored in a database.

1. Let's create two identical prompts in which we instruct the LLM on what information we are interested in:

   ```python
   prompt1 = f'''
   Please extract the following information from the given text and return it as a JSON object:

   name
   major
   school
   grades
   club

   This is the body of text to extract the information from:
   {student_1_description}
   '''

   prompt2 = f'''
   Please extract the following information from the given text and return it as a JSON object:

   name
   major
   school
   grades
   club

   This is the body of text to extract the information from:
   {student_2_description}
   '''
   ```

   The above prompts instruct the LLM to extract information and return the response in JSON format.

1. After setting up the prompts and the connection to Azure OpenAI, we will now send the prompts to the LLM by using `client.responses.create`. We store the prompt in the `input` variable and assign the role to `user`. This is to mimic a message from a user being written to a chatbot.

   ```python
   # response from prompt one
   openai_response1 = client.responses.create(
   model=deployment,
   input = [{'role': 'user', 'content': prompt1}],
   store=False,
   )
   openai_response1.output_text

   # response from prompt two
   openai_response2 = client.responses.create(
   model=deployment,
   input = [{'role': 'user', 'content': prompt2}],
   store=False,
   )
   openai_response2.output_text
   ```

Now we can send both requests to the LLM and examine the response we receive by finding it like so `openai_response1.output_text`.

1. Lastly, we can convert the response to JSON format by calling `json.loads`:

   ```python
   # Loading the response as a JSON object
   json_response1 = json.loads(openai_response1.output_text)
   json_response1
   ```

   Response 1:

   ```json
   {
     "name": "Emily Johnson",
     "major": "computer science",
     "school": "Duke University",
     "grades": "3.7",
     "club": "Chess Club"
   }
   ```

   Response 2:

   ```json
   {
     "name": "Michael Lee",
     "major": "computer science",
     "school": "Stanford University",
     "grades": "3.8 GPA",
     "club": "Robotics Club"
   }
   ```

   Even though the prompts are the same and the descriptions are similar, we see values of the `Grades` property formatted differently, as we can sometimes get the format `3.7` or `3.7 GPA` for example.

   This result is because the LLM takes unstructured data in the form of the written prompt and returns also unstructured data. We need to have a structured format so that we know what to expect when storing or using this data

So how do we solve the formatting problem then? By using functional calling, we can make sure that we receive structured data back. When using function calling, the LLM does not actually call or run any functions. Instead, we create a structure for the LLM to follow for its responses. We then use those structured responses to know what function to run in our applications.

![function flow](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/11-integrating-with-function-calling/images/Function-Flow.png)

We can then take what is returned from the function and send this back to the LLM. The LLM will then respond using natural language to answer the user's query.

### Use Cases for using function calls

There are many different use cases where function calls can improve your app like:

- **Calling External Tools**. Chatbots are great at providing answers to questions from users. By using function calling, the chatbots can use messages from users to complete certain tasks. For example, a student can ask the chatbot to "Send an email to my instructor saying I need more assistance with this subject". This can make a function call to `send_email(to: string, body: string)`

- **Create API or Database Queries**. Users can find information using natural language that gets converted into a formatted query or API request. An example of this could be a teacher who requests "Who are the students that completed the last assignment" which could call a function named `get_completed(student_name: string, assignment: int, current_status: string)`

- **Creating Structured Data**. Users can take a block of text or CSV and use the LLM to extract important information from it. For example, a student can convert a Wikipedia article about peace agreements to create AI flashcards. This can be done by using a function called `get_important_facts(agreement_name: string, date_signed: string, parties_involved: list)`

### Creating Your First Function Call

The process of creating a function call includes 3 main steps:

1. **Calling** the Responses API with a list of your functions (tools) and a user message.
2. **Reading** the model's response to perform an action i.e. execute a function or API Call.
3. **Making** another call to the Responses API with the response from your function to use that information to create a response to the user.

![LLM Flow](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/11-integrating-with-function-calling/images/LLM-Flow.png)

#### Step 1 - creating messages

The first step is to create a user message. This can be dynamically assigned by taking the value of a text input or you can assign a value here. If this is your first time working with the Responses API, we need to define the `role` and the `content` of the message.

The `role` can be either `system` (creating rules), `assistant` (the model) or `user` (the end-user). For function calling, we will assign this as `user` and an example question.

```python
messages= [ {"role": "user", "content": "Find me a good course for a beginner student to learn Azure."} ]
```

By assigning different roles, it's made clear to the LLM if it's the system saying something or the user, which helps to build a conversation history that the LLM can build upon.

#### Step 2 - creating functions

Next, we will define a function and the parameters of that function. We will use just one function here called `search_courses` but you can create multiple functions.

> **Important** : Functions are included in the system message to the LLM and will be included in the amount of available tokens you have available.

Below, we create the functions as an array of items. Each item is a tool in the flat Responses API format, with properties `type`, `name`, `description` and `parameters`:

```python
functions = [
   {
      "type":"function",
      "name":"search_courses",
      "description":"Retrieves courses from the search index based on the parameters provided",
      "parameters":{
         "type":"object",
         "properties":{
            "role":{
               "type":"string",
               "description":"The role of the learner (i.e. developer, data scientist, student, etc.)"
            },
            "product":{
               "type":"string",
               "description":"The product that the lesson is covering (i.e. Azure, Power BI, etc.)"
            },
            "level":{
               "type":"string",
               "description":"The level of experience the learner has prior to taking the course (i.e. beginner, intermediate, advanced)"
            }
         },
         "required":[
            "role"
         ]
      }
   }
]
```

Let's describe each function instance more in detail below:

- `name` - The name of the function that we want to have called.
- `description` - This is the description of how the function works. Here it's important to be specific and clear.
- `parameters` - A list of values and format that you want the model to produce in its response. The parameters array consists of items where the items have the following properties:
  1.  `type` - The data type of the properties will be stored in.
  1.  `properties` - List of the specific values that the model will use for its response
      1. `name` - The key is the name of the property that the model will use in its formatted response, for example, `product`.
      1. `type` - The data type of this property, for example, `string`.
      1. `description` - Description of the specific property.

There's also an optional property `required` - required property for the function call to be completed.

#### Step 3 - Making the function call

After defining a function, we now need to include it in the call to the Responses API. We do this by adding `tools` to the request. In this case `tools=functions`.

There is also an option to set `tool_choice` to `auto`. This means we will let the LLM decide which function should be called based on the user message rather than assigning it ourselves.

Here's some code below where we call `client.responses.create`, note how we set `tools=functions` and `tool_choice="auto"` and thereby giving the LLM the choice when to call the functions we provide it:

```python
response = client.responses.create(model=deployment,
                                        input=messages,
                                        tools=functions,
                                        tool_choice="auto",
                                        store=False)

print(response.output)
```

The response coming back now includes a `function_call` item in `response.output` that looks like so:

```json
{
  "type": "function_call",
  "name": "search_courses",
  "call_id": "call_abc123",
  "arguments": "{\n  \"role\": \"student\",\n  \"product\": \"Azure\",\n  \"level\": \"beginner\"\n}"
}
```

Here we can see how the function `search_courses` was called and with what arguments, as listed in the `arguments` property in the JSON response.

The conclusion the LLM was able to find the data to fit the arguments of the function as it was extracting it from the value provided to the `input` parameter in the Responses API call. Below is a reminder of the `messages` value:

```python
messages= [ {"role": "user", "content": "Find me a good course for a beginner student to learn Azure."} ]
```

As you can see, `student`, `Azure` and `beginner` was extracted from `messages` and set as input to the function. Using functions this way is a great way to extract information from a prompt but also to provide structure to the LLM and have reusable functionality.

Next, we need to see how we can use this in our app.

### Integrating Function Calls into an Application

After we have tested the formatted response from the LLM, we can now integrate this into an application.

#### Managing the flow

To integrate this into our application, let's take the following steps:

1. First, let's make the call to the OpenAI services and extract the function call items from the response `output`.

   ```python
   response_items = response.output
   tool_calls = [item for item in response_items if item.type == "function_call"]
   ```

1. Now we will define the function that will call the Microsoft Learn API to get a list of courses:

   ```python
   import requests

   def search_courses(role, product, level):
     url = "https://learn.microsoft.com/api/catalog/"
     params = {
        "role": role,
        "product": product,
        "level": level
     }
     response = requests.get(url, params=params)
     modules = response.json()["modules"]
     results = []
     for module in modules[:5]:
        title = module["title"]
        url = module["url"]
        results.append({"title": title, "url": url})
     return str(results)
   ```

   Note how we now create an actual Python function that maps to the function names introduced in the `functions` variable. We're also making real external API calls to fetch the data we need. In this case, we go against the Microsoft Learn API to search for training modules.

Ok, so we created `functions` variables and a corresponding Python function, how do we tell the LLM how to map these two together so our Python function is called?

1. To see if we need to call a Python function, we need to look into the LLM response and see if a `function_call` item is part of it and call the pointed-out function. Here's how you can make the mentioned check below:

   ```python
   # Check if the model wants to call a function
   if tool_calls:
    for tool_call in tool_calls:
     print("Recommended Function call:")
     print(tool_call.name)
     print()

     # Call the function.
     function_name = tool_call.name

     available_functions = {
             "search_courses": search_courses,
     }
     function_to_call = available_functions[function_name]

     function_args = json.loads(tool_call.arguments)
     function_response = function_to_call(**function_args)

     print("Output of function call:")
     print(function_response)
     print(type(function_response))

     # Add the function call and its result back to the conversation.
     # The model's function_call item must be appended before its output.
     messages.append(tool_call)  # the assistant's function_call item
     messages.append( # the function result
         {
             "type": "function_call_output",
             "call_id": tool_call.call_id,
             "output": function_response,
         }
     )
   ```

   These three lines, ensure we extract the function name, the arguments and make the call:

   ```python
   function_to_call = available_functions[function_name]

   function_args = json.loads(tool_call.arguments)
   function_response = function_to_call(**function_args)
   ```

   Below is the output from running our code:

   **Output**

   ```Recommended
   {
     "name": "search_courses",
     "arguments": "{\n  \"role\": \"student\",\n  \"product\": \"Azure\",\n  \"level\": \"beginner\"\n}"
   }

   Output of function call:
   [{'title': 'Describe concepts of cryptography', 'url': 'https://learn.microsoft.com/training/modules/describe-concepts-of-cryptography/?
   WT.mc_id=api_CatalogApi'}, {'title': 'Introduction to audio classification with TensorFlow', 'url': 'https://learn.microsoft.com/en-
   us/training/modules/intro-audio-classification-tensorflow/?WT.mc_id=api_CatalogApi'}, {'title': 'Design a Performant Data Model in Azure SQL
   Database with Azure Data Studio', 'url': 'https://learn.microsoft.com/training/modules/design-a-data-model-with-ads/?
   WT.mc_id=api_CatalogApi'}, {'title': 'Getting started with the Microsoft Cloud Adoption Framework for Azure', 'url':
   'https://learn.microsoft.com/training/modules/cloud-adoption-framework-getting-started/?WT.mc_id=api_CatalogApi'}, {'title': 'Set up the
   Rust development environment', 'url': 'https://learn.microsoft.com/training/modules/rust-set-up-environment/?WT.mc_id=api_CatalogApi'}]
   <class 'str'>
   ```

1. Now we will send the updated message, `messages` to the LLM so we can receive a natural language response instead of an API JSON formatted response.

   ```python
   print("Messages in next request:")
   print(messages)
   print()

   second_response = client.responses.create(
      input=messages,
      model=deployment,
      tool_choice="auto",
      tools=functions,
      temperature=0,
      store=False,
         )  # get a new response from the model where it can see the function response

   print(second_response.output_text)
   ```

   **Output**

   ```text
   I found some good courses for beginner students to learn Azure:

   1. [Describe concepts of cryptography](https://learn.microsoft.com/training/modules/describe-concepts-of-cryptography/?WT.mc_id=api_CatalogApi)
   2. [Introduction to audio classification with TensorFlow](https://learn.microsoft.com/training/modules/intro-audio-classification-tensorflow/?WT.mc_id=api_CatalogApi)
   3. [Design a Performant Data Model in Azure SQL Database with Azure Data Studio](https://learn.microsoft.com/training/modules/design-a-data-model-with-ads/?WT.mc_id=api_CatalogApi)
   4. [Getting started with the Microsoft Cloud Adoption Framework for Azure](https://learn.microsoft.com/training/modules/cloud-adoption-framework-getting-started/?WT.mc_id=api_CatalogApi)
   5. [Set up the Rust development environment](https://learn.microsoft.com/training/modules/rust-set-up-environment/?WT.mc_id=api_CatalogApi)

   You can click on the links to access the courses.
   ```

## Designing UX for AI Applications

> **Source:** [Designing UX for AI Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/12-designing-ux-for-ai-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

> _(Click the image above to view video of this lesson)_

User experience is a very important aspect of building apps. Users need to be able to use your app in an efficient way to perform tasks. Being efficient is one thing but you also need to design apps so that they can be used by everyone, to make them _accessible_. This chapter will focus on this area so you hopefully end up designing an app that people can and want to use.

### Introduction

User experience is how a user interacts with and uses a specific product or service be it a system, tool, or design. When developing AI applications, developers not only focus on ensuring the user experience is effective but also ethical. In this lesson, we cover how to build Artificial Intelligence (AI) applications that address user needs.

The lesson will cover the following areas:

- Introduction to User Experience and Understanding User Needs
- Designing AI Applications for Trust and Transparency
- Designing AI Applications for Collaboration and Feedback

### Learning goals

After taking this lesson, you'll be able to:

- Understand how to build AI applications that meet the user needs.
- Design AI applications that promote trust and collaboration.

#### Prerequisite

Take some time and read more about [user experience and design thinking.](https://learn.microsoft.com/training/modules/ux-design?WT.mc_id=academic-105485-koreyst)

### Introduction to User Experience and Understanding User Needs

In our fictitious education startup, we have two primary users, teachers and students. Each of the two users has unique needs. A user-centered design prioritizes the user ensuring the products are relevant and beneficial for those it is intended for.

The application should be **useful, reliable, accessible and pleasant** to provide a good user experience.

#### Usability

Being useful means that the application has functionality that matches its intended purpose, such as automating the grading process or generating flashcards for revision. An application that automates the grading process should be able to accurately and efficiently assign scores to students' work based on predefined criteria. Similarly, an application that generates revision flashcards should be able to create relevant and diverse questions based on its data.

#### Reliability

Being reliable means that the application can perform its task consistently and without errors. However, AI just like humans is not perfect and may be prone to errors. The applications may encounter errors or unexpected situations that require human intervention or correction. How do you handle errors? In the last section of this lesson, we will cover how AI systems and applications are designed for collaboration and feedback.

#### Accessibility

Being accessible means extending the user experience to users with various abilities, including those with disabilities, ensuring no one is left out. By following accessibility guidelines and principles, AI solutions become more inclusive, usable, and beneficial for all users.

#### Pleasant

Being pleasant means that the application is enjoyable to use. An appealing user experience can have a positive impact on the user encouraging them to return to the application and increasing business revenue.

![image illustrating UX considerations in AI](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/uxinai.png)

Not every challenge can be solved with AI. AI comes in to augment your user experience, be it automating manual tasks, or personalizing user experiences.

### Designing AI Applications for Trust and Transparency

Building trust is critical when designing AI applications. Trust ensures a user is confident that the application will get the work done, deliver results consistently and the results are what the user needs. A risk in this area is mistrust and overtrust. Mistrust occurs when a user has little or no trust in an AI system, this leads to the user rejecting your application. Overtrust occurs when a user overestimates the capability of an AI system, leading to users trusting the AI system too much. For example, an automated grading system in the case of overtrust might lead the teacher not to proof through some of the papers to ensure the grading system works well. This could result in unfair or inaccurate grades for the students, or missed opportunities for feedback and improvement.

Two ways to ensure that trust is put right at the center of design are explainability and control.

#### Explainability

When AI helps inform decisions such as imparting knowledge to future generations, it is critical for teachers and parents to understand how AI decisions are made. This is explainability - understanding how AI applications make decisions. Designing for explainability includes adding details that highlight how AI arrived at the output. Audience must be aware that the output is generated by AI and not a human. For example, instead of saying "Start chatting with your tutor now" say "Use AI tutor that adapts to your needs and helps you learn at your pace."

![an app landing page with clear illustration of explainability in AI applications](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/explanability-in-ai.png)

Another example is how AI uses user and personal data. For example, a user with the persona student may have limitations based on their persona. The AI may not be able to reveal answers to questions but may help guide the user to think through how they can solve a problem.

![AI replying to questions based on persona](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/solving-questions.png)

One last key part of explainability is the simplification of explanations. Students and teachers may not be AI experts, therefore explanations of what the application can or cannot do should be simplified and easy to understand.

![simplified explanations on AI capabilities](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/simplified-explanations.png)

#### Control

Generative AI creates a collaboration between AI and the user, where for instance a user can modify prompts for different results. Additionally, once an output is generated, users should be able to modify the results giving them a sense of control. For example, when using Microsoft Copilot (formerly Bing Chat), you can tailor your prompt based on format, tone and length. Additionally, you can add changes to your output and modify the output as shown below:

![Bing search results with options to modify the prompt and output](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/bing1.png)

Another feature in Microsoft Copilot that allows a user to have control over the application is the ability to opt in and opt out of the data AI uses. For a school application, a student might want to use their notes as well as the teachers' resources as revision material.

![Bing search results with options to modify the prompt and output](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/bing2.png)

> When designing AI applications, intentionality is key in ensuring users do not overtrust setting unrealistic expectations of its capabilities. One way to do this is by creating friction between the prompts and the results. Reminding the user, that this is AI and not a fellow human being

### Designing AI Applications for Collaboration and Feedback

As earlier mentioned, generative AI creates a collaboration between the user and AI. Most engagements are with a user inputting a prompt and the AI generating an output. What if the output is incorrect? How does the application handle errors if they occur? Does the AI blame the user or take time to explain the error?

AI applications should be built in to receive and give feedback. This not only helps the AI system improve but also builds trust with the users. A feedback loop should be included in the design, an example can be a simple thumbs up or down on the output.

Another way to handle this is to clearly communicate the capabilities and limitations of the system. When a user makes an error requesting something beyond the AI capabilities, there should also be a way to handle this, as shown below.

![Giving feedback and handling errors](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/12-designing-ux-for-ai-applications/images/feedback-loops.png)

System errors are common with applications where the user might need assistance with information outside the scope of the AI or the application may have a limit on how many questions/subjects a user can generate summaries. For example, an AI application trained with data on limited subjects for example, History and Math may not be able to handle questions around Geography. To mitigate this, the AI system can give a response like: "Sorry, our product has been trained with data in the following subjects....., I cannot be able to respond to the question you asked."

AI applications are not perfect, therefore, they are bound to make mistakes. When designing your applications, you should ensure you create room for feedback from users and error handling in a way that is simple and easily explainable.

## Securing Your Generative AI Applications

> **Source:** [Securing Your Generative AI Applications](https://github.com/microsoft/generative-ai-for-beginners/tree/main/13-securing-ai-applications) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

### Introduction

This lesson will cover:

- Security within the context of AI systems.
- Common risks and threats to AI systems.
- Methods and considerations for securing AI systems.

### Learning Goals

After completing this lesson, you will have an understanding of:

- The threats and risks to AI systems.
- Common methods and practices for securing AI systems.
- How implementing security testing can prevent unexpected results and erosion of user trust.

### What does security mean within the context of generative AI?

As Artificial Intelligence (AI) and Machine Learning (ML) technologies increasingly shape our lives, it’s crucial to protect not only customer data but also the AI systems themselves. AI/ML is increasingly used in support of high-value decision-making processes in industries where the wrong decision may result in serious consequences.

Here are key points to consider:

- **Impact of AI/ML**: AI/ML have significant impacts on daily life and as such safeguarding them has become essential.
- **Security Challenges**: This impact that AI/ML has needs proper attention in order to address the need to protect AI-based products from sophisticated attacks, whether by trolls or organized groups.
- **Strategic Problems**: The tech industry must proactively address strategic challenges to ensure long-term customer safety and data security.

Additionally, Machine Learning models are largely unable to discern between malicious input and benign anomalous data. A significant source of training data is derived from uncurated, unmoderated, public datasets, which are open to 3rd-party contributions. Attackers don’t need to compromise datasets when they're free to contribute to them. Over time, low-confidence malicious data becomes high-confidence trusted data, if the data structure/formatting remains correct.

This is why it is critical to ensure the integrity and protection of the data stores your models use to make decisions with.

### Understanding the threats and risks of AI

In terms of AI and related systems, data poisoning stands out as the most significant security threat today. Data poisoning is when someone intentionally changes the information used to train an AI, causing it to make mistakes. This is due to the absence of standardized detection and mitigation methods, coupled with our reliance on untrusted or uncurated public datasets for training. To maintain data integrity and prevent a flawed training process, it is crucial to track the origin and lineage of your data. Otherwise, the old adage “garbage in, garbage out” holds true, leading to compromised model performance.

Here are examples of how data poisoning can affect your models:

1. **Label Flipping**: In a binary classification task, an adversary intentionally flips the labels of a small subset of training data. For instance, benign samples are labeled as malicious, leading the model to learn incorrect associations.\
   **Example**: A spam filter misclassifying legitimate emails as spam due to manipulated labels.
2. **Feature Poisoning**: An attacker subtly modifies features in the training data to introduce bias or mislead the model.\
   **Example**: Adding irrelevant keywords to product descriptions to manipulate recommendation systems.
3. **Data Injection**: Injecting malicious data into the training set to influence the model’s behavior.\
   **Example**: Introducing fake user reviews to skew sentiment analysis results.
4. **Backdoor Attacks**: An adversary inserts a hidden pattern (backdoor) into the training data. The model learns to recognize this pattern and behaves maliciously when triggered.\
   **Example**: A face recognition system trained with backdoored images that misidentifies a specific person.

The MITRE Corporation has created [ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems)](https://atlas.mitre.org/?WT.mc_id=academic-105485-koreyst), a knowledgebase of tactics and techniques employed by adversaries in real-world attacks on AI systems.

> There are a growing number of vulnerabilities in AI-enabled systems, as the incorporation of AI increases the attack surface of existing systems beyond those of traditional cyber-attacks. We developed ATLAS to raise awareness of these unique and evolving vulnerabilities, as the global community increasingly incorporates AI into various systems. ATLAS is modeled after the MITRE ATT&CK® framework and its tactics, techniques, and procedures (TTPs) are complementary to those in ATT&CK.

Much like the MITRE ATT&CK® framework, which is extensively used in traditional cybersecurity for planning advanced threat emulation scenarios, ATLAS provides an easily searchable set TTPs that can help to better understand and prepare for defending against emerging attacks.

Additionally, the Open Web Application Security Project (OWASP) has created a "[Top 10 list](https://llmtop10.com/?WT.mc_id=academic-105485-koreyst)" of the most critical vulnerabilities found in applications utilizing LLMs. The list highlights the risks of threats such as the aforementioned data poisoning along with others such as:

- **Prompt Injection**: a technique where attackers manipulate a Large Language Model (LLM) through carefully crafted inputs, causing it to behave outside of its intended behavior.
- **Supply Chain Vulnerabilities**: The components and software that make up the applications used by an LLM, such as Python modules or external datasets, can themselves be compromised leading to unexpected results, introduced biases and even vulnerabilities in the underlying infrastructure.
- **Overreliance**: LLMs are fallible and have been prone to hallucinate, providing inaccurate or unsafe results. In several documented circumstances, people have taken the results at face value leading to unintended real-world negative consequences.

Microsoft Cloud Advocate Rod Trent has written a free ebook, [Must Learn AI Security](https://github.com/rod-trent/OpenAISecurity/tree/main/Must_Learn/Book_Version?WT.mc_id=academic-105485-koreyst), that dives deeply into these and other emerging AI threats and provides extensive guidance on how to best tackle these scenarios.

### Security Testing for AI Systems and LLMs

Artificial intelligence (AI) is transforming various domains and industries, offering new possibilities and benefits for society. However, AI also poses significant challenges and risks, such as data privacy, bias, lack of explainability, and potential misuse. Therefore, it is crucial to ensure that AI systems are secure and responsible, meaning that they adhere to ethical and legal standards and can be trusted by users and stakeholders.

Security testing is the process of evaluating the security of an AI system or LLM, by identifying and exploiting their vulnerabilities. This can be performed by developers, users, or third-party auditors, depending on the purpose and scope of the testing. Some of the most common security testing methods for AI systems and LLMs are:

- **Data sanitization**: This is the process of removing or anonymizing sensitive or private information from the training data or the input of an AI system or LLM. Data sanitization can help prevent data leakage and malicious manipulation by reducing the exposure of confidential or personal data.
- **Adversarial testing**: This is the process of generating and applying adversarial examples to the input or output of an AI system or LLM to evaluate its robustness and resilience against adversarial attacks. Adversarial testing can help identify and mitigate the vulnerabilities and weaknesses of an AI system or LLM that may be exploited by attackers.
- **Model verification**: This is the process of verifying the correctness and completeness of the model parameters or architecture of an AI system or LLM. Model verification can help detect and prevent model stealing by ensuring that the model is protected and authenticated.
- **Output validation**: This is the process of validating the quality and reliability of the output of an AI system or LLM. Output validation can help detect and correct malicious manipulation by ensuring that the output is consistent and accurate.

OpenAI, a leader in AI systems, has setup a series of _safety evaluations_ as part of their red teaming network initiative, aimed at testing the output AI systems in the hopes of contributing to AI safety.

> Evaluations can range from simple Q&A tests to more-complex simulations. As concrete examples, here are sample evaluations developed by OpenAI for evaluating AI behaviors from a number of angles:

##### Persuasion

- [MakeMeSay](https://github.com/openai/evals/tree/main/evals/elsuite/make_me_say/readme.md?WT.mc_id=academic-105485-koreyst): How well can an AI system trick another AI system into saying a secret word?
- [MakeMePay](https://github.com/openai/evals/tree/main/evals/elsuite/make_me_pay/readme.md?WT.mc_id=academic-105485-koreyst): How well can an AI system convince another AI system to donate money?
- [Ballot Proposal](https://github.com/openai/evals/tree/main/evals/elsuite/ballots/readme.md?WT.mc_id=academic-105485-koreyst): How well can an AI system influence another AI system’s support of a political proposition?

##### Steganography (hidden messaging)

- [Steganography](https://github.com/openai/evals/tree/main/evals/elsuite/steganography/readme.md?WT.mc_id=academic-105485-koreyst): How well can an AI system ​​pass secret messages without being caught by another AI system?
- [Text Compression](https://github.com/openai/evals/tree/main/evals/elsuite/text_compression/readme.md?WT.mc_id=academic-105485-koreyst): How well can an AI system compress and decompress messages, to enable hiding secret messages?
- [Schelling Point](https://github.com/openai/evals/blob/main/evals/elsuite/schelling_point/README.md?WT.mc_id=academic-105485-koreyst): How well can an AI system coordinate with another AI system, without direct communication?

#### AI Security

It's imperative that we aim to protect AI systems from malicious attacks, misuse, or unintended consequences. This includes taking steps to ensure the safety, reliability, and trustworthiness of AI systems, such as:

- Securing the data and algorithms that are used to train and run AI models
- Preventing unauthorized access, manipulation, or sabotage of AI systems
- Detecting and mitigating bias, discrimination, or ethical issues in AI systems
- Ensuring the accountability, transparency, and explainability of AI decisions and actions
- Aligning the goals and values of AI systems with those of humans and society

AI security is important for ensuring the integrity, availability, and confidentiality of AI systems and data. Some of the challenges and opportunities of AI security are:

- Opportunity: Incorporating AI in cybersecurity strategies since it can play a crucial role in identifying threats and improving response times. AI can help automate and augment the detection and mitigation of cyberattacks, such as phishing, malware, or ransomware.
- Challenge: AI can also be used by adversaries to launch sophisticated attacks, such as generating fake or misleading content, impersonating users, or exploiting vulnerabilities in AI systems. Therefore, AI developers have a unique responsibility to design systems that are robust and resilient against misuse.

#### Data Protection

LLMs can pose risks to the privacy and security of the data that they use. For example, LLMs can potentially memorize and leak sensitive information from their training data, such as personal names, addresses, passwords, or credit card numbers. They can also be manipulated or attacked by malicious actors who want to exploit their vulnerabilities or biases. Therefore, it is important to be aware of these risks and take appropriate measures to protect the data used with LLMs. There are several steps that you can take to protect the data that is used with LLMs. These steps include:

- **Limiting the amount and type of data that they share with LLMs**: Only share the data that is necessary and relevant for the intended purposes, and avoid sharing any data that is sensitive, confidential, or personal. Users should also anonymize or encrypt the data that they share with LLMs, such as by removing or masking any identifying information, or using secure communication channels.
- **Verifying the data that LLMs generate**: Always check the accuracy and quality of the output generated by LLMs to ensure they don't contain any unwanted or inappropriate information.
- **Reporting and alerting any data breaches or incidents**: Be vigilant of any suspicious or abnormal activities or behaviors from LLMs, such as generating texts that are irrelevant, inaccurate, offensive, or harmful. This could be an indication of a data breach or security incident.

Data security, governance, and compliance are critical for any organization that wants to leverage the power of data and AI in a multi-cloud environment. Securing and governing all your data is a complex and multifaceted undertaking. You need to secure and govern different types of data (structured, unstructured, and data generated by AI) in different locations across multiple clouds, and you need to account for existing and future data security, governance, and AI regulations. To protect your data, you need to adopt some best practices and precautions, such as:

- Use cloud services or platforms that offer data protection and privacy features.
- Use data quality and validation tools to check your data for errors, inconsistencies, or anomalies.
- Use data governance and ethics frameworks to ensure your data is used in a responsible and transparent manner.

#### Emulating real-world threats - AI red teaming

Emulating real-world threats is now considered a standard practice in building resilient AI systems by employing similar tools, tactics, procedures to identify the risks to systems and test the response of defenders.

> The practice of AI red teaming has evolved to take on a more expanded meaning: it not only covers probing for security vulnerabilities, but also includes probing for other system failures, such as the generation of potentially harmful content. AI systems come with new risks, and red teaming is core to understanding those novel risks, such as prompt injection and producing ungrounded content. - [Microsoft AI Red Team building future of safer AI](https://www.microsoft.com/security/blog/2023/08/07/microsoft-ai-red-team-building-future-of-safer-ai/?WT.mc_id=academic-105485-koreyst)

Below are key insights that have shaped Microsoft’s AI Red Team program.

1. **Expansive Scope of AI Red Teaming:**
   AI red teaming now encompasses both security and Responsible AI (RAI) outcomes. Traditionally, red teaming focused on security aspects, treating the model as a vector (e.g., stealing the underlying model). However, AI systems introduce novel security vulnerabilities (e.g., prompt injection, poisoning), necessitating special attention. Beyond security, AI red teaming also probes fairness issues (e.g., stereotyping) and harmful content (e.g., glorification of violence). Early identification of these issues allows prioritization of defense investments.
2. **Malicious and Benign Failures:**
   AI red teaming considers failures from both malicious and benign perspectives. For example, when red teaming the new Bing, we explore not only how malicious adversaries can subvert the system but also how regular users may encounter problematic or harmful content. Unlike traditional security red teaming, which focuses mainly on malicious actors, AI red teaming accounts for a broader range of personas and potential failures.
3. **Dynamic Nature of AI Systems:**
   AI applications constantly evolve. In large language model applications, developers adapt to changing requirements. Continuous red teaming ensures ongoing vigilance and adaptation to evolving risks.

AI red teaming is not all encompassing and should be considered a complementary motion to additional controls such as [role-based access control (RBAC)](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/role-based-access-control?WT.mc_id=academic-105485-koreyst) and comprehensive data management solutions. It's meant to supplement a security strategy that focuses on employing safe and responsible AI solutions that account for privacy and security while aspiring to minimize biases, harmful content and misinformation that can erode user confidence.

Here's a list of additional reading that can help you better understand how red teaming can help identify and mitigate risks in your AI systems:

- [Planning red teaming for large language models (LLMs) and their applications](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/red-teaming?WT.mc_id=academic-105485-koreyst)
- [What is the OpenAI Red Teaming Network?](https://openai.com/blog/red-teaming-network?WT.mc_id=academic-105485-koreyst)
- [AI Red Teaming - A Key Practice for Building Safer and More Responsible AI Solutions](https://rodtrent.substack.com/p/ai-red-teaming?WT.mc_id=academic-105485-koreyst)
- MITRE [ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems)](https://atlas.mitre.org/?WT.mc_id=academic-105485-koreyst), a knowledgebase of tactics and techniques employed by adversaries in real-world attacks on AI systems.

## The Generative AI Application Lifecycle

> **Source:** [The Generative AI Application Lifecycle](https://github.com/microsoft/generative-ai-for-beginners/tree/main/14-the-generative-ai-application-lifecycle) · [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners), MIT

An important question for all AI applications is the relevance of AI features, as AI is a fast evolving field, to ensure that your application remains relevant, reliable, and robust, you need to monitor, evaluate, and improve it continuously. This is where the generative AI lifecycle comes in.

The generative AI lifecycle is a framework that guides you through the stages of developing, deploying, and maintaining a generative AI application. It helps you to define your goals, measure your performance, identify your challenges, and implement your solutions. It also helps you to align your application with the ethical and legal standards of your domain and your stakeholders. By following the generative AI lifecycle, you can ensure that your application is always delivering value and satisfying your users.

### Introduction

In this chapter, you will:

- Understand the Paradigm Shift from MLOps to LLMOps
- The LLM Lifecycle
- Lifecycle Tooling
- Lifecycle Metrification and Evaluation

### Understand the Paradigm Shift from MLOps to LLMOps

LLMs are a new tool in the Artificial Intelligence arsenal, they are incredibly powerful in analysis and generation tasks for applications, however this power has some consequences in how we streamline AI and Classic Machine Learning tasks.

With this, we need a new Paradigm to adapt this tool in a dynamic, with the correct incentives. We can categorize older AI apps as "ML Apps" and newer AI Apps as "GenAI Apps" or just "AI Apps", reflecting the mainstream technology and techniques used at the time. This shifts our narrative in multiple ways, look at the following comparison.

![LLMOps vs. MLOps comparison](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/01-llmops-shift.png)

Notice that in LLMOps, we are more focused on the App Developers, using integrations as a key point, using "Models-as-a-Service" and thinking in the following points for metrics.

- Quality: Response quality
- Harm: Responsible AI
- Honesty: Response groundedness (Makes sense? It is correct?)
- Cost: Solution Budget
- Latency: Avg. time for token response

### The LLM Lifecycle

First, to understand the lifecycle and the modifications, let's note the next infographic.

![LLMOps infographic](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/02-llmops.png)

As you may note, this is different from the usual Lifecycles from MLOps. LLMs have many new requirements, as Prompting, different techniques to improve quality (Fine-Tuning, RAG, Meta-Prompts), different assessment and responsibility with responsible AI, lastly, new evaluation metrics (Quality, Harm, Honesty, Cost and Latency).

For instance, take a look at how we ideate. Using prompt engineering to experiment with various LLMs to explore possibilities to test if their Hypothesis could be correct.

Note that this is not linear, but integrated loops, iterative and with an overarching cycle.

How could we explore those steps? Let's step into detail in how could we build a lifecycle.

![LLMOps Workflow](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/03-llm-stage-flows.png)

This may look a bit complicated, lets focus on the three big steps first.

1. Ideating/Exploring: Exploration, here we can explore according to our business needs. Prototyping, creating a [PromptFlow](https://microsoft.github.io/promptflow/index.html?WT.mc_id=academic-105485-koreyst) and test if is efficient enough for our Hypothesis.
1. Building/Augmenting: Implementation, now, we start to evaluate for bigger datasets implement techniques, like Fine-tuning and RAG, to check the robustness of our solution. If it does not, re-implementing it, adding new steps in our flow or restructuring the data, might help. After testing our flow and our scale, if it works and check our Metrics, it is ready for the next step.
1. Operationalizing: Integration, now adding Monitoring and Alerts Systems to our system, deployment and application integration to our Application.

Then, we have the overarching cycle of Management, focusing on security, compliance and governance.

Congratulations, now you have your AI App ready to go and operational. For a hands on experience, take a look on the [Contoso Chat Demo.](https://nitya.github.io/contoso-chat/?WT.mc_id=academic-105485-koreyst)

Now, what tools could we use?

### Lifecycle Tooling

For Tooling, Microsoft provides the [Azure AI Platform](https://azure.microsoft.com/solutions/ai/?WT.mc_id=academic-105485-koreyst) and [PromptFlow](https://microsoft.github.io/promptflow/index.html?WT.mc_id=academic-105485-koreyst) facilitate and make your cycle easy to implement and ready to go.

The [Azure AI Platform](https://azure.microsoft.com/solutions/ai/?WT.mc_id=academic-105485-koreyst), allows you to use [Microsoft Foundry](https://ai.azure.com/?WT.mc_id=academic-105485-koreyst). Microsoft Foundry (formerly Azure AI Studio) is a web portal that lets you explore models, samples and tools, manage your resources, and use UI development flows as well as SDK/CLI options for Code-First development.

![Azure AI possibilities](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/04-azure-ai-platform.png)

Azure AI, allows you to use multiple resources, to manage your operations, services, projects, vector search and databases needs.

![LLMOps with Azure AI](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/05-llm-azure-ai-prompt.png)

Construct, from Proof-of-Concept(POC) until large scale applications with PromptFlow:

- Design and Build apps from VS Code, with visual and functional tools
- Test and fine-tune your apps for quality AI, with ease.
- Use Microsoft Foundry to Integrate and Iterate with cloud, Push and Deploy for quick integration.

![LLMOps with PromptFlow](https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/14-the-generative-ai-application-lifecycle/images/06-llm-promptflow.png)

### Great! Continue your Learning!

Amazing, now learn more about how we structure an application to use the concepts with the [Contoso Chat App](https://nitya.github.io/contoso-chat/?WT.mc_id=academic-105485-koreyst), to check how Cloud Advocacy adds those concepts in demonstrations. For more content, check our [Ignite breakout session!
](https://www.youtube.com/watch?v=DdOylyrTOWg)

Now, check Lesson 15, to understand how [Retrieval Augmented Generation and Vector Databases](https://github.com/microsoft/generative-ai-for-beginners/blob/main/15-rag-and-vector-databases/README.md) impact Generative AI and to make more engaging Applications!
