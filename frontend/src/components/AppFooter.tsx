import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t, type Lang } from '../lib/i18n';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function AppFooter() {
  const { lang, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CONTENT_REVIEWER';
  if (isAdmin) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="footer-flag">
            <span className="saffron" />
            <span className="white" />
            <span className="green" />
          </span>
          <span className="font-display font-bold text-[#0f2a26]">{t(lang, 'brand')}</span>
        </div>
        <p className="site-footer-tag">{t(lang, 'disclaimer')}</p>
        <div className="site-footer-links">
          <Link to="/help">🆘 {L(lang, 'Get help', 'मदद', 'సహాయం')}</Link>
          <Link to="/rights">⚖️ {L(lang, 'Rights', 'अधिकार', 'హక్కులు')}</Link>
          <Link to="/tutor">🤖 {t(lang, 'tutor')}</Link>
          <a href="tel:1098">📞 Childline 1098</a>
        </div>
      </div>
    </footer>
  );
}
