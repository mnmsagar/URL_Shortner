require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.API_KEY);

exports.sendVerificationMail = (email, otp, name) => {
	try {
		sgMail.send({
			to: email,
			from: "sagar785mishra@gmail.com",
			subject: "OTP Verification for Account Activation",
			html: `<div class="container">
					<p>Dear ${name},</p>
					<p>Please use the following OTP to verify your account:</p>
					<h2 style="background-color: #f5f5f5; padding: 10px; font-weight: bold; font-size: 24px;">${otp}</h2>
					<p>Note: This OTP is valid for a limited time and for a single use only.</p>
					<p>If you didn't request this verification, you can safely ignore this email.</p>
					<p>Best regards,</p>
					<p>Your Company</p>
				</div>`,
		});
	} catch (error) {
		console.error(error);
	}
};
