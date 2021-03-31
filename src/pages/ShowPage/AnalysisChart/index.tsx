/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider } from 'antd';
import { useCacheContext } from 'context/CacheContext';
import { FC, useCallback, useMemo } from 'react';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { DataItem } from 'types';
import { PoolAnalysis } from './PoolAnalysis';
import { renderToCanvas } from './renderToCanvas';
import { ISMOBILE } from 'const';
import { useGlobalContext } from 'context/GlobalContext';
import { IconButton } from 'components/IconButton';
import { FriendLinks } from 'components/FriendLinks';
import WordCloudCharts from './WordCloudCharts';
import renderPngTip from 'utils/renderPngTip';
import downloadCanvas from 'utils/downloadCanvas';

interface AnalysisChartProps {
  sheetNames: string[];
  onGetData: (key: string) => DataItem[];
}

export const AnalysisChart: FC<AnalysisChartProps> = ({ sheetNames, onGetData }) => {
  const { dataArr, validSheetNames } = useMemo(() => {
    const dataArr: DataItem[][] = [];
    const validSheetNames: string[] = [];
    sheetNames.forEach((key) => {
      const data = onGetData(key);
      if (data && data.length !== 0) {
        dataArr.push(data);
        validSheetNames.push(key);
      }
    });
    return {
      dataArr,
      validSheetNames,
    };
  }, [sheetNames]);
  const localCache = useCacheContext();
  const { isVertical } = useGlobalContext();
  const handleRenderPng = useCallback(() => {
    renderPngTip((resolve, reject) => {
      renderToCanvas(
        validSheetNames.map((key: string) => localCache[key]),
        isVertical,
        (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
          downloadCanvas(canvas, 'charts.png', resolve);
        },
      );
    });
  }, [isVertical]);
  return (
    <div>
      <Divider>
        <span>
          此页面参考自：
          <a target='_blank' href='https://github.com/biuuu/genshin-gacha-export'>
            github链接
          </a>
        </span>
      </Divider>
      {ISMOBILE ? (
        <div
          css={css`
            position: absolute;
            right: 12px;
            z-index: 999;
          `}
        >
          <Button
            type='primary'
            onClick={handleRenderPng}
            icon={<DownloadOutlined />}
            size='middle'
            shape='circle'
          />
        </div>
      ) : (
        <div
          css={css`
            position: fixed;
            right: 64px;
            z-index: 999;
          `}
        >
          <IconButton
            icon={<DownloadOutlined />}
            onClick={handleRenderPng}
            tip='生成图片'
            placement='left'
          />
        </div>
      )}
      <div
        css={css`
          text-align: center;
          margin: 10px 0;
        `}
      >
        {validSheetNames
          .map((key, index) => {
            return <PoolAnalysis key={key} sheetName={key} data={dataArr[index]} />;
          })
          .filter((v) => !!v)}
      </div>
      <div
        css={css`
          text-align: center;
          margin-bottom: 48px;
        `}
      >
        <Button type='primary' onClick={handleRenderPng} icon={<DownloadOutlined />} size='middle'>
          生成图片
        </Button>
      </div>
      <WordCloudCharts onGetData={onGetData} />
      <FriendLinks mode='bottom' />
    </div>
  );
};
