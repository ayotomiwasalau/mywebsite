![](/images/blog/containers-and-kubernetes-notes/kubernetes-kubelet.png)

For data scientists and ML engineers who are interested in deploying statistical/machine learning models into software applications — i.e. building an AI service or product — it is important to know these concepts. You would understand what it means to deploy your models as a container, run several container instances, and push regular updates and deployments continuously.

The implementation of these concepts would help build AI services/products in a way that would allow for scale and enable a large number of users to access these services/products with reduced cost on supporting hardware.

Typically, building your AI app would consist of these basic components: front-end, API endpoints, database, and statistical/ML engine. You build the app and it works fine on your local system. Now you want to deploy the app so many people can have access.

When deploying your application to the host/production environment, you don't want a situation where the app suddenly fails to run in the production environment. You would say to yourself, "It ran on my system." Yes, but this is a different environment.

This is where **Containers** come to the rescue.

> ##### Containerization simply means deploying your app in a container. The dependencies and environmental variables are defined within the container, so when the container is run in a new environment, it simply declares and installs all the required environmental variables and dependencies the app needs to function. This is the concept of containerization.

Popular container companies such as [Docker](https://twitter.com/Docker), whose containers are defined in Dockerfiles, rkt, and Linux containers.

![](/images/blog/containers-and-kubernetes-notes/containerization.png)

> Apart from deploying the whole app as a container, service components of the app can be grouped and each deployed as a container. This is known as microservices. This means grouping similar service endpoints together and deploying them.
> ex. An app that has a Payment service feature and AI service features needs to be deployed — these services can be deployed individually in their own containers and run. There are many benefits of a microservice architecture. You can check it up.

Your app has been deployed in its container and it's running on the host server. As time goes, the number of users making use of your AI platform starts increasing exponentially. You want to buy more capacity — i.e. RAM, CPU, storage (vertical scaling) — but it's expensive.

This is where **Kubernetes** comes to the rescue.

> ##### Kubernetes is a container orchestration service. On a high level, what Kubernetes does is spin up multiple containers of a particular service (such as AI or Payment service) in case one container fails — another can pick up the slack.

ex. An app running its payment feature and AI feature — if the payment service suddenly stops and people can't make payment on the app at that moment, Kubernetes spins up another container running that payment service. It allows for a more resilient application during peak periods.

Kubernetes runs these containers in pods. Similar containers can be grouped in a pod, or at times it can be one container to a pod. Kubernetes runs these pods on clusters/nodes which helps it to scale; however, since the containers are temporary, they can go down at any time.

> There is need for a management system that spins up containers when there is a need and tears them down when there is none, and also redirects requests from the users to running containers in a way that does not overload the system. This is one of the core functions of Kubernetes known as load balancing.

The containers need to share a more persistent data storage as the container can be torn down easily — it would be ineffective to store data within their nodes.

Consequently, containers can be configured to share a file system for their service. It would reside in a more persistent location that can't be torn down easily.

Google and AWS provide Kubernetes services which help manage containerized applications.

Now you would want to push updates to your app — maybe to improve its AI feature, or some changes to your Payment service. This can't be done on the fly because you would need to compile and build the code, test the code, before deploying.

Traditionally this was done by compiling and building in the development environment before deploying to production. The hassle with this process.

**Continuous integration/delivery** service comes to the rescue.

> Continuous Integration/Delivery is a novel way of deploying changes and updates to your AI applications. It involves automated build, test, and deployment of code. In more practical terms, Continuous delivery and integration services connect directly to your GitHub repo so when you push an update, it immediately captures this update, runs tests on it, if there is a bug returns the error else moves on and deploys the updated code as a new container running on your Kubernetes cluster.\
> Platforms such as GitLab CI, Circle CI, and Jenkins offer Continuous integration and delivery services for the development of code. AWS also offers it as one of its services known as CodeBuild.\
> Many companies such as Airbnb, Tinder, and Reddit have adopted containerized systems with Kubernetes for their applications. Tinder migrated about 200 services, running a Kubernetes cluster at scale totaling 1,000 nodes, 15,000 pods, and 48,000 running containers. That's massive!

Check out courses on Containers, Kubernetes, and CI/CD on [Udemy](https://udemy.com/topic/kubernetes/), [Udacity](https://udacity.com/course/scalable-microservices-with-kubernetes--ud615), and [Pluralsight](https://pluralsight.com/courses/getting-started-kubernetes).

Also check out this [video](https://t.co/ceGYxDbsso?amp=1) on AWS EKS (Amazon Kubernetes Service).

## References

- [GitHub — Deploy Flask App to Kubernetes Using EKS](https://github.com/ayotomiwasalau/Deploy-Flask-App-to-Kubernetes-Using-EKS)
