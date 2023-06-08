import { Controller, Delete, Get, Post, Put, Param, Body } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller('admin')
export class AdminController{
    constructor(private adminService: AdminService) {}

    @Get()
    async getAdmin() {
        console.log("test")
        const admins = await this.adminService.getAdmin();
        return admins;
    }

}