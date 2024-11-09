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
  async login(correo: string, contrasena: string, rut: string) {  // Añadir rut como parámetro
    if (!correo || !contrasena || !rut) {  // Verificar que el rut esté presente
      throw new Error('Correo, contraseña o rut vacíos');
    }
  
    try {
      const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
      const user = credenciales.user;
  
      if (user) {
        // Ahora usamos el `rut` directamente como el ID de documento
        const usuarioDoc = await this.firestore.collection('usuarios').doc(rut).get().toPromise();
        
        if (usuarioDoc && usuarioDoc.exists) {
          // Si encontramos el usuario, navega a MenuPage con el rut
          this.router.navigate(['/menu', { rut }]);
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
  

  // Cerrar sesión
  async logout() {
    await this.afAuth.signOut();
    await this.storage.remove('usuario'); // Eliminar el usuario almacenado al cerrar sesión
    this.router.navigate(['/login']); // Redirigir al login
  }
}
