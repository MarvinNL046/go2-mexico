import Image from 'next/image';
import { CalendarDays, Award } from 'lucide-react';
import { getAuthor } from '../site.config';
import { useTranslation } from '../hooks/useTranslation';

interface AuthorBoxProps {
  authorKey: string;
  updatedAt: string;
}

const AuthorBox: React.FC<AuthorBoxProps> = ({ authorKey, updatedAt }) => {
  const { t } = useTranslation('common');
  const author = getAuthor(authorKey);

  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-brand-primary/20 ring-offset-2">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <span className="text-xs text-gray-500 font-medium">{t('content.writtenBy')}</span>
            <h3 className="text-base font-bold text-gray-900">{author.name}</h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {author.bio}
          </p>

          {/* Credentials + Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
            {author.credentials && (
              <span className="inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-primary" />
                <span>{author.credentials}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('content.lastUpdated')}: {formattedDate}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorBox;
