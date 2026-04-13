import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "noreply@dexurban.md";

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://dexurban.md";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verificare email - DexUrban",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #202020;">Bine ai venit pe <span style="color: #E86842;">Dex</span>Urban!</h2>
        <p>Apasă pe butonul de mai jos pentru a-ți verifica adresa de email:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #E86842; color: #F1F1F1; padding: 12px 24px; text-decoration: none; border-radius: 2px; font-weight: bold;">Verifică email</a>
        <p style="margin-top: 24px; font-size: 13px; color: #666;">Link-ul expiră în 24 de ore. Dacă nu ai creat un cont pe DexUrban, ignoră acest email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://dexurban.md";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Resetare parolă - DexUrban",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #202020;"><span style="color: #E86842;">Dex</span>Urban - Resetare parolă</h2>
        <p>Ai solicitat resetarea parolei. Apasă pe butonul de mai jos:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #E86842; color: #F1F1F1; padding: 12px 24px; text-decoration: none; border-radius: 2px; font-weight: bold;">Resetează parola</a>
        <p style="margin-top: 24px; font-size: 13px; color: #666;">Link-ul expiră în 1 oră. Dacă nu ai solicitat resetarea parolei, ignoră acest email.</p>
      </div>
    `,
  });
}
