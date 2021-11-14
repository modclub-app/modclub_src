import "./Faq.scss";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

const data = {
  title: "",
  rows: [
    {
      uuid: "1jkl2j3",
      title: "Why use MODCLUB?",
      content: `Earn trust from your community and save costs on UGC. Benefit from a large pool of moderators to handle content. Focus on your core product and increase your time to market .`,
    },
    {
      uuid: "2h2rhkjh",
      title: "How to integrate with MODCLUB?",
      content:
        "We have a simple to use developer SDK. Reach out to us to get access.",
    },
    {
      uuid: "2j5h2f",
      title: "What does the MODCLUB token do?",
      content: `The MOD token is a representation of your reputation on the platform. Developers choose how much MOD token you need to have staked in order to moderate their content. You can receive or lose MOD tokens depending how you vote.`,
    },
    {
      uuid: "8j43nh1",
      title: "Where can I get MOD tokens?",
      content:
        "You can receive MOD tokens through our airdrop or via exchanges.",
    },
  ],
};
const styles = {
  bgColor: "#212121",
  rowContentColor: "white",
  rowTitleColor: "white",
  arrowColor: "white",
  rowContentTextSize: "16",
};

export default function Faq() {
  return (
    <Accordion allowZeroExpanded>
      {data.rows.map((item) => (
        <AccordionItem key={item.uuid}>
          <AccordionItemHeading>
            <AccordionItemButton>{item.title}</AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>{item.content}</AccordionItemPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
