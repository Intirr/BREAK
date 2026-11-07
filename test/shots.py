import asyncio, os, re, urllib.parse, glob
from playwright.async_api import async_playwright
ROOT = '/home/claude/break'
FS = ROOT + '/node_modules/@fontsource'
OUT = '/tmp/claude-0/-home-claude/b0ceada6-349a-5478-be03-18a4870ee75e/scratchpad'
os.makedirs(OUT, exist_ok=True)
def css_for(url):
    q = urllib.parse.urlparse(url).query
    fams = [urllib.parse.unquote_plus(v.split(':')[0]) for k, v in urllib.parse.parse_qsl(q, keep_blank_values=True) if k == 'family']
    out = []
    for fam in fams:
        pkg = fam.lower().replace(' ', '-')
        for f in glob.glob(f'{FS}/{pkg}/files/{pkg}-latin-*.woff2'):
            m = re.search(r'-latin-(\d+)-(normal|italic)\.woff2$', f)
            if not m or '-ext-' in f: continue
            out.append(f"@font-face{{font-family:'{fam}';font-style:{m.group(2)};font-weight:{m.group(1)};font-display:swap;src:url(https://fonts.gstatic.com/local/{pkg}/{os.path.basename(f)}) format('woff2')}}")
    return '\n'.join(out)
async def route(r):
    u = r.request.url
    if u.startswith('https://fonts.googleapis.com/css2'):
        return await r.fulfill(status=200, content_type='text/css', body=css_for(u))
    if u.startswith('https://fonts.gstatic.com/local/'):
        pkg, name = u.split('/local/')[1].split('/')
        return await r.fulfill(status=200, content_type='font/woff2', body=open(f'{FS}/{pkg}/files/{name}', 'rb').read())
    if u.startswith('file://') or u.startswith('data:') or u.startswith('about:'):
        return await r.continue_()
    return await r.abort()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs = []
        async def shot(url, name, w, h, full=False, scheme='light', prep=None, clip_h=None):
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, color_scheme=scheme)
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(f'{name}: {e}'))
            pg.on('console', lambda m: errs.append(f'{name} console: {m.text}') if m.type == 'error' and 'net::' not in m.text and 'Failed to load resource' not in m.text else None)
            await pg.route('**/*', route)
            await pg.goto(url)
            await pg.wait_for_timeout(1400)
            if prep: await prep(pg); await pg.wait_for_timeout(900)
            kw = {'path': f'{OUT}/{name}.png', 'full_page': full}
            if clip_h: kw = {'path': f'{OUT}/{name}.png', 'full_page': True, 'clip': {'x': 0, 'y': 0, 'width': w, 'height': clip_h}}
            await pg.screenshot(**kw)
            ov = await pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if ov > 0: errs.append(f'{name}: desborde horizontal de {ov}px')
            await ctx.close()
        studio = 'file://' + ROOT + '/dist/break-studio.html'
        await shot(studio, 'studio-desktop', 1360, 900)
        async def to_modules(pg):
            await pg.click('[data-a="tab"][data-t="modulos"]'); await pg.click('[data-a="mod-open"][data-mid="carta"]')
        await shot(studio, 'studio-desktop-dark-modulos', 1360, 900, scheme='dark', prep=to_modules)
        await shot(studio, 'studio-mobile-vista', 390, 844)
        async def m_estilo(pg): await pg.click('[data-a="tab"][data-t="estilo"]')
        await shot(studio, 'studio-mobile-estilo', 390, 844, full=True, prep=m_estilo, clip_h=1700)
        for n in ['araucaria', 'antojo', 'zocalo']:
            await shot('file://' + ROOT + f'/dist/demo-{n}.html', f'app-{n}', 390, 844, clip_h=3600)
        await b.close()
        print('\n'.join(errs) if errs else 'sin errores ni desbordes')
asyncio.run(main())
