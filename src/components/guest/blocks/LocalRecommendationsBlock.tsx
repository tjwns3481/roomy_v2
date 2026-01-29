// @TASK TouchStay-Comparison - 주변 추천 장소 블록 (Touch Stay 핵심 기능)
'use client';

import { useState } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ExternalLink,
  Utensils,
  Coffee,
  ShoppingBag,
  Landmark,
  Waves,
  TreePine,
  Hospital,
  Fuel,
  Store,
  ChevronDown,
  ChevronUp,
  Navigation
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type POICategory =
  | 'restaurant'
  | 'cafe'
  | 'shopping'
  | 'attraction'
  | 'beach'
  | 'nature'
  | 'hospital'
  | 'gas_station'
  | 'convenience';

interface POI {
  id: string;
  name: string;
  category: POICategory;
  description?: string;
  distance?: string;
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  openHours?: string;
  phone?: string;
  address?: string;
  googleMapsUrl?: string;
  naverMapsUrl?: string;
  imageUrl?: string;
  hostNote?: string; // Host's personal recommendation
}

interface LocalRecommendationsBlockProps {
  content: {
    title?: string;
    description?: string;
    places: POI[];
  };
  themeColor?: string;
}

const categoryConfig: Record<POICategory, { icon: typeof MapPin; label: string; color: string }> = {
  restaurant: { icon: Utensils, label: '맛집', color: '#EF4444' },
  cafe: { icon: Coffee, label: '카페', color: '#8B5CF6' },
  shopping: { icon: ShoppingBag, label: '쇼핑', color: '#F59E0B' },
  attraction: { icon: Landmark, label: '관광지', color: '#3B82F6' },
  beach: { icon: Waves, label: '해변', color: '#06B6D4' },
  nature: { icon: TreePine, label: '자연', color: '#22C55E' },
  hospital: { icon: Hospital, label: '병원', color: '#EC4899' },
  gas_station: { icon: Fuel, label: '주유소', color: '#64748B' },
  convenience: { icon: Store, label: '편의점', color: '#F97316' },
};

function POICard({ place, themeColor }: { place: POI; themeColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const config = categoryConfig[place.category];
  const Icon = config.icon;

  const openInMaps = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else if (place.address) {
      // Fallback to Google Maps search
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {config.label}
                </span>
                {place.distance && (
                  <span className="text-xs text-gray-500">{place.distance}</span>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mt-1">{place.name}</h4>

              {/* Rating & Price */}
              <div className="flex items-center gap-3 mt-1">
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
                  </div>
                )}
                {place.priceLevel && (
                  <span className="text-sm text-gray-500">
                    {'₩'.repeat(place.priceLevel)}
                    <span className="text-gray-300">{'₩'.repeat(4 - place.priceLevel)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Host Note */}
          {place.hostNote && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <span className="font-medium">호스트 추천:</span> {place.hostNote}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t pt-3">
            {place.description && (
              <p className="text-sm text-gray-600">{place.description}</p>
            )}

            {place.imageUrl && (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              {place.openHours && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{place.openHours}</span>
                </div>
              )}
              {place.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{place.address}</span>
                </div>
              )}
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <Phone className="w-4 h-4" />
                  <span>{place.phone}</span>
                </a>
              )}
            </div>

            {/* Map Buttons */}
            <div className="flex gap-2 pt-2">
              {place.naverMapsUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openInMaps(place.naverMapsUrl)}
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  네이버 지도
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openInMaps(place.googleMapsUrl)}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                구글 지도
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LocalRecommendationsBlock({ content, themeColor = '#3B82F6' }: LocalRecommendationsBlockProps) {
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');

  // Get unique categories from places
  const categories = Array.from(new Set(content.places.map(p => p.category)));

  // Filter places by category
  const filteredPlaces = selectedCategory === 'all'
    ? content.places
    : content.places.filter(p => p.category === selectedCategory);

  return (
    <section className="py-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {content.title || '주변 추천 장소'}
        </h2>
        {content.description && (
          <p className="text-gray-600 mt-1">{content.description}</p>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={selectedCategory === 'all' ? { backgroundColor: themeColor } : {}}
        >
          전체 ({content.places.length})
        </button>
        {categories.map(cat => {
          const config = categoryConfig[cat];
          const count = content.places.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat ? { backgroundColor: config.color } : {}}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Places List */}
      <div className="space-y-3">
        {filteredPlaces.map(place => (
          <POICard key={place.id} place={place} themeColor={themeColor} />
        ))}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          이 카테고리에 추천 장소가 없습니다.
        </div>
      )}
    </section>
  );
}
