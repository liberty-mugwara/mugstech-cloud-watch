import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const DEFAULT_REGION = "eu-central-1";

interface ICloudWatchParams {
  logStreamName: string;
  message: string;
  logGroupName: string;
  region?: string;
  sequenceToken?: string;
}

export async function logToAws({
  logStreamName,
  message,
  logGroupName,
  region = DEFAULT_REGION,
}: ICloudWatchParams) {
  try {
    await logToCloudWatch({ logStreamName, message, logGroupName, region });
  } catch (err: any) {
    if (err.expectedSequenceToken)
      await logToCloudWatch({
        logStreamName,
        message,
        logGroupName,
        sequenceToken: err.expectedSequenceToken,
      }).catch((e) => e);
  }
}

export async function logToCloudWatch({
  logStreamName,
  message,
  logGroupName,
  region = DEFAULT_REGION,
  sequenceToken = "1",
}: ICloudWatchParams) {
  const cloudWatchClient = new CloudWatchLogsClient({ region });

  return cloudWatchClient.send(
    new PutLogEventsCommand({
      logEvents: [
        {
          message: message,
          timestamp: new Date().getTime(),
        },
      ],
      logGroupName,
      logStreamName,
      sequenceToken,
    })
  );
}
