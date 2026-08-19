async function purgeCache() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.log(
      '⚠️  Variáveis CLOUDFLARE_ZONE_ID ou CLOUDFLARE_API_TOKEN não encontradas.'
    );
    console.log('Pulando a limpeza de cache...');
    return;
  }

  console.log(`Iniciando limpeza de cache para a Zona: ${zoneId}`);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ purge_everything: true }),
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('✅ Cache do Cloudflare limpo com sucesso!');
    } else {
      console.error('❌ Erro ao limpar o cache:');
      console.error(data.errors);
    }
  } catch (error) {
    console.error('❌ Erro na requisição de limpeza de cache:', error.message);
  }
}

purgeCache();
