@echo off
rem Copies the built homepage from the AlbumPeel project into this repository (public\albumpeel folder).
rem 1) in D:\zwork\dev\PhotoScan\docs\marketing\site run:  python build_site.py
rem 2) run this file, then commit and push (Cloudflare Pages publishes it by itself)
set SRC=D:\zwork\dev\PhotoScan\docs\marketing\site
set DST=%~dp0public\albumpeel
robocopy "%SRC%\ko" "%DST%\ko" /MIR /NFL /NDL /NJH /NJS
robocopy "%SRC%\en" "%DST%\en" /MIR /NFL /NDL /NJH /NJS
robocopy "%SRC%\img" "%DST%\img" /MIR /NFL /NDL /NJH /NJS
copy /Y "%SRC%\style.css" "%DST%\style.css" >nul
copy /Y "%SRC%\index.html" "%DST%\index.html" >nul
copy /Y "%SRC%\blogfeed.js" "%DST%\blogfeed.js" >nul
echo done. Now: git add -A ^&^& git commit -m "update site" ^&^& git push
