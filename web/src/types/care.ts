import { CareDifficulty, Product } from './product';

export interface CareGuide {
  id: string;
  title: string;
  slug: string;
  species?: string;
  summary: string;
  sunlightTips: string;
  wateringTips: string;
  soilTips: string;
  repottingTips?: string;
  pestControlTips?: string;
  fertilizerTips?: string;
  difficulty: CareDifficulty;
  imageUrl?: string;
  isPublished: boolean;
  products?: Product[];
  _count?: {
    products: number;
  };
  createdAt: string;
}
