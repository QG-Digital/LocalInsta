document.addEventListener('DOMContentLoaded', () => {
  // Chama a função do state.js que puxa os arquivos e DEPOIS carrega a UI
  initApp(); 
  console.log('LocalInsta Interface Initialized - Conectado ao Python!');
});