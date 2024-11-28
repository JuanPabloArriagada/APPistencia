import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Clase, AsistenciaAsignatura } from '../interfaces/asignatura';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor(private storage: Storage) {
    this.storage.create();
  }

  async guardarClaseLocal(clase: Clase): Promise<void> {
    const clasesGuardadas = await this.storage.get('clases') || [];
    clasesGuardadas.push(clase);
    await this.storage.set('clases', clasesGuardadas);
  }
  

  async obtenerClasesNoSincronizadas(): Promise<Clase[]> {
    return await this.storage.get('clases') || [];
  }

  async eliminarClaseSincronizada(claseId: string): Promise<void> {
    const clasesGuardadas = await this.storage.get('clases') || [];
    const clasesFiltradas: Clase[] = clasesGuardadas.filter((clase: Clase) => clase.id !== claseId);
    await this.storage.set('clases', clasesFiltradas);
  }

  async guardarAsistenciaOffline(asistencia: { claseId: string; alumnoId: string; estado: 'presente' | 'ausente' | 'tarde' }) {
    const clasesOffline = (await this.storage.get('clasesOffline')) || [];
    const claseIndex = clasesOffline.findIndex((clase: Clase) => clase.id === asistencia.claseId);
  
    if (claseIndex !== -1) {
      // Si la clase ya existe en el almacenamiento offline, añade la asistencia
      clasesOffline[claseIndex].offlineAsistencias = [
        ...(clasesOffline[claseIndex].offlineAsistencias || []),
        asistencia,
      ];
    } else {
      // Si la clase no existe, crea una nueva entrada
      clasesOffline.push({
        id: asistencia.claseId,
        asignaturaId: '', // Agregar asignaturaId si es necesario
        dia: '',
        horaInicio: '',
        horaFin: '',
        codigoSala: '',
        asistentes: [],
        inasistentes: [],
        fecha: '',
        offlineAsistencias: [asistencia],
      });
    }
  
    await this.storage.set('clasesOffline', clasesOffline);
    console.log('Asistencia offline guardada:', asistencia);
  }

  // Obtener todas las asistencias no sincronizadas
  async obtenerAsistenciasNoSincronizadas(): Promise<AsistenciaAsignatura[]> {
    return (await this.storage.get('asistenciasOffline')) || [];
  }

  // Eliminar una asistencia sincronizada
  async eliminarAsistenciaSincronizada(asistenciaId: string) {
    const asistenciasOffline = (await this.storage.get('asistenciasOffline')) || [];
    const nuevasAsistencias = asistenciasOffline.filter((a: AsistenciaAsignatura) => a.id !== asistenciaId);
    await this.storage.set('asistenciasOffline', nuevasAsistencias);
    console.log(`Asistencia con ID ${asistenciaId} eliminada de almacenamiento offline.`);
  }

  // Sincronizar asistencias offline
  async sincronizarAsistenciasOffline(enviarAsistencia: (asistencia: any) => Promise<void>) {
    const clasesOffline = await this.storage.get('clasesOffline') || [];
  
    for (const clase of clasesOffline) {
      const offlineAsistencias = clase.offlineAsistencias || [];
  
      for (const asistencia of offlineAsistencias) {
        try {
          await enviarAsistencia(asistencia);
  
          // Si se sincroniza correctamente, elimina la asistencia de la lista offline
          clase.offlineAsistencias = clase.offlineAsistencias.filter((a: any) => a.alumnoId !== asistencia.alumnoId);
        } catch (error) {
          console.error('Error al sincronizar asistencia:', asistencia, error);
        }
      }
    }
  
    // Actualiza las clases offline después de sincronizar
    await this.storage.set('clasesOffline', clasesOffline);
  }
  
}