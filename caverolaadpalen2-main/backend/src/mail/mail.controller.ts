import { Controller, Delete, Get, Post, Put, Param, Body } from "@nestjs/common";
import { response } from "express";
import { get } from "http";
import { MailService } from "./mail.service";

// Controller die op (GET http://localhost:3000/mail/....) wordt opgeroepen en op service MailService depend.
@Controller('mail')
export class MailController{
    constructor(private mailService: MailService) {}


    // (GET http://localhost:3000/mail/wachtrij) returned de wachtrij.
    @Get("wachtrij")
    getwachtrij(){
        return this.mailService.Wachtrij();
    }



    // (POST http://localhost:3000/mail/{email: "email", emailnaam: "naam"}})
    @Post()
    returnemail(
        @Body('email') email: string,
        @Body('emailnaam') naam: string){ 
        return this.mailService.Insertemail(email,naam);
    }

     // (Delete http://localhost:3000/mail)
    @Delete()
    DeleteEmail(){
        return this.mailService.DeleteEmail();
    }
    // GET (http://localhost:3000/mail/wachtrij/Email)
    @Get("Email")
    getEmail(){
        return this.mailService.getEmail();
    }
}