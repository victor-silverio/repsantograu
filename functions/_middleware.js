export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // 1. Redirecionamentos Canônicos no Edge
  if (url.hostname.endsWith('.pages.dev')) {
    url.hostname = 'www.repsantograu.online';
    return Response.redirect(url.toString(), 301);
  }

  // 2. Processa a requisição
  const response = await context.next();
  const contentType = response.headers.get('Content-Type') || '';

  // 3. Early Hints para recursos críticos quando a resposta for HTML
  if (contentType.includes('text/html')) {
    const headers = new Headers(response.headers);

    headers.append(
      'Link',
      '</fonts/montserrat-v31-latin-regular.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
    );
    headers.append(
      'Link',
      '</fonts/montserrat-v31-latin-700.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
    );
    headers.append(
      'Link',
      '</fonts/playfair-display-v40-latin-700.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
