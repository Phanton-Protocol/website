import { useEffect } from 'react';

function upsertMetaByName(name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertTwitterMeta(name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const DEFAULT_OG_IMAGE = 'https://phantomproto.com/favicon.jpg';

const SeoHead = ({ title, description, path = '/', robots }) => {
  useEffect(() => {
    const baseUrl = 'https://phantomproto.com';
    const canonical =
      path === '/' || !path
        ? `${baseUrl}/`
        : `${baseUrl}${String(path).replace(/\/$/, '')}`;

    document.title = title;
    upsertCanonical(canonical);
    if (robots) {
      upsertMetaByName('robots', robots);
    } else {
      upsertMetaByName('robots', 'index, follow, max-image-preview:large');
    }
    upsertMetaByName('description', description);
    upsertMetaByProperty('og:type', 'website');
    upsertMetaByProperty('og:locale', 'en_US');
    upsertMetaByProperty('og:site_name', 'Phantom Protocol');
    upsertMetaByProperty('og:title', title);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:url', canonical);
    upsertMetaByProperty('og:image', DEFAULT_OG_IMAGE);
    upsertMetaByProperty('og:image:alt', title);

    upsertTwitterMeta('twitter:card', 'summary_large_image');
    upsertTwitterMeta('twitter:title', title);
    upsertTwitterMeta('twitter:description', description);
    upsertTwitterMeta('twitter:url', canonical);
    upsertTwitterMeta('twitter:image', DEFAULT_OG_IMAGE);
    upsertTwitterMeta('twitter:image:alt', title);

    const googleToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
    const bingToken = import.meta.env.VITE_BING_SITE_VERIFICATION;
    if (googleToken) upsertMetaByName('google-site-verification', googleToken);
    if (bingToken) upsertMetaByName('msvalidate.01', bingToken);
  }, [title, description, path, robots]);

  return null;
};

export default SeoHead;
