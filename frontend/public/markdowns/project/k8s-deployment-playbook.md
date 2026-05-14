![](/images/project/k8s-deployment-playbook/containers_kubernetes.webp)

For Data scientist/ML Engineers who are interested in deploying statistical/machine learning models into software applications i.e building AI service/product.

It is important to know these concepts as you would understand what it means to deploy your models as a container, running several container instances and pushing regular updates & deployments continuously.

The implementation of this concepts would help build AI service/product in a way that would allow for scale and enable a large number of users to access these services/products with reduced cost on supporting hardware

Typically building your AI app would consist of these basic components; Front-end, API Endpoints & Database and Statistical/ML engine. You build the app and it works fine on your local system. Now you want to deploy the app so many people can have access.

When deploying your application to a the host/production environment , you don’t want a situation where the app suddenly fails to run in the production environment. You would say to yourself, “It ran on my system”. Yes, but this is a different environment.

This is where **Containers** come to the rescue.
> ##### Containerization simply means deploying your app in a container, the dependencies and environmental variable are defined within the container so when the container is run in a new environment, it simply declares and installs all the required environmental variable and dependencies the app needs to function. This is the concept of containerization.

Popularly known Container companies such [Docker](https://twitter.com/Docker) whose containers are known as Dockerfile, rkt, & Linux containers
> Apart from the deploying the whole app as a container, service components of the app can be grouped and each deployed as a container, this is known as Microservice, This means grouping similar service endpoints together and deploying them.
> ex. An app that has a Payment service feature and AI service features needs to be deployed, these services can be deployed individually in their own containers and run. There are many benefit of a Microservice architecture. You can check it up.

Your app has been deployed in its container and its running on the host server. As time goes, the number users making use of your AI platform starts increasing exponentially, you want to buy more capacity i.e RAM, CPU, storage (Vertical Scaling) but its expensive.

This is where **Kubernetes** comes to the rescue.
> ##### Kubernetes is a Container Orchestration service. On a high level what Kubernetes does is to spin up multiple containers of a particular service (such as AI or Payment service) in case one container falls, another can pick up the slack.

ex. An app running its payment feature and AI feature, if payment service suddenly stops and people can’t make payment on the app at that moment. Kubernetes spin up another container running that payment service, it allows for a more resilient application during peak period.

Kubernetes runs these containers in pods, similar containers can be grouped in a pod, or atimes it can be one container to a pod. Kubernetes runs this pods on clusters/node which helps it to scale however the since the containers are temporary can go down any time.
> There is need for a management system that spins up a containers when there is a need and tears it down when there is none and also re-directs requests from the users to running containers in a way that does not overload the system.This is the one of the core function of Kubernetes known as Load Balancing .

The containers need to share a more persistent data storage as the container can be torn down easily, it would be ineffective to store data with their nodes.

Consequently containers can be configured to share a file system for their service, it would reside in a more persistent location cant be torn down easily.

Google and AWS provides kubernetes services which help manage containerized applications.

Now you would want to push updates to your app maybe to improve its AI feature, or some changes to your Payment service. This cant be done on the fly because you would need to compile and build the code, test the code, before deploying.

Traditionally this was done by compile and building in the development environment before deploying to production. The hassel with this process.

**Continuous integration/delivery** service comes to the rescue.
> Continuous Integration/Delivery is a novel way of deploying changes and updates to your AI applications. It involves automated build, test and deployment of code. In more practical terms, Continuous delivery and integration services connect directly to your Github repo so when you push update, it immediate captures this update, run tests on it, if there is bug returns the error else moves on and deploys the updated code as a new container running on your Kubernetes cluster.\
> Platforms such as Gitlab CI, Circle CI, Jenkins offer Continuous integration and delivery services for the development of code. AWS also offer it as one of its service known as CodeBuild.\
> Many companies such as Airbnb, Tinder, Reddit have adopted containerized systems with Kubernetes for their application. Tinder migrated about 200 services, running a Kubernetes cluster at scale totaling 1,000 nodes, 15,000 pods, and 48,000 running containers. thats massive!

Check out courses on Containers, Kubernetes, CI/CD on [Udemy](https://udemy.com/topic/kubernetes/), [Udacity](https://udacity.com/course/scalable-microservices-with-kubernetes--ud615), [Pluralsight](https://pluralsight.com/courses/getting-started-kubernetes) etc

Also Check out this [video](https://t.co/ceGYxDbsso?amp=1) on AWS EKS (Amazon Kubernetes service).

Thanks for reading. Hope it was informative.

Cheers!
