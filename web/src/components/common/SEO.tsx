import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "RJ Flowers | Bloom Patch & Flower Nursery in Pokhara";
const DEFAULT_DESCRIPTION =
  "RJ Flowers is Pokhara's premier flower shop and plant nursery at Arghau Chowk. Discover fresh floral bouquets, indoor plants, and garden supplies through our Bloom Patch collection with delivery across Pokhara.";
const DEFAULT_KEYWORDS =
  "RJ Flowers, RJ Flowers Pokhara, Flower shop Pokhara, Flower nursery Pokhara, Bloom Patch, Bloom Patch Pokhara, buy plants Pokhara, flower delivery Pokhara";
const DEFAULT_IMAGE = "/the-bloom-patch-logo.png";
const SITE_NAME = "RJ Flowers & Nursery — Bloom Patch Pokhara";

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  structuredData,
  noIndex = false,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Set Document Title
    const finalTitle = title ? `${title}` : DEFAULT_TITLE;
    document.title = finalTitle;

    // Helper: set or update meta tag by name or property
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMetaTag('name', 'geo.region', 'NP-GA');
    setMetaTag('name', 'geo.placename', 'Pokhara');
    setMetaTag('name', 'geo.position', '28.2365;84.0036');
    setMetaTag('name', 'ICBM', '28.2365, 84.0036');

    // 3. Open Graph Metadata
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://rjflowers.com';
    const finalCanonical = canonical || `${currentOrigin}${location.pathname}`;

    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:locale', 'en_US');

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonical);

    // 6. Structured Data (JSON-LD)
    const jsonLdId = 'rj-seo-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement;

    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = jsonLdId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up structured data on unmount if needed
      const oldScript = document.getElementById(jsonLdId);
      if (oldScript) oldScript.remove();
    };
  }, [title, description, keywords, canonical, ogType, ogImage, structuredData, noIndex, location.pathname]);

  return null;
};
