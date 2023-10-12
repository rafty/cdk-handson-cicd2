import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';


export interface IEnvironmentStack extends StackProps {
  stage: string;
}

export class CdkHandsonCicd2Stack extends Stack {
  constructor(scope: Construct, id: string, props: IEnvironmentStack) {
    super(scope, id, props);

    const stageList = ["dev", "stg", "prd"];
    if ( !stageList.includes(props.stage) ) {
      throw new Error("stage must be dev, stg, prd")
    }

    const queue = new sqs.Queue(this, `CdkHandsonCicd2Queue`, {
      visibilityTimeout: Duration.seconds(300)
    });

    const topic = new sns.Topic(this, `CdkHandsonCicd2Topic`);

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
