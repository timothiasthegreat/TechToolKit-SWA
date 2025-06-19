const { app } = require('@azure/functions');
const fetch = require('node-fetch');

app.http('SetTags', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        const body = await request.json();

        const targetUrl = process.env.SET_TAGS_URL;
        const functionKey = process.env.SET_TAGS_API_KEY;
        context.log('SET_TAGS_URL:', targetUrl);
        context.log('SET_TAGS_API_KEY:', functionKey ? '[set]' : '[not set]');

        if (!targetUrl || !functionKey) {
            context.log('Missing environment variables for target URL or function key.');
            return { status: 500, body: 'Internal Server Error: Missing configuration.' };
        }

        try {
            context.log(`Forwarding request to: ${targetUrl}?code=${functionKey}`);
            const fetchResponse = await fetch(`${targetUrl}?code=${functionKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const responseBody = await fetchResponse.text();

            return {
                status: fetchResponse.status,
                headers: { 'Content-Type': fetchResponse.headers.get('content-type') || 'text/plain' },
                body: responseBody
            };
        } catch (error) {
            context.log.error('Error forwarding SetTags request:', error.message);
            return {
                status: 500,
                body: 'Internal Server Error'
            };
        }
    }
});
