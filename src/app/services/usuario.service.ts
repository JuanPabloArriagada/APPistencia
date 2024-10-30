import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  // Inicializar la base de datos
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Guardar un usuario en el almacenamiento
  async guardarUsuario(usuario: Usuario): Promise<void> {
    const usuarios = await this.obtenerUsuarios();
    usuarios.push(usuario);
    await this._storage?.set('usuarios', usuarios);
  }

  // Obtener todos los usuarios del almacenamiento
  async obtenerUsuarios(): Promise<Usuario[]> {
    return (await this._storage?.get('usuarios')) || [];
  }

  // Obtener un usuario por su RUT
  async obtenerUsuarioPorRut(rut: string): Promise<Usuario | null> {
    const usuarios = await this.obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(usuario => usuario.rut === rut);
    return usuarioEncontrado || null;
  }

  // Eliminar un usuario por su RUT
  async eliminarUsuario(rut: string): Promise<void> {
    const usuarios = await this.obtenerUsuarios();
    const usuariosFiltrados = usuarios.filter(usuario => usuario.rut !== rut);
    await this._storage?.set('usuarios', usuariosFiltrados);
  }

  // Actualizar la información de un usuario
  async actualizarUsuario(usuarioActualizado: Usuario): Promise<void> {
    const usuarios = await this.obtenerUsuarios();
    const index = usuarios.findIndex(usuario => usuario.rut === usuarioActualizado.rut);

    if (index !== -1) {
      usuarios[index] = usuarioActualizado;
      await this._storage?.set('usuarios', usuarios);
    }
  }
}
