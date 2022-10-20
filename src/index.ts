import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const DEFAULT_REGION = "eu-central-1";

interface ICloudWatchParams<TLogStreamName, TLogGroupName> {
  logStreamName: TLogStreamName extends string ? TLogStreamName : string;
  message: string;
  logGroupName: TLogGroupName extends string ? TLogGroupName : string;
  region?: string;
  sequenceToken?: string;
}

export async function logToAws<TLogStreamName, TLogGroupName>({
  logStreamName,
  message,
  logGroupName,
  region = DEFAULT_REGION,
}: ICloudWatchParams<TLogStreamName, TLogGroupName>) {
  try {
    await logToCloudWatch<TLogStreamName, TLogGroupName>({
      logStreamName,
      message,
      logGroupName,
      region,
    });
  } catch (err: any) {
    if (err.expectedSequenceToken)
      await logToCloudWatch<TLogStreamName, TLogGroupName>({
        logStreamName,
        message,
        logGroupName,
        sequenceToken: err.expectedSequenceToken,
      }).catch((e) => e);
  }
}

async function logToCloudWatch<TLogStreamName, TLogGroupName>({
  logStreamName,
  message,
  logGroupName,
  region = DEFAULT_REGION,
  sequenceToken = "1",
}: ICloudWatchParams<TLogStreamName, TLogGroupName>) {
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
