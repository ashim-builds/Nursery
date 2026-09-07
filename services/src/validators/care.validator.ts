import { z } from 'zod';

export const careGuideSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    species: z.string().optional(),
    summary: z.string().min(10, 'Summary is required'),
    sunlightTips: z.string().min(5, 'Sunlight tips required'),
    wateringTips: z.string().min(5, 'Watering tips required'),
    soilTips: z.string().min(5, 'Soil tips required'),
    repottingTips: z.string().optional(),
    pestControlTips: z.string().optional(),
    fertilizerTips: z.string().optional(),
    difficulty: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).default('EASY'),
    imageUrl: z.string().url().optional(),
    isPublished: z.boolean().default(true),
  }),
});
