const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
      googleClientIdPublic,
      googleClientSecret,
      googleRedirectUriPublic
    );

//scope you need: https://www.googleapis.com/auth/userinfo.email

oauth2Client.setCredentials(tokens);

const googleAuth = google.oauth2({
      version: "v2",
      auth: oauth2Client,
    });

const googleUserInfo = await googleAuth.userinfo.get();
const email = googleUserInfo.data.email;
console.log('hi'
)