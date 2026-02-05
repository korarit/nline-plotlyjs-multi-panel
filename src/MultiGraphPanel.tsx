import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { PlotlyChart } from './PlotlyChart';
import { ScopedVars } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { calculateColumnWidths } from './dataUtils';

interface GraphChartConfig {
  id: string;
  title: string;
  data: any[];
  layout: Partial<any>;
  config: any;
  frames?: any[];
  width: number;
  height: number;
}

interface MultiGraphPanelProps {
  charts: GraphChartConfig[];
  gridCols: number;
  columnWidths?: number[];
  totalWidth: number;
  totalHeight: number;
  onEvent?: (event: { type: 'click' | 'select' | 'zoom'; data: any; graphId: string }) => void;
  replaceVariables: (value: string, scopedVars?: ScopedVars, format?: string | Function) => string;
}

export const MultiGraphPanel: React.FC<MultiGraphPanelProps> = ({
  charts,
  gridCols,
  columnWidths,
  totalWidth,
  totalHeight,
  onEvent,
  replaceVariables,
}) => {
  const theme = useTheme2();

  const { gridStyle, itemStyle, chartDimensions } = useMemo(() => {
    const cols = Math.max(1, Math.min(gridCols, charts.length));
    const rows = Math.ceil(charts.length / cols);
    
    // Calculate column widths using utility function
    const widths = calculateColumnWidths(cols, columnWidths);
    
    // Calculate pixel widths based on percentages
    const colPixelWidths = widths.map(w => (totalWidth * w) / 100);
    const itemHeight = totalHeight / rows;

    const gridTemplateColumns = widths.map(w => `${w}%`).join(' ');
    
    const gridStyle = css`
      display: grid;
      grid-template-columns: ${gridTemplateColumns};
      grid-template-rows: repeat(${rows}, 1fr);
      gap: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    `;

    const itemStyle = css`
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    `;

    return {
      gridStyle,
      itemStyle,
      chartDimensions: colPixelWidths.map((w, idx) => {
        const col = idx % cols;
        const widthIdx = col % widths.length;
        const chartW = colPixelWidths[widthIdx];
        return { width: chartW, height: itemHeight };
      }),
    };
  }, [gridCols, columnWidths, charts.length, totalWidth, totalHeight]);

  // Apply Grafana theme to all charts
  const themedCharts = useMemo(() => {
    const textColor = theme.colors.text.primary;
    const altbackgroundColor = theme.colors.background.secondary;

    return charts.map((chart) => ({
      ...chart,
      layout: {
        ...chart.layout,
        font: {
          color: textColor,
          ...chart.layout?.font,
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        hoverlabel: {
          bgcolor: textColor,
          ...chart.layout?.hoverlabel,
        },
        xaxis: {
          gridcolor: altbackgroundColor,
          ...chart.layout?.xaxis,
        },
        yaxis: {
          gridcolor: altbackgroundColor,
          ...chart.layout?.yaxis,
        },
      },
    }));
  }, [charts, theme]);

  if (charts.length === 0) {
    return <div>No graphs configured</div>;
  }

  return (
    <div className={gridStyle} style={{ width: '100%', height: '100%' }}>
      {themedCharts.map((chart, idx) => {
        const dims = chartDimensions[idx] || { width: 0, height: 0 };
        return (
          <div 
            key={chart.id} 
            className={itemStyle}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <PlotlyChart
              data={chart.data}
              layout={{
                ...chart.layout,
                margin: {
                  l: 40,
                  r: 20,
                  b: 40,
                  t: 40,
                  ...(chart.layout as any)?.margin
                }
              }}
              config={chart.config}
              frames={chart.frames}
              width={dims.width}
              height={dims.height}
              onEvent={(event) =>
                onEvent?.({
                  ...event,
                  graphId: chart.id,
                })
              }
              title={chart.title}
              replaceVariables={replaceVariables}
            />
          </div>
        );
      })}
    </div>
  );
};
