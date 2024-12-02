import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Clase, AsistenciaAsignatura, Asignatura } from '../interfaces/asignatura';
import { AsignaturaService } from './asignaturas.service';
import { AsistenciaService } from './asistencia.service';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor(private storage: Storage, private asignaturaService: AsignaturaService, private asistenciaService: AsistenciaService) {
    this.storage.create();
    this.subscribeToNetworkChanges();
  }

  async guardarClaseLocal(clase: Clase): Promise<void> {
    const clasesGuardadas = (await this.storage.get('clasesOffline')) || [];
    const claseExistente = clasesGuardadas.some((c: Clase) => c.id === clase.id);

    if (!claseExistente) {
      clasesGuardadas.push(clase);
      await this.storage.set('clasesOffline', clasesGuardadas);
    } else {
      console.log(`Clase con ID ${clase.id} ya existe en almacenamiento local.`);
    }
  }

  async obtenerClasesNoSincronizadas(): Promise<Clase[]> {
    return (await this.storage.get('clasesOffline')) || [];
  }

  async eliminarClaseSincronizada(claseId: string): Promise<void> {
    const clasesGuardadas = (await this.storage.get('clasesOffline')) || [];
    const clasesFiltradas = clasesGuardadas.filter((clase: Clase) => clase.id !== claseId);
    await this.storage.set('clasesOffline', clasesFiltradas);
  }

  async guardarAsistenciaOffline(asistencia: { claseId: string; alumnoId: string; estado: 'presente' | 'ausente' | 'tarde' }): Promise<void> {
    const asistenciasGuardadas = (await this.storage.get('asistenciasOffline')) || [];
    asistenciasGuardadas.push(asistencia);
    await this.storage.set('asistenciasOffline', asistenciasGuardadas);
    console.log('Asistencia offline guardada:', asistencia);
  }

  async obtenerAsistenciasNoSincronizadas(): Promise<any[]> {
    return (await this.storage.get('asistenciasOffline')) || [];
  }

  async eliminarAsistenciaSincronizada(claseId: string, alumnoId: string): Promise<void> {
    const asistenciasOffline = (await this.storage.get('asistenciasOffline')) || [];
    const nuevasAsistencias = asistenciasOffline.filter((a: any) => !(a.claseId === claseId && a.alumnoId === alumnoId));
    await this.storage.set('asistenciasOffline', nuevasAsistencias);
    console.log(`Asistencia eliminada para claseId: ${claseId}, alumnoId: ${alumnoId}`);
  }

  async sincronizarDatosOffline(enviarClase: (clase: Clase) => Promise<void>, enviarAsistencia: (asistencia: any) => Promise<void>): Promise<void> {
    const clasesOffline = await this.obtenerClasesNoSincronizadas();
    const asistenciasOffline = await this.obtenerAsistenciasNoSincronizadas();

    // Sincronizar clases primero
    for (const clase of clasesOffline) {
      try {
        await enviarClase(clase);
        await this.eliminarClaseSincronizada(clase.id);
        console.log(`Clase sincronizada: ${clase.id}`);
      } catch (error) {
        console.error(`Error al sincronizar clase ${clase.id}:`, error);
      }
    }

    // Verificar asistencias pendientes
    for (const asistencia of asistenciasOffline) {
      try {
        const claseSincronizada = !clasesOffline.some((c: Clase) => c.id === asistencia.claseId);

        if (claseSincronizada) {
          await enviarAsistencia(asistencia);
          await this.eliminarAsistenciaSincronizada(asistencia.claseId, asistencia.alumnoId);
          console.log(`Asistencia sincronizada: claseId ${asistencia.claseId}, alumnoId ${asistencia.alumnoId}`);
        }
      } catch (error) {
        console.error('Error al sincronizar asistencia:', asistencia, error);
      }
    }
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

  private subscribeToNetworkChanges(): void {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conexión detectada. Sincronizando datos offline...');
        await this.sincronizarDatosOffline(
          (clase) => this.asistenciaService.guardarAsistencia(clase),  
          (asistencia) => this.asistenciaService.registrarAsistencia(asistencia.claseId, asistencia.alumnoId)  
        );
      }
    });
  }

  async sincronizarAsistenciasOffline(enviarAsistencia: (asistencia: any) => Promise<void>): Promise<void> {
    const asistenciasOffline = await this.obtenerAsistenciasNoSincronizadas();
    for (const asistencia of asistenciasOffline) {
      try {
        await enviarAsistencia(asistencia);
        await this.eliminarAsistenciaSincronizada(asistencia.claseId, asistencia.alumnoId);
        console.log(`Asistencia sincronizada: claseId ${asistencia.claseId}, alumnoId ${asistencia.alumnoId}`);
      } catch (error) {
        console.error('Error al sincronizar asistencia:', asistencia, error);
      }
    }
  }

}
