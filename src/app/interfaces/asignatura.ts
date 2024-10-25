export interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
  codigoSala: string;
}

  
export interface Asignatura {
  id: string;
  nombre: string;
  profesorId: string;   //para vincular el profesor con la asignatura, esto lo veremos cuando este subido el login
  horarios: Horario[];
}

export interface Clase {
  id: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  codigoSala: string;
}