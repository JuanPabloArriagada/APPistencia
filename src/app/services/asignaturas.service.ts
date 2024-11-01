import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Asignatura, Clase } from '../interfaces/asignatura';
import { v4 as uuidv4 } from 'uuid';
import { arrayUnion } from 'firebase/firestore'; // Importa arrayUnion
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  constructor(private firestore: AngularFirestore) {}

  async obtenerAsignaturas(): Promise<Asignatura[]> {
    const asignaturasSnapshot = await this.firestore.collection('asignaturas').get().toPromise();
    
    if (!asignaturasSnapshot || asignaturasSnapshot.empty) {
      return []; // Retorna un array vacío si no hay documentos
    }

    return asignaturasSnapshot.docs.map(doc => {
      const data = doc.data() as Asignatura;
      return { ...data, id: doc.id }; // Cambié el orden
    });
  }

  async guardarAsignatura(asignatura: Asignatura): Promise<void> {
    const asignaturaRef = this.firestore.collection('asignaturas').doc(asignatura.id);
    await asignaturaRef.set(asignatura); // Guardar o crear la asignatura
  }

  async obtenerAsignaturasPorUsuario(usuarioId: string): Promise<Asignatura[]> {
    const asignaturas = await this.obtenerAsignaturas();
    return asignaturas.filter(asignatura => asignatura.profesorId === usuarioId);
  }

  async agregarClaseaHorario(asignaturaId: string, clase: Clase): Promise<Clase | null> {
    const asignaturaRef = this.firestore.collection('asignaturas').doc(asignaturaId);

    clase.id = uuidv4();

    await asignaturaRef.update({
      horarios: arrayUnion(clase) // Usa arrayUnion de Firebase
    });
    
    return clase;
  }

  async obtenerAsignaturaPorId(asignaturaId: string): Promise<Asignatura | undefined> {
    try {
      const doc = await this.firestore.collection('asignaturas').doc(asignaturaId).get().toPromise();
      if (doc && doc.exists) {
        return doc.data() as Asignatura;
      } else {
        console.error(`El documento con ID ${asignaturaId} no existe en la colección 'asignaturas'.`);
        return undefined;
      }
    } catch (error) {
      console.error(`Error al obtener la asignatura ${asignaturaId}:`, error);
      return undefined;
    }
  }

  async actualizarAsignatura(asignaturaId: string, asignatura: Asignatura) {
    try {
      await this.firestore.collection('asignaturas').doc(asignaturaId).update(asignatura);
      console.log(`Asignatura ${asignaturaId} actualizada en Firestore con nuevos inscritos.`);
    } catch (error) {
      console.error(`Error al actualizar la asignatura ${asignaturaId} en Firestore:`, error);
    }
  }
  

  async inscribirAlumnoEnAsignatura(asignaturaId: string, alumnoId: string) {
    try {
      const asignatura = await this.obtenerAsignaturaPorId(asignaturaId);
      if (!asignatura) {
        console.error(`Asignatura con ID ${asignaturaId} no encontrada para el alumno ${alumnoId}`);
        return;
      }
  
      // Comprobar si el alumno ya está inscrito (opcional, si quieres evitar duplicados)
      if (asignatura.inscritos.includes(alumnoId)) {
        console.log(`El alumno ${alumnoId} ya está inscrito en la asignatura ${asignaturaId}`);
      } else {
        // Añadir el alumno a los inscritos y actualizar en Firestore
        asignatura.inscritos = [...(asignatura.inscritos || []), alumnoId];
        await this.actualizarAsignatura(asignaturaId, asignatura);
      }
    } catch (error) {
      console.error(`Error al inscribir al alumno ${alumnoId} en la asignatura ${asignaturaId}:`, error);
    }
  } 


  obtenerAsignaturaEnTiempoReal(asignaturaId: string): Observable<Asignatura> {
    return this.firestore.collection('asignaturas').doc<Asignatura>(asignaturaId).snapshotChanges().pipe(
      map((doc) => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        return { id, ...data } as Asignatura;
      })
    );
  }
}
