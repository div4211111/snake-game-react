import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useState } from "react";

export const useSize = (target: any) => {
  const [size, setSize] = useState<DOMRectReadOnly>();

  useEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};
