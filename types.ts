export enum Location {
  HOME = 'Casa',
  OFFICE = 'Empresa',
  OTHER = 'Otro'
}

export enum Status {
  PENDING = 'Pendiente',
  PAID = 'Pagado'
}

export interface WorkDay {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  location: Location;
  status: Status;
  rate: number;
  notes?: string;
  createdAt: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export type FilterType = 'range' | 'month';