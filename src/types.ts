/** Unique identifiers for navigation. */
export type ViewId = "home" | string;

/** JSON source types for type-safe import. */
export interface ReformaVigente {
  resumen: string | null;
  procedencia: string;
  verificadoConTextoVigenteCompleto: boolean;
}

export interface ReformaPropuesta {
  resumen: string;
  procedencia: string;
}

export interface ReformaTexto {
  texto: string;
  naturaleza: string;
}

export interface ReformaObjetivo {
  texto: string | null;
  naturaleza: string;
  esBeneficioGarantizado: boolean;
}

export interface ReformaFuente {
  documentoId: string;
  articulos?: (number | string)[];
  paginas?: number[];
  articulosVigentesMencionados?: (number | string)[];
}

export interface ReformaAclaracionRevision {
  diferencia: string;
  criterio: string;
  fundamento: string;
}

export interface ReformaCambio {
  id: string;
  titulo: string;
  estatutoVigente: ReformaVigente;
  propuesta: ReformaPropuesta;
  queCambia: ReformaTexto;
  queBuscaElClub: ReformaObjetivo;
  detalles: string[];
  notasRevision: string[];
  aclaracionRevision?: ReformaAclaracionRevision;
  fuentes: ReformaFuente[];
  estadoRevision: string;
  requiereRevisionHumanaAntesDePublicar: boolean;
}

export interface ReformaSubtema {
  id: string;
  titulo: string;
  cambios: string[];
}

export interface ReformaTema {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  subtemas: ReformaSubtema[];
}

export interface ReformaIntegracion {
  etiquetaVigente: string;
  etiquetaPropuesta: string;
  etiquetaObjetivo: string;
  nullSignifica: string;
}

export interface ReformaData {
  schemaVersion: string;
  integracion: ReformaIntegracion;
  temas: ReformaTema[];
  cambios: ReformaCambio[];
}

/* ── Internal view types ─────────────────────────────────────── */

export interface TopicSummary {
  id: string;
  number: number;
  title: string;
  phrase: string;
  icon: string;
}

export interface ChangeItem {
  id: string;
  subtitle: string;
  slug: string;
  currentStatute: string;
  proposal: string;
  whatChanges: string;
  clubGoal: string | null;
  details: string[];
  reviewNotes: string[];
  reviewClarification?: ReformaAclaracionRevision;
  sources: ReformaFuente[];
  estadoRevision: string;
  requiresHumanReview: boolean;
}

export interface TopicDetail {
  id: string;
  title: string;
  changes: ChangeItem[];
}

export interface ContentData {
  topics: TopicSummary[];
  details: Record<string, TopicDetail>;
  integration: ReformaIntegracion;
}
