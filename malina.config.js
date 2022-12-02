const fs = require('fs');
const path = require('path');

require('./autoroute')(process.argv.includes('-w'));

module.exports = function (option, filename) {
   let dirname = filename.replace(/[^\\\/]+$/, '');
   option.hideLabel = true;
   option.css = false;
   option.extension = ['html', 'ma', 'xht', 'svg'];
   option.autoimport = (name) => {
      let search = [
         `./${name}.xht`,
         `../${name}.xht`,
         `components/${name}.xht`,
         `routes/${name}.xht`,
         `modules/${name}.xht`,
      ];
      for (let i = 0; i < search.length; i++)
         if (fs.existsSync(path.join(dirname, search[i])))
            return `import ${name} from '${search[i]}';`;
   };
   return option;
};
