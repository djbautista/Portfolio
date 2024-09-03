const nodemailer = require('nodemailer');

export async function POST(request: Request) {
  const username = process.env.MAIL_USERNAME;
  const password = process.env.MAIL_PASSWORD;
  const myEmail = process.env.TARGET_EMAIL;

  const { name, email, message } = await request.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: username,
      pass: password,
    },
  });

  const nameHTML = name ? `<p>Name: ${name} </p>` : '';
  const emailHTML = email ? `<p>Email: ${email} </p>` : '';
  const messageHTML = message ? `<p>Message: ${message} </p>` : '';

  try {
    await transporter.sendMail({
      from: username,
      to: myEmail,
      subject: `Website activity from ${email}`,
      html: `
      ${nameHTML}
      ${emailHTML}
      ${messageHTML}
        `,
    });

    return Response.json({ status: 200, message: 'Success: email was sent' });
  } catch (error) {
    console.error(error);
    Response.json({ status: 500, message: 'COULD NOT SEND MESSAGE' });
  }
}
