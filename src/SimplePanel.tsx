import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { PanelProps, dateTime } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions } from 'types';
import { processData, emptyData } from './dataUtils';
import { useScriptEvaluation } from './useScriptEvaluation';
import { useChartConfig } from './useChartConfig';
import { PlotlyChart } from './PlotlyChart';
import { MultiGraphPanel } from './MultiGraphPanel';
import { ErrorDisplay } from './ErrorDisplay';
import { useTheme2 } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {
  onChangeTimeRange: (timeRange: { from: number; to: number }) => void;
}

export const SimplePanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
  timeZone,
  replaceVariables,
  title,
  onChangeTimeRange,
}) => {
  const plotRef = useRef<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const { evaluateScript, error: scriptError } = useScriptEvaluation();

  const processedData = useMemo(() => {
    try {
      return processData(data, timeZone, options.timeCol);
    } catch (e: any) {
      setError(e);
      return null;
    }
  }, [data, timeZone, options.timeCol]);

  const scriptVars = useMemo(() => {
    if (!processedData) {
      return null;
    }

    const templateSrv = getTemplateSrv();
    const dashboardVariables = templateSrv.getVariables().reduce((acc, v) => ({ ...acc, [v.name]: v }), {});

    const nativeVariables = {
      __from: data.timeRange.from.valueOf(),
      __to: data.timeRange.to.valueOf(),
      __interval: data.request?.interval,
      __interval_ms: data.request?.intervalMs,
      __timezone: timeZone,
      __timeFilter: (field: string) => {
        return templateSrv.replace(`$__timeFilter(${field})`, data.request?.scopedVars);
      },
      __dashboard: {
        uid: data.request?.dashboardUID,
        // Add other dashboard properties as needed
      },
    };

    const mergedVariables = { ...dashboardVariables, ...nativeVariables };

    return {
      data: processedData,
      variables: mergedVariables,
      options,
      utils: {
        timeZone,
        dayjs: require('dayjs'),
        matchTimezone: require('./dataUtils').matchTimezone,
        locationService,
        getTemplateSrv,
        replaceVariables: (variableName: string) => templateSrv.replace(variableName, data.request?.scopedVars),
      },
    };
  }, [processedData, options, timeZone, data.timeRange, data.request]);

  const evaluatedScript = useMemo(() => {
    if (!scriptVars) {
      return null;
    }
    try {
      const result = evaluateScript(options.script, scriptVars);
      // DEBUG: Log evaluated script result
      console.log('📋 evaluatedScript result:', result);
      return result;
    } catch (e: any) {
      // Don't set the error state here, let the scriptError from useScriptEvaluation handle it
      console.error('❌ evaluateScript error:', e);
      return null;
    }
  }, [options.script, scriptVars, evaluateScript]);

  const theme = useTheme2();
  
  // Check if using multi-graph mode from evaluatedScript
  const isMultiGraphMode = evaluatedScript?.graphs && evaluatedScript.graphs.length > 0;
  
  // Extract grid config from evaluatedScript
  const gridConfig = evaluatedScript?.gridConfig;
  const gridCols = gridConfig?.cols || options.gridCols || 1;
  const columnWidths = gridConfig?.widths;
  
  // DEBUG: Log multi-graph detection
  if (evaluatedScript) {
    console.log('🔍 SimplePanel Debug:', {
      evaluatedScript,
      hasGraphs: !!evaluatedScript?.graphs,
      graphsLength: evaluatedScript?.graphs?.length,
      isMultiGraphMode,
      gridConfig,
    });
  }
  
  // For multi-graph mode, process each graph
  const multiGraphCharts = useMemo(() => {
    if (!isMultiGraphMode || !scriptVars || !evaluatedScript?.graphs) {
      return null;
    }
    
    const cols = Math.max(1, Math.min(gridCols, evaluatedScript.graphs.length));
    const rows = Math.ceil(evaluatedScript.graphs.length / cols);
    const chartWidth = width / cols;
    const chartHeight = height / rows;

    const processedCharts = evaluatedScript.graphs.map((graph: any) => {
      // Evaluate script specific to this graph if it has one
      let graphLayout = graph.layout || {};
      let graphData = graph.data || [];
      let graphConfig = graph.config || {};
      let graphFrames = graph.frames || [];

      if (graph.script) {
        try {
          const result = evaluateScript(graph.script, scriptVars);
          if (result) {
            graphData = result.data || graphData;
            graphLayout = result.layout || graphLayout;
            graphConfig = result.config || graphConfig;
            graphFrames = result.frames || graphFrames;
          }
        } catch (e: any) {
          console.error(`Error evaluating script for graph ${graph.id}:`, e);
        }
      }

      return {
        id: graph.id,
        title: graph.title,
        data: graphData,
        layout: graphLayout,
        config: graphConfig,
        frames: graphFrames,
        width: chartWidth,
        height: chartHeight,
      };
    });

    // DEBUG: Log processed charts
    console.log('📊 MultiGraphCharts processed:', {
      count: processedCharts.length,
      cols,
      rows,
      columnWidths,
      charts: processedCharts.map((c: any) => ({
        id: c.id,
        title: c.title,
        dataLength: c.data?.length,
        hasLayout: !!c.layout,
      })),
    });

    return processedCharts;
  }, [isMultiGraphMode, evaluatedScript, gridCols, width, height, scriptVars, evaluateScript, columnWidths]);

  // For single graph mode, use the existing logic
  // Only pass evaluatedScript to useChartConfig if NOT in multi-graph mode
  const chartConfig = !isMultiGraphMode
    ? useChartConfig(
        options,
        isMultiGraphMode ? null : evaluatedScript,
        replaceVariables,
        width,
        height,
        theme,
        data
      )
    : null;

  useEffect(() => {
    // Clear errors when options or data change, but not scriptError
    setError(null);
  }, [options, data]);

  const handleEvent = useCallback(
    (event: { type: 'click' | 'select' | 'zoom'; data: any; graphId?: string }) => {
      if (options.onclick && scriptVars) {
        const eventContext = {
          ...scriptVars,
          event,
        };
        try {
          evaluateScript(options.onclick, eventContext);
        } catch (e: any) {
          setError(e);
        }
      }

      if (
        options.syncTimeRange &&
        event.type === 'zoom' &&
        event.data['xaxis.range[0]'] &&
        event.data['xaxis.range[1]']
      ) {
        const from = dateTime(event.data['xaxis.range[0]']);
        const to = dateTime(event.data['xaxis.range[1]']);
        onChangeTimeRange({
          from: from.valueOf(),
          to: to.valueOf(),
        });
      }
    },
    [options.onclick, options.syncTimeRange, scriptVars, evaluateScript, onChangeTimeRange]
  );

  if (scriptError) {
    return (
      <ErrorDisplay
        message={{
          message: scriptError.message,
          lineNumber: scriptError.lineNumber,
          line: scriptError.line,
        }}
        title="Script Evaluation Error"
      />
    );
  }

  if (error) {
    return <ErrorDisplay message={error.message} title="Error" />;
  }

  // Multi-graph mode rendering
  if (isMultiGraphMode) {
    console.log('🎨 Rendering MultiGraphPanel with:', {
      multiGraphChartsLength: multiGraphCharts?.length,
      gridCols,
      columnWidths,
    });
    
    if (!multiGraphCharts || multiGraphCharts.length === 0) {
      return <ErrorDisplay message="No graphs configured" title="Error" />;
    }

    return (
      <MultiGraphPanel
        charts={multiGraphCharts}
        gridCols={gridCols}
        columnWidths={columnWidths}
        totalWidth={width}
        totalHeight={height}
        onEvent={handleEvent}
        replaceVariables={replaceVariables}
      />
    );
  }

  // Single graph mode rendering (original behavior)
  if (!chartConfig) {
    return <ErrorDisplay message="No chart configuration available" title="Data Error" isNoData={true} />;
  }

  const { isEmpty, message } = emptyData(chartConfig.data);

  if (isEmpty) {
    return <ErrorDisplay message={message} title="Data Error" isNoData={true} />;
  }

  return (
    <PlotlyChart
      ref={plotRef}
      data={chartConfig.data}
      layout={chartConfig.layout}
      config={chartConfig.config}
      frames={chartConfig.frames}
      width={width}
      height={height}
      onEvent={handleEvent}
      title={title}
      replaceVariables={replaceVariables}
    />
  );
};
