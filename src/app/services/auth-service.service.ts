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
      await this.firestore.collection('usuarios').doc(rut).set({
        rut,
        correo,
        ...resto,
      });
    }
  }

  async login(correo: string, contrasena: string, rut: string): Promise<Usuario | null> {
    try {
      const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
      const user = credenciales.user;

      if (user) {
        const usuarioDoc = await this.firestore.collection('usuarios').doc(rut).get().toPromise();
        if (usuarioDoc && usuarioDoc.exists) {
          const usuario = usuarioDoc.data() as Usuario;
          if (usuario.correo === correo) {
            // Almacenar datos localmente para el uso offline
            await this.guardarUsuarioOffline(usuario);
            return usuario;
          } else {
            throw new Error('El correo y el RUT no coinciden.');
          }
        } else {
          throw new Error('Usuario no encontrado.');
        }
      }
    } catch (error) {
      throw new Error('Error en la autenticación online.');
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
    this.router.navigate(['/login']); 
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user !== null;  // Si hay un usuario, está autenticado
  }

  async guardarUsuarioOffline(usuario: Usuario): Promise<void> {
    await this.storage.set(`usuario_${usuario.rut}`, usuario);
    console.log(`Usuario ${usuario.rut} almacenado localmente.`);
  }

  async getUsuarioActualOffline(rut: string): Promise<Usuario | null> {
    return await this.storage.get(`usuario_${rut}`) || null;
  }

}
