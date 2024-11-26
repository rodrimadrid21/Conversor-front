import { Moneda } from "./moneda";

export interface Conversion {
    fechaConversion: any;
    UsuarioId : number;
    FromCurrency: string;
    ToCurrency: string;
    Amount: number;
    Result?: number; // Este será devuelto por la API
    Date?: string; // También devuelto por la API
    moneda?: Moneda;
}
