#!/usr/bin/env node

// Script to fix private key newline issues
const fs = require('fs');

function fixPrivateKey(inputPath, outputPath) {
  try {
    console.log('🔧 Fixing private key newline issues...');
    console.log(`Input file: ${inputPath}`);

    // Read the original file
    const originalContent = fs.readFileSync(inputPath, 'utf8');
    console.log(`Original file size: ${originalContent.length} characters`);

    // Show first and last few characters
    console.log(`First 50 chars: ${originalContent.substring(0, 50)}`);
    console.log(`Last 50 chars: ${originalContent.substring(originalContent.length - 50)}`);

    // Fix the content
    let fixedContent = originalContent
      // Remove any Windows-style carriage returns
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Ensure proper line endings
      .trim();

    // Ensure it starts and ends correctly
    if (!fixedContent.startsWith('-----BEGIN')) {
      console.log('❌ Private key missing BEGIN marker');
      return false;
    }

    if (!fixedContent.endsWith('-----')) {
      console.log('❌ Private key missing proper END marker');
      return false;
    }

    console.log(`Fixed file size: ${fixedContent.length} characters`);

    // Write the fixed version
    fs.writeFileSync(outputPath, fixedContent, 'utf8');
    console.log(`✅ Fixed private key saved to: ${outputPath}`);

    // Verify the fix worked
    const verifyContent = fs.readFileSync(outputPath, 'utf8');
    console.log(`Verification - file size: ${verifyContent.length} characters`);

    return true;

  } catch (error) {
    console.error('❌ Failed to fix private key:', error.message);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath) {
    console.log('Usage: node fix-private-key.js <input-pem-file> [output-pem-file]');
    console.log('');
    console.log('Examples:');
    console.log('  node fix-private-key.js ./my-app.pem ./my-app-fixed.pem');
    console.log('  node fix-private-key.js ./my-app.pem  # overwrites original');
    process.exit(1);
  }

  const output = outputPath || inputPath;
  const success = fixPrivateKey(inputPath, output);

  if (success) {
    console.log(`\n✅ Private key fixed! Now test with:`);
    console.log(`node scripts/basic-app-test.js [APP_ID] ${output}`);
  }

  process.exit(success ? 0 : 1);
}

module.exports = { fixPrivateKey };