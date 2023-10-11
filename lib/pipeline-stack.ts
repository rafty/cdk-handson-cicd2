import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';

export class CdkHandsonPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // -----------------------------------------------------------
        // CodeCommit Repository
        // -----------------------------------------------------------
        const repository = new codecommit.Repository(this, 'CdkHandsonPipeline2Repository', {
            repositoryName: "CdkHandsonPipeline2Repository"
        });
        cdk.Tags.of(repository).add('Name', "CdkHandsonPipeline2Repository");
        new cdk.CfnOutput(this, "CdkHandson2Repository", {
            value: repository.repositoryCloneUrlHttp,
        });

    }
}
