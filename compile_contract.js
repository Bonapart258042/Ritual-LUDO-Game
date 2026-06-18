import fs from 'fs';
import solc from 'solc';

try {
  console.log('Starting Solidity compilation...');
  const source = fs.readFileSync('./src/contracts/LudoVictoryRegistrar.sol', 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'LudoVictoryRegistrar.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    output.errors.forEach((err) => {
      if (err.severity === 'error') {
        hasError = true;
        console.error('ERROR:', err.formattedMessage);
      } else {
        console.warn('WARNING:', err.formattedMessage);
      }
    });
    if (hasError) {
      process.exit(1);
    }
  }

  const contract = output.contracts['LudoVictoryRegistrar.sol']['LudoVictoryRegistrar'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log('EVM Bytecode size:', bytecode.length, 'characters');
  
  const result = {
    abi,
    bytecode: '0x' + bytecode
  };

  fs.writeFileSync('./src/utils/contractData.json', JSON.stringify(result, null, 2));
  console.log('COMPILATION SUCCESSFUL! Results written to ./src/utils/contractData.json');
} catch (err) {
  console.error('Compilation failed with exception:', err);
  process.exit(1);
}
