import nodemailer from "nodemailer";
import dotenv from "dotenv";

import verifyTurnstile from "../utils/turnstile.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready:", success);
  }
});

const contactController = async (req, res) => {
  try {
    const {
      username,
      workEmail,
      companyName,
      description,
      turnstileToken,
    } = req.body;

    // -----------------------------------
    // Clean values
    // -----------------------------------

    const cleanUsername =
      typeof username === "string"
        ? username.trim()
        : "";

    const cleanWorkEmail =
      typeof workEmail === "string"
        ? workEmail.trim()
        : "";

    const cleanCompanyName =
      typeof companyName === "string"
        ? companyName.trim()
        : "";

    const cleanDescription =
      typeof description === "string"
        ? description.trim()
        : "";

    // -----------------------------------
    // Validate name
    // -----------------------------------

    if (!cleanUsername) {
      return res.status(400).json({
        success: false,
        field: "username",
        message: "Please enter your name.",
      });
    }

    if (cleanUsername.length > 100) {
      return res.status(400).json({
        success: false,
        field: "username",
        message:
          "Name cannot be longer than 100 characters.",
      });
    }

    // -----------------------------------
    // Validate email
    // -----------------------------------

    if (!cleanWorkEmail) {
      return res.status(400).json({
        success: false,
        field: "workEmail",
        message:
          "Please enter your work email.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanWorkEmail)) {
      return res.status(400).json({
        success: false,
        field: "workEmail",
        message:
          "Please enter a valid work email.",
      });
    }

    // -----------------------------------
    // Validate company
    // -----------------------------------

    if (!cleanCompanyName) {
      return res.status(400).json({
        success: false,
        field: "companyName",
        message:
          "Please enter your company name.",
      });
    }

    if (cleanCompanyName.length > 200) {
      return res.status(400).json({
        success: false,
        field: "companyName",
        message:
          "Company name cannot be longer than 200 characters.",
      });
    }

    // -----------------------------------
    // Validate description
    // -----------------------------------

    if (!cleanDescription) {
      return res.status(400).json({
        success: false,
        field: "description",
        message:
          "Please enter your project details.",
      });
    }

    if (cleanDescription.length > 5000) {
      return res.status(400).json({
        success: false,
        field: "description",
        message:
          "Project details cannot be longer than 5000 characters.",
      });
    }

    // -----------------------------------
    // Check Turnstile token
    // -----------------------------------

    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        field: "turnstile",
        message:
          "Please complete the security verification.",
      });
    }

    // -----------------------------------
    // Verify Turnstile with Cloudflare
    // -----------------------------------

    console.log(
      "Verifying Cloudflare Turnstile..."
    );

    const turnstileResult =
      await verifyTurnstile(
        turnstileToken,
        req.ip
      );

    if (!turnstileResult.success) {
      console.error(
        "Cloudflare verification failed:",
        turnstileResult
      );

      return res.status(403).json({
        success: false,
        field: "turnstile",
        message:
          "Security verification failed. Please try again.",
      });
    }

    console.log(
      "Cloudflare verification successful."
    );

    // -----------------------------------
    // Send email
    // -----------------------------------

    const mailOptions = {
      from: process.env.SMTP_USER,

      to: process.env.COMPANY_EMAIL,

      replyTo: cleanWorkEmail,

      subject:
        "New Contact Form Submission",

      text: `
New Contact Form Submission

Name:
${cleanUsername}

Work Email:
${cleanWorkEmail}

Company:
${cleanCompanyName}

Project Details:
${cleanDescription}
      `,
    };

    console.log(
      "Sending contact form email..."
    );

    await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Contact form email sent successfully."
    );

    // -----------------------------------
    // Success
    // -----------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully.",
    });

  } catch (error) {
    console.error(
      "Contact form error:",
      error
    );

    return res.status(500).json({
      success: false,
      field: "general",
      message:
        "Something went wrong while sending your message. Please try again.",
    });
  }
};

export default contactController;