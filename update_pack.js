const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Step 1 : Read JSON files
const readJSONFiles = (path) => {
  const files = fs.readdirSync(path);
  let jsonFiles = [];

  // loop through all files and directories in the given path
  for (let i = 0; i < files.length; i++) {
    const filePath = path + '/' + files[i];
    const fileStat = fs.statSync(filePath);

    // if the current file is a directory, recursively read its JSON files
    if (fileStat.isDirectory()) {
      jsonFiles = jsonFiles.concat(readJSONFiles(filePath));
    } else if (filePath.endsWith('.json')) {
      // if the current file is a JSON file, add it to the array
      jsonFiles.push(filePath);
    }
  }

  return jsonFiles;
};

// Step 2 : Check if the JSON file is valid
const isValidJSON = (json) => {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

// Step 3 : Convert to LANG
const convertToLANGFormat = (json) => {
  let langString = '';
  const jsonObject = JSON.parse(json);

  for (const key in jsonObject) {
    // replace any occurrence of \n with \\n to preserve the newline symbol
    const value = jsonObject[key].replace(/\n/g, '\\n');
    langString += `${key}=${value}\n`;
  }

  return langString;
};

// Step 4 : Merge LANG files
const mergeLANGFiles = (langFiles) => {
  let mergedLangString = '';

  for (let i = 0; i < langFiles.length; i++) {
    const json = fs.readFileSync(langFiles[i], 'utf8');
    if (isValidJSON(json)) {
      mergedLangString += convertToLANGFormat(json);
    }
  }

  return mergedLangString;
};

// Step 5 : Merge Pack Data LANG files
const mergeWithPackDataLANGFile = (mergedLangString, packDataLANGFile) => {
  const packDataLANG = fs.readFileSync(packDataLANGFile, 'utf8');
  return `${mergedLangString}\n${packDataLANG}`;
};

// Step 6 : Setting Directories
const zhCNDirectories = ['zh-CN/maps', 'zh-CN/mods_addons', 'zh-CN/vanilla', 'zh-CN/chemistry'];
const zhHKDirectories = ['zh-HK/maps', 'zh-HK/mods_addons', 'zh-HK/vanilla', 'zh-HK/chemistry'];
const zhTWDirectories = ['zh-TW/maps', 'zh-TW/mods_addons', 'zh-TW/vanilla', 'zh-TW/chemistry'];

// use the readJSONFiles function to get the array of JSON files for each language
const zhCNJSONFiles = zhCNDirectories.map((dir) => readJSONFiles(dir)).flat();
const zhHKJSONFiles = zhHKDirectories.map((dir) => readJSONFiles(dir)).flat();
const zhTWJSONFiles = zhTWDirectories.map((dir) => readJSONFiles(dir)).flat();

// Step 7 : 
const zhCNMergedLangString = mergeLANGFiles(zhCNJSONFiles);
const zhHKMergedLangString = mergeLANGFiles(zhHKJSONFiles);
const zhTWMergedLangString = mergeLANGFiles(zhTWJSONFiles);

// Step 8
const zhCNMergedLangWithPackData = mergeWithPackDataLANGFile(zhCNMergedLangString, 'pack_data/zh_CN.lang');
const zhHKMergedLangWithPackData = mergeWithPackDataLANGFile(zhHKMergedLangString, 'pack_data/zh_HK.lang');
const zhTWMergedLangWithPackData = mergeWithPackDataLANGFile(zhTWMergedLangString, 'pack_data/zh_TW.lang');

// Step 9
fs.writeFileSync('resources/texts/zh_CN.lang', zhCNMergedLangWithPackData);
fs.writeFileSync('resources/subpacks/zh_HK/texts/zh_TW.lang', zhHKMergedLangWithPackData);
fs.writeFileSync('resources/texts/zh_TW.lang', zhTWMergedLangWithPackData);

// Step 10
const manifest = JSON.parse(fs.readFileSync('resources/manifest.json', 'utf8'));

// Step 11
manifest.header.uuid = uuidv4();
manifest.modules[0].uuid = uuidv4();

// Step 12
// increase the version number by 1
const increaseVersion = (version) => {
  if (version[2] < 9) {
    version[2]++;
  } else {
    version[2] = 0;
    if (version[1] < 9) {
      version[1]++;
    } else {
      version[1] = 0;
      version[0]++;
    }
  }
};

increaseVersion(manifest.header.version);
increaseVersion(manifest.modules[0].version);

fs.writeFileSync('resources/manifest.json', JSON.stringify(manifest, null, 2));

fs.copyFileSync('pack_data/en_US.lang', 'resources/texts/en_US.lang');