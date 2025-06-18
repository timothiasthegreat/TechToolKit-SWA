const { app } = require('@azure/functions');

app.http('ListTools', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log('Request method:', request.method);
        context.log('Request headers:', JSON.stringify(request.headers));
        context.log('Request body:', JSON.stringify(request.body));

        const targetUrl = process.env.LIST_TOOLS_URL;
        const functionKey = process.env.LIST_TOOLS_API_KEY;
        context.log('LIST_TOOLS_URL:', targetUrl);
        context.log('LIST_TOOLS_API_KEY:', functionKey ? '[set]' : '[not set]');

        if (!targetUrl || !functionKey) {
            context.log('Missing environment variables for target URL or function key.');
            return { status: 500, body: 'Internal Server Error: Missing configuration.' };
        }
        try {
            context.log(`Making POST request to: ${targetUrl}?code=${functionKey}`);
            const fetchResponse = await fetch(`${targetUrl}?code=${functionKey}`);

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

            // Ensure the response is always in the form { tools: [...] }
            let resultArray = [];
            if (Array.isArray(data)) {
                resultArray = data;
            } else if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        resultArray = parsed;
                    } else if (parsed && Array.isArray(parsed.tools)) {
                        resultArray = parsed.tools;
                    } else if (parsed && Array.isArray(parsed.data)) {
                        resultArray = parsed.data;
                    }
                } catch {
                    // Not JSON, ignore
                }
            } else if (data && Array.isArray(data.tools)) {
                resultArray = data.tools;
            } else if (data && Array.isArray(data.data)) {
                resultArray = data.data;
            }

            return {
                status: fetchResponse.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tools: resultArray }) // <-- use "tools" as the array name
            };
        } catch (error) {
            context.log.error('Error calling ListTools function:', error.message);
            return {
                status: 500,
                body: 'Internal Server Error'
            };
        }
    }
});