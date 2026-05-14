The demand for streaming service has risen exponentially, companies like Netflix, Spotify, Twitter, Uber want to offer real-time services to their customers, this would entail instantaneous flow of data across their network of computers. They also want to collect data and build real-time analytics of their business process to make decisions on the fly.

Stream technology allows them to achieve this.

![](/images/project/streaming-platform-multi-tenant/streamingsrvc_header_img.webp)

Stream engines are technologies that enable one transfer and process a large amount of data real-time from point A to point B with low latency over a network.

Some applications of data streaming include

— Real-time music and video streaming

— Real-time update of your social media feed.

— Real-time ride data event collection

With demand for instantaneous services increasing, Stream tech are the go-tos.

Popular stream tech includes Apache Kafka, Spark stream, Flume, Storm etc One common theme about these stream engines, is they are able to break down large data into micro-batches or a continuous flow and send instantaneously to the client, making use of the distributed computing power of the cloud to partition and process on a large scale. It provides low latency for a transfer involving high throughput.

For Kafka, the data is broken down into events that sent to Topics (a pathway for the data stream), while for Spark stream, it is broken into a continuous stream of data frames/datasets. They are sent over the network to the consumer.

A Netflix user wants to play a movie sitting on a server in Europe. Stream engines are used to send the movie data file from the server to the user over such distance through the network, ensuring that quality of playback doesn’t drop(apart from the added CDNs- content delivery network).
> ##### When these engines are infused with machine learning, it can optimize and adapt the stream to suit the network bandwidth, Youtube uses the same tech, that's why when watching youtube videos, the resolution can automatically adjust itself from 720p to 480p, based on the user’s bandwidth.

Netflix also uses streams engine to collect and send event data on video viewing activities from users to an analytic dashboard. While watching movies Netflix collects data on video performance, encoding efficiency and network efficiency, the data is visualized to help make decisions on the performance of their service across various locations and devices.

Uber uses stream engines to collect event data on their app. When a user opens the Uber app, the action generates a string of data events, from when the rider actually requests a ride to the point where the trip has been completed.
> ##### When the driver picks up the rider, their app sends a ‘pickup completed’ event to the dispatch system effectively starting the trip. When the driver reaches their destination and indicates that the passenger has been dropped off in their app, it sends a ‘trip completed’ event. These data events are sent via streams (Kafka topics) to a data store to be used for future analysis to improve their services.

Also in UberEATS, real-time metrics such as customer satisfaction rates and sales are collected to enable restaurants to better understand the health of their business and the satisfaction of their customers, allowing them to optimize potential earnings

Twitter serves the latest updates, breaking news, and relevant advertisements to users, and many other real-time use cases using stream processing.
> ##### Twitter integrated stream engine in its timeline update pipeline to serve top tweets (the ones you are likely to care about) to its user. These tweets are based on accounts you interact with most, tweets you engage with, and much more. The system that picks the top Tweets uses a machine learning model to predict what Tweets you will be most interested in.

Kafka stream engine is used to build the real-time data pipeline used for re-training the machine learning model with the latest top tweets based your engagements. Since user interest is constantly changing, this model must be retrained/updated regularly in a process called refreshing the model.

Using stream processing engines, Twitter has successfully reduced the time to refresh the model from 7 days to about 1 day, from previously using batch processing. That is, now all the training data is collected and prepared in real-time without any delay.

This makes the model more responsive and adaptive to changes in the user interests, providing top Tweets that change as quickly as the interests do. Additionally, this change has helped the internal systems that back the Home Timeline ranking to be more agile, robust, and resilient.

Also, think of an analytics dashboard receiving real-time data from several POS (Point of Sale) terminals. Stream engines collect this data from the POS terminals and send it instantaneously to analytical dashboards to visualize the data.

I hope I been able to shed more light on Stream Engines. I have been working on a couple of stream projects.

To build stream engines particularly with popular tools like Kafka & Spark-Stream, knowledge of Java or Scala or Python is important. Kafka and Spark Stream supports all but Python is limited in functionality in Kafka.
