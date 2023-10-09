import { Handler } from "aws-lambda";
import {
	OpenAIApi,
	Configuration,
	ChatCompletionFunctions,
	ChatCompletionRequestMessageFunctionCall,
	ChatCompletionRequestMessage,
} from "openai";
import getEvents from "./getEvents";

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const ai = new OpenAIApi(config);

/**
 * Define an initial context for the chat assisant.
 */
const messages: ChatCompletionRequestMessage[] = [
	{
		role: "system",
		content:
			"You are a chat assistant that is an expert in helping others find new friends. You exist in a collaborative friend seraching platform called Frieddie. In Frieddie you can add buddies (frieddies) to find new friends and events. If you don't know how to answer / perform an action you refer the user to the Frieddie documentation.",
	},
];

/**
 * Define the functions that are available for OpenAI to choose from.
 */
const functions: ChatCompletionFunctions[] = [
	{
		name: "get_events",
		description: "Get the current events in a given location and event category",
		parameters: {
			type: "object",
			properties: {
				location: {
					type: "string",
					description: "The city and country, e.g. Malmö, Sweden",
				},
				category: {
					type: "string",
					description:
						"The event category, e.g. concert, wine tasting and hike",
				},
			},
			required: ["location", "category"],
		},
	},
];

////////////////////////////////////////////////////////////////////////////////
// Handler
////////////////////////////////////////////////////////////////////////////////
export const handler: Handler = async (event, context) => {
	try {
		const body = event.body;
		const userMessages: ChatCompletionRequestMessage[] = body.messages;
		if (userMessages) {
			userMessages.map((message: ChatCompletionRequestMessage) => {
				return messages.push(message);
			});
		}
		return callOpenAI(messages);
	} catch (e) {
		console.log(e);
		return {
			statusCode: 500,
			headers: { "Content-Type": "text/plain" },
			body: "Oh no! Something went wrong.",
		};
	}
};

////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////
/**
 * Function that handles communication with OpenAI.
 */
async function callOpenAI(
	messages: ChatCompletionRequestMessage[]
): Promise<string | undefined> {
	try {
		const res = await ai.createChatCompletion({
			model: "gpt-3.5-turbo-0613",
			messages: messages,
			functions: functions,
			function_call: "auto",
			max_tokens: 100,
		});
		if (
			res.data.choices[0].finish_reason === "function_call" &&
			res.data.choices[0].message?.function_call
		) {
			return performFunction(res.data.choices[0].message?.function_call); //Calls a function that contains a switch case triggering the function suggested by OpenAI
		}
		messages.push({
			role: "assistant",
			content: res.data.choices[0].message?.content,
		});
		return res.data.choices[0].message?.content;
	} catch (e: any) {
		return e.response.data.error;
	}
}

/**
 * Function that triggers the function that was recommended by OpenAI.
 */
async function performFunction(
	function_call: ChatCompletionRequestMessageFunctionCall
): Promise<string | undefined> {
	const args = JSON.parse(function_call.arguments!);

	switch (function_call.name) {
		case "get_events": {
			const res = await getEvents();
			messages.push({ role: "function", name: "get_events", content: res }); //Add the output of the functions to the messages object for OpenAI to interpertate
			const processedRes: string | undefined = await callOpenAI(messages);
			return processedRes;
		}
		default: {
			return "Something went wrong.";
		}
	}
}
