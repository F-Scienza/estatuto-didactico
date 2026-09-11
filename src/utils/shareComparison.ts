const SITE_URL = "https://estatutocab.netlify.app/";

interface ShareComparisonInput {
  title: string;
  currentLabel: string;
  currentText: string;
  proposalLabel: string;
  proposalText: string;
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }

    if (line) lines.push(line);
  }

  return lines;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen."));
    }, "image/png");
  });
}

export async function createComparisonImage({
  title,
  currentLabel,
  currentText,
  proposalLabel,
  proposalText,
}: ShareComparisonInput): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("El navegador no permite generar la imagen.");

  const padding = 72;
  const contentWidth = canvas.width - padding * 2;
  const cardGap = 28;
  const cardHeight = 410;
  const cardPadding = 40;

  context.fillStyle = "#0f1724";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#6cace4";
  context.font = "800 34px Manrope, Arial, sans-serif";
  context.fillText("GUÍA DE LA REFORMA", padding, 92);

  context.fillStyle = "#e8edf4";
  context.font = "700 58px Manrope, Arial, sans-serif";
  const titleLines = wrapText(context, title, contentWidth);
  titleLines.slice(0, 2).forEach((line, index) => {
    context.fillText(line, padding, 178 + index * 68);
  });

  const cardsTop = titleLines.length > 1 ? 310 : 255;

  const drawCard = (
    y: number,
    label: string,
    body: string,
    accent: boolean,
  ) => {
    context.fillStyle = accent ? "#15263a" : "#1a2536";
    context.strokeStyle = accent ? "#4179a8" : "#2d3b50";
    context.lineWidth = 2;
    roundedRect(context, padding, y, contentWidth, cardHeight, 24);
    context.fill();
    context.stroke();

    context.fillStyle = accent ? "#6cace4" : "#94a3b8";
    context.font = "800 25px Manrope, Arial, sans-serif";
    context.fillText(label.toUpperCase(), padding + cardPadding, y + 58);

    let fontSize = 38;
    let lines: string[] = [];
    do {
      context.font = `400 ${fontSize}px Manrope, Arial, sans-serif`;
      lines = wrapText(context, body, contentWidth - cardPadding * 2);
      fontSize -= 2;
    } while (lines.length * (fontSize + 17) > cardHeight - 125 && fontSize > 25);

    const lineHeight = fontSize + 17;
    context.fillStyle = "#e8edf4";
    context.font = `400 ${fontSize}px Manrope, Arial, sans-serif`;
    lines.forEach((line, index) => {
      context.fillText(line, padding + cardPadding, y + 120 + index * lineHeight);
    });
  };

  drawCard(cardsTop, currentLabel, currentText, false);
  drawCard(cardsTop + cardHeight + cardGap, proposalLabel, proposalText, true);

  context.strokeStyle = "#2d3b50";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(padding, 1246);
  context.lineTo(canvas.width - padding, 1246);
  context.stroke();

  context.fillStyle = "#94a3b8";
  context.font = "500 26px Manrope, Arial, sans-serif";
  context.fillText("Conocé todos los puntos en", padding, 1300);
  context.fillStyle = "#6cace4";
  context.font = "700 26px Manrope, Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(SITE_URL.replace(/^https?:\/\//, ""), canvas.width - padding, 1300);

  const blob = await canvasToBlob(canvas);
  return new File([blob], "comparacion-estatuto-cab.png", { type: "image/png" });
}

export async function shareComparison(input: ShareComparisonInput): Promise<"shared" | "downloaded"> {
  const file = await createComparisonImage(input);
  const shareData: ShareData = {
    title: input.title,
    text: `${input.title} — Comparación del estatuto del CAB`,
    url: SITE_URL,
    files: [file],
  };

  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share(shareData);
    return "shared";
  }

  const downloadUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
  return "downloaded";
}
