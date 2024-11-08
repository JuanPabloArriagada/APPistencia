import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../interfaces/usuario';
import { Storage } from '@ionic/storage-angular';  // Importar Storage
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private storage: Storage // Inyectar Storage
  ) {
    this.initStorage(); // Inicializar el almacenamiento en el constructor
  }

  // Inicializar el almacenamiento
  private async initStorage() {
    await this.storage.create(); // Asegurarse de que la base de datos del almacenamiento esté creada
  }

  // Registro con Email y Password
  async registro(usuario: Usuario) {
    const { correo, contrasena, rut, ...resto } = usuario;
  
    // Crear el usuario en Firebase Auth (para tener correo y contraseña)
    const credenciales = await this.afAuth.createUserWithEmailAndPassword(correo, contrasena);
    
    if (credenciales.user) {
      // Guardar la información en Firestore usando rut como ID del documento
      await this.firestore.collection('usuarios').doc(rut).set({
        rut,
        correo,
        ...resto,
      });
    }
  }

  // Iniciar sesión
  async login(correo: string, contrasena: string) {
    if (!correo || !contrasena) {
      throw new Error('Correo o contraseña vacíos');
    }
  
    try {
      const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
      const user = credenciales.user;
      if (user) {
        const usuariosRef = this.firestore.collection('usuarios');
        const querySnapshot = await usuariosRef.ref.where('correo', '==', correo).get();
  
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as Usuario;
          this.router.navigate(['/menu', { rut: data.rut }]);
        } else {
          throw new Error('Usuario no encontrado');
        }
      }
    } catch (error) {
      console.error('Credenciales incorrectas', error);
      throw new Error('Error de autenticación');
    }
  }
  
  // Obtener datos del usuario autenticado
  getUsuarioActual(rut: string): Observable<Usuario | null> {
    const docRef = this.firestore.collection('usuarios').doc(rut);

    // Devuelve un Observable que puedes suscribir
    return docRef.get().pipe(
      map(docSnapshot => {
        if (docSnapshot.exists) {
          return docSnapshot.data() as Usuario;
        }
        return null; // Si no existe el documento
      })
    );
  }
  
  async actualizarUsuario(rut: string, datosActualizados: Partial<Usuario>) {
    try {
      await this.firestore.collection('usuarios').doc(rut).update(datosActualizados);
      console.log('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error('Error al actualizar el perfil');
    }
  }
  

  // Cerrar sesión
  async logout() {
    await this.afAuth.signOut();
    await this.storage.remove('usuario'); // Eliminar el usuario almacenado al cerrar sesión
    this.router.navigate(['/login']); // Redirigir al login
  }
}
