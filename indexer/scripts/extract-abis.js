import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, '../../contracts/out');
const outputDir = path.join(__dirname, '../abis');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Contracts we want to extract ABIs for
const contracts = [
  'ProjectFactory',
  'DirectPool',
  'BondingCurve',
  'ERC20Token',
];

contracts.forEach(contractName => {
  try {
    const contractPath = path.join(contractsDir, `${contractName}.sol`, `${contractName}.json`);
    
    if (fs.existsSync(contractPath)) {
      const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      const abi = contractData.abi;
      
      // Create TypeScript file with exported ABI constant
      const tsContent = `export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)} as const;
`;
      
      const outputPath = path.join(outputDir, `${contractName}ABI.ts`);
      fs.writeFileSync(outputPath, tsContent);
      
      console.log(`✅ Extracted ABI for ${contractName}`);
    } else {
      console.log(`❌ Contract file not found: ${contractName}`);
    }
  } catch (error) {
    console.error(`Error processing ${contractName}:`, error.message);
  }
});

// Create index file for easier imports
const indexContent = `// Auto-generated ABI exports
${contracts.map(name => `export { ${name}ABI } from './${name}ABI.js';`).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
console.log('✅ Created index.ts for ABI exports');