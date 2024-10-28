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
  profesorId: string;   //para vincular el profesor con la asignatura, esto lo veremos cuando este subido el login
  horarios: Horario[];
  inscritos: string[];
}

export interface Clase {
  id: string;
  asignaturaId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  codigoSala: string;
  asistentes: string[];
  inasistentes: string[];
}