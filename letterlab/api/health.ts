export default function handler(_req: any, res: any) {
  res.json({status:'ok', hasApiKey:Boolean(process.env.GEMINI_API_KEY), app:'LetterLab'});
}
