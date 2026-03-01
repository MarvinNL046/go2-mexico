import { ExternalLink, Plane, Hotel, Wifi, Shield, MapPin, Utensils } from 'lucide-react';

interface OfferCardProps {
  partner: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  category: string;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  flights: { icon: Plane, color: 'bg-blue-50 text-blue-600' },
  hotels: { icon: Hotel, color: 'bg-purple-50 text-purple-600' },
  esim: { icon: Wifi, color: 'bg-green-50 text-green-600' },
  insurance: { icon: Shield, color: 'bg-amber-50 text-amber-600' },
  activities: { icon: MapPin, color: 'bg-brand-accent/10 text-brand-accent' },
  food: { icon: Utensils, color: 'bg-brand-secondary/10 text-brand-secondary' },
  transport: { icon: Plane, color: 'bg-sky-50 text-sky-600' },
  security: { icon: Shield, color: 'bg-red-50 text-red-600' },
};

const OfferCard: React.FC<OfferCardProps> = ({
  partner,
  title,
  description,
  cta,
  url,
  category,
}) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.activities;
  const IconComponent = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 p-5 flex flex-col h-full">
      {/* Header: category badge + partner */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span className="capitalize">{category}</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">{partner}</span>
      </div>

      {/* Title + Description */}
      <h4 className="text-base font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">{description}</p>

      {/* CTA */}
      <a
        href={url}
        target="_blank"
        rel="noopener sponsored"
        className="inline-flex items-center justify-center gap-2 w-full bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-primary-600 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
      >
        <span>{cta}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export type { OfferCardProps };
export default OfferCard;
