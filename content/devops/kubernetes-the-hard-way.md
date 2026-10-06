---
title: "Kubernetes the Hard Way"
order: 13.5
summary: "A study guide to Kelsey Hightower's Kubernetes the Hard Way: what each of the 13 labs builds by hand, which part of Kubernetes it exposes, and what to take away."
category: "Production Skills"
level: Advanced
---

# Kubernetes the Hard Way

[Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) by Kelsey Hightower builds a working cluster from bare binaries: no kubeadm, no managed service, no installer. You generate every certificate, write every config file and start every component as a systemd service yourself. It's slow on purpose. Afterwards, nothing a managed cluster does is magic any more.

> **Note:** The tutorial's text is licensed CC BY-NC-SA 4.0, which can't be mixed into this site's content, so this page is a study guide written for Atlas CE: what each lab does and why it matters, with a link to the lab itself. Work through the labs on the original site, and read the matching section here before or after each one. The [Kubernetes](/devops/kubernetes) module covers the concepts in depth.

## What You Build

Four Debian machines, virtual or physical:

| Machine | Role |
| --- | --- |
| `jumpbox` | Where you run every command: holds the binaries, certificates and configs and copies them out |
| `server` | The control plane: etcd, the API server, the controller manager and the scheduler |
| `node-0`, `node-1` | Workers: containerd, the kubelet and kube-proxy, each with its own pod subnet |

Everything is wired by hand, so each component's flags, certificates and connections are visible. That's the point: on a managed cluster the same pieces exist, they're just hidden.

## The Labs, One by One

### 01 · Prerequisites

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/01-prerequisites.md)

You provision the four machines and confirm the OS version. **Takeaway:** a control plane and workers are just Linux hosts; Kubernetes adds no special hardware.

### 02 · Set Up the Jumpbox

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/02-jumpbox.md)

You install basic tools and download the release binaries: `kubectl`, the four control plane components, `etcd`, `containerd`, `runc`, the CNI plugins and `crictl`. **Takeaway:** Kubernetes is a handful of separate programs, not one monolith. Count them; you'll configure each one.

### 03 · Provisioning Compute Resources

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/03-compute-resources.md)

You record each machine's IP, hostname and pod subnet, set up SSH access from the jumpbox and fill in `/etc/hosts`. **Takeaway:** components find each other by name and address; get naming wrong here and certificates fail later.

### 04 · Certificate Authority and TLS Certificates

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/04-certificate-authority.md)

You create a CA with OpenSSL and issue certificates for the admin user, each kubelet, kube-proxy, the controller manager, the scheduler, the API server and service-account signing, then copy them to the machines that need them. **Takeaway:** every connection in a cluster is mutual TLS. A certificate's subject is its identity: a kubelet's `CN=system:node:node-0` in group `system:nodes` is what lets the Node authorizer limit it to its own pods.

### 05 · Kubernetes Configuration Files

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/05-kubernetes-configuration-files.md)

You write a kubeconfig for each client of the API server: kubelets, kube-proxy, the controller manager, the scheduler and the admin. **Takeaway:** a kubeconfig is just three things bundled: where the API server is, the CA to trust, and the client certificate to present. The one in `~/.kube/config` on your laptop is the same shape.

### 06 · Data Encryption Config and Key

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/06-data-encryption-keys.md)

You generate a key and an encryption config that tells the API server to encrypt Secrets before writing them to etcd. **Takeaway:** by default Secrets are only base64-encoded in etcd. Encryption at rest is an API server setting you have to turn on, and managed providers do it for you with a KMS.

### 07 · Bootstrapping etcd

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/07-bootstrapping-etcd.md)

You install etcd on the server as a systemd service and check that it answers. **Takeaway:** etcd is the cluster's only database: every object you `kubectl apply` ends up as a key here. Back it up and you can rebuild the control plane; lose it and the cluster forgets everything.

### 08 · Bootstrapping the Control Plane

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/08-bootstrapping-kubernetes-controllers.md)

You run the API server, controller manager and scheduler as systemd units with their certificates and configs, then grant the API server permission to talk to kubelets (for `logs`, `exec` and `port-forward`). **Takeaway:** the API server is the only component that talks to etcd; everything else, including the scheduler and controllers, is a client watching the API. That's why the control plane scales and fails the way it does.

### 09 · Bootstrapping the Worker Nodes

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/09-bootstrapping-kubernetes-workers.md)

On each worker you install containerd and runc, configure the CNI bridge for that node's pod subnet, disable swap, and start the kubelet and kube-proxy. **Takeaway:** the kubelet is the agent that turns PodSpecs into running containers through the container runtime; kube-proxy turns Services into packet rules. Neither runs on its own: both take orders from the API server.

### 10 · Configuring kubectl for Remote Access

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/10-configuring-kubectl.md)

You build an admin kubeconfig on the jumpbox and check the nodes are `Ready`. **Takeaway:** `kubectl` is just an HTTPS client of the API server; anything it does, you could do with `curl` and the right certificate.

### 11 · Pod Network Routes

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/11-pod-network-routes.md)

You add static routes so each node can reach the other node's pod subnet. **Takeaway:** the Kubernetes network model requires every pod to reach every other pod without NAT, but Kubernetes doesn't provide that itself. Here it's two routes; in production a CNI plugin such as Calico or Cilium does the same job at scale.

### 12 · Smoke Test

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/12-smoke-test.md)

You confirm Secrets are encrypted in etcd, then exercise deployments, port forwarding, logs, exec and a NodePort service. **Takeaway:** each check proves one connection you built: API server → etcd, API server → kubelet, kubelet → runtime, kube-proxy → service rules.

### 13 · Cleaning Up

[Open the lab](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/13-cleanup.md)

You delete the machines. **Takeaway:** nothing persists outside the hosts you made. A real cluster's durability is etcd backups plus the configs that recreate the rest.

## What to Remember

- **Certificates are identity.** Most "the cluster is broken" problems in hand-built or upgraded clusters are expired or misnamed certificates.
- **The API server is the hub.** etcd sits behind it; every other component watches it. Follow a request from `kubectl` to a running container and you've understood the architecture.
- **Networking is a contract, not a feature.** Kubernetes defines the rules (pod-to-pod without NAT, Services as stable virtual IPs); CNI plugins and kube-proxy implement them.
- **Managed clusters hide this, they don't remove it.** EKS, GKE and AKS run the same components; when one misbehaves, this mental model is what you debug with.
