import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class LocalDBService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Registrar un usuario nuevo
  public async registro(usuario: Usuario) {
    await this._storage?.set(usuario.rut, usuario);
    console.log('Usuario registrado:', usuario); // Agrega este log
  }


  // Obtener un usuario por RUT
  public async obtenerUsuarioPorRut(rut: string): Promise<Usuario | null> {
    const usuario = await this._storage?.get(rut);
    console.log('Usuario obtenido:', usuario); // Agrega este log
    return usuario || null;
  }
}
