import * as mongoose from 'mongoose';
import internal from 'stream';

// Email en name als required velden in de database.
export const MailSchema =  new mongoose.Schema(
    {
        email : {type: String, required: true},
        name : {type: String, required: false},
    }
);


export interface Mail {
    
    id: string,
    email: string,
    name: string,
}