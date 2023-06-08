const fs = require('fs').promises;
const ls = require('fs');
const path = require('path');
const process2 = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { get } = require('http');
const { testing } = require('googleapis/build/src/apis/testing');
import { serialize } from 'v8';
import { ChargerService } from '../charger/charger.service';
const axios = require('axios').default;

const gmailSend = require('./gmailsend.service');

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
    // Load client secrets from a local file.
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

    // Save token to disk for later program executions
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

    // Load client secrets from a local file.
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

class gmailReader {
    // List all messages of the user's mailbox matching the query.
    static async listMessages(auth) {
        const gmail = google.gmail({version: 'v1', auth});
        const res = await gmail.users.messages.list({
            userId: 'me',
        });
        const messages = res.data.messages;
        if (messages) {
            //console.log('Messages:');
            messages.forEach((message) => {
                //console.log(`- ${message.id}`);
                this.getMessage(auth, message.id);
                this.archiveMessage(auth, message.id);
            });
        } else {
            let DateTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
            console.log(DateTime + ' No Messages found.');
            return;
        }
    }

    // Archive a message by removing it from the inbox and adding it to the trash
    static async archiveMessage(auth, id) {
        const gmail = google.gmail({version: 'v1', auth});
        const res = await gmail.users.messages.modify({
            userId: 'me',
            id: id,
            resource: {
                removeLabelIds: ['INBOX'],
                addLabelIds: ['TRASH'],
            },
        });
        const message = res.data;
        if (!message) {
            console.log('No Message found.');
            return;
        }
        console.log('Message archived.');
    }

    // Get a message and use it to get the serial number and the status
    static async getMessage(auth, id) {
        const gmail = google.gmail({version: 'v1', auth});
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: id,
        });
        const message = res.data;
        // only if label is "INBOX"
        if (!message) {
            console.log('No Message found.');
            return;
        }

        // only if label is "INBOX" and "UNREAD"
        if (message.labelIds[1] == 'INBOX' && message.labelIds[0] == 'UNREAD') {
        let message64 = message.payload.parts[0].body.data;
        let messageDecoded = Buffer.from(message64, 'base64').toString('ascii');
        //console.log(messageDecoded);
        
        // get the position of the string "Charge point serial number:"
        let positionSerialNumber = messageDecoded.search("Charge point serial number:");
        // get the string "Charge point serial number:" and the serial number
        let SerialNumberHeader = messageDecoded.slice(positionSerialNumber, positionSerialNumber+27);
        // get the serial number
        let SerialNumber = messageDecoded.slice(positionSerialNumber+28, positionSerialNumber+36);
        console.log(SerialNumberHeader + SerialNumber);

        // get the position of the string "Charge point status:"
        let positionStatus = messageDecoded.search("Charge point status:");
        let StatusHeader = messageDecoded.slice(positionStatus, positionStatus+20);
        let Status = messageDecoded.slice(positionStatus+21, positionStatus+63);
        console.log(StatusHeader + Status);
        
        // get the position of the string "Time of status change:"
        let positionTime = messageDecoded.search("Time of status change:");
        let TimeHeader = messageDecoded.slice(positionTime, positionTime+21);
        let Time = messageDecoded.slice(positionTime+22, positionTime+42);
        console.log(TimeHeader + Time);

        // get the position of the string "Charge card serial number:"
        let positionCardSerialNumber = messageDecoded.search("Charge card serial number:");
        let CardSerialNumberHeader = messageDecoded.slice(positionCardSerialNumber, positionCardSerialNumber+26);
        let CardSerialNumber = messageDecoded.slice(positionCardSerialNumber+27, positionCardSerialNumber+42);
        console.log(CardSerialNumberHeader + CardSerialNumber);

        //remove - and white space from the status
        Status = Status.replace(/-/g, '');

        //save the data in a json file
        let data = {
        "SerialNumber": SerialNumber,
        "Status": Status,
        "Time": Time.slice(1),
        "CardSerialNumber": CardSerialNumber
        }
        let dataJSON = JSON.stringify(data);
        // replace the : with - in the file name
        ls.writeFileSync('./src/gmail/parsed/' + (Time.slice(1).replace(/:/g, '.')) + '.json', dataJSON);

        let statusint = 0;
        console.log(Status);

        // Als uit de geparsde email de status "Occupied by a vehicle that is charging" uit komt, gaat hij hier in de if statement.
       
        if(Status == "Occupied by a vehicle that is not charging"){

            // de Enum voor een paal die occupied is maar niet laad is 3, daarom zetten we hier statusint op 3.
            statusint = 3;
           
            // We updaten de status van de paal in de database op serialnumber ( Wat uit de geparsde email komt) en zetten de status op3 
            axios.put('http://localhost:3000/charger', { id: parseInt(SerialNumber), status : statusint});

            // We halen de email op van de gebruiker die de auto heeft geparkeerd op de paal, deze email sturen we dan als param door.
            // Lijn 185 wordt de email doorgestuurd naar de functie main in de gmailSend class.
             axios.get('http://localhost:3000/charger/' + parseInt(SerialNumber))
            .then(function (response) {
              let email = response.data.OccupiedByEmail;
              gmailSend.main(email, "Auto is vol","Je auto is vol,haal hem zo snel mogelijk weg!")
            })
            
            // Nadat we de email hebben gestuurd zetten we de email op die paal leeg, dus als placeholder.
            axios.put('http://localhost:3000/charger/occupied', { id: parseInt(SerialNumber), email: "Placeholder" });

          }

           // Als uit de geparsde email de status "Occupied by a vehicle that is charging" uit komt, gaat hij hier in de if statement.
          else if (Status == "Occupied by a vehicle that is charging")
          {

            // Enum voor deze status is 2, vandaar statusint is 2
            statusint = 2;

            // we updaten de status hier in de database naar 2 op de laadpaal met de ID serialnumber.
            axios.put('http://localhost:3000/charger', { id: parseInt(SerialNumber), status : statusint});
            console.log("Email for Vehicle that is charging")

            
          }
      
           // Als uit de geparsde email de status "Available" uit komt, gaat hij hier in de if statement.
          else if (Status == "Available"){

            // enum voor vrije laadpaal is 1
            statusint = 1;
            //update hier weer de status in de database naar 1.
            axios.put('http://localhost:3000/charger', { id: parseInt(SerialNumber), status : statusint});
            console.log("Email for Available")


            // We halen de email op van de eerste gebruiker in de database op die in de wachtrij staat, deze mail sturen we als param door naar gmailssend.main.
            axios.get('http://localhost:3000/mail/Email')
            .then(function (response) {
              let email = response.data;
              console.log(email);
              gmailSend.main(email, "Er is een plek vrijgekomen","Er is een plek vrijgekomen, je kan je auto nu gaan opladen.")
            })

          }
        } 
        
        else {
            console.log('No Message found.');
            return;
        }
    }
}

export async function main() {
    const auth = await authorizeGmail.authorize();
    const run = setInterval(() => {
        gmailReader.listMessages(auth).catch(console.error);
    }, 1000);
}