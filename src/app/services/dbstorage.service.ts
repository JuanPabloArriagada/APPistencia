import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class LocalDBService {
  private _storage: Storage | null = null;
  private dbKey = 'usuariosDB';  // Llave en localStorage para almacenar los usuarios 


  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Guarda el usuario en localStorage
  async registro(usuario: Usuario) {
    const usuarios = JSON.parse(localStorage.getItem(this.dbKey) || '[]');
    usuarios.push(usuario);
    localStorage.setItem(this.dbKey, JSON.stringify(usuarios));
  }

  // Obtiene un usuario por rut
  async obtenerUsuarioPorRut(rut: string): Promise<Usuario | null> {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem(this.dbKey) || '[]');
    const usuarioEncontrado = usuarios.find(usuario => usuario.rut === rut);
    return usuarioEncontrado || null;
  }

  
}
