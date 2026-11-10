# albumpeel-site

Static homepage of AlbumPeel, served at **https://albumpeel.xcolorrip.com/** by the Cloudflare Worker `albumpeel`
(static assets, see `wrangler.jsonc`). This repository holds ONLY the website (the installer download goes to
GitHub Releases). The program source code is NOT here. The XColorRIP site lives in its own repository and Worker.

```
albumpeel-site/
├─ public/                         <- the Worker serves ONLY this folder; it is the root of albumpeel.xcolorrip.com
│  ├─ index.html                   language picker; redirects by browser language to ko/ or en/ (add ?pick to stay)
│  ├─ ko/  en/                     pages: index (one-page home), policy, guide, download, news, blog, qa, terms
│  ├─ img/  style.css  blogfeed.js pictures, style, Blogger feed reader
│  ├─ _headers  _redirects         headers (noindex until launch); old /albumpeel/... addresses -> new root
│  └─ 404.html  robots.txt  sitemap.xml
├─ wrangler.jsonc                  Worker name and assets folder
├─ update_from_main.bat            copies a new build from the AlbumPeel project into public\
├─ README.md  LICENSE  .gitignore
```

## Update the site
1. In the AlbumPeel project: `python docs\marketing\site\build_site.py`
2. Run `update_from_main.bat`
3. `git add -A && git commit -m "update site" && git push` - Cloudflare deploys by itself (about a minute).

## Notes
- All page links are relative, so the folder works under any path.
- A single file on Cloudflare must be 25 MiB or smaller: do NOT put the installer here. Upload it to GitHub Releases and link it.
- Pre-launch: `_headers` sends `X-Robots-Tag: noindex, nofollow` and `robots.txt` disallows everything. Remove both when the site is made public, and then add the Sitemap line to `robots.txt`.
- Placeholders still in the pages: PayPal payment link, legal review of the terms.
