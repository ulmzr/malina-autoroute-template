const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

module.exports = function (watch) {
   if (!watch) return;

   let routeDir = path.join(process.cwd(), 'src', 'routes');
   let obj = {};

   const capitalize = (str) => {
      if (!str) return '';
      let words = str.replaceAll('/', ' ').trim().split(' ');
      return words
         .map((word) => {
            return word[0].toUpperCase() + word.substring(1);
         })
         .join(' ')
         .replaceAll(' ', '');
   };

   const ready = () => {
      let scripts = `<script>import {Route} from 'malinajs-router';/**/import E404 from 'modules/E404.xht';</script>`;
      let str = ``;
      for (const [key, value] of Object.entries(obj)) {
         str += `import ${key} from './${value[0]}';`;
      }
      scripts = scripts.replaceAll('/**/', str);
      str = '';
      let routes = `<Route><!--><Route fallback><E404/></></>`;
      for (const [key, value] of Object.entries(obj)) {
         str += `<Route path='${value[1]}'><${key}/></>`;
         if (value[1] !== '/') {
            str += `<Route path='${value[1]}/:slug'>{#slot params}<${key} {params}/>{/slot}</>`;
         }
      }
      routes = routes.replaceAll('<!-->', str);
      fs.writeFileSync(
         path.join(routeDir, '..', 'Router.xht'),
         scripts + routes
      );
   };

   const getRoute = (dirPath) =>
      dirPath.replaceAll(routeDir, '').replaceAll('\\', '/');

   const dirAdded = (dirPath) => {
      let indexContent = `<script>\n\texport let params = {};\n\tlet slug;\n\t$: params, slug = params.slug;\n</script>\n\n{#if slug}\n\t<Slug/>\n{:else}\n\t<Page/>\n{/if}\n`;
      let route = getRoute(dirPath);
      let cmpName = capitalize(route) === '' ? 'Home' : capitalize(route);
      let cmpPath = path
         .join('routes', dirPath.replace(routeDir, ''), 'Index.xht')
         .replaceAll('\\', '/');
      obj[cmpName] = [cmpPath, route || '/'];
      if (!fs.existsSync(path.join(dirPath, 'Index.xht')))
         fs.writeFileSync(path.join(dirPath, 'Index.xht'), indexContent);
      let pageContent = `<h1>${cmpName}-page title</h1>\n<p>Content of ${cmpName}-Page</p>\n`;
      let slugContent = `<h1>${cmpName}-slug title</h1>\n<p>Content of ${cmpName}-Slug</p>\n`;
      if (route && !fs.existsSync(path.join(dirPath, 'Page.xht')))
         fs.writeFileSync(path.join(dirPath, 'Page.xht'), pageContent);
      if (route && !fs.existsSync(path.join(dirPath, 'Slug.xht')))
         fs.writeFileSync(path.join(dirPath, 'Slug.xht'), slugContent);
      ready();
   };

   const dirRemove = (dirPath) => {
      let route = getRoute(dirPath);
      let cmpName = capitalize(route) === '' ? 'Home' : capitalize(route);
      delete obj[cmpName];
      ready();
   };

   const watcher = chokidar.watch(routeDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
   });

   watcher
      .on('addDir', (path) => dirAdded(path))
      .on('unlinkDir', (path) => dirRemove(path));
};
