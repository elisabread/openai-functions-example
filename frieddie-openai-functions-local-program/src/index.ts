import {
	OpenAIApi,
	Configuration,
	ChatCompletionFunctions,
	ChatCompletionRequestMessageFunctionCall,
	ChatCompletionRequestMessage,
} from "openai";
import * as dotenv from "dotenv";
import { createInterface } from "readline";
import getfrieddies from "./functions/getFrieddies";
import invitefrieddie from "./functions/inviteFrieddie";
import getEvents from "./functions/getEvents";

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////
const devResourceID = "ex-34c47185-8f12-6ceb-88f4-1453530670e6";
const devUserID = "ex-86c3bcb2-1c74-5e50-457f-49a2cf02dca5";
dotenv.config();
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY }); //You will need to create an .env file and add your API key as a variable
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
	{
		name: "get_frieddies",
		description: "Get the current frieddies and their information",
		parameters: {
			type: "object",
			properties: {
				frieddies: {
					type: "array",
					items: {
						frieddie: {
							properties: {
								userId: {
									type: "string",
									description: "ID for a frieddie",
								},
								firstName: {
									type: "string",
									description: "First name of the frieddie",
								},
								lastName: {
									type: "string",
									description: "Last name of the frieddie",
								},
							},
						},
					},
				},
			},
		},
	},
	{
		name: "invite_frieddie",
		description: "Invite a frieddie to attend an event",
		parameters: {
			type: "object",
			properties: {
				frieddieID: {
					type: "string",
					description:
						"ID of the frieddie that will attend the event.",
				},
				resourceID: {
					type: "string",
					description: "The ID for the text resource.",
				},
			},
		},
	},
];

////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////
/**
 * Function that handles communication with OpenAI.
 */
async function callOpenAI(prompt?: string): Promise<string | undefined> {
	try {
		if (prompt) {
			messages.push({ role: "user", content: prompt }); //Add the new message to the chat history
		}
		console.log("Calling OpenAi ...");
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
			console.log("A function is needed to answer the prompt ...");

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
	console.log("Calling", function_call.name, " ...");

	const args = JSON.parse(function_call.arguments!);

	switch (function_call.name) {
		case "get_events": {
			const res = await getEvents();
			messages.push({ role: "function", name: "get_events", content: res }); //Add the output of the functions to the messages object for OpenAI to interpertate
			const processedRes: string | undefined = await callOpenAI();
			return processedRes;
		}
		case "get_frieddies": {
			const res = await getfrieddies();
			messages.push({
				role: "function",
				name: "get_frieddies",
				content: JSON.stringify(res),
			}); //Add the output of the functions to the messages object for OpenAI to interpertate
			const processedRes: string | undefined = await callOpenAI();
			return processedRes;
		}
		case "invite_frieddie": {
			const res = await invitefrieddie(args.frieddieID, devResourceID);
			console.log(res);
			messages.push({
				role: "function",
				name: "invite_frieddie",
				content: res,
			}); //Add the output of the functions to the messages object for OpenAI to interpertate

			const processedRes: string | undefined = await callOpenAI();
			return processedRes;
		}
		default: {
			return "Something went wrong.";
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// Readline Program
////////////////////////////////////////////////////////////////////////////////

/**
 * Realine program to run in the console and test OpenAI's new functions feature
 */
const readline = createInterface(process.stdin, process.stdout);
readline.setPrompt(`\x1b[1mPrompt: \x1b[0m`);
console.log(
	"\x1b[1m",
	"✨🤖  Welcome to the frieddie AI Assistant! 🤖✨",
	"\x1b[0m"
);
console.log();

readline.prompt();

readline
	.on("line", async function (line) {
		switch (line) {
			case "":
				break;
			case "thank you":
				readline.close();
				break;
			default: {
				try {
					const aiAnswer = await callOpenAI(line);
					console.log();
					console.log(
						"\x1b[1m",
						`🤖 frobbie: ${JSON.stringify(aiAnswer)}`,
						"\x1b[0m"
					);
					console.log();
					break;
				} catch (e) {
					console.log("Error: ", e);
					break;
				}
			}
		}
		console.log();
		readline.prompt();
	})
	.on("close", function () {
		console.log();
		console.log(
			"\x1b[1m",
			`🤖 frobbie: Happy to help! Have a great day.`,
			"\x1b[0m"
		);
		process.exit(0);
	});
