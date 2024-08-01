import {Party} from "./projects.model";

export interface Transaction {
    id: string;
    date: string;
    value: {
        amount: number;
        currency: string;
    };
    payer: Party;
    payee: Party;
}
