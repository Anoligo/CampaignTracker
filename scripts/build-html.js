import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveTemplate(p) {
    return path.join(__dirname, '..', 'templates', p);
}

function processIncludes(content) {
    const includeRegex = /<!--\s*include:(.*?)\s*-->/g;
    return content.replace(includeRegex, (_, includePath) => {
        const file = resolveTemplate(includePath.trim());
        if (!fs.existsSync(file)) {
            throw new Error(`Included file not found: ${file}`);
        }
        const included = fs.readFileSync(file, 'utf8');
        return processIncludes(included); // recursive includes
    });
}

function build() {
    const templatePath = path.join(__dirname, '..', 'index.html');
    let content = fs.readFileSync(templatePath, 'utf8');
    content = processIncludes(content);
    const outputPath = path.join(__dirname, '..', 'dist', 'index.html');
    fs.writeFileSync(outputPath, content);
    console.log('dist/index.html built successfully');
}

build();
