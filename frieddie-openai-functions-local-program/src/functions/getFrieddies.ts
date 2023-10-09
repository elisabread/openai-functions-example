import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Function that makes an API call to the Neprune cluster containing frieddies.
 */
export default async function getfrieddies(): Promise<string> {
	const query = `query {
		listfrieddies(id: "0") {
		  lastName
		  firstName
		}
	  }`;

	const headers = { "x-api-key": `${process.env.frieddie_API_KEY}` };

	try {
		const res = await axios.post(
			process.env.frieddie_API_URL!,
			{
				query: query,
			},
			{
				headers: headers,
			}
		);
		const frieddies = res.data.data.listfrieddies;
		return frieddies;
	} catch (e: any) {
		console.error(e.response.data.errors);
		return "Could not access the DB";
	}
}
