---
title: "Production SRE Agent"
order: 25
summary: "An SRE agent for Kubernetes: k8sgpt scans a cluster, diagnoses problems and explains them in plain language."
category: "Platform Engineering"
level: Intermediate
---

# Production SRE Agent

A production SRE agent watches the platform, finds what's broken and explains it. k8sgpt is an open source one for Kubernetes.

**Course milestone:** Platform Engineering

## k8sgpt

> **Source:** [k8sgpt](https://github.com/k8sgpt-ai/k8sgpt#readme) · [k8sgpt](https://github.com/k8sgpt-ai/k8sgpt), Apache 2.0

[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/7272/badge)](https://bestpractices.coreinfrastructure.org/projects/7272)

[![codecov](https://codecov.io/github/k8sgpt-ai/k8sgpt/graph/badge.svg?token=ZLR7NG8URE)](https://codecov.io/github/k8sgpt-ai/k8sgpt)

`k8sgpt` is a tool for scanning your Kubernetes clusters, diagnosing, and triaging issues in simple English.

It has SRE experience codified into its analyzers and helps to pull out the most relevant information to enrich it with AI.

_Out of the box integration with OpenAI, Azure, Cohere, Amazon Bedrock, Google Gemini and local models._

> **Sister project:** Check out [sympozium](https://github.com/AlexsJones/sympozium/) for managing agents in Kubernetes.

<a href="https://www.producthunt.com/posts/k8sgpt?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-k8sgpt" target="_blank"></a> <a href="https://hellogithub.com/repository/9dfe44c18dfb4d6fa0181baf8b2cf2e1" target="_blank"></a>

### Analyzers

K8sGPT uses analyzers to triage and diagnose issues in your cluster. It has a set of analyzers that are built in, but
you will be able to write your own analyzers.

#### Built in analyzers

##### Enabled by default

- [x] podAnalyzer
- [x] pvcAnalyzer
- [x] rsAnalyzer
- [x] serviceAnalyzer
- [x] eventAnalyzer
- [x] ingressAnalyzer
- [x] statefulSetAnalyzer
- [x] deploymentAnalyzer
- [x] jobAnalyzer
- [x] cronJobAnalyzer
- [x] nodeAnalyzer
- [x] mutatingWebhookAnalyzer
- [x] validatingWebhookAnalyzer
- [x] configMapAnalyzer

##### Optional

- [x] hpaAnalyzer
- [x] pdbAnalyzer
- [x] networkPolicyAnalyzer
- [x] gatewayClass
- [x] gateway
- [x] httproute
- [x] logAnalyzer
- [x] storageAnalyzer
- [x] securityAnalyzer
- [x] CatalogSource
- [x] ClusterCatalog
- [x] ClusterExtension
- [x] ClusterService
- [x] ClusterServiceVersion
- [x] OperatorGroup
- [x] InstallPlan
- [x] Subscription
- [x] ValidatingAdmissionPolicy
- [x] ResourceClaim

### Key Features

<details>

With this option, the data is anonymized before being sent to the AI Backend. During the analysis execution, `k8sgpt` retrieves sensitive data (Kubernetes object names, labels, etc.). This data is masked when sent to the AI backend and replaced by a key that can be used to de-anonymize the data when the solution is returned to the user.

<summary> Anonymization </summary>

1. Error reported during analysis:

```bash
Error: HorizontalPodAutoscaler uses StatefulSet/fake-deployment as ScaleTargetRef which does not exist.
```

2. Payload sent to the AI backend:

```bash
Error: HorizontalPodAutoscaler uses StatefulSet/tGLcCRcHa1Ce5Rs as ScaleTargetRef which does not exist.
```

3. Payload returned by the AI:

```bash
The Kubernetes system is trying to scale a StatefulSet named tGLcCRcHa1Ce5Rs using the HorizontalPodAutoscaler, but it cannot find the StatefulSet. The solution is to verify that the StatefulSet name is spelled correctly and exists in the same namespace as the HorizontalPodAutoscaler.
```

4. Payload returned to the user:

```bash
The Kubernetes system is trying to scale a StatefulSet named fake-deployment using the HorizontalPodAutoscaler, but it cannot find the StatefulSet. The solution is to verify that the StatefulSet name is spelled correctly and exists in the same namespace as the HorizontalPodAutoscaler.
```

#### Further Details

Note: **Anonymization does not currently apply to events.**

_In a few analysers like Pod, we feed to the AI backend the event messages which are not known beforehand thus we are not masking them for the **time being**._

- The following is the list of analysers in which data is **being masked**:-

  - Statefulset
  - Service
  - PodDisruptionBudget
  - Node
  - NetworkPolicy
  - Ingress
  - HPA
  - Deployment
  - Cronjob

- The following is the list of analysers in which data is **not being masked**:-

  - ReplicaSet
  - PersistentVolumeClaim
  - Pod
  - Log
  - **_\*Events_**

**\*Note**:

- k8gpt will not mask the above analysers because they do not send any identifying information except **Events** analyser.
- Masking for **Events** analyzer is scheduled in the near future as seen in this [issue](https://github.com/k8sgpt-ai/k8sgpt/issues/560). _Further research has to be made to understand the patterns and be able to mask the sensitive parts of an event like pod name, namespace etc._

- The following is the list of fields which are not **being masked**:-

  - Describe
  - ObjectStatus
  - Replicas
  - ContainerStatus
  - **_\*Event Message_**
  - ReplicaStatus
  - Count (Pod)

**\*Note**:

- It is quite possible the payload of the event message might have something like "super-secret-project-pod-X crashed" which we don't currently redact _(scheduled in the near future as seen in this [issue](https://github.com/k8sgpt-ai/k8sgpt/issues/560))_.

#### Proceed with care

- The K8gpt team recommends using an entirely different backend **(a local model) in critical production environments**. By using a local model, you can rest assured that everything stays within your DMZ, and nothing is leaked.
- If there is any uncertainty about the possibility of sending data to a public LLM (open AI, Azure AI) and it poses a risk to business-critical operations, then, in such cases, the use of public LLM should be avoided based on personal assessment and the jurisdiction of risks involved.

</details>

<details>
<summary> Configuration management</summary>

`k8sgpt` stores config data in the `$XDG_CONFIG_HOME/k8sgpt/k8sgpt.yaml` file. The data is stored in plain text, including your OpenAI key.

Config file locations:
| OS | Path |
| ------- | ------------------------------------------------ |
| MacOS | ~/Library/Application Support/k8sgpt/k8sgpt.yaml |
| Linux | ~/.config/k8sgpt/k8sgpt.yaml |
| Windows | %LOCALAPPDATA%/k8sgpt/k8sgpt.yaml |

</details>

<details>
There may be scenarios where caching remotely is preferred.
In these scenarios K8sGPT supports AWS S3 or Azure Blob storage Integration.

<summary> Remote caching </summary>
<em>Note: You can configure and use only one remote cache at a time</em>

_Adding a remote cache_

- AWS S3
  - _As a prerequisite `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are required as environmental variables._
  - Configuration, `k8sgpt cache add s3 --region <aws region> --bucket <name>`
  - Minio Configuration with HTTP endpoint ` k8sgpt cache add s3 --bucket <name> --endpoint <http://localhost:9000>`
  - Minio Configuration with HTTPs endpoint, skipping TLS verification ` k8sgpt cache add s3 --bucket <name> --endpoint <https://localhost:9000> --insecure`
    - K8sGPT will create the bucket if it does not exist
- Azure Storage
  - We support a number of [techniques](https://learn.microsoft.com/en-us/azure/developer/go/azure-sdk-authentication?tabs=bash#2-authenticate-with-azure) to authenticate against Azure
  - Configuration, `k8sgpt cache add azure --storageacc <storage account name> --container <container name>`
    - K8sGPT assumes that the storage account already exist and it will create the container if it does not exist
    - It is the **user** responsibility have to grant specific permissions to their identity in order to be able to upload blob files and create SA containers (e.g Storage Blob Data Contributor)
- Google Cloud Storage
  - _As a prerequisite `GOOGLE_APPLICATION_CREDENTIALS` are required as environmental variables._
  - Configuration, ` k8sgpt cache add gcs --region <gcp region> --bucket <name> --projectid <project id>`
    - K8sGPT will create the bucket if it does not exist

_Listing cache items_

```
k8sgpt cache list
```

_Purging an object from the cache_
Note: purging an object using this command will delete upstream files, so it requires appropriate permissions.

```
k8sgpt cache purge $OBJECT_NAME
```

_Removing the remote cache_
Note: this will not delete the upstream S3 bucket or Azure storage container

```
k8sgpt cache remove
```

</details>

<details>
<summary> Custom Analyzers</summary>

There may be scenarios where you wish to write your own analyzer in a language of your choice.
K8sGPT now supports the ability to do so by abiding by the [schema](https://github.com/k8sgpt-ai/schemas/blob/main/protobuf/schema/v1/custom_analyzer.proto) and serving the analyzer for consumption.
To do so, define the analyzer within the K8sGPT configuration and it will add it into the scanning process.
In addition to this you will need to enable the following flag on analysis:

```
k8sgpt analyze --custom-analysis
```

Here is an example local host analyzer in [Rust](https://github.com/k8sgpt-ai/host-analyzer)
When this is run on `localhost:8080` the K8sGPT config can pick it up with the following additions:

```
custom_analyzers:
  - name: host-analyzer
    connection:
      url: localhost
      port: 8080
```

This now gives the ability to pass through hostOS information ( from this analyzer example ) to K8sGPT to use as context with normal analysis.

_See the docs on how to write a custom analyzer_

_Listing custom analyzers configured_
```
k8sgpt custom-analyzer list
```

_Adding custom analyzer without install_
```
k8sgpt custom-analyzer add --name my-custom-analyzer --port 8085
```

_Removing custom analyzer_
```
k8sgpt custom-analyzer remove --names "my-custom-analyzer,my-custom-analyzer-2"
```

</details>
