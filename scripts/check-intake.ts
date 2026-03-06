import { MongoClient } from 'mongodb';
const MONGO_URI = 'mongodb+srv://Rohith:SridhaR16@leadmirror.evkzzyi.mongodb.net/?retryWrites=true&w=majority&appName=LeadMirror';
async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('LeadMirror');
  
  // Check the intake the user mentioned
  const doc2 = await db.collection('sfo_pattern_audits').findOne({ intake_id: 'fo_audit_UWHQSOUtohM9' });
  if (doc2) {
    const pd = doc2.preview_data || {};
    console.log('=== fo_audit_UWHQSOUtohM9 ===');
    console.log('all_mistakes count:', pd.all_mistakes?.length || 0);
    console.log('identified_risks count:', (doc2 as any).identified_risks?.length || pd.identified_risks?.length || 0);
    console.log('risk_assessment:', JSON.stringify(pd.risk_assessment || {}).substring(0, 300));
    console.log('verdict:', pd.verdict);
    console.log('thesis_summary:', pd.thesis_summary?.substring(0, 200) || 'MISSING');
    console.log('decision_thesis:', pd.decision_thesis?.substring(0, 200) || 'MISSING');
    console.log('precedent_count:', pd.precedent_count);
    console.log('developments_count:', pd.developments_count);
    console.log('corridor_precedents:', pd.corridor_precedents);
    
    // Show first mistake structure
    if (pd.all_mistakes?.length > 0) {
      console.log('\nFirst mistake structure:', JSON.stringify(pd.all_mistakes[0]).substring(0, 300));
    }
    // Show first identified_risk structure
    const ir = (doc2 as any).identified_risks || pd.identified_risks;
    if (ir?.length > 0) {
      console.log('\nFirst identified_risk:', JSON.stringify(ir[0]).substring(0, 300));
    }
  } else {
    console.log('fo_audit_UWHQSOUtohM9 NOT FOUND');
  }
  
  // Also check our test intake
  const doc1 = await db.collection('sfo_pattern_audits').findOne({ intake_id: 'fo_audit_c5_heFbzDg3T' });
  if (doc1) {
    const pd = doc1.preview_data || {};
    console.log('\n=== fo_audit_c5_heFbzDg3T ===');
    console.log('all_mistakes count:', pd.all_mistakes?.length || 0);
    console.log('identified_risks count:', (doc1 as any).identified_risks?.length || pd.identified_risks?.length || 0);
    console.log('risk_assessment:', JSON.stringify(pd.risk_assessment || {}).substring(0, 300));
    console.log('precedent_count:', pd.precedent_count);
    console.log('developments_count:', pd.developments_count);
    console.log('thesis_summary:', pd.thesis_summary?.substring(0, 200) || 'MISSING');
    
    if (pd.all_mistakes?.length > 0) {
      console.log('\nFirst mistake:', JSON.stringify(pd.all_mistakes[0]).substring(0, 300));
    }
  }
  
  await client.close();
}
main();
