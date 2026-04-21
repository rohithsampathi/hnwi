'use client';

import { useEffect, type RefObject } from 'react';

const PRINT_ROOT_ID = 'decision-memo-print-root';
const PAGE_HEIGHT_PX = 1123;
const PAGE_MARGIN_TOP_PX = 40;
const PAGE_MARGIN_BOTTOM_PX = 56;
const PAGE_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_MARGIN_TOP_PX - PAGE_MARGIN_BOTTOM_PX;
const DEFAULT_MAX_BLOCK_HEIGHT_PX = PAGE_CONTENT_HEIGHT_PX - 72;
const PAGE_BREAK_TOLERANCE_PX = 2;

interface PrintPaginationOptimizerProps {
  containerRef: RefObject<HTMLElement | null>;
}

function setPrintReadyState(isReady: boolean) {
  const root = document.getElementById(PRINT_ROOT_ID);
  if (!root) return;

  root.setAttribute('data-decision-memo-ready', isReady ? 'true' : 'pending');
  root.setAttribute('data-print-pagination-ready', isReady ? 'true' : 'pending');
}

function clearPaginationClasses(container: HTMLElement) {
  container
    .querySelectorAll<HTMLElement>('.print-break-before, .print-keep-together')
    .forEach((node) => {
      node.classList.remove('print-break-before', 'print-keep-together');
    });
}

function getCandidateBlocks(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-print-block="keep"]'))
    .filter((block) => !block.parentElement?.closest('[data-print-block="keep"]'))
    .filter((block) => {
      const rect = block.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    })
    .sort((left, right) => {
      const leftTop = left.getBoundingClientRect().top;
      const rightTop = right.getBoundingClientRect().top;
      return leftTop - rightTop;
    });
}

function optimizePrintPagination(container: HTMLElement) {
  clearPaginationClasses(container);

  const containerTop = container.getBoundingClientRect().top + window.scrollY;
  const blocks = getCandidateBlocks(container);
  let insertedGap = 0;

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();
    const height = Math.ceil(rect.height);

    if (height <= 0) return;

    const virtualTop = Math.max(
      0,
      Math.round(rect.top + window.scrollY - containerTop + insertedGap),
    );
    const pageOffset = virtualTop % PAGE_CONTENT_HEIGHT_PX;
    const remainingOnPage = PAGE_CONTENT_HEIGHT_PX - pageOffset;
    const overflowsPage =
      pageOffset > 0 && virtualTop + height > virtualTop - pageOffset + PAGE_CONTENT_HEIGHT_PX + PAGE_BREAK_TOLERANCE_PX;

    if (!overflowsPage) return;

    const maxHeight = Number(block.dataset.printMaxHeight || DEFAULT_MAX_BLOCK_HEIGHT_PX);

    if (height > maxHeight) return;

    block.classList.add('print-break-before', 'print-keep-together');
    insertedGap += remainingOnPage;
  });
}

export function PrintPaginationOptimizer({
  containerRef,
}: PrintPaginationOptimizerProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let settledTimeout: number | undefined;
    let frameOne = 0;
    let frameTwo = 0;
    let observer: ResizeObserver | undefined;
    let isDisposed = false;

    const finish = () => {
      if (isDisposed) return;
      setPrintReadyState(true);
    };

    const run = () => {
      if (isDisposed) return;

      try {
        optimizePrintPagination(container);
      } finally {
        if (settledTimeout) window.clearTimeout(settledTimeout);
        settledTimeout = window.setTimeout(finish, 120);
      }
    };

    const schedule = () => {
      if (isDisposed) return;

      setPrintReadyState(false);
      if (frameOne) window.cancelAnimationFrame(frameOne);
      if (frameTwo) window.cancelAnimationFrame(frameTwo);

      frameOne = window.requestAnimationFrame(() => {
        frameTwo = window.requestAnimationFrame(run);
      });
    };

    const initialize = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // Ignore font readiness failures and continue with pagination.
      }

      schedule();
    };

    initialize();

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        schedule();
      });
      observer.observe(container);
    }

    window.addEventListener('load', schedule);

    const fallbackShort = window.setTimeout(schedule, 250);
    const fallbackLong = window.setTimeout(schedule, 900);

    return () => {
      isDisposed = true;
      if (observer) observer.disconnect();
      if (frameOne) window.cancelAnimationFrame(frameOne);
      if (frameTwo) window.cancelAnimationFrame(frameTwo);
      if (settledTimeout) window.clearTimeout(settledTimeout);
      window.clearTimeout(fallbackShort);
      window.clearTimeout(fallbackLong);
      window.removeEventListener('load', schedule);
    };
  }, [containerRef]);

  return null;
}
