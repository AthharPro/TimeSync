const generateEmailTemplate = (title: string, message: string, buttonText: string, buttonUrl: string) => `
<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>${title}</title>
  <meta name="description" content="${title}">
  <style type="text/css">a:hover{text-decoration:underline!important}</style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr><td style="text-align:center;"></td></tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">${title}</h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">${message}</p>
                    <a target="_blank" href="${buttonUrl}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">${buttonText}</a>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const getPasswordResetTemplate = (url: string) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: generateEmailTemplate(
    "You have requested to reset your password",
    "A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.",
    "Reset Password",
    url
  ),
});

// Simple HTML escaping for dynamic text nodes
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getWelcomeTmsTemplate = (url: string, username: string, password: string) => {
  const safeUsername = escapeHtml(username);
  const safePassword = escapeHtml(password);
  return ({
    subject: "Welcome to TMS",
    text: `Welcome to TMS! Use the following credentials for your first login:\nUsername: ${username}\nPassword: ${password}\nClick on the link to set your new password: ${url}`,
    html: generateEmailTemplate(
      "Welcome to TMS",
      `Use the following credentials for your first login:<br><br>
      <strong>Username:</strong> ${safeUsername}<br>
      <strong>Password:</strong> ${safePassword}<br><br>
      Click on the following link to go to the login page`,
      "Login to TMS",
      url
    ),
  });
};


   export const getEmailVerificationTemplate = (url: string) => ({
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: ${url}`,
    html: generateEmailTemplate(
      "Email Verification",
      "Please verify your email by clicking on the following link:",
      "Verify Email",
      url
    ),
  });

  export const getTimesheetReminderTemplate = (
    firstName: string,
    weekStartDate: Date,
    weekEndDate: Date,
    loginUrl: string
  ) => ({
    subject: "Timesheet Submission Reminder",
    text: `Dear ${firstName}, This is a reminder that you haven't submitted your timesheet for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()}. Please submit your timesheet as soon as possible. Login at: ${loginUrl}`,
    html: generateEmailTemplate(
      "Timesheet Submission Reminder",
      `Dear ${firstName},<br><br>
      This is a friendly reminder that you haven't submitted your timesheet for the week of:<br><br>
      <strong>${weekStartDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} - ${weekEndDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</strong><br><br>
      ⚠️ Please submit your timesheet as soon as possible.<br><br>`,
      "Submit Timesheet",
      `${loginUrl}/timesheet`
    ),
  });