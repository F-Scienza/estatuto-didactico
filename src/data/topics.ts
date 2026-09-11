import type { ContentData, ReformaData, ReformaCambio, ChangeItem } from "../types";
import reformaJson from "./reforma-content.json";

const data = reformaJson as unknown as ReformaData;

const NULL_ABSENT = "No se identificó información suficiente en los documentos.";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatSource(f: ReformaCambio["fuentes"][number]): string {
  const parts: string[] = [];
  const docName = f.documentoId === "proyecto" ? "Proyecto" : "Anexo comparativo";
  if (f.articulos && f.articulos.length > 0) {
    parts.push(`Arts. ${f.articulos.join(", ")}`);
  }
  if (f.paginas && f.paginas.length > 0) {
    parts.push(`${docName}, pág. ${f.paginas.join(", ")}`);
  }
  if (!parts.length) {
    parts.push(docName);
  }
  return parts.join(" — ");
}

function formatSources(sources: ReformaCambio["fuentes"]): string {
  return sources.map(formatSource).join("\n");
}

function changeFromJson(c: ReformaCambio): ChangeItem {
  const vigente = c.estatutoVigente.resumen ?? NULL_ABSENT;
  return {
    id: c.id,
    subtitle: c.titulo,
    slug: slugify(c.titulo),
    currentStatute: vigente,
    proposal: c.propuesta.resumen,
    whatChanges: c.queCambia.texto,
    clubGoal: c.queBuscaElClub.texto,
    details: c.detalles,
    reviewNotes: c.notasRevision,
    reviewClarification: c.aclaracionRevision,
    sources: c.fuentes,
    estadoRevision: c.estadoRevision,
    requiresHumanReview: c.requiereRevisionHumanaAntesDePublicar,
  };
}

function buildTopicChanges(tema: ReformaTema): ChangeItem[] {
  const seen = new Set<string>();
  const changes: ChangeItem[] = [];
  for (const sub of tema.subtemas) {
    for (const changeId of sub.cambios) {
      if (seen.has(changeId)) continue;
      seen.add(changeId);
      const cambio = data.cambios.find((c) => c.id === changeId);
      if (cambio) {
        changes.push(changeFromJson(cambio));
      }
    }
  }
  return changes;
}

import type { ReformaTema } from "../types";

const ICONS: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
};

export const CONTENT: ContentData = {
  topics: data.temas
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((t) => ({
      id: t.id,
      number: t.orden,
      title: t.titulo,
      phrase: t.descripcion,
      icon: ICONS[t.orden] ?? String(t.orden),
    })),

  details: Object.fromEntries(
    data.temas
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((t) => [
        t.id,
        {
          id: t.id,
          title: t.titulo,
          changes: buildTopicChanges(t),
        },
      ]),
  ),

  integration: data.integracion,
};
