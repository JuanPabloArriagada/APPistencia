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

  // Guarda o actualiza la asistencia de una clase en Firestore
  guardarAsistencia(clase: Clase) {
    return this.firestore.collection('clases').doc(clase.id).set(clase);
  }

  // Obtiene una clase específica por su ID
  async obtenerClase(claseId: string): Promise<Clase | null> {
    try {
      const claseDoc = await this.firestore.collection('clases').doc(claseId).get().toPromise();
      return claseDoc && claseDoc.exists ? claseDoc.data() as Clase : null;
    } catch (error) {
      console.error('Error al obtener la clase:', (error as Error).message);
      throw new Error('Error al obtener la clase: ' + (error as Error).message);
    }
  }

  // Obtiene todas las clases y las devuelve como un Observable
  obtenerClases(): Observable<Clase[]> {
    return this.firestore.collection<Clase>('clases').valueChanges();
  }

  // Actualiza los asistentes y los inasistentes de una clase específica
  async actualizarAsistencia(claseId: string, asistentes: string[], inasistentes: string[]) {
    try {
      await this.firestore.collection('clases').doc(claseId).update({ asistentes, inasistentes });
      console.log(`Asistentes y inasistentes actualizados para la clase ID: ${claseId}`);
    } catch (error) {
      console.error('Error al actualizar la asistencia:', (error as Error).message);
      throw new Error('Error al actualizar la asistencia: ' + (error as Error).message);
    }
  }

  // Escucha los cambios en tiempo real de una clase específica
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

      // Verificar si el alumno ya está en los asistentes
      if (clase.asistentes.includes(alumnoId)) {
        console.log(`El alumno ${alumnoId} ya está registrado en la asistencia.`);
      } else {
        // Agregar el alumno a los asistentes
        const nuevosAsistentes = [...clase.asistentes, alumnoId];
        const inasistentesActualizados = clase.inasistentes.filter((id: string) => id !== alumnoId);

        // Actualizar la asistencia en Firestore
        await this.firestore.collection('clases').doc(claseId).update({ asistentes: nuevosAsistentes, inasistentes: inasistentesActualizados });

        // Verificar y actualizar la lista de inscritos en la asignatura
        const asignaturaId = clase.asignaturaId;
        await this.asignaturaService.inscribirAlumnoEnAsignatura(asignaturaId, alumnoId);
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
    }
  }
  // Obtiene las clases de una asignatura específica
  async obtenerAsistenciaPorAsignatura(asignaturaId: string): Promise<Clase[]> {
    const clases = await this.firestore.collection<Clase>('clases', ref => ref.where('asignaturaId', '==', asignaturaId)).valueChanges().toPromise();
    return clases ?? [];
  }

}
