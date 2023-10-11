#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import { CdkHandsonCicd2Stack } from '../lib/cdk-handson-cicd2-stack';
import { getStageConfig } from '../stage-config';
import {CdkHandsonPipelineStack} from "../lib/pipeline-stack";

const app = new cdk.App();

// const stage = "dev"
// const stageVariables = getStageConfig(stage);
// new CdkHandsonCicd2Stack(app, 'CdkHandsonCicd2Stack', { stage: "dev" });

const stageVariables = getStageConfig("cicd");
const pipeline = new CdkHandsonPipelineStack(app, 'CdkHandsonPipelineStack', {
    env: stageVariables.env,
});
cdk.Tags.of(pipeline).add('Name', "CdkHandsonPipeline");
