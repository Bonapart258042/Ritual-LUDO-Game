import { encodeVictoryCalldata } from './src/utils/web3';
import { LUDO_REGISTRAR_ABI } from './src/utils/contractData';

function runDiagnostics() {
  console.log('====================================');
  console.log('   LUDO CONTRACT PREFLIGHT TESTER   ');
  console.log('====================================\n');

  // Test 1: Verify registerLudoVictory ABI items
  console.log('Test 1: Verification of registerLudoVictory ABI Signature...');
  const methodAbi = LUDO_REGISTRAR_ABI.find(item => item.name === 'registerLudoVictory');
  if (methodAbi) {
    console.log('✓ Found method "registerLudoVictory" in compiled ABI JSON.');
    console.log('  Inputs expected:', methodAbi.inputs.map(i => `${i.name} (${i.type})`).join(', '));
  } else {
    console.error('✗ ERROR: registerLudoVictory not found in ABI!');
    process.exit(1);
  }

  // Test 2: Verify custom encoder selector
  console.log('\nTest 2: Verifying Selector and parameter pack compilation...');
  const testWinner = 'Cosmic Emperor';
  const testMoves = 42;
  const testDuration = 600;

  const calldata = encodeVictoryCalldata(testWinner, testMoves, testDuration);
  console.log(`  Dummy Winner Name: "${testWinner}"`);
  console.log(`  Dummy Moves Count: ${testMoves}`);
  console.log(`  Dummy Duration     : ${testDuration}s`);
  console.log(`\n  Generated Calldata: ${calldata}`);

  console.log('\nAnalyzing Segment Slots:');
  const selector = calldata.substring(0, 10);
  console.log(`  Method Selector      : ${selector} (Expected: 0xcdd6df10)`);
  
  if (selector !== '0xcdd6df10') {
    console.error('✗ ERROR: Method selector mismatches EVM signature!');
    process.exit(1);
  } else {
    console.log('  ✓ Method selector is perfectly correct (registerLudoVictory(string,uint32,uint32))!');
  }

  // Slice individual slot parameters (32 bytes = 64 characters hex per slot)
  const paramsPart = calldata.substring(10);
  const slots = paramsPart.match(/.{1,64}/g) || [];
  slots.forEach((slot, idx) => {
    console.log(`  Slot ${idx.toString().padStart(2, ' ')} (0x${(idx * 32).toString(16).padStart(2, '0')}): ${slot}`);
  });

  console.log('\n✓ Segment 0 (Offset pointer to string):', slots[0] || 'NONE');
  console.log('✓ Segment 1 (Moves count uint32)      :', slots[1] || 'NONE');
  console.log('✓ Segment 2 (Duration uint32)         :', slots[2] || 'NONE');
  console.log('✓ Segment 3 (String content length)   :', slots[3] || 'NONE');
  console.log('✓ Segment 4 (String content hex)      :', slots[4] || 'NONE');

  // Test 3: Structural calldata validation test
  console.log('\nTest 3: Calldata Integrity Guard Check...');
  if (!calldata.startsWith('0x')) {
    console.error('✗ ERROR: Compiled calldata is missing the required "0x" prefix!');
    process.exit(1);
  }
  if (calldata.startsWith('0x0x')) {
    console.error('✗ ERROR: Double "0x" prefix detected on calldata output!');
    process.exit(1);
  }
  console.log('✓ Calldata passed prefix structural integrity check.');

  console.log('\n====================================');
  console.log('   ALL DIAGNOSTIC PREFLIGHTS PASS   ');
  console.log('====================================');
}

runDiagnostics();
