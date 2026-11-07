// Une las piezas en un solo HTML publicable y revisa que el script sea seguro de incrustar.
const fs = require('fs');
const path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');

const js = ['runtime.js', 'templates.js', 'catalog.js', 'studio.js'].map(src).join('\n\n');
const css = src('studio.css');
const page = src('page.html').replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);

const problems = [];
if (/<\/script/i.test(js)) problems.push('el JS contiene </script');
if (/<!--/.test(js)) problems.push('el JS contiene <!--');
const runtime = src('runtime.js');
if (/`[^`]*<\/script/i.test(runtime)) problems.push('el motor contiene </script');
try { new Function(js); } catch (e) { problems.push('error de sintaxis: ' + e.message); }
if (problems.length) { console.error('BUILD FALLÓ:\n - ' + problems.join('\n - ')); process.exit(1); }

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'break-studio.html'), page);
console.log('dist/break-studio.html', (Buffer.byteLength(page) / 1024).toFixed(1) + ' KB', '· JS', (Buffer.byteLength(js) / 1024).toFixed(1) + ' KB');
