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

  // const updateTable = [
  //   { title: "Current Stake", value: tokenHoldings.stake },
  //   // { title: "After Stake", value: tokenHoldings.stake - (values.amount ? values.amount : 0) },
  //   { title: "After Stake", value: 5 },
  //   { title: "Stake will be released on", value: "9/12/2021" },
  // ]

  return (
    <FormModal
      title="Unstake"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable stake={tokenHoldings.stake} />}
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

    {/* <div className="field level px-5 pt-5">
      <span className="has-text-silver">Current Stake:</span>
      <label className="label">{tokenHoldings.stake}</label>
    </div>
    <div className="field level px-5">
      <span className="has-text-silver">After Stake:</span>
       <label className="label">{tokenHoldings.stake - (values.amount ? values.amount : 0)}</label>
    </div>
    <div className="field level px-5">
      <span className="has-text-silver">Stake will be released on:</span>
      <label className="label">9/12/2021</label>
    </div> */}
    </FormModal>
  );
};