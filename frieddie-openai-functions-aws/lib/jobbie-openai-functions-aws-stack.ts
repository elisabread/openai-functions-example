import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as dotenv from "dotenv";
import { Duration } from "aws-cdk-lib";

dotenv.config();

export class frieddieOpenaiFunctionsAwsStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const fn = new lambda.Function(this, "frieddie-openai-functions-example", {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: "index.handler",
			code: lambda.Code.fromAsset("functions"),
			environment: { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
			timeout: Duration.seconds(30),
		});

		const api = new apigateway.LambdaRestApi(this, "endpoint", {
			handler: fn,
		});
	}
}
