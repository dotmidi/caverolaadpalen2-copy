import * as mongoose from 'mongoose';

export const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

export interface Admin extends mongoose.Document {
    username:string;
    password:string;
}