class ExpoClient {
  constructor() {
    this.url = "https://exp.host/--/api/v2/push/send";
  }

  async sendExpoMessage(expo_message) {
    const expoMessageRequest = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify([expo_message]),
      }
    );
    const expoResponse = await expoMessageRequest.json();
    return expoResponse;
  }
}

export default ExpoClient;
