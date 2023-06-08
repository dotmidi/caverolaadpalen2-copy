import { BadRequestException, Injectable } from "@nestjs/common";
import { MailModule } from "./mail.module";
import { InjectModel } from '@nestjs/mongoose'; 
import { Model } from 'mongoose';
import { Mail } from "./mail.model";


@Injectable({})
export class MailService{
    

    constructor(@InjectModel('Mail') private readonly mailModel : Model<Mail>) {}


    // Pakt de lengte van de aantal entrys in de database en returned dit. 
    // Dit is nodig om te kijken hoeveel mensen er precies aan het wachten zijn voor een Notificatie.
   async Wachtrij(){
        const result = await this.mailModel.find().exec();
        const lenght = result.length;  
        return lenght;
    }

    // Deze functie insert de email die in de frontend door de gebruiker wordt ingevoerd in de database.
   async Insertemail(email: string , name: string){
        let exist = false
        const all = await this.mailModel.find().exec();
        for(let i = 0; i < all.length; i++){
            if(all[i].email == email){
                exist = true
                return "Email bestaat al"
            }
        }
        if(exist == false){
        const newEmail  = new this.mailModel({ email, name});
        const result = await newEmail.save();
        console.log(result);
        }
    }
    async DeleteEmail(){
        // delete de eerste entry in de database
        // Dit is nodig omdat als er een email wordt gestuurd naar de gebruiker, deze email moet verwijderd worden uit de database.
        let result = await this.mailModel.deleteOne().exec();
        console.log(result);
    }

    async getEmail(){
        // Pakt de eerste email die in de database staat ( dus als eerst aan de beurt is), deze email moet naar de sendemail functie gestuurd worden.
        let result = await this.mailModel.find().exec();
        if(result.length == 0){
            return "Geen email in de wachtrij"
        }
        this.DeleteEmail();
        return result[0].email;
        
    }
}