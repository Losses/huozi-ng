import type { LayoutOptions } from './types';

export const DIANHAO = `。，、．：；！‼？⁇`;
export const BIAOHAO = `「」『』“”‘’（）【】〖〗〔〕［］｛｝⸺—…●•–～~～～·﹏《》〈〉＿/／`;
export const BIAODIAN = `${BIAOHAO}${DIANHAO} `;
export const BIAODIANVALIDATEND = `。，、．：；！‼？⁇」』”’）】〗〕］｝》〉 `;
export const BIAODIANVALIDATSTART = `「『“‘（【〖〔［｛《〈 `;
export const INCOMPRESSIBLE = '‼⁇⸺—';

export const DEFAULT_OPTIONS: LayoutOptions = {
  fontFamily: '"PingFang SC", "Microsoft YaHei", "Source Han Sans SC", sans-serif',
  gridSize: 26,
  column: 25,
  xInterval: 0,
  yInterval: 12,
  letterSpacing: 0,
  inlineCompression: true,
  forceGridAlignment: true,
  westernCharacterFirst: false,
  forceSpaceBetweenCJKAndWestern: false,
  fixLeftQuote: true,
  enablePagination: false,
  pageWidth: 800,
  pageHeight: 1000,
  layoutColumnCount: 1,
  layoutColumnGap: 40,
  padding: 60,
  row: Infinity // Default to infinite rows if not specified
};
