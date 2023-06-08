const fs = require('fs').promises;
const ls = require('fs');
const path = require('path');
const process2 = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { get } = require('http');
const { testing } = require('googleapis/build/src/apis/testing');
import { gmail } from 'googleapis/build/src/apis/gmail';
import { serialize } from 'v8';
import { ChargerService } from '../charger/charger.service';
const axios = require('axios').default;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), './src/gmail/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './src/gmail/credentials.json');

class authorizeGmail {

    /**
     * 
     * @returns {Promise<OAuth2Client|null>}
     */
    static async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    /**
     * 
     * @param {OAuth2Client} client
     * @returns {Promise<void>}
     */
    static async saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }

    static async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (!client) {
            // Request authorization from the user.
            client = await authenticate({
                keyfilePath: CREDENTIALS_PATH,
                scopes: SCOPES,
            });
            await this.saveCredentials(client);
        }
        return client;
    }
}

class createMail {
    static async makeBody(to, from, subject, message) {
        var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');
    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
    }
}

class gmailSend {
    static async sendMessage(auth, to, subject, message) {
        var raw = await createMail.makeBody(to, 'caverolaadpalenteam4@gmail.com', subject, message);
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                raw: raw
            }
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            //console.log(response);
            console.log('Message sent: %s', response.data.id);
            console.log('Message sent to %s', to)
        });

    }
}

export async function main(to, subject, message) {
    authorizeGmail.authorize().then((auth) => {
        gmailSend.sendMessage(auth, to, subject, message);
    });
}