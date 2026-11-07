// Genera las tres apps exportadas con el mismo código del estudio, para revisarlas en Chrome.
const { JSDOM, VirtualConsole } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync('dist/break-studio.html', 'utf8');
const vc = new VirtualConsole();
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://claude.ai/a', virtualConsole: vc, beforeParse(w) { w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} }); w.scrollTo = () => {}; } });
setTimeout(() => {
  const w = dom.window, S = w.__breakStudio;
  for (const t of w.eval('TEMPLATES')) fs.writeFileSync('dist/demo-' + t.id.replace('tpl-', '') + '.html', S.buildAppHTML(t, {}));
  console.log(fs.readdirSync('dist').join(' '));
  w.close(); process.exit(0);
}, 300);
