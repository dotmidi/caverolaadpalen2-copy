import { Controller, Delete, Get, Post, Put, Param, Body } from "@nestjs/common";
import { ChargerService } from "./charger.service";

/*
Ik heb hier een controller gemaakt, deze controller is een soort tussenstap tussen de frontend en de service.
De service is de plek waar de data wordt verwerkt en de controller is de plek waar de data wordt opgehaald.
De model is gewoon een object dat de data bevat.
Over de model gesproken, er staan 2 enums in, dit zijn constanten die je moet gebruiken als je bijv een laadpaal aanmaakt.
Het is dus belangrijk om te weten dat een normale lader 1 is en een snellader 2 is.

VOORBEELD lader aanmaken:
als je een lader wilt aanmaken moet je een post request sturen naar de endpoint /charger met de volgende body:
(als je niet weet hoe je een request moet sturen moet je ff googelen, zelfde geld voor de body)
{
    "id": 1, // dit kan alles zijn zolang het een int is (ik moet nog toevoegen dat het uniek moet zijn maar cba atm)
    "type": 1 // Dit is de enum die ik eerder noemde, 1 is normaal, 2 is snel
} // status wordt automatisch op AVAILABLE gezet (of ik doe hem op UNKNOWN, weet niet wat handiger is)

Ohja als er iets niet klopt in deze comment dat kan want ik heb het niet geschreven, dat was copilot.

groetjes
T
*/



@Controller('charger')
export class ChargerController{
    constructor(private chargerService: ChargerService) {}


    // returned alle laadpalen en hun informatie als deze endpoint wordt aangeroepen ( GET http://localhost:3000/charger)
    @Get()
    async getLaadpalen() {
        const chargers = await this.chargerService.getChargers();
        return chargers;
    }

    // returned 1 specifieke laadpaal en de informatie erin als de id in de query staat ( Get http://localhost:3000/charger/12345)
    @Get(':id')
    async getLaadpaal(@Param('id') Id: number) {
        return await this.chargerService.getCharger(Id);
    }

    // Maakt een nieuwe laadpaal aan als de body de juiste informatie bevat (POST http://localhost:3000/charger)
    @Post()
    async createLaadpaal(
        @Body('id') Id: number,
        @Body('type') Type: number,

    ) 
    {
        return this.chargerService.createCharger(Id, Type);
    }

    // Update de status van een laadpaal in de database, in de body moet de id en status staan (PUT http://localhost:3000/charger {id: 12345, status: 1}})
    @Put()
    async updateChargerStatus(
        @Body('id') Id: number,
        @Body('status') Status: number,
    ) {
        console.log(Id, Status);
        return await this.chargerService.updateChargerStatus(Id, Status);
    }

    // Update de occupiedbyemail in de database.
    // Dit is nodig omdat als er iemand op een laadpaal gaat laden we de informatie op de laadpaal moeten updaten. 
    // (PUT http://localhost:3000/charger/occupied {id: 12345, status: 1}})
    @Put("occupied")
    async updateChargerOccupied(
        @Body('id') Id: number,
        @Body('email') Email: string,
    ) {
        console.log(Id, Email);
        return await this.chargerService.updateChargerOccupied(Id, Email);
    }

    // Delete een laadpaal uit de database, het delete de entry met de ID die wordt gegeven in de query (DELETE http://localhost:3000/charger/12345)
    @Delete(':id')
    async deleteLaadpaal(
        @Param('id') Id: number,
    ) {
        await this.chargerService.deleteCharger(Id);
        return null;
    }

}