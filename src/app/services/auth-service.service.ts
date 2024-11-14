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
    private storage: Storage 
  ) {
    this.initStorage();
  }

  // Inicializar el almacenamiento
  private async initStorage() {
    await this.storage.create(); 
  }

  async verificarRutExistente(rut: string): Promise<boolean> {
    const usuarioDoc = await this.firestore.collection('usuarios').doc(rut).get().toPromise();
    return usuarioDoc ? usuarioDoc.exists : false;  // Devuelve true si el RUT ya está en la base de datos
  }

  async verificarCorreoExistente(correo: string): Promise<boolean> {
    try {
      const snapshot = await this.firestore.collection('usuarios', ref => ref.where('correo', '==', correo)).get().toPromise();
      return snapshot && !snapshot.empty ? true : false;  // Si el correo está vacío, no existe, si no está vacío, ya está registrado.
    } catch (error) {
      console.error('Error al verificar el correo:', error);
      return false;
    }
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

  async login(correo: string, contrasena: string, rut: string): Promise<Usuario | null> {
    if (!correo || !contrasena || !rut) {
      throw new Error('Correo, contraseña o rut vacíos');
    }
  
    try {
      const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
      const user = credenciales.user;
  
      if (user) {
        const usuarioDoc = await this.firestore.collection('usuarios').doc(rut).get().toPromise();
  
        if (usuarioDoc && usuarioDoc.exists) {
          const usuario = usuarioDoc.data() as Usuario;
  
          if (usuario.correo === correo) {
            // Guardar los datos del usuario en el Storage
            await this.storage.set('usuario', usuario);  // Guardar el usuario en el almacenamiento local
            return usuario;
          } else {
            throw new Error('El correo y el RUT no coinciden');
          }
        } else {
          throw new Error('Usuario no encontrado');
        }
      }
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      throw new Error('Credenciales incorrectas');
    }
    return null;
  }
  
  // Obtener datos del usuario autenticado
  getUsuarioActual(rut: string): Observable<Usuario | null> {
    return this.firestore.collection('usuarios').doc(rut).snapshotChanges().pipe(
      map(snapshot => {
        if (snapshot.payload.exists) {
          return snapshot.payload.data() as Usuario;
        }
        return null;
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
  

  async logout() {
    await this.afAuth.signOut();
    await this.storage.remove('usuario');  // Eliminar el usuario almacenado
    this.router.navigate(['/login']); // Redirigir al login
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user !== null;  // Si hay un usuario, está autenticado
  }
}
