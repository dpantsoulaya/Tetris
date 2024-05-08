import { FigureType } from "./figureType";
import { Point } from "./point";

export type Block = {
  points: Point[];
  figureType?: FigureType;
};
