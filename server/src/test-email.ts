import nodemailer from 'nodemailer';

// Create a test email transporter
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 2525,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send a test email
async function sendTestEmail(to: string) {
  try {
    const info = await transporter.sendMail({
      from: 'test@example.com',
      to: to,
      subject: 'Test Email ✔',
      text: 'This is a test email from our local SMTP server',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email sent to: ${to}</p>
          <p>If you're seeing this, the SMTP server is working! 🎉</p>
          <hr>
          <p style="color: #666;">Sent from Flash Mail Test Script</p>
        </div>
      `
    });

    console.log('Message sent successfully!');
    console.log('Preview:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Get the email address from command line argument or use a default one
const emailAddress = process.argv[2] || 'test@demo.flashmail.com';

// Send the test email
console.log(`Sending test email to: ${emailAddress}`);
sendTestEmail(emailAddress); 