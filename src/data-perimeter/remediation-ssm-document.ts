/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Construct } from 'constructs';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as yaml from 'js-yaml';

import { Document } from '../aws-ssm/document';
import { toPascalCase } from '../common/functions';
import { GlobalConfig } from '../global-config';

/**
 * Detect Resource Policy
 * This construct creates a Lambda function which is triggered by AWS Config Rule and
 * detect if a resource policy is compliant to the resource policy template by comparing
 * statements in resource policy.
 */
export interface RemediationSsmDocumentProps {
  documentName: string;
  sharedAccountIds: string[];
  globalConfig: GlobalConfig;
  cloudwatchKey?: cdk.aws_kms.IKey;
}

export class RemediationSsmDocument extends Construct {
  private readonly documentPath = path.join(__dirname, 'attach-resource-based-policy.yaml');

  constructor(scope: Construct, id: string, props: RemediationSsmDocumentProps) {
    super(scope, id);

    // Read in the document which should be properly formatted
    const buffer = fs.readFileSync(this.documentPath, 'utf8');
    const content = yaml.load(buffer);

    // Create the document
    new Document(this, toPascalCase(props.documentName), {
      name: props.documentName,
      content,
      documentType: 'Automation',
      sharedWithAccountIds: props.sharedAccountIds,
      kmsKey: props.cloudwatchKey,
      logRetentionInDays: props.globalConfig.cloudwatchLogRetentionInDays,
      targetType: undefined,
    });
  }
}
