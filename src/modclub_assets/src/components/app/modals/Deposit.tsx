import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useState } from "react";
import { icrc1Decimal, icrc2Approve, topUpProviderReserve } from "../../../utils/api";
import { Principal } from "@dfinity/principal";
import PopupModal from "./PopupModal";

interface DepositProps {
    toggle: () => void;
    userTokenBalance: number;
    identity: any;
    provider: string;
}

export default function Deposit({ toggle, userTokenBalance, identity, provider } : DepositProps) {
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState(userTokenBalance);

    const handleDeposit = async (value : any)=>{
        setError(null);
        const { reserved } = value;
        try 
        {
            const digit = await icrc1Decimal();
            const amount = Number(reserved)*Math.pow(10, Number(digit))
            await icrc2Approve(amount);
            await topUpProviderReserve(amount, Principal.fromText(provider))
            return Number(reserved);
        } catch (err) {
            setError(err.message);
        }
    }

    const preventMax = (e) => {
        const newValue = parseInt(e.target.value);
        if (newValue > userTokenBalance) {
            setInputValue(userTokenBalance);
            e.target.value = userTokenBalance;
        } else {
            setInputValue(newValue);
        }
    };

    return (
    <>{error != null && (
        <Notification
          color={"danger"}
          className="has-text-centered"
        >
          {error}
        </Notification>
      )}
    <PopupModal
        toggle={toggle}
        title="Deposit"
        subtitle="Congratulation!"
        handleSubmit={handleDeposit}
    >
        <label className="label">Enter the amount you want to deposit</label>
        <div className="field">
            <div className="control">
                <div className="is-flex is-align-items-center">
                    <Field
                        name="reserved"
                        component="input"
                        type="number"
                        className="input"
                        initialValue={0}
                        onInput={preventMax}
                    />
                    <Icon align="right" color="white" className="mr-4 justify-content-center" style={{marginLeft:"1.5rem"}}>
                    AMT
                    </Icon>
                </div>
            </div>
        </div>
        <label className="label">Deposit to this principal ID:</label>
        <p className="is-flex is-justify-content-center has-text-white">{provider}</p>
    </PopupModal></>
    );
}