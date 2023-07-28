import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useState } from "react";
import { getProfileById, getProviderSa, icrc1Decimal, icrc1Transfer } from "../../../utils/api";
import { Principal } from "@dfinity/principal";
import PopupModal from "./PopupModal";
import { format_token } from "../../../utils/util";

interface DepositProps {
    toggle: () => void;
    userTokenBalance: number;
    receiver: string;
    provider?: string;
    subacc?: Uint8Array;
    isProvider: boolean;
}
export default function Deposit({ toggle, userTokenBalance, receiver, provider, isProvider, subacc } : DepositProps) {
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState(userTokenBalance);

    const handleDeposit = async (value : any)=>{
        setError(null);
        const { reserved } = value;
        try 
        {
            const digit = await icrc1Decimal();
            const amount : number = Number(reserved)*Math.pow(10, Number(digit))
            const transfer = await icrc1Transfer(BigInt(amount), Principal.fromText(receiver), subacc)
            return {reserved: Number(reserved), transfer: transfer};
        } catch (err) {
            setError(err.message);
        }
    }

    const handleDepositProvider = async (value : any)=>{
        setError(null);
        const { reserved } = value;
        try 
        {
            const digit = await icrc1Decimal();
            const amount : number = Number(reserved)*Math.pow(10, Number(digit))
            let subacc: any = await getProviderSa(Principal.fromText(provider));
            if(subacc.length == 0){
                subacc = [];
            }
            const transfer = await icrc1Transfer(BigInt(amount), Principal.fromText(receiver), subacc)
            return {reserved: Number(reserved), transfer: transfer};
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
        handleSubmit={isProvider ? handleDepositProvider : handleDeposit}
    >
        <label className="label">Enter the amount you want to deposit</label>
        <br/>
        <label className="label">Your current balance {format_token(userTokenBalance)}</label>
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
        {isProvider &&(<>
            <label className="label">Deposit to this principal ID:</label>
            <p className="is-flex is-justify-content-center has-text-white">{isProvider ? provider : receiver}</p>
            </>
        )}
        </PopupModal></>
    );
}