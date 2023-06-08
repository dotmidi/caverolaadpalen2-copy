import { Module } from "@nestjs/common";
import { ChargerController } from "./charger.controller";
import { ChargerService } from "./charger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ChargerSchema } from "./charger.model";

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Charger', schema: ChargerSchema }])],
    controllers: [ChargerController],
    providers: [ChargerService]
})

export class ChargerModule {}