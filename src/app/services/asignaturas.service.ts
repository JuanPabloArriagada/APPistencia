import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Asignatura, AsistenciaAsignatura, Clase } from '../interfaces/asignatura';
import { v4 as uuidv4 } from 'uuid';
import { arrayUnion } from 'firebase/firestore'; // Importa arrayUnion
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  constructor(private firestore: AngularFirestore) {}

  async obtenerAsignaturas(): Promise<Asignatura[]> {
    console.log('Intentando obtener todas las asignaturas...');
    try {
      const asignaturasSnapshot = await this.firestore.collection('asignaturas').get().toPromise();
      if (!asignaturasSnapshot || asignaturasSnapshot.empty) {
        console.log('No se encontraron documentos en la colección "asignaturas".');
        return [];
      }
      
      const asignaturas = asignaturasSnapshot.docs.map(doc => {
        const data = doc.data() as Asignatura;
        console.log(`Asignatura obtenida: ${JSON.stringify(data)}`);
        return { ...data, id: doc.id };
      });
      
      console.log('Asignaturas obtenidas:', asignaturas);
      return asignaturas;
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      return [];
    }
  }

  async guardarAsignatura(asignatura: Asignatura): Promise<void> {
    const asignaturaRef = this.firestore.collection('asignaturas').doc(asignatura.id);
    const docSnapshot = await asignaturaRef.get().toPromise();
    if (!docSnapshot || !docSnapshot.exists) {
      await asignaturaRef.set(asignatura); // Solo guarda si no existe
      console.log('Asignatura guardada correctamente');
    } else {
      console.log('La asignatura ya existe en la base de datos.');
    }
  }

  async obtenerAsignaturasPorUsuario(usuarioId: string): Promise<Asignatura[]> {
    console.log(`Obteniendo asignaturas para el usuario con ID: ${usuarioId}`);
    try {
      const asignaturas = await this.obtenerAsignaturas();
      console.log('Asignaturas obtenidas desde Firebase:', asignaturas);
      
      const asignaturasFiltradas = asignaturas.filter(asignatura => asignatura.profesorId === usuarioId);
      console.log(`Asignaturas filtradas para el usuario ${usuarioId}:`, asignaturasFiltradas);
      
      return asignaturasFiltradas;
    } catch (error) {
      console.error('Error al obtener asignaturas por usuario:', error);
      return [];
    }
  }

  async obtenerAsignaturasPorProfesor(rutProfesor: string): Promise<Asignatura[]> {
    console.log(`Obteniendo asignaturas para el profesor con rut: ${rutProfesor}`);
    try {
      const asignaturasRef = this.firestore.collection<Asignatura>('asignaturas', ref => ref.where('profesorId', '==', rutProfesor));
      const asignaturasSnapshot = await asignaturasRef.get().toPromise();

      if (!asignaturasSnapshot || asignaturasSnapshot.empty) {
        console.log('No se encontraron asignaturas para este profesor.');
        return [];
      }
      
      const asignaturas = asignaturasSnapshot.docs.map(doc => {
        const data = doc.data() as Asignatura;
        return { ...data, id: doc.id };
      });
      
      console.log(`Asignaturas obtenidas para el profesor ${rutProfesor}:`, asignaturas);
      return asignaturas;
    } catch (error) {
      console.error('Error al obtener asignaturas por profesor:', error);
      return [];
    } 
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
    // Primero intenta obtenerla de Firebase
    try {
      const doc = await this.firestore.collection('asignaturas').doc(asignaturaId).get().toPromise();
      if (doc && doc.exists) {
        const asignatura = doc.data() as Asignatura;
        // Guardar la asignatura en almacenamiento local
        localStorage.setItem(`asignatura-${asignaturaId}`, JSON.stringify(asignatura));
        return asignatura;
      } else {
        console.error(`El documento con ID ${asignaturaId} no existe en la colección 'asignaturas'.`);
        return undefined;
      }
    } catch (error) {
      console.error(`Error al obtener la asignatura ${asignaturaId}:`, error);
      // Si hay error, intentar cargar desde localStorage
      const asignatura = localStorage.getItem(`asignatura-${asignaturaId}`);
      if (asignatura) {
        return JSON.parse(asignatura);
      } else {
        return undefined;
      }
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
  
      if (asignatura.inscritos.includes(alumnoId)) {
        console.log(`El alumno ${alumnoId} ya está inscrito en la asignatura ${asignaturaId}`);
      } else {
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

  obtenerAsignaturasDelHorarioPorUsuario(usuarioRut: string): Promise<Asignatura[]> {
    return this.firestore
      .collection<Asignatura>('asignaturas', ref => ref.where('inscritos', 'array-contains', usuarioRut))
      .get()
      .toPromise()
      .then(querySnapshot => {
        const asignaturas: Asignatura[] = [];
        querySnapshot?.forEach(doc => {
          asignaturas.push(doc.data() as Asignatura);
        });
        console.log(`Asignaturas filtradas para el horario del usuario ${usuarioRut}:`, asignaturas);
        return asignaturas;
      });
  }
  
  async obtenerAsignaturasConAsistencias(rut: string): Promise<AsistenciaAsignatura[]> {
    try {
      const asignaturasRef = this.firestore.collection<Asignatura>('asignaturas', ref => ref.where('inscritos', 'array-contains', rut));
      const asignaturasSnapshot = await asignaturasRef.get().toPromise();
  
      if (!asignaturasSnapshot) {
        console.error('No se pudo obtener el snapshot de asignaturas.');
        return [];
      }
      const asignaturas = await Promise.all(asignaturasSnapshot.docs.map(async doc => {
        const asignatura = doc.data() as Asignatura;
        const clasesRef = this.firestore.collection<Clase>('clases', ref => ref.where('asignaturaId', '==', asignatura.id));
        const clasesSnapshot = await clasesRef.get().toPromise();
  
        let cantAsistencias = 0;
        let cantInasistencias = 0;
  
        clasesSnapshot?.forEach(claseDoc => {
          const clase = claseDoc.data() as Clase;
          if (clase.asistentes.includes(rut)) cantAsistencias++;
          if (clase.inasistentes.includes(rut)) cantInasistencias++;
        });
  
        return { ...asignatura, cantAsistencias, cantInasistencias } as AsistenciaAsignatura;
      }));
  
      return asignaturas;
    } catch (error) {
      console.error('Error al obtener asignaturas con asistencias:', error);
      return [];
    }
  }
  
  async obtenerClasesPorAsignatura(asignaturaId: string): Promise<Clase[]> {
    console.log('Obteniendo clases para la asignatura con ID:', asignaturaId); 
    const clasesSnapshot = await this.firestore.collection<Clase>('clases', ref => ref.where('asignaturaId', '==', asignaturaId)).get().toPromise();
    const clases = clasesSnapshot?.docs.map(doc => doc.data() as Clase) || [];
    console.log(`Clases obtenidas para la asignatura ${asignaturaId}:`, clases); 
    return clases;
  }

  sincronizarAsignaturas(asignaturas: Asignatura[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const asignaturasRef = this.firestore.collection('asignaturas');
      asignaturas.forEach(asignatura => {
        const asignaturaRef = asignaturasRef.doc(asignatura.id); // Usamos doc con el id de la asignatura
  
        asignaturaRef.get().toPromise().then(docSnapshot => {
          if (docSnapshot && docSnapshot.exists) {
            // Si la asignatura ya existe, la actualizamos
            asignaturaRef.update(asignatura).then(() => {
              console.log('Asignatura actualizada');
            }).catch(reject);
          } else {
            // Si no existe, la agregamos como nueva
            asignaturaRef.set(asignatura).then(() => {
              console.log('Asignatura sincronizada');
            }).catch(reject);
          }
        }).catch(reject);
      });
      resolve();
    });
  }

}

