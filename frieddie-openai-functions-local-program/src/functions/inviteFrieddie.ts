import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export default async function inviteFrieddie(
	frieddieID: string,
	resourceID: string
): Promise<string> {
	const query = `mutation {
        inviteFrieddie(frieddieID: "${frieddieID}", resourceID: "${resourceID}")
      }`;

	const headers = { "x-api-key": `${process.env.frieddie_API_KEY}` };

	const res = await axios.post(
		process.env.frieddie_API_URL!,
		{ query },
		{ headers }
	);

	return res.data.data.invitefrieddie;
}
