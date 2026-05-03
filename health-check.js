const http = require('http');

const checkHealth = (url, serviceName) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(url, (res) => {
      const time = Date.now() - start;
      if (res.statusCode === 200) {
        console.log(`✅ ${serviceName}: Saludable (${time}ms)`);
        resolve({ service: serviceName, status: 'ok', time });
      } else {
        console.log(`❌ ${serviceName}: Error (HTTP ${res.statusCode})`);
        reject(new Error(`${serviceName}: HTTP ${res.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`❌ ${serviceName}: Error de conexión - ${err.message}`);
      reject(err);
    });
  });
};

const runHealthChecks = async () => {
  console.log('\n🔍 Ejecutando chequeos de salud...\n');
  try {
    await Promise.all([
      checkHealth('http://localhost:3001/health', 'API NestJS'),
      checkHealth('http://localhost:3001/health/live', 'API Live'),
      checkHealth('http://localhost:3000', 'Frontend Next.js'),
    ]);
    console.log('\n🎉 Todos los servicios están saludables!\n');
  } catch (err) {
    console.error('\n❌ Fallo en chequeos de salud:', err.message, '\n');
    process.exit(1);
  }
};

const runLoadTest = async () => {
  console.log('\n⚡ Iniciando prueba de carga (5 minutos)...\n');
  const endTime = Date.now() + 5 * 60 * 1000;
  let successCount = 0;
  let failCount = 0;

  const interval = setInterval(async () => {
    try {
      await checkHealth('http://localhost:3001/health', 'API NestJS');
      successCount++;
    } catch {
      failCount++;
    }

    if (Date.now() >= endTime) {
      clearInterval(interval);
      console.log(`\n📊 Resultados de la prueba de 5 minutos:`);
      console.log(`   ✅ Éxitos: ${successCount}`);
      console.log(`   ❌ Fallos: ${failCount}`);
      if (failCount === 0) {
        console.log('🎉 ¡Prueba de carga completada sin fallos!\n');
      } else {
        console.log('⚠️ Se detectaron fallos durante la prueba.\n');
        process.exit(1);
      }
    }
  }, 2000);
};

if (process.argv.includes('--load')) {
  runLoadTest();
} else {
  runHealthChecks();
}
