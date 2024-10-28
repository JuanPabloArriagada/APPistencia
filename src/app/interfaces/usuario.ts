export interface Usuario {
    rut: string,
    Nombre: string,
    correo:string,
    rol:string,
    foto:string,
    contrasena:any
    asignaturasInscritas?: string[];  // IDs de asignaturas inscritas (para alumnos)
    asignaturasCreadas?: string[];    // IDs de asignaturas creadas (para profesores)
}
