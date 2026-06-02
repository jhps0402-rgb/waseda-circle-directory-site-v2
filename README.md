# Waseda Circle Directory

Public beta build of the Waseda Circle Directory static site.

This repository contains only the files needed to preview the website:

```text
index.html
style.css
script.js
data/raw/official_latest_all_link_checked.csv
```

The source data is based on the Waseda University Official Circles Guide:

```text
https://www.waseda.jp/inst/weekly/circleguide/?lng=en
```

## Local Preview

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8080/
```
