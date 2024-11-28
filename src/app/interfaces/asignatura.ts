export interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
  codigoSala: string;
  asignaturaId: string;
}

  
export interface Asignatura {
  id: string;
  nombre: string;
  profesorId: string;   
  horarios: Horario[];
  inscritos: string[];
  clases: Clase[];
  porcentajeAsistencia: number;
}

export interface Clase {
  id: string;
  asignaturaId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  codigoSala: string;
  asistentes: string[]; // Lista de alumnos presentes
  inasistentes: string[]; // Lista de alumnos ausentes
  fecha: string;
  mostrarDetalles?: boolean;
  offlineAsistencias?: {
    alumnoId: string;
    estado: 'presente' | 'ausente' | 'tarde';
  }[]; // Asistencias almacenadas localmente
}
export interface AsistenciaAsignatura extends Asignatura {
  cantAsistencias: number;
  cantInasistencias: number;
}