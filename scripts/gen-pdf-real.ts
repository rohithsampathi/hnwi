import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { PatternAuditDocument } from '../lib/pdf/PatternAuditDocument';

const INTAKE_ID = process.argv[2] || 'sfo_audit_90c06218287b4af6';
const MONGO_URI = 'mongodb+srv://Rohith:SridhaR16@leadmirror.evkzzyi.mongodb.net/?retryWrites=true&w=majority&appName=LeadMirror';

async function main() {
  console.log(`Fetching from MongoDB: ${INTAKE_ID}`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('LeadMirror');

  const doc = await db.collection('sfo_pattern_audits').findOne({ intake_id: INTAKE_ID });
  if (!doc) {
    console.error(`Intake not found: ${INTAKE_ID}`);
    await client.close();
    process.exit(1);
  }

  const memoData = {
    success: true,
    intake_id: doc.intake_id,
    generated_at: doc.generated_at || doc.created_at || new Date().toISOString(),
    preview_data: doc.preview_data || {},
    memo_data: doc.memo_data || { kgv3_intelligence_used: {} },
    full_memo_url: doc.full_memo_url,
    mitigationTimeline: doc.mitigationTimeline,
    risk_assessment: doc.risk_assessment,
    all_mistakes: doc.all_mistakes,
    identified_risks: doc.identified_risks,
  };

  await client.close();

  const pd = memoData.preview_data;
  console.log(`Verdict: ${pd.verdict || '?'}`);
  console.log(`Source: ${pd.source_jurisdiction || '?'}`);
  console.log(`Dest: ${pd.destination_jurisdiction || '?'}`);
  console.log(`Risk factors: ${pd.risk_factors?.length || 0}`);
  console.log(`Precedents: ${pd.precedent_count || 0}`);
  console.log(`Has memo_data keys: ${Object.keys(memoData.memo_data || {}).length}`);

  console.log('\nRendering PDF...');
  const buffer = await renderToBuffer(React.createElement(PatternAuditDocument, { memoData: memoData as any }));

  const outPath = `/tmp/pdf-real-${INTAKE_ID.slice(-8)}.pdf`;
  fs.writeFileSync(outPath, buffer);
  console.log(`\nPDF: ${buffer.length} bytes (${Math.round(buffer.length/1024)}KB)`);
  console.log(`Saved: ${outPath}`);
}

main().catch(err => { console.error(err.message, err.stack?.split('\n').slice(0,3).join('\n')); process.exit(1); });
