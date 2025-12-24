export async function sendSlackAlert(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not set. Skipping Slack alert.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send Slack alert: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error sending Slack alert:", error);
  }
}
