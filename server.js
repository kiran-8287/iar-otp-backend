const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// Memory store for OTPs and expiry
let otpStore = {};

// ✉️ Configure Nodemailer with Gmail or other SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'otpcheckiar@gmail.com', // ✅ Replace with your Gmail
        pass: 'ckwh jnzb uatj befo'     // ✅ Use App Password, NOT your real password
    }
});

// ✅ Send OTP Route
app.post('/send-otp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[email] = { code: otp, expires: expiry };

    const mailOptions = {
        from: 'IIT Palakkad <your.email@gmail.com>',
        to: email,
        subject: '🔐 Your OTP for IIT Palakkad Portal',
        bcc: 'admin@iitpkd.ac.in', // ✅ Optional for monitoring
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f2f6ff; border-radius: 10px; border: 1px solid #ddd;">
                <h2 style="color: #004080;">IIT Palakkad - OTP Verification</h2>
                <p>Hello,</p>
                <p>You requested a one-time password (OTP) to log in to the <strong>IIT Palakkad Alumni Portal</strong>.</p>
                <p style="font-size: 24px; font-weight: bold; color: #000; margin: 16px 0;">Your OTP: <span style="letter-spacing: 2px;">${otp}</span></p>
                <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <br>
                <p>Regards,</p>
                <p><strong>IIT Palakkad Authentication System</strong></p>
                <hr style="border: none; border-top: 1px solid #ccc;">
                <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Mail error:', error);
            return res.status(500).json({ success: false, message: "Failed to send OTP" });
        }
        console.log(`✅ OTP sent to ${email} - ${otp}`);
        res.status(200).json({ success: true });
    });
});

// ✅ Verify OTP Route
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = otpStore[email];
    if (!record) {
        return res.json({ success: false, message: "No OTP found for this email" });
    }

    const isValid = record.code === otp;
    const isExpired = Date.now() > record.expires;

    if (isValid && !isExpired) {
        delete otpStore[email];
        console.log(`✅ OTP verified for ${email}`);
        return res.json({ success: true });
    } else {
        return res.json({ success: false, message: isExpired ? "OTP expired" : "Invalid OTP" });
    }
});

// 🟢 Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
