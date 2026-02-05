import { useState, useCallback } from 'react';

export const useScriptEvaluation = () => {
  const [error, setError] = useState<{ message: string; lineNumber: number | string; line: string } | null>(null);

  const evaluateScript = useCallback((script: string, context: any) => {
    try {
      const f = new Function(...Object.keys(context), script);
      const result = f(...Object.values(context));

      // Validate the result
      if (result && typeof result === 'object') {
        // Check for single-graph mode (data property)
        if ('data' in result) {
          if (!Array.isArray(result.data)) {
            throw new Error("The 'data' property must be an array");
          }
        }
        // Check for multi-graph mode (graphs property)
        if ('graphs' in result) {
          if (!Array.isArray(result.graphs)) {
            throw new Error("The 'graphs' property must be an array");
          }
          // Validate each graph
          result.graphs.forEach((graph: any, idx: number) => {
            if (!graph.id) throw new Error(`Graph ${idx} is missing 'id' property`);
            if (!graph.title) throw new Error(`Graph ${idx} is missing 'title' property`);
            if (!Array.isArray(graph.data)) throw new Error(`Graph ${idx} 'data' must be an array`);
          });
        }
        // Check for gridConfig (optional)
        if ('gridConfig' in result) {
          const gridConfig = result.gridConfig;
          if (gridConfig && typeof gridConfig === 'object') {
            if (!gridConfig.cols || typeof gridConfig.cols !== 'number' || gridConfig.cols < 1 || gridConfig.cols > 6) {
              throw new Error("gridConfig.cols must be a number between 1 and 6");
            }
            if (gridConfig.widths) {
              if (!Array.isArray(gridConfig.widths)) {
                throw new Error("gridConfig.widths must be an array of numbers");
              }
              gridConfig.widths.forEach((width: any, idx: number) => {
                if (typeof width !== 'number' || width <= 0) {
                  throw new Error(`gridConfig.widths[${idx}] must be a positive number`);
                }
              });
            }
          }
        }
      }

      setError(null); // Clear the error when successful
      return result;
    } catch (e: any) {
      let lineNumber: any = 'unknown';
      let line = '';

      const lines = script.split('\n');
      if (e.stack) {
        // Try to match line numbers for both Chrome and Firefox
        const match = e.stack.match(/:(\d+):\d+/);
        if (match) {
          lineNumber = parseInt(match[1], 10);
          // Adjust for the function wrapper
          lineNumber = Math.max(1, lineNumber - 2);
          line = lines[lineNumber - 1];
        }
      }

      setError({
        message: e.message,
        lineNumber,
        line: line,
      });
      return null;
    }
  }, []);

  return { evaluateScript, error, setError };
};
