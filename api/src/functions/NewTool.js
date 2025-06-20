const { app } = require('@azure/functions');
const https = require('https');

app.http('NewTool', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const targetUrl = process.env.NEW_TOOL_URL;
        const functionKey = process.env.NEW_TOOL_API_KEY;

        context.log('NEW_TOOL_URL:', targetUrl);
        context.log('NEW_TOOL_API_KEY:', functionKey ? '[set]' : '[not set]');

        if (!targetUrl || !functionKey) {
            context.log('Missing environment variables for target URL or function key.');
            return { status: 500, body: 'Internal Server Error: Missing configuration.' };
        }

        let formData;
        try {
            formData = await request.formData();
        } catch (error) {
            context.log.error('Error parsing form data:', error.message);
            return { status: 400, body: 'Bad Request: Invalid form data.' };
        }

        const file = formData.get('file');
        if (!file) {
            context.log('No file uploaded.');
            return { status: 400, body: 'Bad Request: No file uploaded.' };
        }

        const fileName = request.query.FileName || file.name || 'unknown';
        const options = {
            hostname: new URL(targetUrl).hostname,
            path: `${new URL(targetUrl).pathname}?code=${functionKey}&FileName=${encodeURIComponent(fileName)}`,
            method: 'POST',
            headers: {
                'Content-Type': file.type,
                'Content-Length': file.size
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
                    context.log.error('Request error:', error.message);
                    reject(error);
                });

                const fileStream = file.stream();
                fileStream.on('error', (error) => {
                    context.log.error('File stream error:', error.message);
                    reject(error);
                });

                fileStream.pipe(req);
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
