// services/asistencia.service.ts

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Clase } from '../interfaces/asignatura';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private storageReady = this.storage.create();

  constructor(private storage: Storage) {}

  // Guardar la asistencia de una clase
  async guardarAsistencia(clase: Clase): Promise<void> {
    await this.storageReady;
    let clases = (await this.storage.get('clases')) || [];
    clases.push(clase);
    await this.storage.set('clases', clases);
  }

  // Obtener todas las asistencias
  async obtenerAsistencias(): Promise<Clase[]> {
    await this.storageReady;
    return (await this.storage.get('clases')) || [];
  }
}
