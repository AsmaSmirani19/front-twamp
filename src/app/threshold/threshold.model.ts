export interface Threshold {
  id?: number;
  name: string;
  creation_date: string;

  // Valeurs des seuils
  avg: number;       
  min: number;       
  max: number;       

  // Statuts d’activation
  avg_status: boolean;
  min_status: boolean;
  max_status: boolean;

  // Opérateurs (>, <, etc.)
  avg_opr: string;
  min_opr: string;
  max_opr: string;

  // Listes utilisées pour l'affichage (pas  utiles côté backend)
  active_threshold?: string[];
  disabled_threshold?: string[];
}
