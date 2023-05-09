import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface SnakeCanvasProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  foodCount: number;
  initialCount: number;
  setFoodCount: (prev: any) => void;
}
