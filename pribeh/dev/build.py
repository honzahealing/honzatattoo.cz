"""Slozi pribeh.html + pribeh/*.css/*.js do jednoho souboru (pro nahled jako artefakt).
python3 pribeh/dev/build.py <vystup.html> [--artifact]   --artifact: bez <html>/<head>/<body>, odkazy na honzatattoo.cz"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
html = (root / 'pribeh.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="(pribeh/[^"]+)">', lambda m: '<style>\n' + (root / m.group(1)).read_text() + '\n</style>', html)
html = re.sub(r'<script src="(pribeh/[^"]+)"></script>', lambda m: '<script>\n' + (root / m.group(1)).read_text().replace('</script', '<\\/script') + '\n</script>', html)
if '--artifact' in sys.argv:
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
    body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
    html = (head + body).replace('href="index.html#contact"', 'href="https://honzatattoo.cz/#contact"').replace('href="index.html"', 'href="https://honzatattoo.cz/"')
pathlib.Path(sys.argv[1]).write_text(html)
print(sys.argv[1], len(html) // 1024, 'kB')
