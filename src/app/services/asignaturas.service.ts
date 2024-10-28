import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Asignatura, Clase } from '../interfaces/asignatura';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  obtenerUsuarioActual(): import("../interfaces/usuario").Usuario | PromiseLike<import("../interfaces/usuario").Usuario> {
    throw new Error('Method not implemented.');
  }
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async guardarAsignatura(asignatura: Asignatura): Promise<void> {
    const asignaturas = await this.obtenerAsignaturas();
    asignaturas.push(asignatura);
    await this._storage?.set('asignaturas', asignaturas);
  }

  async obtenerAsignaturas(): Promise<Asignatura[]> {
    return (await this._storage?.get('asignaturas')) || [];
  }

  async obtenerAsignaturasPorUsuario(usuarioId: string): Promise<Asignatura[]> {
    const asignaturas = await this.obtenerAsignaturas();
    return asignaturas.filter(asignatura => asignatura.profesorId === usuarioId);
  }

  async agregarClaseaHorario(asignaturaId: string, clase: Clase): Promise<Clase | null> {
    const asignaturas = await this.obtenerAsignaturas();
    const asignatura = asignaturas.find(a => a.id === asignaturaId);

    if (asignatura) {
      clase.id = uuidv4();  // Generamos un ID único para la clase
      asignatura.horarios.push(clase);
      await this._storage?.set('asignaturas', asignaturas);
      return clase;
    }
    return null;
  }
}
