require("dotenv").config();
const nodemailer = require("nodemailer");
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.API_KEY);

// exports.sendVerificationMail = async (email, otp) => {
// 	const sendMail = await sgMail.send({
// 		to: email,
// 		from: "sagar785mishra@gmail.com",
// 		subject: "OTP Verification for Account Activation",
// 		html: `<div class="container">
// 					<p>Dear User,</p>
// 					<p>Please use the following OTP to verify your account:</p>
// 					<h2 style="background-color: #f5f5f5; padding: 10px; font-weight: bold; font-size: 24px;">${otp}</h2>
// 					<p>Note: This OTP is valid for a limited time and for a single use only.</p>
// 					<p>If you didn't request this verification, you can safely ignore this email.</p>
// 					<p>Best regards,</p>
// 					<p>Your Company</p>
// 				</div>`,
// 	});

// 	if (!sendMail[0]) {
// 		throw new Error("Sending Mail Error");
// 	}
// };

const sendEmail = async (mailOptions) => {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "testoscompany@gmail.com",
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const obj = await transporter.sendMail(mailOptions);
	if (!obj.accepted.length) {
		throw new Error("Mail Sending Error");
	}
};

exports.sendVerificationEmail = async (name, email, otp) => {
	let mailOptions = {
		from: "testoscompany@gmail.com",
		to: email,
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
	};
	await sendEmail(mailOptions);
};

exports.sendForgetPasswordEmail = async (name, email, otp) => {
	let mailOptions = {
		from: "testoscompany@gmail.com",
		to: email,
		subject: "OTP for Account's Password Reset",
		html: `<div class="container">
					<p>Dear ${name},</p>
					<p>We received a request to reset your password for your account.</p>
					<p>Please use the following OTP to reset your account:</p>
					<h2 style="background-color: #f5f5f5; padding: 10px; font-weight: bold; font-size: 24px;">${otp}</h2>
					<p>Note: This OTP is valid for a limited time and for a single use only.</p>
					<p>If you didn't request this, you can safely ignore this email.</p>
					<p>Best regards,</p>
					<p>Your Company</p>
				</div>`,
	};
	await sendEmail(mailOptions);
};

exports.sendResendOtpMail = async (name, email, otp) => {
	let mailOptions = {
		from: "testoscompany@gmail.com",
		to: email,
		subject: "New OTP for Verification",
		html: `<div class="container">
					<p>Dear ${name},</p>
					<p>We noticed that you requested a new OTP to verify your account.</p>
					<h2 style="background-color: #f5f5f5; padding: 10px; font-weight: bold; font-size: 24px;">${otp}</h2>
					<p>Note: This OTP is valid for a limited time and for a single use only.</p>
					<p>If you didn't request this, you can safely ignore this email.</p>
					<p>Best regards,</p>
					<p>Your Company</p>
				</div>`,
	};
	await sendEmail(mailOptions);
};
