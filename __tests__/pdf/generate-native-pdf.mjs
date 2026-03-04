/**
 * Quick native PDF generation test via the API route
 * Authenticates, then calls /api/decision-memo/pdf/[intakeId]
 *
 * Usage: node __tests__/pdf/generate-native-pdf.mjs [intakeId]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PDF = path.join(__dirname, 'screenshots', 'native-test-output.pdf');

const SERVER_URL = 'http://localhost:3000';
const INTAKE_ID = process.argv[2] || 'fo_audit_UWHQSOUtohM9';

async function main() {
  console.log('=== NATIVE PDF GENERATION TEST ===\n');
  console.log(`   Intake ID: ${INTAKE_ID}`);
  console.log(`   Server: ${SERVER_URL}\n`);

  // 1. Authenticate
  console.log('1. Authenticating...');
  const loginRes = await fetch(`${SERVER_URL}/api/decision-memo/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: INTAKE_ID,
      email: 'audit.viewer@hnwichronicles.com',
      password: 'unTocx5CkdjbccYa',
    }),
  });

  if (!loginRes.ok) {
    console.error('   Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }

  // Extract cookies from login response
  const cookies = loginRes.headers.getSetCookie?.() || [];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('   Login OK, cookies:', cookies.length);

  // 2. Check if MFA is required
  const loginData = await loginRes.json();
  let finalCookies = cookieHeader;

  if (loginData.requires_mfa) {
    console.log('   MFA required, verifying...');
    const mfaRes = await fetch(`${SERVER_URL}/api/auth/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({ code: '000000' }), // Test code
    });
    if (mfaRes.ok) {
      const mfaCookies = mfaRes.headers.getSetCookie?.() || [];
      finalCookies = [...cookies, ...mfaCookies].map(c => c.split(';')[0]).join('; ');
    }
  }

  // 3. Generate PDF via native route
  console.log('\n2. Generating PDF via /api/decision-memo/pdf/...');
  const startTime = Date.now();

  const pdfRes = await fetch(`${SERVER_URL}/api/decision-memo/pdf/${INTAKE_ID}`, {
    headers: { 'Cookie': finalCookies },
  });

  const elapsed = Date.now() - startTime;

  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    console.error(`   PDF generation failed: ${pdfRes.status}`);
    console.error(`   Response: ${errText.slice(0, 500)}`);
    process.exit(1);
  }

  // 4. Save PDF
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
  const sizeKB = Math.round(pdfBuffer.length / 1024);

  fs.writeFileSync(OUTPUT_PDF, pdfBuffer);
  console.log(`   Done in ${elapsed}ms`);
  console.log(`   PDF size: ${sizeKB} KB`);
  console.log(`   Written to: ${OUTPUT_PDF}`);

  // 5. PDF info
  try {
    const { execSync } = await import('child_process');
    const pdfInfo = execSync(`pdfinfo "${OUTPUT_PDF}" 2>&1`, { encoding: 'utf-8' });
    console.log('\n3. PDF Info:');
    pdfInfo.split('\n').filter(l => l.trim()).forEach(l => console.log(`   ${l}`));
  } catch {
    console.log('\n   (pdfinfo not available)');
  }

  console.log('\n=== DONE ===');
  console.log(`Open: open "${OUTPUT_PDF}"`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
