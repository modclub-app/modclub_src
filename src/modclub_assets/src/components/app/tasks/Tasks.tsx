import * as React from 'react'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent, getProviderRules } from "../../../utils/api";
import {
  Columns,
  Card,
  Heading,
  Button,
  Icon
} from "react-bulma-components";
import RulesList from "../tasks/RulesList";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import TaskConfirmationModal from "./TaskConfirmationModal";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";

const Task = ({ task, setVoted }) => {
  const [rules, setRules] = useState([]);
  const [html, setHtml] = useState(null);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  const fetchRules = async () => {
    const rules = await getProviderRules(task.providerId);
    setRules(rules);
    setHtml(`<body><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WGQVQ44"
    <p>At the heart of the rewards card concept is the incentive for shoppers to select your business over the endless choices in today’s global market. The more they buy from you, the more rewards they expect to receive.</p>
    <p>Since today’s shoppers are more interested in rewards that can be utilized anywhere, the ideal rewards card concept should utilize a currency technology such as Discover, Mastercard, or Visa, which are pretty much accepted anywhere these days.</p><h2>An Example: Vester &amp; Son’s</h2>
    <p>As an example, let’s assume that Vester &amp; Son’s is an online retailer looking to increase sales via a rewards card program. When shoppers sign up for the Vester &amp; Son’s Rewards program, they only need an account on the Vester &amp; Son’s e-commerce site. This is not a stretch for most customers, because they already provide the following required information every time they make a purchase:</p>
    <ul>
    <li>Full Name</li>
    <li>Email Address</li>
    <li>Phone Number</li>
    <li>Mailing Address</li>
    </ul>
    <p>Once a customer spends over $100 in purchases, Vester &amp; Son’s will provide a Discover card which will be pre-loaded with 10% of their total purchases. Meaning, every $10 spent on Vester &amp; Son’s products will yield a $1 reward. Not a bad deal, right?</p><p>The customer can use their Vester &amp; Son’s Rewards Discover card on anything … wherever Discover is accepted.</p><h2>Using Marqeta as a Rewards Card Source</h2>
    <p>In my “<a href="https://hackernoon.com/leveraging-marqeta-to-build-a-payment-service-in-spring-boot-a-how-to-guide?ref=hackernoon.com" rel="ugc">Leveraging Marqeta to Build a Payment Service in Spring Boot</a>” article published earlier this year, I detailed the following transaction flow used by Marqeta for popular services by Uber, DoorDash, and Square (just to name a few):</p>
    <p><div style="width:0;height:0;position:relative"><div class="fullscreen"><div style="display:block;overflow:hidden;position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;margin:0"><img alt="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain"/><noscript><img alt="image" sizes="100vw" srcSet="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=640&amp;q=75 640w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=750&amp;q=75 750w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=828&amp;q=75 828w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=3840&amp;q=75 3840w" src="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ir03ccw.png&amp;w=3840&amp;q=75" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain" loading="lazy"/></noscript></div></div></div></p>
    <p>As it turns out, using Marqeta to fund a globally accepted rewards card follows a very similar flow:</p>
    <p><div style="width:0;height:0;position:relative"><div class="fullscreen"><div style="display:block;overflow:hidden;position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;margin:0"><img alt="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain"/><noscript><img alt="image" sizes="100vw" srcSet="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=640&amp;q=75 640w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=750&amp;q=75 750w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=828&amp;q=75 828w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=3840&amp;q=75 3840w" src="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-xq13c1l.png&amp;w=3840&amp;q=75" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain" loading="lazy"/></noscript></div></div></div></p>
    <p>In this example, Vester &amp; Son’s provides a funding source for the rewards card program. As each customer qualifies for the program, funds are made available for use on the Discover-based rewards card.</p>
    <p>While the customer can use the Discover card for future purchases at Vester &amp; Son’s, nothing prevents the purchase of anything from anywhere, including from Vester &amp; Son’s competitors.</p>
    <h3>Creating the Rewards Card Program</h3>
    <p>Leveraging the Marqeta API, I was able to establish a new program for the Vester &amp; Son’s rewards card program using the following cURL command:</p>
    <pre><code class="language-javascript">curl --location --request POST &#x27;https://sandbox-api.marqeta.com/v3/fundingsources/program&#x27; \
    --header &#x27;accept: application/json&#x27; \
    --header &#x27;Content-Type: application/json&#x27; \
    --header &#x27;Authorization: Basic APPLICATION_TOKEN_GOES_HERE:ADMIN_ACCESS_TOKEN_GOES_HERE&#x27; \
    --data-raw &#x27;{&quot;name&quot;:&quot;vester_rewards_card_program&quot;,&quot;active&quot;:true}&#x27;
    </code></pre>
    <p>The following response was returned, which includes a token property that will be referenced later in this article:</p><pre><code class="language-javascript">{
    &quot;name&quot;: &quot;vester_rewards_card_program&quot;,
    &quot;active&quot;: true,
    &quot;token&quot;: &quot;9ff9d776-bf89-4350-bac2-ee8d8412f611&quot;,
    &quot;created_time&quot;: &quot;2021-12-28T12:37:47Z&quot;,
    &quot;last_modified_time&quot;: &quot;2021-12-28T12:37:47Z&quot;,
    &quot;account&quot;: &quot;12.003.001.000000&quot;
    }
    </code></pre>
    <h2>A Quick Example (Using cURL Commands)</h2>
    <p>For the “Leveraging Marqeta to Build a Payment Service in Spring Boot” article (referenced above), I created a Spring Boot API service to act as a front-end to the Marqeta API, which can be found on GitLab at the following URL:</p>
    <p><a href="https://gitlab.com/johnjvester/marqeta-example?ref=hackernoon.com" target="_blank" rel="noopener noreferrer ugc">https://gitlab.com/johnjvester/marqeta-example</a></p><p>I will continue to use this service in this publication as well.</p><h2>Locating the Customer</h2>
    <p>The Spring Boot User API was enhanced to return Marqeta user data for a given customer, Doing so utilized the user token as the unique key in the URI. Using the <a href="https://twitter.com/randykern?ref=hackernoon.com" target="_blank" rel="noopener noreferrer ugc">Randy Kern</a> user token (from my prior publication), we can send the following cURL request:</p>
    <pre><code class="language-javascript">curl --location -X GET &#x27;localhost:9999/users/1017b62c-6b61-4fcd-b663-5c81feab6524&#x27;
    </code></pre>
    <p>The request returns the following response payload:</p><pre><code class="language-javascript">{
    &quot;token&quot;: &quot;7193b62c-6b61-4fcd-b663-5c81feab6524&quot;,
    &quot;createdTime&quot;: 1628946073000,
    &quot;lastModifiedTime&quot;: 1628946074000,
    &quot;metadata&quot;: {},
    &quot;active&quot;: true,
    &quot;firstName&quot;: &quot;Randy&quot;,
    &quot;lastName&quot;: &quot;Kern&quot;,
    &quot;usersParentAccount&quot;: false,
    &quot;corporateCardHolder&quot;: false,
    &quot;accountHolderGroupToken&quot;: &quot;DEFAULT_AHG&quot;,
    &quot;status&quot;: &quot;ACTIVE&quot;
    }
    </code></pre>
    <h3>Locating the Rewards Card</h3>
    <p>The Vester &amp; Son’s e-commerce site would automatically establish a new Vester &amp; Son’s rewards card once the customer made $100 in purchases. To simulate this action, we send the following cURL request to the Marqeta API:</p>
    <pre><code class="language-javascript">curl --location --request POST &#x27;https://sandbox-api.marqeta.com/v3/fundingsources/paymentcard&#x27; \
    --header &#x27;accept: application/json&#x27; \
    --header &#x27;Content-Type: application/json&#x27; \
    --header &#x27;Authorization: Basic APPLICATION_TOKEN_GOES_HERE:ADMIN_ACCESS_TOKEN_GOES_HERE’ \
    --data-raw &#x27;{&quot;postal_code&quot;:&quot;46077&quot;,&quot;account_number&quot;:&quot;6559906559906557&quot;,&quot;exp_date&quot;:&quot;1225&quot;,&quot;cvv_number&quot;:&quot;123&quot;,&quot;user_token&quot;:&quot;1017b62c-6b61-4fcd-b663-5c81feab6524&quot;,&quot;is_default_account&quot;:true}&#x27;
    </code></pre>
    <p>The response payload includes the newly created Discover card information for the Randy Kern customer:</p><pre><code class="language-javascript">{
    &quot;created_time&quot;: &quot;2021-12-28T11:54:08Z&quot;,
    &quot;last_modified_time&quot;: &quot;2021-12-28T11:54:08Z&quot;,
    &quot;type&quot;: &quot;paymentcard&quot;,
    &quot;token&quot;: &quot;2ee44d0b-5d00-4744-af2d-8ab9c8c606b8&quot;,
    &quot;account_suffix&quot;: &quot;6557&quot;,
    &quot;account_type&quot;: &quot;DISCOVER&quot;,
    &quot;active&quot;: true,
    &quot;is_default_account&quot;: true,
    &quot;exp_date&quot;: &quot;1225&quot;,
    &quot;user_token&quot;: &quot;1017b62c-6b61-4fcd-b663-5c81feab6524&quot;
    }
    </code></pre>
    <p>Please note: the expiration date for the card may have to align with the card provider’s standards (it cannot be endless). In these cases, the Vester &amp; Son’s rewards card program would have the necessary business logic in place to route a new card to the customer when the expiration date nears.</p><p>Below is an example of what the Vester &amp; Son’s rewards card for Randy Kern might look like:</p><p><div style="width:0;height:0;position:relative"><div class="fullscreen"><div style="display:block;overflow:hidden;position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;margin:0"><img alt="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain"/><noscript><img alt="image" sizes="100vw" srcSet="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=640&amp;q=75 640w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=750&amp;q=75 750w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=828&amp;q=75 828w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=3840&amp;q=75 3840w" src="/_next/image?url=https%3A%2F%2Fcdn.hackernoon.com%2Fimages%2FcINIFbqqBHP6eJ0PSVZp9TroFeI3-ua23cew.png&amp;w=3840&amp;q=75" decoding="async" data-nimg="fill" style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;object-fit:contain" loading="lazy"/></noscript></div></div></div></p><p>With the user token identified, the Spring Boot service can easily locate the Vester &amp; Son’s rewards card payment cards for the Randy Kern user via the following cURL command:</p>
    <pre><code class="language-javascript">curl --location --request GET &#x27;localhost:9999/paymentcards/user/7193b62c-6b61-4fcd-b663-5c81feab6524&#x27;
    </code></pre>
    <p>The following response includes all the payment cards associated with the Randy Kern customer:</p><pre><code class="language-javascript">[
    {
    &quot;token&quot;: &quot;2ee44d0b-5d00-4744-af2d-8ab9c8c606b8&quot;,
    &quot;createdTime&quot;: 1640692448000,
    &quot;lastModifiedTime&quot;: 1640692448000,
    &quot;type&quot;: &quot;paymentcard&quot;,
    &quot;active&quot;: true,
    &quot;userToken&quot;: &quot;7193b62c-6b61-4fcd-b663-5c81feab6524&quot;,
    &quot;accountSuffix&quot;: &quot;6557&quot;,
    &quot;accountType&quot;: &quot;DISCOVER&quot;,
    &quot;expDate&quot;: &quot;1225&quot;,
    &quot;defaultAccount&quot;: true
    }
    ]
    </code></pre>
    <p>Using the payment card token, we sent the following cURL request to retrieve a single payment card:</p><pre><code class="language-javascript">curl --location --request GET &#x27;localhost:9999/paymentcards/2ee44d0b-5d00-4744-af2d-8ab9c8c606b8&#x27;
    </code></pre>
    <p>This returns a payload limited to the payment card token provided:</p><pre><code class="language-javascript">{
    &quot;token&quot;: &quot;2ee44d0b-5d00-4744-af2d-8ab9c8c606b8&quot;,
    &quot;createdTime&quot;: 1640692448000,
    &quot;lastModifiedTime&quot;: 1640692448000,
    &quot;type&quot;: &quot;paymentcard&quot;,
    &quot;active&quot;: true,
    &quot;userToken&quot;: &quot;7193b62c-6b61-4fcd-b663-5c81feab6524&quot;,
    &quot;accountSuffix&quot;: &quot;6557&quot;,
    &quot;accountType&quot;: &quot;DISCOVER&quot;,
    &quot;expDate&quot;: &quot;1225&quot;,
    &quot;defaultAccount&quot;: true
    }
    </code></pre>
    <p>The Vester &amp; Son’s e-commerce site would store the user token and payment card token for each customer enrolled in the Vester &amp; Son’s rewards card program. This will make it easy to cross-reference a given customer for a given rewards card.</p><p>As the customer earns more rewards, the program adds to the funds available for spending on the customer&#x27;s reward card. Adding funds is as simple as making an API call. From there, the customer can spend their Vester &amp; Son’s rewards anywhere that Discover is accepted.</p><h2>Conclusion</h2>
    <p>Starting in 2021, I have been trying to live the following mission statement, which I feel can apply to any IT professional:</p>
    <blockquote>
    <p>“Focus your time on delivering features/functionality which extends the value of your intellectual property. Leverage frameworks, products, and services for everything else.”</p>
    <p>- J. Vester</p></blockquote>
    </body>`);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <Columns.Column key={task.id} size={12}>
      <Card>
        <Card.Header>
          <Card.Header.Title>
            {task.providerName}
            <span>Submitted by {task.sourceId} {formatDate(task.createdAt)}</span>
          </Card.Header.Title>
          <Progress
            value={Number(task.voteCount)}
            min={Number(task.minVotes)}
          />
        </Card.Header>
        <Card.Content>
          <Heading subtitle>
            {task.title}
          </Heading>

          {/* {'imageBlob' in task.contentType ?
            <img src={getImage(task.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
            :
            <p>{task.text}</p>
          } */}

          <div className="htmlContent preview">
            <div dangerouslySetInnerHTML={{__html: sanitizeHtml(html) }} />
          </div>

          <Link to={`/app/tasks/${task.id}`} className="button is-block mt-4" style={{ width: 100, margin: "auto" }}>
            See More
          </Link>
        </Card.Content>
        <Card.Footer className="tasks-footer">
          <Button.Group alignItems="flex-end">
            <Button className="is-outlined">
              <Icon align="left" size="small" className="has-text-white">
                <span className="material-icons">local_atm</span>
              </Icon>
              <span>{"Rq Stake: " + task.minStake}</span>
            </Button>
            <Button className="is-outlined">
              <Icon align="left" size="small" className="has-text-white">
                <span className="material-icons">stars</span>
              </Icon>
              <span>{"Reward: " + task.minStake}</span>
            </Button>
          </Button.Group>

          <Button.Group style={{ flexWrap: "wrap" }}>
            <div className="mb-4 mt-1" style={{ width: "100%" }}>
              <RulesList
                platform={task.providerName}
                rules={rules}
              />
            </div>
            <TaskConfirmationModal
              task={task}
              onUpdate={() => setVoted(true)}
            />
          </Button.Group>
        </Card.Footer>
      </Card>
    </Columns.Column>
  );
};

export default function Tasks() {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);

  const fetchTasks = async () => {
    const status = { "new": null };
    const content = await getAllContent(status);
    setTasks(content);
  }

  useEffect(() => {
    user && fetchTasks();
    setVoted(false);
  }, [user, voted]);
  
  return (
    <>
      <Userstats />

      <Columns>
        {!tasks ? (
          <div className="loader is-loading p-4 mt-6" />
        ) : tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            setVoted={setVoted}
          />
        ))}
      </Columns>
    </>
  )
}