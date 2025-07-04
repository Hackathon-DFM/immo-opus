const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '../../contracts/out');
const outputDir = path.join(__dirname, '../lib/contracts');

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
  'CLOBAdapter',
  'MockUSDC',
];

contracts.forEach(contractName => {
  try {
    const contractPath = path.join(contractsDir, `${contractName}.sol`, `${contractName}.json`);
    
    if (fs.existsSync(contractPath)) {
      const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      const abi = contractData.abi;
      
      // Write ABI to output directory
      const outputPath = path.join(outputDir, `${contractName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
      
      console.log(`✅ Extracted ABI for ${contractName}`);
    } else {
      console.log(`❌ Contract file not found: ${contractName}`);
    }
  } catch (error) {
    console.error(`Error processing ${contractName}:`, error.message);
  }
});

// Create TypeScript definitions
const tsContent = `// Auto-generated contract types
${contracts.map(name => `export { default as ${name}ABI } from './${name}.json';`).join('\n')}

export const contractAddresses = {
  ProjectFactory: process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS || '',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
} as const;
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), tsContent);
console.log('✅ Created TypeScript definitions');