const { app } = require('@azure/functions');

app.http('GetSASUrl', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Get blobName from query string
        const blobName = request.query.get('blobName');
        if (!blobName) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'Missing required query parameter: blobName' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        const targetUrl = process.env.GET_SAS_URI_URL;
        const functionKey = process.env.GET_SAS_URI_URL_API_KEY;
        context.log('GET_SAS_URL_URL:', targetUrl);
        context.log('GET_SAS_URL_API_KEY:', functionKey ? '[set]' : '[not set]');

        if (!targetUrl || !functionKey) {
            context.log('Missing environment variables for target URL or function key.');
            return { status: 500, body: 'Internal Server Error: Missing configuration.' };
        }

        try {
            // Forward the blobName to the backend function
            const url = `${targetUrl}?code=${functionKey}&blobName=${encodeURIComponent(blobName)}`;
            context.log(`Making GET request to: ${url}`);
            const fetchResponse = await fetch(url);

            const contentType = fetchResponse.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await fetchResponse.json();
            } else {
                data = await fetchResponse.text();
            }

            context.log('Received response from target function:', {
                status: fetchResponse.status,
                data: data
            });

            // Ensure the response is always in the form { sasUrl: "..." }
            let sasUrl = '';
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && typeof parsed.sasUrl === 'string') {
                        sasUrl = parsed.sasUrl;
                    } else if (parsed && typeof parsed.downloadUrl === 'string') {
                        sasUrl = parsed.downloadUrl;
                    }
                } catch {
                    // Not JSON, ignore
                }
            } else if (data && typeof data.sasUrl === 'string') {
                sasUrl = data.sasUrl;
            } else if (data && typeof data.downloadUrl === 'string') {
                sasUrl = data.downloadUrl;
            }

            if (!sasUrl) {
                return {
                    status: 502,
                    body: JSON.stringify({ error: 'No SAS URL returned from backend.' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sasUrl })
            };
        } catch (error) {
            context.log.error('Error calling GetSASUrl function:', error.message);
            return {
                status: 500,
                body: 'Internal Server Error'
            };
        }
    }
});
