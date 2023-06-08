import { Module } from "@nestjs/common";
import { MailController } from "./mail.controller";
import { MailService } from "./mail.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MailSchema } from "./mail.model";

@Module({
    imports:[MongooseModule.forFeature([{name:"Mail", schema: MailSchema}])],
    controllers: [MailController],
    providers: [MailService]
})
export class MailModule {
}




