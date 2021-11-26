import { Field } from "react-final-form";
import { Level } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { unStakeTokens } from '../../../utils/api';


const UpdateTable = ({ stake, amount = null }) => {
  // {items.map(item => 
    // <Level key={item.title} className="has-text-silver px-5">
    //   <span>{item.title}</span>
    //   <span className="has-text-weight-bold">{item.value}</span>
    // </Level>
  // )}
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Current Stake</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>

      <Level className="has-text-silver px-5">
        <span>After Stake</span>
        <span className="has-text-weight-bold">{stake - (amount ? amount : 0)}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Stake will be released on</span>
        <span className="has-text-weight-bold">9/12/2021</span>
      </Level>
    </>
  )
}

export default function Unstake({ toggle, tokenHoldings }) {  
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    return await unStakeTokens(amount);
  };

  // const amount = 0;
  // const tableItems = [
  //   { title: "Current Stake", value: tokenHoldings.stake },
  //   { title: "After Stake", value: tokenHoldings.stake - (amount) },
  //   { title: "Stake will be released on", value: "9/12/2021" },
  // ]

  const tableItems = {
    // proxy = (amount) => {
    //   return [
    //     { title: "Current Stake", value: tokenHoldings.stake },
    //     { title: "After Stake", value: tokenHoldings.stake - (amount) },
    //     { title: "Stake will be released on", value: "9/12/2021" },
    //   ];
    // }()

    proxy: (amount) => {
      return 
       [
        { title: "Current Stake", value: tokenHoldings.stake },
        { title: "After Stake", value: tokenHoldings.stake - (amount) },
        { title: "Stake will be released on", value: "9/12/2021" },
      ]
    }
  };

  return (
    <FormModal
      title="Unstake"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable stake={tokenHoldings.stake} />}
      tableItems={tableItems}
    >
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue={100}
            max={tokenHoldings.stake}
          />
          <span className="icon is-right has-text-white mr-4">AMT</span>
        </div>
      </div>
    </FormModal>
  );
};