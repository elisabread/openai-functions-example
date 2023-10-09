# openai-functions-example

Example repository of how to implement OpenAI Functions by using TypeScript.

## Description

June 13th OpenAI announced their new functions feature. Meaning that you now could use OpenAI out of the box to fetch additional data for chat completions. Note that OpenAI will not call the function for you. It will simply return structured data for you to call functions in your code. Basically OpenAI is used to generate arguments for your functions and to determine when to call them.

[OpenAI Functions Documentation](https://platform.openai.com/docs/guides/gpt/function-calling)

## Getting Started

### Installing

- Download the repo to your local machine
- Open up a terminal in the project folder
```
cd frieddie-openai-functions-local-program
```
- Run `npm i`

- Add a .env file and add your OPENAI_API_KEY as a variable

### Executing program

- Run the following command in the terminal located in the projects folder:

```
cd frieddie-openai-functions-local-program
```

```
npm run frobbie
```

### Example prompts to frobbie

- What frieddies do I have?
- Can you invite my frieddie with the id [[INSERT ID]] to the resource with id [[INSERT ID]]

Happy experimenting! 🤖🫶
