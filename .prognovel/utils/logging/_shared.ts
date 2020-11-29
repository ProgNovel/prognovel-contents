import chalk from "chalk";

interface LogOptions {
  withBorders?: boolean;
  marginTop?: number;
  marginLeft?: number;
  marginBottom?: number;
  padding?: number;
  width?: number;
}

export class Log {
  marginTop: number = 1;
  marginBottom: number = 2;
  marginLeft: number = 4;
  padding: number = 2;
  width: number = 100;
  borderText: string;
  withBorders: boolean = false;

  constructor(opts?: LogOptions) {
    this.borderText = Array(this.width).fill("*").join("");
    if (opts?.withBorders) this.withBorders = opts.withBorders;
    if (opts?.marginTop) this.marginTop = opts.marginTop;
    if (opts?.marginBottom) this.marginBottom = opts.marginBottom;
    if (opts?.marginLeft) this.marginLeft = opts.marginLeft;
    if (opts?.padding) this.padding = opts.padding;
    if (opts?.width) this.width = opts.width;
  }

  createLine(text: string) {
    const length = text.length + this.padding * 2 + (this.withBorders ? 2 : 0);
    const getPadding = this.createWhitespace;
    const space = getPadding(this.width - length);
    const borders = this.withBorders ? c("*") : "";
    if (length <= this.width) {
      return `${borders + getPadding() + text + space + getPadding() + borders}`;
    } else {
      // TODO trim long texts
    }
  }

  createWhitespace(space?: number) {
    if (!space) space = Log.prototype.padding;
    if (space < 1) return "";
    return Array(space).fill(" ").join("");
  }

  show(texts: string[]) {
    const margin = this.createWhitespace(this.marginLeft);
    if (this.withBorders) console.log(margin + c(this.borderText));
    for (let i = 0; i < this.marginTop; i++) console.log(margin + c(this.createLine("")));
    texts.forEach((text) => console.log(margin + this.createLine(text)));
    for (let i = 0; i < this.marginBottom; i++) console.log(margin + c(this.createLine("")));
    if (this.withBorders) console.log(margin + c(this.borderText));
  }
}

function c(text: string) {
  return chalk.bold.yellowBright(text);
}
