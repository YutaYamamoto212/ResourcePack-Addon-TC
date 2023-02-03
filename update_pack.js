const fs = require('fs');
const { zip } = require('zip-a-folder');
const { v4: uuidv4 } = require('uuid');

// Step 1 : Update version numbers in LANG files
const updatePackDataLANGFiles = (packDataDirectory) => {
  const files = fs.readdirSync(packDataDirectory);

  for (let i = 0; i < files.length; i++) {
    const filePath = packDataDirectory + '/' + files[i];
    const fileStat = fs.statSync(filePath);

    if (filePath.endsWith('.lang')) {
      // read the LANG file
      let langString = fs.readFileSync(filePath, 'utf8');

      // extract all version numbers
      const regex = /\d+\.\d+\.\d+/g;
      let matches;
      while ((matches = regex.exec(langString)) !== null) {
        // split the version number into its components
        const versionComponents = matches[0].split('.').map(Number);

        // increment the last component of the version number
        versionComponents[2]++;

        // if the last component is 10, set it back to 0 and increment the second component
        if (versionComponents[2] === 10) {
          versionComponents[2] = 0;
          versionComponents[1]++;
        }

        // if the second component is 10, set it back to 0 and increment the first component
        if (versionComponents[1] === 10) {
          versionComponents[1] = 0;
          versionComponents[0]++;
        }

        // update the version number in the LANG string
        langString = langString.replace(matches[0], `${versionComponents.join('.')}`);
      }

      // write the updated LANG string back to the file
      fs.writeFileSync(filePath, langString, 'utf8');
    }
  }
};

updatePackDataLANGFiles('pack_data');

// Step 2 : Update version numbers in YAML files
const updateIssueTemplateYAMLFiles = (issueTemplateDirectory) => {
  const files = fs.readdirSync(issueTemplateDirectory);

  for (let i = 0; i < files.length; i++) {
    const filePath = issueTemplateDirectory + '/' + files[i];
    const fileStat = fs.statSync(filePath);

    if (filePath.endsWith('.yaml')) {
      // read the YAML file
      let yamlString = fs.readFileSync(filePath, 'utf8');

      // extract all version numbers
      const regex = /\d+\.\d+\.\d+/g;
      let matches;
      while ((matches = regex.exec(yamlString)) !== null) {
        // split the version number into its components
        const versionComponents = matches[0].split('.').map(Number);

        // increment the last component of the version number
        versionComponents[2]++;

        // if the last component is 10, set it back to 0 and increment the second component
        if (versionComponents[2] === 10) {
          versionComponents[2] = 0;
          versionComponents[1]++;
        }

        // if the second component is 10, set it back to 0 and increment the first component
        if (versionComponents[1] === 10) {
          versionComponents[1] = 0;
          versionComponents[0]++;
        }

        // update the version number in the YAML string
        yamlString = yamlString.replace(matches[0], `${versionComponents.join('.')}`);
      }

      // write the updated YAML string back to the file
      fs.writeFileSync(filePath, yamlString, 'utf8');
    }
  }
};

updateIssueTemplateYAMLFiles('.github/ISSUE_TEMPLATE');

// Step 3 : Read JSON files
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

// Step 4 : Check if the JSON file is valid
const isValidJSON = (json) => {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

// Step 5 : Convert to LANG
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

// Step 6 : Merge LANG files
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

// Step 7 : Merge Pack Data LANG files
const mergeWithPackDataLANGFile = (mergedLangString, packDataLANGFile) => {
  const packDataLANG = fs.readFileSync(packDataLANGFile, 'utf8');
  return `${mergedLangString}\n${packDataLANG}`;
};

// Step 8 : Setting Directories
const zhCNDirectories = ['zh-CN/maps', 'zh-CN/mods_addons', 'zh-CN/vanilla', 'zh-CN/chemistry'];
const zhHKDirectories = ['zh-HK/maps', 'zh-HK/mods_addons', 'zh-HK/vanilla', 'zh-HK/chemistry'];
const zhTWDirectories = ['zh-TW/maps', 'zh-TW/mods_addons', 'zh-TW/vanilla', 'zh-TW/chemistry'];
const lzhDirectories = ['lzh/maps', 'lzh/mods_addons', 'lzh/vanilla', 'lzh/chemistry'];

// use the readJSONFiles function to get the array of JSON files for each language
const zhCNJSONFiles = zhCNDirectories.map((dir) => readJSONFiles(dir)).flat();
const zhHKJSONFiles = zhHKDirectories.map((dir) => readJSONFiles(dir)).flat();
const zhTWJSONFiles = zhTWDirectories.map((dir) => readJSONFiles(dir)).flat();
const lzhJSONFiles = lzhDirectories.map((dir) => readJSONFiles(dir)).flat();

// Step 9 : Merging LANG files for each language
const zhCNMergedLangString = mergeLANGFiles(zhCNJSONFiles);
const zhHKMergedLangString = mergeLANGFiles(zhHKJSONFiles);
const zhTWMergedLangString = mergeLANGFiles(zhTWJSONFiles);
const lzhMergedLangString = mergeLANGFiles(lzhJSONFiles);

// Step 10 : Merging LANG files with pack data
const zhCNMergedLangWithPackData = mergeWithPackDataLANGFile(zhCNMergedLangString, 'pack_data/zh_CN.lang');
const zhHKMergedLangWithPackData = mergeWithPackDataLANGFile(zhHKMergedLangString, 'pack_data/zh_HK.lang');
const zhTWMergedLangWithPackData = mergeWithPackDataLANGFile(zhTWMergedLangString, 'pack_data/zh_TW.lang');
const lzhMergedLangWithPackData = mergeWithPackDataLANGFile(lzhMergedLangString, 'pack_data/lzh.lang');

// Step 11 : Generating output LANG files
fs.writeFileSync('resources/texts/zh_CN.lang', zhCNMergedLangWithPackData);
fs.writeFileSync('resources/subpacks/zh_HK/texts/zh_TW.lang', zhHKMergedLangWithPackData);
fs.writeFileSync('resources/texts/zh_TW.lang', zhTWMergedLangWithPackData);
fs.writeFileSync('resources/subpacks/lzh/texts/zh_TW.lang', lzhMergedLangWithPackData);
fs.copyFileSync('pack_data/en_US.lang', 'resources/texts/en_US.lang');

// Step 12 : Read the manifest.json file
const manifest = JSON.parse(fs.readFileSync('resources/manifest.json', 'utf8'));

// Step 13 : Generate UUIDs for updating
manifest.header.uuid = uuidv4();
manifest.modules[0].uuid = uuidv4();

// Step 14 : Update version numbers in manifest.json files
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

const resourceDirectory = 'resources';

// Step 15 : Read the en_US.lang file to get the version number
const enUsLangPath = `${resourceDirectory}/texts/en_US.lang`;
let version = 'unknown';
if (fs.existsSync(enUsLangPath)) {
  const langString = fs.readFileSync(enUsLangPath, 'utf8');
  const regex = /v\d+\.\d+\.\d+/g;
  const matches = regex.exec(langString);
  if (matches !== null) {
    version = matches[0].slice(1).replace(/\./g, '');
  }
}

// Step 16 : Create the ZIP file
const zipPath = `resourcepack_addon_zh_v${version}.mcpack`;
zip(resourceDirectory, zipPath, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Successfully created ZIP file at ${zipPath}`);
  }
});
