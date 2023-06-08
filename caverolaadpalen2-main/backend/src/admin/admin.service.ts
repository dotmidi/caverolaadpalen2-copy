import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { Admin } from "./admin.model"

import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { empty } from "rxjs";

@Injectable({})
export class AdminService{

    constructor(@InjectModel('Admin') private readonly adminModel: Model<Admin>) {}

    getAdmin() {
        const all = this.adminModel.find().exec();
        return all
    }
}
