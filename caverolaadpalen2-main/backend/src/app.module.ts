import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChargerModule } from './charger/charger.module';
import { MongooseModule } from '@nestjs/mongoose';
import {MailModule} from './mail/mail.module';
import { AdminModule } from './admin/admin.module';


// Hier worden alle dependecies geinject. Veel nestjs magie wordt hier uitgevoerd. Dat geld voor alle module.ts files.
@Module({
  imports: [ChargerModule, MailModule, AdminModule, MongooseModule.forRoot('mongodb+srv://caverolaadpalen:admin123@caverolaadpalen.hkeshf7.mongodb.net/?retryWrites=true&w=majority')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
