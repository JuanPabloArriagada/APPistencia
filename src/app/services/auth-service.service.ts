import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../interfaces/usuario';
import { Storage } from '@ionic/storage-angular';  // Importar Storage

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private storage: Storage // Inyectar Storage
  ) {}

  // Registro con Email y Password
  async registro(usuario: Usuario) {
    const { correo, contrasena, rut, ...resto } = usuario;
    const credenciales = await this.afAuth.createUserWithEmailAndPassword(correo, contrasena);
    if (credenciales.user) {
      await this.firestore.collection('usuarios').doc(credenciales.user.uid).set({
        rut,
        correo,
        ...resto,
      });
    }
  }

  // Iniciar sesión
  async login(correo: string, contrasena: string) {
    const credenciales = await this.afAuth.signInWithEmailAndPassword(correo, contrasena);
    const user = credenciales.user;
    if (user) {
      // Obtener RUT desde Firestore
      const docRef = await this.firestore.collection('usuarios').doc(user.uid).ref.get();
      if (docRef.exists) {
        const data = docRef.data() as Usuario;

        // Guardar la información del usuario en el almacenamiento local
        await this.storage.set('usuario', data);
        this.router.navigate(['/menu', { rut: data.rut }]);
      }
    }
  }

  // Obtener datos del usuario autenticado
  async getUsuarioActual() {
    const storedUser = await this.storage.get('usuario');
    if (storedUser) {
      return storedUser; // Devolver los datos del usuario desde el almacenamiento local
    }
    return null;
  }

  // Cerrar sesión
  async logout() {
    await this.afAuth.signOut();
    await this.storage.remove('usuario'); // Eliminar el usuario almacenado al cerrar sesión
    this.router.navigate(['/login']); // Redirigir al login
  }
}
