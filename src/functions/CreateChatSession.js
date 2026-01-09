const { CommunicationIdentityClient } =
  require("@azure/communication-identity");
const { ChatClient } =
  require("@azure/communication-chat");
const { AzureCommunicationTokenCredential } =
  require("@azure/communication-common");

module.exports = async function (context, req) {
  try {
    const identityClient = new CommunicationIdentityClient(
      process.env.ACS_CONNECTION_STRING
    );

    // Create customer user
    const customerUser = await identityClient.createUser();
    const customerUserId = customerUser.communicationUserId;

    // Create agent user (POC only – normally stored)
    const agentUser = await identityClient.createUser();
    const agentUserId = agentUser.communicationUserId;

    // Issue token for customer
    const customerToken = await identityClient.getToken(
      { communicationUserId: customerUserId },
      ["chat"]
    );

    // Create chat client using customer token
    const chatClient = new ChatClient(
      process.env.ACS_ENDPOINT,
      new AzureCommunicationTokenCredential(customerToken.token)
    );

    // Create chat thread
    const threadResult = await chatClient.createChatThread(
      { topic: "Banking Support Chat" },
      {
        participants: [
          {
            id: { communicationUserId: customerUserId },
            displayName: "Customer"
          },
          {
            id: { communicationUserId: agentUserId },
            displayName: "Support Agent"
          }
        ]
      }
    );

    //context.log("Chat thread created:", threadResult.chatThread.id);


    context.res = {
      status: 200,
      body: {
        customerUserId,
        customerToken: customerToken.token,
        threadId: threadResult.chatThread.id,
        endpoint: process.env.ACS_ENDPOINT
      }
    };

  } catch (error) {
    context.res = {
      status: 500,
      body: error.message
    };
  }
};




