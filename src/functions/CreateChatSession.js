const { app } = require("@azure/functions");
const { CommunicationIdentityClient } = require("@azure/communication-identity");
const { ChatClient } = require("@azure/communication-chat");
const { AzureCommunicationTokenCredential } = require("@azure/communication-common");

app.http("CreateChatSession", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const identityClient = new CommunicationIdentityClient(
        process.env.ACS_CONNECTION_STRING
      );

      const customerUser = await identityClient.createUser();
      const agentUser = await identityClient.createUser();

      const customerToken = await identityClient.getToken(
        { communicationUserId: customerUser.communicationUserId },
        ["chat"]
      );

      const chatClient = new ChatClient(
        process.env.ACS_ENDPOINT,
        new AzureCommunicationTokenCredential(customerToken.token)
      );

      const threadResult = await chatClient.createChatThread(
        { topic: "Banking Support Chat" },
        {
          participants: [
            {
              id: { communicationUserId: customerUser.communicationUserId },
              displayName: "Customer"
            },
            {
              id: { communicationUserId: agentUser.communicationUserId },
              displayName: "Support Agent"
            }
          ]
        }
      );

      return {
        status: 200,
        jsonBody: {
          customerUserId: customerUser.communicationUserId,
          customerToken: customerToken.token,
          threadId: threadResult.chatThread.id,
          endpoint: process.env.ACS_ENDPOINT
        }
      };
    } catch (error) {
      return {
        status: 500,
        body: error.message
      };
    }
  }
});
