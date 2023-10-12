#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkHandsonCicd2Stack } from '../lib/cdk-handson-cicd2-stack';
import { getStageConfig } from '../stage-config';
import {CdkHandsonPipelineStack} from "../lib/pipeline-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage");
const stageVariables = getStageConfig(stage);

switch (stage) {
    case "dev":
    case "stg":
    case "prd":
        // -----------------------------------------------------------
        // CDK Sample Application
        // -----------------------------------------------------------
        const cdkAppStack = new CdkHandsonCicd2Stack(app, 'CdkHandsonCicd2Stack', {
                stage: stage
        });
        cdk.Tags.of(cdkAppStack).add('Name', "CdkHandsonCdkApp");
        break
    case "cicd":
        // -----------------------------------------------------------
        // CI/CD Pipeline
        // -----------------------------------------------------------
        const pipeline = new CdkHandsonPipelineStack(app, 'CdkHandsonPipelineStack', {
            env: stageVariables.env,
        });
        cdk.Tags.of(pipeline).add('Name', "CdkHandsonPipeline");
        break
    default:
        throw new Error("The cdk context 'stage' must be either 'dev', 'stg', 'prd', or 'cicd'.");
}
