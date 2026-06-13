import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/secure-logger';
import { getReportAuthTokenFromRequest } from '@/lib/security/report-auth';
import {
  encodeDecisionMemoIdForPath,
  resolveCanonicalDecisionMemoId,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

type PdfBrowser = {
  newPage: () => Promise<any>;
  close: () => Promise<void>;
};

async function launchPdfBrowser(): Promise<PdfBrowser> {
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=none',
    '--disable-web-security',
  ];

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const [{ default: chromium }, { default: puppeteerCore }] = await Promise.all([
      import('@sparticuz/chromium'),
      import('puppeteer-core'),
    ]);
    const executablePath = await chromium.executablePath();

    return puppeteerCore.launch({
      args: [...chromium.args, ...launchArgs],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  const { default: puppeteer } = await import('puppeteer');
  return puppeteer.launch({
    headless: true,
    args: launchArgs,
  });
}

export async function renderDecisionMemoPdf(request: NextRequest, intakeId: string) {
  if (!intakeId || intakeId.length < 5) {
    return NextResponse.json({ error: 'Invalid intakeId' }, { status: 400 });
  }

  const canonicalIntakeId = resolveCanonicalDecisionMemoId(intakeId);
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  let browser: PdfBrowser | undefined;

  try {
    logger.info('Starting decision memo PDF generation', {
      intakeId: publicIntakeId,
      canonicalIntakeId,
    });

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const serverUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.PUPPETEER_BASE_URL ||
      `${protocol}://${host}`;

    browser = await launchPdfBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    await page.emulateMediaType('print');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    const authHeader =
      getReportAuthTokenFromRequest(request, intakeId) ??
      getReportAuthTokenFromRequest(request, canonicalIntakeId);
    if (authHeader) {
      await page.setExtraHTTPHeaders({
        Authorization: authHeader,
      });
    }

    const pageErrors: string[] = [];
    page.on('pageerror', (error: Error) => {
      pageErrors.push(error.message);
      logger.error('Decision memo PDF page error', { intakeId, error: error.message });
    });
    page.on('console', (message: { type: () => string; text: () => string }) => {
      if (message.type() === 'error') {
        const text = message.text();
        pageErrors.push(`console.error: ${text}`);
        logger.error('Decision memo PDF console error', { intakeId, text });
      }
    });

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader
        .split(';')
        .map((cookie) => {
          const [name, ...rest] = cookie.trim().split('=');
          return {
            name: name.trim(),
            value: rest.join('=').trim(),
            domain: new URL(serverUrl).hostname,
          };
        })
        .filter((cookie) => cookie.name);
      if (cookies.length > 0) {
        await page.setCookie(...cookies);
      }
    }

    const printUrl = `${serverUrl}/decision-memo-print/${encodeDecisionMemoIdForPath(publicIntakeId)}`;
    logger.info('Navigating to decision memo print page', {
      intakeId: publicIntakeId,
      canonicalIntakeId,
      printUrl,
    });

    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    try {
      await page.waitForFunction(
        () => {
          const errorNode = document.querySelector('[data-error]');
          const readyNode = document.querySelector(
            '[data-decision-memo-ready="true"][data-print-pagination-ready="true"]',
          );

          return Boolean(errorNode || readyNode);
        },
        { timeout: 30000 },
      );
    } catch {
      const pageState = await page.evaluate(() => {
        const readyNode = document.querySelector('[data-decision-memo-ready="true"]');
        const loadedNode = document.querySelector('[data-loaded="true"]');
        const errorNode = document.querySelector('[data-error]');
        const paginationNode = document.querySelector('[data-print-pagination-ready]');

        return {
          dataLoaded: loadedNode?.getAttribute('data-loaded') ?? null,
          dataReady: readyNode?.getAttribute('data-decision-memo-ready') ?? null,
          paginationReady: paginationNode?.getAttribute('data-print-pagination-ready') ?? null,
          dataError: errorNode?.getAttribute('data-error') ?? null,
          bodyText: document.body.innerText?.slice(0, 500),
        };
      });

      logger.error('Decision memo PDF page did not signal ready', {
        intakeId: publicIntakeId,
        canonicalIntakeId,
        pageState,
        pageErrors: pageErrors.slice(0, 5),
      });

      throw new Error(
        `Page did not signal ready. Loaded: ${pageState.dataLoaded || 'null'}, Ready: ${pageState.dataReady || 'null'}, Pagination: ${pageState.paginationReady || 'null'}, Error: ${pageState.dataError || 'none'}, PageErrors: ${pageErrors.join('; ').slice(0, 300)}`
      );
    }

    const pageState = await page.evaluate(() => {
      const readyNode = document.querySelector('[data-decision-memo-ready="true"]');
      const loadedNode = document.querySelector('[data-loaded="true"]');
      const errorNode = document.querySelector('[data-error]');
      const paginationNode = document.querySelector('[data-print-pagination-ready]');

      return {
        dataLoaded: loadedNode?.getAttribute('data-loaded') ?? null,
        dataReady: readyNode?.getAttribute('data-decision-memo-ready') ?? null,
        paginationReady: paginationNode?.getAttribute('data-print-pagination-ready') ?? null,
        dataError: errorNode?.getAttribute('data-error') ?? null,
      };
    });

    if (pageState.dataError && !pageState.dataReady) {
      throw new Error(`Print surface error: ${pageState.dataError}`);
    }

    if (pageState.dataReady !== 'true' || pageState.paginationReady !== 'true') {
      throw new Error(
        `Print surface not fully ready. Ready: ${pageState.dataReady || 'null'}, Pagination: ${pageState.paginationReady || 'null'}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const refId =
      publicIntakeId.toUpperCase();

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '40px',
        bottom: '56px',
        left: '0',
        right: '0',
      },
      displayHeaderFooter: true,
      headerTemplate: `<div><style>#header, #footer { padding: 0 !important; margin: 0 !important; }</style></div>`,
      footerTemplate: `
        <style>#header, #footer { padding: 0 !important; margin: 0 !important; }</style>
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 52px 8px;
          box-sizing: border-box;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Inter', 'Helvetica Neue', sans-serif;
            font-size: 8px;
            color: #6b6358;
            border-top: 0.5px solid rgba(171, 149, 112, 0.35);
            padding-top: 8px;
          ">
            <span style="letter-spacing: 0.8px; text-transform: uppercase;">Decision Memo · ${refId}</span>
            <span style="color: #8f6a25; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;">HNWI Chronicles</span>
            <span style="letter-spacing: 0.8px; text-transform: uppercase;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        </div>
      `,
    });

    logger.info('Decision memo PDF generated successfully', {
      intakeId: publicIntakeId,
      canonicalIntakeId,
      sizeKB: Math.round(pdfBuffer.length / 1024),
    });

    const fileName = `HNWI-Decision-Audit-${refId}.pdf`;

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logger.error('Decision memo PDF generation failed', {
      intakeId: publicIntakeId,
      canonicalIntakeId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'PDF generation failed',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors.
      }
    }
  }
}
