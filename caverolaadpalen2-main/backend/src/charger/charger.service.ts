import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { Charger, eStatus, eType } from "./charger.model";

import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { empty } from "rxjs";

@Injectable({})
export class ChargerService{
    chargers: Charger[] = [];

    constructor(@InjectModel('Charger') private readonly chargerModel: Model<Charger>) {}

    
    getChargers() {
        // pakt alle entrys in de database en returned ze
        const all =  this.chargerModel.find().exec();
        return all;
    }

    async getCharger(id: number) {
        // pakt 1 laadpaal uit de database en returned de informatie.
        const charger = await this.findCharger(id);
        return charger ;
    }

    async createCharger(id: number, type: number) {
        
        //  checkt of de id valid is.
        if (!id) {
            throw new BadRequestException('ID cannot be empty');
        }
        if (id < 0) {
            throw new BadRequestException('ID cannot be negative');
        }
        if (!type) {
            throw new BadRequestException('Type cannot be empty');
        }
        if (type !== eType.FAST && type !== eType.NORMAL) {
            throw new BadRequestException('Type is not valid');
        }
        // Hier zetten we OccupiedByEmail op "Placeholder" omdat het niet leeg man zijn in de database, het is een required veld.
        const newCharger = new this.chargerModel({sId: id, Type: type, Status: 1, OccupiedByEmail: "Placeholder"});
        const result = await newCharger.save();
        console.log(result);
        return id;
    }
        

 
    async updateChargerStatus(chargerId: number, status: number) {
        
        // zoekt de charger op ID die wordt gegeven aan de functie als parameter.
        const charger = await this.findCharger(chargerId);
        
        charger.Status = status;
        
        // change status to unknown if status is not valid or empty
        if (!status || status < 1 || status > 5) {
            status = eStatus.UNKNOWN;
        }
        //charger.status = status;
        charger.save();
    }

    
    async updateChargerOccupied(chargerId: number, Email: String) {
        const charger = await this.findCharger(chargerId);
        // update de email die op een laadpaal zit met een ID.
        charger.OccupiedByEmail = Email;
        charger.save();

    }


    async deleteCharger(id: number) {
        await this.chargerModel.deleteOne({sId: id}).exec();
    }

    // zoekt een charger op ID en returned deze.
    private async findCharger(id: number): Promise<Charger> {
        let charger;
        try {
            charger = await this.chargerModel.findOne({sId: id}).exec();
        } catch (error) {
            throw new NotFoundException('Charger not found');
        }
        if (!charger) {
            throw new NotFoundException('Charger not found');
        }
        return charger;
    }
}
