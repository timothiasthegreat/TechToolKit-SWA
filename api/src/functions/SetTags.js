const { app } = require('@azure/functions');
const https = require('https');

app.http('SetTags', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let body;
        try {
            body = await request.json();
            context.log('Request body parsed successfully:', body);
        } catch (error) {
            context.log.error('Error parsing request body:', error.message);
            return {
                status: 400,
                body: 'Bad Request: Invalid JSON body.'
            };
        }

        const targetUrl = process.env.SET_TAGS_URL;
        const functionKey = process.env.SET_TAGS_API_KEY;
        context.log('SET_TAGS_URL:', targetUrl);
        context.log('SET_TAGS_API_KEY:', functionKey ? '[set]' : '[not set]');

        if (!targetUrl || !functionKey) {
            context.log('Missing environment variables for target URL or function key.');
            return { status: 500, body: 'Internal Server Error: Missing configuration.' };
        }

        const formattedBody = Array.isArray(body) ? body : [body];
        const requestBody = JSON.stringify(formattedBody);
        context.log('Formatted request body:', requestBody);

        const options = {
            hostname: new URL(targetUrl).hostname,
            path: `${new URL(targetUrl).pathname}?code=${functionKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        context.log('Request options:', options);

        try {
            const response = await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({ status: res.statusCode, body: data });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                req.write(requestBody);
                req.end();
            });

            context.log('Response from target function:', response);
            return {
                status: response.status,
                body: response.body
            };
        } catch (error) {
            context.log.error('Error forwarding request:', error.message);
            return {
                status: 500,
                body: 'Internal Server Error'
            };
        }
    }
});
