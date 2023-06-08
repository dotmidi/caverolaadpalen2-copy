import * as mongoose from 'mongoose';


// dit is de mongodb schema voor de laadpalen, deze velden komen in de database terecht, alle velden zijn verplicht.
export const ChargerSchema = new mongoose.Schema({
    sId: { type: Number, required: true },
    Status: { type: Number, required: true },
    Type: { type: Number, required: true },
    OccupiedByEmail: { type: String, required: true },
});

// Enums om de status makkelijker te weizigen en het overzichtelijker te houden
export enum eStatus {
    AVAILABLE = 1,
    OCCUPIED = 2,
    DONE = 3,
    OUT_OF_ORDER = 4,
    UNKNOWN = 5
}

export enum eType {
    NORMAL = 1,
    FAST = 2,
}

// export class Charger {
//     static readonly STATUS = eStatus;
//     static readonly TYPE = eType;
//     sId: number;
//     status: eStatus;
//     type: eType;

//     constructor(id: number, type: eType) {
//         this.sId = id;
//         this.status = Charger.STATUS.AVAILABLE;
//         this.type = type;
//     }

//     public setStatus(status: eStatus) {
//         this.status = status;
//     }
// }

export interface Charger extends mongoose.Document {
    sId: number;
    Status: eStatus;
    Type: eType;
    OccupiedByEmail: String;
}