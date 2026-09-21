import nodemailer from "nodemailer";

interface SendResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: SendResetEmailParams): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"مطبعة خط الإعلان" <no-reply@adlineksa.com>`;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; padding-bottom: 20px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">مطبعة خط الإعلان | Adline</h2>
          <p style="color: #64748b; font-size: 14px;">طلب إعادة تعيين كلمة المرور</p>
        </div>
        
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #cbd5e1; text-align: right;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">مرحباً بك،</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يمكنك البدء في إنشاء كلمة مرور جديدة بالنقر على الزر أدناه:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #f59e0b; color: #0f172a; padding: 14px 28px; text-decoration: none; font-weight: 800; border-radius: 10px; display: inline-block; font-size: 15px;">إعادة تعيين كلمة المرور ←</a>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">هذا الرابط صالحة لمدة 60 دقيقة فقط وهو مخصص للاستخدام مرة واحدة.</p>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">إذا لم تطلب إعادة تعيين كلمة المرور، فيمكنك تجاهل هذا البريد الإلكتروني وسيظل حسابك آمناً.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} Adline KSA. جميع الحقوق محفوظة.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: "إعادة تعيين كلمة المرور - مطبعة خط الإعلان",
      html: htmlContent,
    });
  } else {
    // Fallback logging for environment without configured SMTP
    console.log(`[Email Service] Password reset link requested for account.`);
  }
}
