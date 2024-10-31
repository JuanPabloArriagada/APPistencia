import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Clase } from '../interfaces/asignatura';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(private firestore: AngularFirestore) {}

  guardarAsistencia(clase: Clase) {
    return this.firestore.collection('clases').doc(clase.id).set(clase);
  }

  obtenerClase(claseId: string): Observable<Clase | undefined> {
    return this.firestore.collection('clases').doc<Clase>(claseId).valueChanges();
  }

  async actualizarAsistencia(claseId: string, asistentes: string[], inasistentes: string[]) {
    await this.firestore.collection('clases').doc(claseId).update({ asistentes, inasistentes });
  }
}
