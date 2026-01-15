// src/functions/index.js
const { app } = require('@azure/functions');

app.http('CreateChatSession', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Your function logic here
        return { body: 'Hello!' };
    }
});