// Quick test to verify FeatSpells component loads without HTTP 500 error

console.log('Testing FeatSpells component loading...');

try {
  // This simulates what happens when the component is dynamically imported
  const moduleTest = async () => {
    const module = await import('./src/components/organisms/dnd5e/Tabs/FeatSpells.svelte');
    console.log('✓ FeatSpells.svelte loaded successfully');
    console.log('Component exports:', Object.keys(module));
    return module;
  };
  
  moduleTest().then(() => {
    console.log('✓ Test completed - no HTTP 500 error');
  }).catch(error => {
    console.error('✗ Component loading failed:', error);
  });
} catch (error) {
  console.error('✗ Import test failed:', error);
}
