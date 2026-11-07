import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844})
        pg = await ctx.new_page()
        await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file://') else r.abort())
        await pg.goto('file:///home/claude/break/dist/break-studio.html')
        await pg.wait_for_timeout(800)
        for t in ['estilo','modulos','carta','datos','publicar']:
            await pg.click(f'[data-a="tab"][data-t="{t}"]')
            await pg.wait_for_timeout(200)
            r = await pg.evaluate('''() => { const W = document.documentElement.clientWidth; const out = [];
              document.querySelectorAll('.editor *').forEach(el => { const b = el.getBoundingClientRect(); if (b.right > W + 0.5 && b.width) out.push(el.tagName + '.' + (el.className||'').toString().split(' ').join('.') + ' r=' + Math.round(b.right) + ' w=' + Math.round(b.width)); });
              return [document.documentElement.scrollWidth - W, out.slice(0,6)]; }''')
            print(t, r)
        await b.close()
asyncio.run(main())
