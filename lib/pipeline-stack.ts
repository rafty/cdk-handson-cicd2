import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
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

        // -----------------------------------------------------------
        // CodePipeline Pipeline
        // -----------------------------------------------------------
        const pipeline = new codepipeline.Pipeline(this, "CdkHandsonPipeline2", {
            pipelineName: "CdkHandsonPipeline2"
        });
        cdk.Tags.of(pipeline).add('Name', "CdkHandsonPipeline2");


        // -----------------------------------------------------------
        // CodePipeline Source Stage
        // -----------------------------------------------------------
        const sourceOutput = new codepipeline.Artifact();
        const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
            actionName: "SourceRepository",
            repository: repository,
            output: sourceOutput,
            branch: "master",
        });

        pipeline.addStage({
            stageName: "Source",
            actions: [sourceAction],
        });

        // -----------------------------------------------------------
        // CodeBuild Build Project
        // -----------------------------------------------------------

        // 注) codebuildがcdk cliを実行する際、bootstrapなどにアクセス権限が必要になります。
        const role = new iam.Role(this, 'role', {
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

        const cdkBuildProject = new codebuild.PipelineProject(this, "CDK Build", {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yaml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
                computeType: codebuild.ComputeType.LARGE,
            },
            role: role,
        });

        // -----------------------------------------------------------
        // CodePipeline Dev Stage
        // -----------------------------------------------------------
        const devOutput = new codepipeline.Artifact();
        const devAction = new codepipeline_actions.CodeBuildAction({
            actionName: "DevBuild",
            project: cdkBuildProject,
            input: sourceOutput,
            outputs: [devOutput],
            environmentVariables: {
                STAGE: {            // buildspec.yamlに指定する環境変数
                    value: "dev",
                }
            }
        });
        pipeline.addStage({
            stageName: "DevDeploy",
            actions: [devAction]
        });

        // -----------------------------------------------------------
        // CodePipeline Stg Stage
        // -----------------------------------------------------------

        // --- CodePipeline manual approval stage---
        const approval_action = new codepipeline_actions.ManualApprovalAction({
            actionName: "Approve",
        })
        pipeline.addStage({
            stageName: 'StgApproval',
            actions: [approval_action]
        })

        const stgOutput = new codepipeline.Artifact();
        const stgAction = new codepipeline_actions.CodeBuildAction({
            actionName: "StgBuild",
            project: cdkBuildProject,
            input: sourceOutput,
            outputs: [stgOutput],
            environmentVariables: {
                STAGE: {            // buildspec.yamlに指定する環境変数
                    value: "stg",
                }
            }
        });
        pipeline.addStage({
            stageName: "StgDeploy",
            actions: [stgAction]
        });

        // -----------------------------------------------------------
        // CodePipeline prd Stage
        // -----------------------------------------------------------

        // --- CodePipeline manual approval stage---
        pipeline.addStage({
            stageName: 'PrdApproval',
            actions: [approval_action]
        })

        const prdOutput = new codepipeline.Artifact();
        const prdAction = new codepipeline_actions.CodeBuildAction({
            actionName: "PrdBuild",
            project: cdkBuildProject,
            input: sourceOutput,
            outputs: [prdOutput],
            environmentVariables: {
                STAGE: {            // buildspec.yamlに指定する環境変数
                    value: "prd",
                }
            }
        });
        pipeline.addStage({
            stageName: "PrdDeploy",
            actions: [prdAction]
        });

    }
}









