import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../package.json');

export default fs.readJsonSync(packageJsonPath);
