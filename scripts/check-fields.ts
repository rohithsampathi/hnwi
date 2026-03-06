import { MongoClient } from 'mongodb';
const MONGO_URI = 'mongodb+srv://Rohith:SridhaR16@leadmirror.evkzzyi.mongodb.net/?retryWrites=true&w=majority&appName=LeadMirror';
async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('LeadMirror');
  const doc = await db.collection('sfo_pattern_audits').findOne({ intake_id: 'fo_audit_c5_heFbzDg3T' });
  const pd = doc?.preview_data || {};
  const interesting = ['thesis_summary','decision_thesis','decision_context','executive_summary','overview','corridor_precedents','precedent_count','developments_count','corridor_signals','exposure_class','pattern_intelligence'];
  for (const k of interesting) {
    const v = (pd as any)[k];
    if (v !== undefined && v !== null) {
      const s = typeof v === 'string' ? v.substring(0,200) : JSON.stringify(v).substring(0,200);
      console.log(k + ':', s);
    } else {
      console.log(k + ': MISSING');
    }
  }
  await client.close();
}
main();
