import { MongoClient } from 'mongodb';
const MONGO_URI = 'mongodb+srv://Rohith:SridhaR16@leadmirror.evkzzyi.mongodb.net/?retryWrites=true&w=majority&appName=LeadMirror';
const INTAKE_ID = 'fo_audit_c5_heFbzDg3T';
async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('LeadMirror');
  const doc = await db.collection('sfo_pattern_audits').findOne({ intake_id: INTAKE_ID }) as any;
  await client.close();
  const pd = doc.preview_data || {};
  
  // structure_optimization
  console.log('=== structure_optimization ===');
  const so = pd.structure_optimization;
  if (so) {
    console.log('keys:', Object.keys(so).join(', '));
    console.log('verdict:', so.verdict);
    console.log('optimal_structure:', JSON.stringify(so.optimal_structure).substring(0,200));
  }
  
  // verdict fields
  console.log('\n=== VERDICT FIELDS ===');
  console.log('pd.verdict:', pd.verdict);
  console.log('pd.risk_assessment.verdict:', pd.risk_assessment?.verdict);
  console.log('full_artifact.verdict:', typeof doc.full_artifact?.verdict === 'object' ? JSON.stringify(doc.full_artifact.verdict) : doc.full_artifact?.verdict);

  // what does thesis look like from full_artifact perspective
  console.log('\n=== THESIS TEXT ===');
  const fa = doc.full_artifact || {};
  console.log('thesis_summary:', fa.thesis_summary || 'MISSING');
  const moveDesc = doc.thesis?.move_description || '';
  const expectedOutcome = doc.thesis?.expected_outcome || '';
  console.log('Combined thesis:', (moveDesc + (expectedOutcome ? '\n\n' + expectedOutcome : '')).substring(0, 300));

  // check if Python backend probably returns thesis as string
  // by looking at what fields the backend endpoint would include
  // The gen-pdf-real script doesn't pass thesis - so we need to either:
  // 1. Pass it in the script, or 2. Extract from what we have in preview_data/memo_data
  
  // Any text fields in preview_data that could serve as thesis?
  const textFields = ['description', 'summary', 'overview', 'context'];
  textFields.forEach(f => {
    if (pd[f]) console.log(`pd.${f}:`, String(pd[f]).substring(0, 100));
  });

  // Check for mcp_context which has the original user input
  console.log('\nRaw thesis fields at root level:');
  ['thesis', 'constraints', 'asset_details', 'mcp_context'].forEach(f => {
    const val = (doc as any)[f];
    if (val) {
      if (typeof val === 'string') console.log(`doc.${f}:`, val.substring(0, 150));
      else if (typeof val === 'object') console.log(`doc.${f} (obj keys):`, Object.keys(val).join(', '));
    }
  });
}
main().catch(e => { console.error(e.message); process.exit(1); });
