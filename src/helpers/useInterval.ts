import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number) {
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (callbackRef.current != undefined) callbackRef.current();
    }, delay);
    return () => clearInterval(interval);
  }, [delay]);
}
