const fs = require('fs');
const path = require('path');

function readDirRecursive(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            readDirRecursive(filePath, filelist);
        } else if (
            file.endsWith('.js') ||
            file.endsWith('.jsx') ||
            file.endsWith('.ts') ||
            file.endsWith('.tsx')
        ) {
            filelist.push(filePath);
        }
    });
    return filelist;
}

function extractCode(srcDir, outFile) {
    let allCode = '';
    readDirRecursive(srcDir).forEach(filePath => {
        allCode += `\n----- ${filePath} -----\n\n`;
        allCode += fs.readFileSync(filePath, 'utf8');
        allCode += `\n\n`;
    });
    fs.writeFileSync(outFile, allCode);
    console.log(`Svi fajlovi iz ${srcDir} su izvučeni u ${outFile}`);
}

extractCode('./server/src', './server.txt');
extractCode('./client/src', './client.txt');
