const fs = require('fs');
const byline = require('byline');
const jsonfile = require('jsonfile');
const util = require('util');
const writeFile = util.promisify(jsonfile.writeFile);

function readLines(filenamePath) {
  return new Promise(function(resolve,reject){
    const input = fs.createReadStream(filenamePath,{ encoding: 'utf8' });
    stream = byline.createStream(input);
    const list = [];

    stream.on('data', function(data) {
      const line = data.trim();
      if(goodLine(line)){
        list.push(line);
      }
    });

    stream.on('end', function() {
      input.close();
      resolve(list);
    });
    stream.on('error', function(err){
      reject(err);
    })
  })
};

function goodLine(str) {
  return /(APELLIDOS|CARGO|€|[A-Z]+)/i.test(str) && !/(boe|BOE|BOLET|Núm|PERSONALES|IMPORTE|Incluye)/.test(str);
}

function classifier (list) {
  const [name,position,...data] = list;
   return {
    name : name.split(":")[1].split(",").reverse().join("").trim(),
    position : position.split(":")[1].trim(),
    data : moneyConcepts(data)

  }
}

function moneyConcepts(list) {
  return list.reduce((old,cur,i,arr) => {
    if (old.lastGap !== i ) {
      const val = cur.trim().replace(/ +/g, " ");

      if (/pasivo/i.test(cur)) {
        old.passive.push(val);
      } else {
        if(/^[a-z](.+)€$/i.test(cur)) {
          old.active.push(val);
        } else {
         // Skip header text
         if(!/ACTIVO/.test(cur)) {
           if (!/€$/.test(old.active[old.active.length -1])) {
             old.active.push(`${/ACTIVO/.test(arr[i-1]) ? "" : arr[i-1]} ${val} ${/PASIVO/i.test(arr[i+1]) ? "" : arr[i+1]}`.trim().replace(/ +/g, " "));
           } else {
             old.active.push(`${val} ${/PASIVO/i.test(arr[i+1]) ? "" : arr[i+1]}`.trim().replace(/ +/g, " "));
           }

           old.lastGap = !/pasivo/i.test(arr[i+1]) ? i+1 : i;
         }
        }
      }
    }

    return old;
  },{ passive : [], active : [], lastGap: null})
}

(async (FILENAME) => {
  console.log(`Processing [${FILENAME}]`);
  const arr = await readLines(`./data/${FILENAME}`);
  if (arr.length < 3) {
    // There is a problem with the source file
    console.log(`source file failed : ./data/${FILENAME}`);
  } else {
    const classified = classifier(arr);
    await writeFile(`./parsed/${FILENAME}.json`,classified, { spaces: 2 });
  }

})(process.argv[2]);
