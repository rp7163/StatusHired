import { useEffect } from 'react';

/**
 * Hook to dynamically update document title, canonical URL, meta description,
 * and robots directives per route in client-side React.
 *
 * @param {Object} options
 * @param {string} options.title - Page-specific title
 * @param {string} [options.description] - Page meta description
 * @param {string} [options.canonicalPath] - Canonical path e.g. '/' or '/login'
 * @param {string} [options.robots] - Robots directive e.g. 'index, follow' or 'noindex, nofollow'
 */
export function useDocumentTitle(titleOrOptions) {
  useEffect(() => {
    let title = '';
    let description = '';
    let canonicalPath = '';
    let robots = '';

    if (typeof titleOrOptions === 'string') {
      title = titleOrOptions;
    } else if (titleOrOptions && typeof titleOrOptions === 'object') {
      title = titleOrOptions.title || '';
      description = titleOrOptions.description || '';
      canonicalPath = titleOrOptions.canonicalPath || '';
      robots = titleOrOptions.robots || '';
    }

    // 1. Update Title
    if (title) {
      document.title = title.includes('StatusHired') ? title : `StatusHired · ${title}`;
    } else {
      document.title = 'StatusHired - Job Application Tracker & Career Pipeline Manager';
    }

    // 2. Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Update Canonical Link
    if (canonicalPath) {
      const canonicalOrigin = 'https://status-hired.vercel.app';
      const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
      const canonicalUrl = cleanPath === '/' ? `${canonicalOrigin}/` : `${canonicalOrigin}${cleanPath}`;

      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    // 4. Update Robots Meta
    if (robots) {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', robots);
    }
  }, [
    typeof titleOrOptions === 'string' ? titleOrOptions : JSON.stringify(titleOrOptions),
  ]);
}
