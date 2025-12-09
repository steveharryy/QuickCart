import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ success: false, message: "Email is required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "🎉 Welcome to QuickCart!",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
      <div style="max-width: 500px; margin: auto; background: white; padding: 25px; border-radius: 10px;">
        
        <h2 style="color: #333; text-align: center;">🎉 Welcome to QuickCart!</h2>

        <p style="font-size: 15px; color: #555;">
          Thank you for subscribing to QuickCart! You're now part of our exclusive member list.
        </p>

        <p style="font-size: 15px; color: #555;">
          You'll receive:
        </p>

        <ul style="color: #555; font-size: 15px;">
          <li>🔥 Early access to new products</li>
          <li>💰 Exclusive deals and limited-time discounts</li>
          <li>🛍️ Personalized product recommendations</li>
        </ul>

        <div style="margin-top: 20px; padding: 15px; background: #e8f0fe; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #1a73e8;">Your 20% OFF Code</h3>
          <p style="font-size: 22px; font-weight: bold; margin: 5px 0 0; color: #1a73e8;">WELCOME20</p>
        </div>

        <p style="font-size: 14px; color: #777; margin-top: 25px; text-align: center;">
          Enjoy your shopping experience with QuickCart ❤️  
        </p>
      </div>
    </div>
  `,
});


    return Response.json({
      success: true,
      message: "Subscription email sent successfully!",
    });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return Response.json({
      success: false,
      message: "Failed to send email",
    });
  }
}
