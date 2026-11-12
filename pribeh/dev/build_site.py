"""Slozi web: preview.html + pribeh na zacatku (pred filmem s andelem).
python3 pribeh/dev/build_site.py <vystup.html> [--inline] [--artifact]
  bez --inline: odkazy na pribeh/*.js (soubor do korene repa)
  --inline:     JS i CSS vlozene do stranky
  --artifact:   bez <html>/<head>/<body> obalu (pro nahled jako artefakt)"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
prev = (root / 'preview.html').read_text()
story = (root / 'pribeh.html').read_text()
inline = '--inline' in sys.argv or '--artifact' in sys.argv

css = (root / 'pribeh/style.css').read_text()
css = css.replace(':root{', '#story{', 1)
for rule in [r'\*\{margin:0;padding:0;box-sizing:border-box\}', r'\nhtml\{[^}]*\}', r'\nbody\{[^}]*\}', r'\na\{color:inherit\}']:
    css = re.sub(rule, '', css, count=1)
css += '''
/* napojeni na web */
#story{background:transparent;color:var(--line)}
#story *{box-sizing:border-box}
#hero{position:relative;z-index:1}
#nb,.announce-bar{transition:opacity .5s}
.in-story #sticky-cta,.in-story #btt,.in-story #scroll-progress{opacity:0!important;pointer-events:none!important}
#sticky-cta,#btt,#scroll-progress{transition:opacity .5s}
#hero{background:#0C0F14}
#hero::before{content:'';position:absolute;left:0;right:0;bottom:100%;height:40vh;background:#0C0F14;pointer-events:none}
/* horni lista webu je videt uz behem pribehu (pri predani do filmu se nahore nic nemeni); z hlavicky pribehu zustava jen tlacitko zvuku vpravo dole */
#story .top{top:auto;bottom:calc(90px + env(safe-area-inset-bottom,0px));left:auto;right:16px;padding:0}
#story .top::before{display:none}
#story .top .logo,#story .top .top-cta{display:none}
#story .top .snd{background:rgba(12,15,20,.78);padding:9px 14px;border-radius:22px;margin:0;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
'''
mark = re.search(r'<section class="story" id="story".*?</section>\s*<!--[^>]*-->\s*<section class="sr".*?</section>', story, re.S).group(0)
mark = mark.replace('href="index.html#contact"', 'href="#contact"').replace('href="index.html"', 'href="#hero"')
fonts = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">\n'
mods = ['core', 'street', 'studio', 'doors', 'facade', 'close', 'chars', 'audio']
if inline:
    js = ''.join('<script>\n' + (root / f'pribeh/{m}.js').read_text().replace('</script', '<\\/script') + '\n</script>\n' for m in mods)
else:
    js = ''.join(f'<script src="pribeh/{m}.js"></script>\n' for m in mods)
js += '<script>ST.start();</script>\n'

out = prev
out = out.replace('</head>', fonts + '<style>\n' + css + '\n</style>\n</head>', 1)
out = out.replace('<section class="scrolly" id="hero">', mark + '\n\n<section class="scrolly" id="hero">', 1)
out = re.sub(r'<body([^>]*)>', lambda m: '<body' + (m.group(1) if 'class=' in m.group(1) else m.group(1) + ' class="in-story"') + '>', out, count=1)
out = out.replace('</body>', js + '</body>', 1)
if inline:
    out = re.sub(r'<link rel="stylesheet" href="scrolly\.css[^"]*">', lambda m: '<style>\n' + (root / 'scrolly.css').read_text() + '\n</style>', out)
    out = re.sub(r'<script src="scrolly\.js[^"]*"></script>', lambda m: '<script>\n' + (root / 'scrolly.js').read_text() + '\n</script>', out)
if '--artifact' in sys.argv:
    head = re.search(r'<head>(.*?)</head>', out, re.S).group(1)
    head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
    body = re.search(r'<body[^>]*>(.*)</body>', out, re.S).group(1)
    out = head + body
pathlib.Path(sys.argv[1]).write_text(out)
print(sys.argv[1], len(out) // 1024, 'kB')
