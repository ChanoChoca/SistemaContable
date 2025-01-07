import {User} from "../core/model/user.model";

export interface Asiento {
  id?: number;
  fecha: Date;
  descripcion: string;
  usuario: User;
}
