import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Clase } from '../interfaces/asignatura';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsignaturaService } from './asignaturas.service';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  constructor(
    private firestore: AngularFirestore,
    private asignaturaService: AsignaturaService
  ) {}

  guardarAsistencia(clase: Clase) {
    return this.firestore.collection('clases').doc(clase.id).set(clase);
  }

  async obtenerClase(claseId: string): Promise<Clase | null> {
    try {
      const claseDoc = await this.firestore.collection('clases').doc(claseId).get().toPromise();
      return claseDoc && claseDoc.exists ? claseDoc.data() as Clase : null;
    } catch (error) {
      console.error('Error al obtener la clase:', (error as Error).message);
      throw new Error('Error al obtener la clase: ' + (error as Error).message);
    }
  }

  obtenerClases(): Observable<Clase[]> {
    return this.firestore.collection<Clase>('clases').valueChanges();
  }

  async actualizarAsistencia(claseId: string, asistentes: string[], inasistentes: string[]) {
    try {
      await this.firestore.collection('clases').doc(claseId).update({ asistentes, inasistentes });
      console.log(`Asistentes y inasistentes actualizados para la clase ID: ${claseId}`);
    } catch (error) {
      console.error('Error al actualizar la asistencia:', (error as Error).message);
      throw new Error('Error al actualizar la asistencia: ' + (error as Error).message);
    }
  }

  obtenerClaseEnTiempoReal(claseId: string): Observable<Clase> {
    return this.firestore.collection('clases').doc<Clase>(claseId).snapshotChanges().pipe(
      map((doc) => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        return { id, ...data } as Clase;
      })
    );
  }

  async registrarAsistencia(claseId: string, alumnoId: string) {
    try {
      const clase = await this.obtenerClase(claseId);

      if (!clase) {
        console.error('Clase no encontrada');
        return;
      }

      if (clase.asistentes.includes(alumnoId)) {
        console.log(`El alumno ${alumnoId} ya está registrado en la asistencia.`);
      } else {
        const nuevosAsistentes = [...clase.asistentes, alumnoId];
        const inasistentesActualizados = clase.inasistentes.filter((id: string) => id !== alumnoId);

        await this.firestore.collection('clases').doc(claseId).update({ asistentes: nuevosAsistentes, inasistentes: inasistentesActualizados });
        const asignaturaId = clase.asignaturaId;
        await this.asignaturaService.inscribirAlumnoEnAsignatura(asignaturaId, alumnoId);
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
    }
  }

  async obtenerAsistenciaPorAsignatura(asignaturaId: string): Promise<Clase[]> {
    const clases = await this.firestore.collection<Clase>('clases', ref => ref.where('asignaturaId', '==', asignaturaId)).valueChanges().toPromise();
    return clases ?? [];
  }

  async eliminarClase(claseId: string): Promise<void> {
    try {
      await this.firestore.collection('clases').doc(claseId).delete();
      console.log(`Clase con ID ${claseId} eliminada de Firebase.`);
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      throw new Error('No se pudo eliminar la clase.');
    }
  }
  

}
