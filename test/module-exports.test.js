const { spawn } = require('child_process');
const path = require('path');

describe('Module Exports', () => {
  const distPath = path.join(__dirname, '..', 'dist');

  test('ES module import works', (done) => {
    const testCode = `
      import { ManaCubeApi, gamemodeSvasSchema } from '${distPath}/index.js';
      console.log('ES_TEST_PASS');
      if (typeof ManaCubeApi !== 'function') process.exit(1);
      if (typeof gamemodeSvasSchema !== 'object') process.exit(1);
      const api = new ManaCubeApi();
      if (!(api instanceof ManaCubeApi)) process.exit(1);
      process.exit(0);
    `;

    const child = spawn('node', ['--input-type=module', '-e', testCode], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(output).toContain('ES_TEST_PASS');
      expect(code).toBe(0);
      done();
    });
  });

  test('CommonJS require works', (done) => {
    const testCode = `
      const { ManaCubeApi, gamemodeSvasSchema } = require('${distPath}/index.cjs');
      console.log('CJS_TEST_PASS');
      if (typeof ManaCubeApi !== 'function') process.exit(1);
      if (typeof gamemodeSvasSchema !== 'object') process.exit(1);
      const api = new ManaCubeApi();
      if (!(api instanceof ManaCubeApi)) process.exit(1);
      process.exit(0);
    `;

    const child = spawn('node', ['-e', testCode], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(output).toContain('CJS_TEST_PASS');
      expect(code).toBe(0);
      done();
    });
  });
});