import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { stakeTokens } from '../../../utils/api';

const UpdateTable = ({ wallet, stake, amount = 0 }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{wallet}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Available after:</span>
        <span className="has-text-weight-bold">{wallet - amount}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Current Stake:</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Stake:</span>
        <span className="has-text-weight-bold">{stake + Number(amount)}</span>
      </Level>
    </>
  )
}

export default function Stake({ toggle, tokenHoldings, onUpdate }) {  
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    let res = await stakeTokens(amount);
    onUpdate();
    return res;
  };

  const preventMax = (e) => {
    if (parseInt(e.target.value) > tokenHoldings.wallet) {
      e.target.value = tokenHoldings.wallet; 
    }
  }

  return (
    <FormModal
      title="Stake"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable wallet={tokenHoldings.wallet} stake={tokenHoldings.stake} />}
    >
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue={100}
            onInput={preventMax}
          />
          <Icon align="right" color="white" className="mr-4">
            AMT
          </Icon>
        </div>
      </div>
    </FormModal>
  );
};