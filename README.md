# albumpeel-site

Static homepage of AlbumPeel (published with Cloudflare Pages). This repository holds ONLY the website and the
installer downloads (GitHub Releases). The program source code is NOT here.

```
albumpeel-site/
├─ index.html            company front page (placeholder), links to /albumpeel/
├─ albumpeel/            the AlbumPeel site  ->  https://<domain>/albumpeel/
│  ├─ index.html         language picker (ko / en)
│  ├─ ko/  en/           pages: index (one-page home), policy (purchase & license), guide, blog, board, terms, download
│  ├─ img/               pictures
│  └─ style.css
├─ _headers              cache headers (Cloudflare Pages)
├─ _redirects            /albumpeel -> /albumpeel/
├─ 404.html  robots.txt  sitemap.xml
└─ update_from_main.bat  copies a new build from the AlbumPeel project into publiclbumpeel\
```

## Update the site
1. In the AlbumPeel project: `python docs\marketing\site\build_site.py`
2. Run `update_from_main.bat`
3. `git add -A && git commit -m "update site" && git push` — Cloudflare Pages deploys by itself (about a minute).

## Cloudflare Pages settings
- Framework preset: None, Build command: (empty), Build output directory: `public`
- Custom domain: add it in the Pages dashboard FIRST, then DNS.

## Notes
- All links in the pages are relative, so the folder works under any path.
- A single file on Cloudflare Pages must be 25 MiB or smaller: do NOT put the installer here. Upload it to GitHub Releases and link it.
- Placeholders still in the pages: download link, SHA-256, PayPal payment link, legal review of the terms.
