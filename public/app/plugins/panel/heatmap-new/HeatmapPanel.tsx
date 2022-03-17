import React, { useCallback, useMemo, useRef, useState } from 'react';
import { css } from '@emotion/css';
import {
  Field,
  formattedValueToString,
  GrafanaTheme2,
  LinkModel,
  PanelProps,
  reduceField,
  ReducerID,
} from '@grafana/data';
import {
  Portal,
  UPlotChart,
  useStyles2,
  useTheme2,
  VizLayout,
  VizTooltipContainer,
  LegendDisplayMode,
} from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';

import { HeatmapData, prepareHeatmapData } from './fields';
import { PanelOptions } from './models.gen';
import { quantizeScheme } from './palettes';
import { HeatmapHoverEvent, prepConfig } from './utils';
import { HeatmapHoverView } from './HeatmapHoverView';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { ColorScale } from './ColorScale';
import { ExemplarsPlugin } from './plugins/ExemplarsPlugin';

interface HeatmapPanelProps extends PanelProps<PanelOptions> {}

export const HeatmapPanel: React.FC<HeatmapPanelProps> = ({
  data,
  id,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  onChangeTimeRange,
  replaceVariables,
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const info = useMemo(() => prepareHeatmapData(data.series, options, theme), [data, options, theme]);

  const facets = useMemo(() => [null, info.heatmap?.fields.map((f) => f.values.toArray())], [info.heatmap]);

  //console.log(facets);

  const palette = useMemo(() => quantizeScheme(options.color, theme), [options.color, theme]);

  const [hover, setHover] = useState<HeatmapHoverEvent | undefined>(undefined);
  const [shouldDisplayCloseButton, setShouldDisplayCloseButton] = useState<boolean>(false);
  const isToolTipOpen = useRef<boolean>(false);

  const onCloseToolTip = () => {
    isToolTipOpen.current = false;
    setShouldDisplayCloseButton(false);
    onhover(null);
  };

  const onclick = () => {
    isToolTipOpen.current = !isToolTipOpen.current;

    // Linking into useState required to re-render tooltip
    setShouldDisplayCloseButton(isToolTipOpen.current);
  };

  const onhover = useCallback(
    (evt?: HeatmapHoverEvent | null) => {
      setHover(evt ?? undefined);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, data.structureRev]
  );

  const dataRef = useRef<HeatmapData>(info);

  dataRef.current = info;

  const builder = useMemo(() => {
    return prepConfig({
      dataRef,
      theme,
      onhover: options.tooltip.show ? onhover : () => {},
      onclick: options.tooltip.show ? onclick : () => {},
      isToolTipOpen,
      timeZone,
      timeRange,
      palette,
      cellGap: options.cellGap,
      hideThreshold: options.hideThreshold,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, data.structureRev]);

  const renderLegend = () => {
    if (options.legend.displayMode === LegendDisplayMode.Hidden || !info.heatmap) {
      return null;
    }

    const field = info.heatmap.fields[2];
    const { min, max } = reduceField({ field, reducers: [ReducerID.min, ReducerID.max] });
    const display = field.display ? (v: number) => formattedValueToString(field.display!(v)) : (v: number) => `${v}`;

    return (
      <VizLayout.Legend placement="bottom" maxHeight="20%">
        <ColorScale colorPalette={palette} min={min} max={max} display={display} />
      </VizLayout.Legend>
    );
  };

  if (info.warning || !info.heatmap) {
    return <PanelDataErrorView panelId={id} data={data} needsNumberField={true} message={info.warning} />;
  }

  return (
    <>
      <VizLayout width={width} height={height} legend={renderLegend()}>
        {(vizWidth: number, vizHeight: number) => (
          <UPlotChart config={builder} data={facets as any} width={vizWidth} height={vizHeight} timeRange={timeRange}>
            {/*children ? children(config, alignedFrame) : null*/}
            {data.annotations && (
              <ExemplarsPlugin
                config={builder}
                exemplars={data.annotations}
                timeZone={timeZone}
                getFieldLinks={(field: Field, rowIndex: number): Array<LinkModel<Field>> => {
                  console.log('getFieldLinks Called', field, rowIndex);
                  return [];
                }}
              />
            )}
          </UPlotChart>
        )}
      </VizLayout>
      <Portal>
        {hover && (
          <VizTooltipContainer
            position={{ x: hover.pageX, y: hover.pageY }}
            offset={{ x: 10, y: 10 }}
            allowPointerEvents={isToolTipOpen.current}
          >
            {shouldDisplayCloseButton && (
              <>
                <CloseButton onClick={onCloseToolTip} />
                <div className={styles.closeButtonSpacer} />
              </>
            )}
            <HeatmapHoverView data={info} hover={hover} showHistogram={options.tooltip.yHistogram} />
          </VizTooltipContainer>
        )}
      </Portal>
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  closeButtonSpacer: css`
    margin-bottom: 15px;
  `,
});
