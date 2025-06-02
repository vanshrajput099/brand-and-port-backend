import express from "express";
import cors from "cors";
import { Resend } from "resend";

export const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.post("/api/v1/contact/send-mail", async (req, res) => {
    try {
        const { name, email, location, companyName, helpWith } = req.body;

        if ([name, email, location, companyName, helpWith].some((ele) => !ele?.trim())) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const resend = new Resend(process.env.RESEND_API);

        try {
            const result = await resend.emails.send({
                from: 'The Brand and Port <no-reply@thebrandandport.com>',
                to: "contact@thebrandandport.com",
                subject: 'New Contact Request',
                html: `
                    <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">📩 New Message from Contact Form</h2>
                        <p>Name: ${name}</p>
                        <p>Email: <a href="mailto:${email}" style="color: #2980b9;">${email}</a></p>
                        <p>Location: ${location || 'N/A'}</p>
                        <p>Company: ${companyName || 'N/A'}</p>
                        <p>Help With: ${helpWith}</p>
                        <hr style="margin: 20px 0;">
                        <p style="font-size: 12px; color: #888;">This message was sent via your website's contact form.</p>
                    </div>
                `,
            });

            if (result.error) {
                return res.status(500).json({
                    error: "Failed to send email",
                    message: result.error.message,
                });
            }

            return res.status(200).json({
                success: true,
                message: "Email sent successfully",
            });

        } catch (err) {
            return res.status(500).json({
                error: "Failed to send email",
                message: err.message,
            });
        }

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});
