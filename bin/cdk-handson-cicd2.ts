#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkHandsonCicd2Stack } from '../lib/cdk-handson-cicd2-stack';

const app = new cdk.App();
new CdkHandsonCicd2Stack(app, 'CdkHandsonCicd2Stack');
