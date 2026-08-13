import { useRef } from 'react';
import type { Lang } from '../lib/i18n';

type Props = {
  name: string;
  level: number;
  levelName: string;
  xp: number;
  badges: number;
  modulesCompleted: number;
  lang: Lang;
};

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function Certificate({
  name,
  level,
  levelName,
  xp,
  badges,
  modulesCompleted,
  lang,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const date = new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'te-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function print() {
    const el = ref.current;
    if (!el) return;
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>RightsQuest Certificate</title>
      <style>
        body { font-family: Georgia, serif; margin: 40px; color: #0f2a26; }
        .cert { border: 4px double #0d6b63; padding: 40px; text-align: center; max-width: 640px; margin: 0 auto; }
        .ribbon { display: flex; gap: 4px; justify-content: center; margin-bottom: 16px; }
        .ribbon span { width: 40px; height: 6px; border-radius: 3px; }
        .saffron { background: #e07a2f; } .white { background: #fff; border: 1px solid #ccc; } .green { background: #138808; }
        h1 { font-size: 28px; margin: 0; } h2 { font-size: 20px; color: #0d6b63; }
        .name { font-size: 32px; font-weight: bold; margin: 24px 0; border-bottom: 2px solid #c9a227; display: inline-block; padding: 0 16px 8px; }
        .stats { margin-top: 24px; font-size: 14px; } .foot { margin-top: 32px; font-size: 12px; color: #666; }
      </style></head><body>${el.innerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div className="certificate-wrap">
      <div ref={ref} className="certificate panel p-6 text-center">
        <div className="cert-ribbon mx-auto mb-4 flex w-fit gap-1">
          <span className="saffron h-1.5 w-10 rounded-full" />
          <span className="white h-1.5 w-10 rounded-full border border-[#d5e5e0]" />
          <span className="green h-1.5 w-10 rounded-full" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d6b63]">RightsQuest India</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-[#0f2a26]">
          {L(lang, 'Certificate of Learning', 'सीखने का प्रमाणपत्र', 'నేర్చుకోవడం ధృవపత్రం')}
        </h3>
        <p className="mt-4 text-sm font-semibold text-[#3d5c56]">
          {L(lang, 'This certifies that', 'यह प्रमाणित करता है कि', 'ఇది ధృవీకరిస్తుంది')}
        </p>
        <p className="certificate-name mt-2 font-display text-3xl font-bold text-[#0f2a26]">{name}</p>
        <p className="mt-4 text-sm font-semibold text-[#3d5c56]">
          {L(
            lang,
            'has made progress in child rights literacy on RightsQuest India',
            'ने RightsQuest India पर बाल अधिकार साक्षरता में प्रगति की है',
            'RightsQuest Indiaలో పిల్లల హక్కుల సాక్షరతలో పురోగతి సాధించారు'
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-[#0d6b63]">
          <span>⭐ {xp} XP</span>
          <span>
            {L(lang, 'Level', 'लेवल', 'లెవెల్')} {level} · {levelName}
          </span>
          <span>
            {badges} {L(lang, 'badges', 'बैज', 'బ్యాడ్జ్‌లు')}
          </span>
          <span>
            {modulesCompleted} {L(lang, 'modules', 'मॉड्यूल', 'మాడ్యూల్స్')}
          </span>
        </div>
        <p className="mt-6 text-xs font-semibold text-[#3d5c56]">{date}</p>
        <p className="mt-2 text-xs text-[#3d5c56]/80">
          {L(
            lang,
            'Educational achievement — not a government certificate.',
            'शैक्षिक उपलब्धि — सरकारी प्रमाणपत्र नहीं।',
            'విద్యా సాధన — ప్రభుత్వ ధృవపత్రం కాదు.'
          )}
        </p>
      </div>
      <button type="button" className="btn-primary mt-4 w-full sm:w-auto" onClick={print}>
        🖨️ {L(lang, 'Print certificate', 'प्रमाणपत्र प्रिंट करो', 'ధృవపత్రం ప్రింట్ చేయండి')}
      </button>
    </div>
  );
}
