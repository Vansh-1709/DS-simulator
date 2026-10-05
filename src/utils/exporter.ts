import JSZip from 'jszip';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // Use Vite's glob import with query '?raw' to bundle source files into the client
  const rootFiles = import.meta.glob(
    ['/package.json', '/tsconfig.json', '/vite.config.ts', '/index.html', '/README.md', '/.gitignore'],
    { query: '?raw', import: 'default', eager: true }
  );

  const srcFiles = import.meta.glob(
    ['/src/**/*.tsx', '/src/**/*.ts', '/src/**/*.css'],
    { query: '?raw', import: 'default', eager: true }
  );

  // Add root files
  for (const [path, content] of Object.entries(rootFiles)) {
    const filename = path.replace(/^\//, '');
    zip.file(filename, content as string);
  }

  // Add src files
  for (const [path, content] of Object.entries(srcFiles)) {
    const filename = path.replace(/^\//, '');
    zip.file(filename, content as string);
  }

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });

  // Trigger download via anchor
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'datastructs-interactive-app.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
