import { QueryClient } from '@tanstack/react-query';

/**
 * Universal cache invalidation helper for RJ Flowers
 * Immediately purges all stale queries across storefront and admin panels
 * whenever a product, price, photo, stock, or status is created/edited/deleted.
 */
export const invalidateAllProductQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['products-catalog-simple'] });
  queryClient.invalidateQueries({ queryKey: ['latest-products'] });
  queryClient.invalidateQueries({ queryKey: ['featured-products'] });
  queryClient.invalidateQueries({ queryKey: ['product'] });
  queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
  queryClient.invalidateQueries({ queryKey: ['admin-inventory-list'] });
  queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] });
  queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
  queryClient.invalidateQueries({ queryKey: ['admin-metrics-full'] });
  queryClient.invalidateQueries({ queryKey: ['admin-inventory-transactions'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['site-settings'] });
};
