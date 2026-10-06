import "server-only";
import { inflateSync } from "node:zlib";

export type RGB = [number, number, number];

const CLOUDINARY_TRANSFORM = /\/image\/upload\/[^/]+\/(v\d+\/)/;

/**
 * Cor do fundo de uma foto: pede ao Cloudinary o canto superior esquerdo reduzido a 1 pixel PNG
 * e lê esse pixel. Só funciona para imagens do Cloudinary; nas outras devolve null.
 */
export async function sampleBackground(url: string): Promise<RGB | null> {
  if (!CLOUDINARY_TRANSFORM.test(url)) return null;
  const pixelUrl = url.replace(CLOUDINARY_TRANSFORM, "/image/upload/c_crop,g_north_west,w_0.12,h_0.12/c_scale,w_1,h_1/f_png/$1");
  try {
    const res = await fetch(pixelUrl, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!res.ok) return null;
    return readSinglePixelPng(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

/** Decodifica o único pixel de um PNG 1×1 (tons de cinza, RGB, RGBA ou paleta). */
function readSinglePixelPng(png: Buffer): RGB | null {
  let pos = 8;
  let depth = 8;
  let colorType = 2;
  let palette: Buffer | null = null;
  const idat: Buffer[] = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      depth = data[8];
      colorType = data[9];
    } else if (type === "PLTE") palette = data;
    else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)); // [filtro, ...pixel]
  const px = raw.subarray(1);
  if (depth !== 8 && colorType !== 3) return null;
  switch (colorType) {
    case 0:
      return [px[0], px[0], px[0]];
    case 2:
    case 6:
      return [px[0], px[1], px[2]];
    case 3: {
      if (!palette) return null;
      const index = px[0] >> (8 - depth);
      return [palette[index * 3], palette[index * 3 + 1], palette[index * 3 + 2]];
    }
    default:
      return null;
  }
}

function luminance([r, g, b]: RGB) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const INK_LUMINANCE = luminance([43, 15, 31]); // --color-ink

/** true quando texto escuro contrasta melhor que texto branco sobre essa cor. */
export function prefersDarkText(bg: RGB) {
  const l = luminance(bg);
  const withInk = (l + 0.05) / (INK_LUMINANCE + 0.05);
  const withWhite = 1.05 / (l + 0.05);
  return withInk >= withWhite;
}

export const toHex = (rgb: RGB) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
