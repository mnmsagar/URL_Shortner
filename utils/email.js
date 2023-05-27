/**
 *
 * Run:
 *
 */
require("dotenv").config();
const mailjet = require("node-mailjet").apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const request = mailjet.post("send", { version: "v3.1" }).request({
	Messages: [
		{
			From: {
				Email: "sagar785mishra@gmail.com",
				Name: "Sagar",
			},
			To: [
				{
					Email: "sagar785mishra@gmail.com",
					Name: "You",
				},
			],
			Subject: "My first Mailjet Email!",
			TextPart: "Greetings from Mailjet!",
			HTMLPart:
				"<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
		},
	],
});
request
	.then((result) => {
		console.log(result.body);
	})
	.catch((err) => {
		console.log(err.statusCode);
	});
