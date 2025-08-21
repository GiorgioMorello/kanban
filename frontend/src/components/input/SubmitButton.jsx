import React from 'react';


export default function SubmitButton({disable_submit, data_testid}){



    return (
        <input data-testid={data_testid} disabled={disable_submit} className={disable_submit ? 'submit_btn_disabled' : 'submit_btn'} type='submit' value='Enviar'/>
    )
}

