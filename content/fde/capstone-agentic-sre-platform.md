---
title: "Capstone: Full Agentic SRE Platform"
order: 21
summary: "A full agentic SRE platform in practice: HolmesGPT investigates alerts by pulling data from your observability stack."
category: "Agentic System Design"
level: Intermediate
---

# Capstone: Full Agentic SRE Platform

The capstone looks at a real open source agentic SRE platform end to end: what it connects to, how it investigates, and how it keeps data private.

**Course milestone:** Agentic System Design

## HolmesGPT

> **Source:** [HolmesGPT](https://github.com/robusta-dev/holmesgpt#readme) · [HolmesGPT](https://github.com/robusta-dev/holmesgpt), Apache 2.0

<h1 align="center">HolmesGPT — The CNCF SRE Agent</h1>

    <a href="#installation"><strong>Installation</strong></a> |
    <a href="https://holmesgpt.dev/"><strong>Docs</strong></a> |
    <a href="https://deepwiki.com/HolmesGPT/holmesgpt"></a>

Open-source AI agent for investigating production incidents and finding root causes. Works with any stack — Kubernetes, VMs, cloud providers, databases, and SaaS platforms. We are a [Cloud Native Computing Foundation](https://www.cncf.io/) sandbox project. Originally created by [Robusta.Dev](http://robusta.dev), with major contributions from [Microsoft](https://microsoft.com/).

### Features

- **Petabyte-scale data**: Server-side filtering, JSON tree traversal, and tool output transformers keep large payloads out of context windows
- **Memory-safe execution**: Per-tool memory limits, streaming large results to disk, and automatic output budgeting prevent OOM kills when querying large observability datasets
- **[Deep integrations](https://holmesgpt.dev/data-sources/builtin-toolsets/)**: Prometheus, Grafana, Datadog, Kubernetes, and [many more](#-data-sources)—plus any [REST API](https://holmesgpt.dev/data-sources/api-toolsets/)
- **Bidirectional alert integrations**: Fetch alerts from AlertManager, PagerDuty, OpsGenie, or Jira—and write findings back
- **[Any LLM provider](https://holmesgpt.dev/ai-providers/)**: OpenAI, Anthropic, Azure, Bedrock, Gemini, and more
- **No Kubernetes required**: Works with any infrastructure — VMs, bare metal, cloud services, or containers

### How it Works

HolmesGPT uses an **agentic loop** to query live observability data from multiple sources and identify root causes.

![HolmesGPT Investigation Demo](https://holmesgpt.dev/assets/HolmesInvestigation.gif)

#### 🔗 Data Sources

HolmesGPT integrates with popular observability and cloud platforms. The following data sources ("toolsets") are built-in. [Add your own](https://holmesgpt.dev/data-sources/custom-toolsets/).

| Data Source | Notes |
|-------------|-------|
| [ **AKS**](https://holmesgpt.dev/data-sources/builtin-toolsets/aks/) | Azure Kubernetes Service cluster and node health diagnostics |
| [ **Atlassian Rovo**](https://holmesgpt.dev/data-sources/builtin-toolsets/atlassian-rovo-mcp/) | Jira issues and Confluence pages via Atlassian's hosted server (MCP) |
| [ **ArgoCD**](https://holmesgpt.dev/data-sources/builtin-toolsets/argocd/) | Get status, history and manifests and more of apps, projects and clusters |
| [ **AWS**](https://holmesgpt.dev/data-sources/builtin-toolsets/aws/) | RDS events, instances, slow query logs, and more (MCP) |
| [ **Azure**](https://holmesgpt.dev/data-sources/builtin-toolsets/azure-mcp/) | Azure resources and diagnostics (MCP) |
| [ **Confluence**](https://holmesgpt.dev/data-sources/builtin-toolsets/confluence/) | Private runbooks and documentation |
| [ **Confluence (MCP)**](https://holmesgpt.dev/data-sources/builtin-toolsets/confluence-mcp/) | Private runbooks and documentation (MCP) |
| [ **Coralogix**](https://holmesgpt.dev/data-sources/builtin-toolsets/coralogix-logs/) | Retrieve logs for any resource |
| [ **Crossplane**](https://holmesgpt.dev/data-sources/builtin-toolsets/crossplane/) | Troubleshoot Crossplane providers, compositions, claims, and managed resources |
| [ **Datadog**](https://holmesgpt.dev/data-sources/builtin-toolsets/datadog/) | Query logs, metrics, and traces |
| [ **Docker**](https://holmesgpt.dev/data-sources/builtin-toolsets/docker/) | Get images, logs, events, history and more |
| [ **Elasticsearch / OpenSearch**](https://holmesgpt.dev/data-sources/builtin-toolsets/elasticsearch/) | Query logs, cluster health, shard and index diagnostics |
| [ **GCP**](https://holmesgpt.dev/data-sources/builtin-toolsets/gcp/) | Google Cloud Platform resources (MCP) |
| [ **GitHub**](https://holmesgpt.dev/data-sources/builtin-toolsets/github-mcp/) | Repositories, issues, and pull requests (MCP) |
| [ **GitLab**](https://holmesgpt.dev/data-sources/builtin-toolsets/gitlab-mcp/) | Projects, merge requests, issues, and CI/CD pipelines (MCP) |
| [ **Jenkins (MCP)**](https://holmesgpt.dev/data-sources/builtin-toolsets/jenkins-mcp/) | Build status, pipeline logs, and job history (MCP) |
| [ **Grafana**](https://holmesgpt.dev/data-sources/builtin-toolsets/grafanadashboards/) | Query and analyze dashboard configurations and panels |
| [ **Helm**](https://holmesgpt.dev/data-sources/builtin-toolsets/helm/) | Release status, chart metadata, and values |
| [ **Internet**](https://holmesgpt.dev/data-sources/builtin-toolsets/internet/) | Public runbooks, community docs, etc. |
| [ **Kafka**](https://holmesgpt.dev/data-sources/builtin-toolsets/kafka/) | Fetch metadata, list consumers and topics or find lagging consumer groups |
| [ **Kubernetes**](https://holmesgpt.dev/data-sources/builtin-toolsets/kubernetes/) | Pod logs, K8s events, and resource status (kubectl describe) |
| [ **Kubernetes Remediation (MCP)**](https://holmesgpt.dev/data-sources/builtin-toolsets/kubernetes-remediation-mcp/) | Apply fixes like scaling, rollbacks, and resource edits (MCP) |
| [ **Loki**](https://holmesgpt.dev/data-sources/builtin-toolsets/grafanaloki/) | Query logs for Kubernetes resources or any query |
| [ **MariaDB**](https://holmesgpt.dev/data-sources/builtin-toolsets/database-mariadb/) | MariaDB database queries and diagnostics |
| [ **MongoDB**](https://holmesgpt.dev/data-sources/builtin-toolsets/mongodb/) | Query data, diagnose performance, inspect schemas, find slow operations |
| [ **MongoDB Atlas**](https://holmesgpt.dev/data-sources/builtin-toolsets/mongodb-atlas/) | Cluster health, slow queries, and performance diagnostics |
| [ **NewRelic**](https://holmesgpt.dev/data-sources/builtin-toolsets/newrelic/) | Investigate alerts, query tracing data |
| [ **OpenShift**](https://holmesgpt.dev/data-sources/builtin-toolsets/openshift/) | Projects, routes, builds, security context constraints, and deployment configs |
| [ **Prefect (MCP)**](https://holmesgpt.dev/data-sources/builtin-toolsets/prefect-mcp/) | Workflow orchestration monitoring, flow runs, and worker health (MCP) |
| [ **Prometheus**](https://holmesgpt.dev/data-sources/builtin-toolsets/prometheus/) | Investigate alerts, query metrics and generate PromQL queries |
| [ **RabbitMQ**](https://holmesgpt.dev/data-sources/builtin-toolsets/rabbitmq/) | Partitions, memory/disk alerts, troubleshoot split-brain scenarios and more |
| [ **Robusta**](https://holmesgpt.dev/data-sources/builtin-toolsets/robusta/) | Multi-cluster monitoring, historical change data, runbooks, PromQL graphs and more |
| [ **ServiceNow**](https://holmesgpt.dev/data-sources/builtin-toolsets/servicenow/) | Query tables and incident records |
| [ **Sentry**](https://holmesgpt.dev/data-sources/builtin-toolsets/sentry-mcp/) | Error tracking, issues, and performance monitoring (MCP) |
| [ **Slab**](https://holmesgpt.dev/data-sources/builtin-toolsets/slab/) | Team knowledge base and runbooks on demand |
| **Splunk** | Log search and analysis (MCP) |
| [ **SQL Databases**](https://holmesgpt.dev/data-sources/builtin-toolsets/database-postgresql/) | PostgreSQL, MySQL, ClickHouse, MariaDB, SQL Server, Azure SQL, SQLite |
| [ **Tempo**](https://holmesgpt.dev/data-sources/builtin-toolsets/grafanatempo/) | Fetch trace info, debug issues like high latency in application |
| [ **VictoriaLogs**](https://holmesgpt.dev/data-sources/builtin-toolsets/victorialogs/) | Query logs from VictoriaLogs using LogsQL |
| **VictoriaMetrics** | Query metrics from a Prometheus-compatible TSDB (`vmsingle` / `vmcluster`) |
| [ **Zabbix**](https://holmesgpt.dev/data-sources/builtin-toolsets/zabbix/) | Monitor hosts, problems, events, triggers, and historical metrics |

See the [full list of built-in toolsets](https://holmesgpt.dev/data-sources/builtin-toolsets/) for additional integrations including Cilium, KubeVela, Notion, and more.

#### 🚀 End-to-End Automation

HolmesGPT can fetch alerts/tickets to investigate from external systems, then write the analysis back to the source or Slack.

| Integration             | Status    | Notes |
|-------------------------|-----------|-------|
| Slack                   | ✅        | [Demo.](https://www.loom.com/share/afcd81444b1a4adfaa0bbe01c37a4847) Available via [Robusta](https://home.robusta.dev/) |
| Microsoft Teams         | ✅        | Available via [Robusta](https://home.robusta.dev/) |
| Prometheus/AlertManager | ✅        | Robusta or HolmesGPT CLI |
| PagerDuty               | ✅        | HolmesGPT CLI only |
| OpsGenie                | ✅        | HolmesGPT CLI only |
| Jira                    | ✅        | HolmesGPT CLI only |
| GitHub                  | ✅        | HolmesGPT CLI only |

### 🔐 Data Privacy

By design, HolmesGPT has **read-only access** and respects RBAC permissions. It is safe to run in production environments.
