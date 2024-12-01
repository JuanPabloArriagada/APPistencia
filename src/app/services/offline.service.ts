import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Clase, AsistenciaAsignatura, Asignatura } from '../interfaces/asignatura';
import { AsignaturaService } from './asignaturas.service';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor(private storage: Storage, private asignaturaService: AsignaturaService) {
    this.storage.create();
    this.subscribeToNetworkChanges();
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
      clasesOffline[claseIndex].offlineAsistencias = [
        ...(clasesOffline[claseIndex].offlineAsistencias || []),
        asistencia,
      ];
    } else {
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

  async obtenerAsistenciasNoSincronizadas(): Promise<AsistenciaAsignatura[]> {
    return (await this.storage.get('asistenciasOffline')) || [];
  }

  async eliminarAsistenciaSincronizada(asistenciaId: string) {
    const asistenciasOffline = (await this.storage.get('asistenciasOffline')) || [];
    const nuevasAsistencias = asistenciasOffline.filter((a: AsistenciaAsignatura) => a.id !== asistenciaId);
    await this.storage.set('asistenciasOffline', nuevasAsistencias);
    console.log(`Asistencia con ID ${asistenciaId} eliminada de almacenamiento offline.`);
  }

  async sincronizarAsistenciasOffline(enviarAsistencia: (asistencia: any) => Promise<void>) {
    const clasesOffline = await this.storage.get('clasesOffline') || [];
  
    for (const clase of clasesOffline) {
      const offlineAsistencias = clase.offlineAsistencias || [];
  
      for (const asistencia of offlineAsistencias) {
        try {
          await enviarAsistencia(asistencia);
          clase.offlineAsistencias = clase.offlineAsistencias.filter((a: any) => a.alumnoId !== asistencia.alumnoId);
        } catch (error) {
          console.error('Error al sincronizar asistencia:', asistencia, error);
        }
      }
    }
  
    await this.storage.set('clasesOffline', clasesOffline);
  }

  async guardarAsignaturaLocal(asignatura: Asignatura): Promise<void> {
    const asignaturasGuardadas = await this.storage.get(`asignaturas-${asignatura.profesorId}`) || [];
  
    // Comprobar si la asignatura ya está en el almacenamiento local antes de guardarla
    const asignaturaExistente: boolean = asignaturasGuardadas.some((a: Asignatura) => a.id === asignatura.id);
  
    if (!asignaturaExistente) {
      asignaturasGuardadas.push(asignatura);
      await this.storage.set(`asignaturas-${asignatura.profesorId}`, asignaturasGuardadas); // Guardar usando la clave del rut
    } else {
      console.log(`La asignatura con ID ${asignatura.id} ya está en el almacenamiento local.`);
    }
  }

  // Obtener asignaturas no sincronizadas
  async obtenerAsignaturasNoSincronizadas(): Promise<any[]> {
    return await this.storage.get('asignaturasOffline') || [];
  }

  // Sincronizar asignaturas offline con Firebase
  async sincronizarAsignaturasOffline() {
    const asignaturasOffline = await this.obtenerAsignaturasNoSincronizadas();
    for (const asignatura of asignaturasOffline) {
      try {
        // Verificar si la asignatura ya existe en Firebase
        const asignaturaExistente = await this.asignaturaService.obtenerAsignaturaPorId(asignatura.id);
        
        // Solo sincronizar si no existe en Firebase
        if (!asignaturaExistente) {
          await this.asignaturaService.guardarAsignatura(asignatura);
          await this.eliminarAsignaturaSincronizada(asignatura.id);
        } else {
          console.log(`La asignatura con ID ${asignatura.id} ya existe en Firebase.`);
        }
      } catch (error) {
        console.error('Error al sincronizar asignatura:', asignatura, error);
      }
    }
  }

  // Eliminar asignatura ya sincronizada
  async eliminarAsignaturaSincronizada(asignaturaId: string): Promise<void> {
    const asignaturasGuardadas = await this.storage.get('asignaturasOffline') || [];
    const asignaturasFiltradas = asignaturasGuardadas.filter((asignatura: any) => asignatura.id !== asignaturaId);
    await this.storage.set('asignaturasOffline', asignaturasFiltradas);
  }

  // Escuchar los cambios en la conectividad de la red
  private subscribeToNetworkChanges() {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        // Sincronizar datos offline cuando vuelve la conexión
        await this.sincronizarAsignaturasOffline();
      }
    });
  }

}
