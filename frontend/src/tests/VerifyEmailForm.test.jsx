import React, {useState} from "react"
import {render, screen, cleanup, fireEvent, waitFor, within} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter, Route} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, delay, HttpResponse} from 'msw';
import MockAuthProvider, {mockSetAccessToken, mockSetUser} from "../__mocks__/MockAuthProvider.jsx";
import {access_token} from "./tests_utils.jsx";
import { mockedNavigate } from "../__mocks__/mockRouter"; // Isso já ativa o mock de useNavigate
import "../__mocks__/mockSendAlert.jsx";

import VerifyEmailForm from "../components/VerifyEmailForm.jsx";



function fill_form(otp) {
    fireEvent.change(screen.getByPlaceholderText("Insira o código"), {target: {value: otp}});
}


function server_use(body={ok: 'ok'}, status={status: 200}){
    server.use(
        http.post('http://127.0.0.1:8000/user/otp-verification/', async({request})=>{
            return HttpResponse.json(body, status)
        })
    )
}



import Alert, { __mocked_send_alert as mockedSendAlert } from "../utils/Alert.jsx";





afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    server.resetHandlers();

})

describe('Test component VerifyEmailForm', () => {

    beforeEach(() => {

        function Wrapper(){
           const [errors, setErrors] = useState("")
            return (
                <MemoryRouter>
                    <MockAuthProvider>
                        <VerifyEmailForm set_error={setErrors} errors={errors}/>

                    </MockAuthProvider>
                </MemoryRouter>
            )
        }

        const util = render(<Wrapper />)


    });

    it("should render the verify email form", () => {

        const form = screen.getByTestId("verify_email_form");
        expect(form).toBeInTheDocument();

    });


    it("should disable submit button if code is less than 8 characters", () => {

        fill_form('1234567');
        const btn = screen.getByTestId("verify_email_submit_btn");
        expect(btn).toBeDisabled()

    });

    it("should enable submit button if code is 8 or more characters", () => {
        fill_form("12345678");
        const btn = screen.getByTestId("verify_email_submit_btn");
        expect(btn).not.toBeDisabled();
    });

    it("should show error if OTP is invalid", async ()=>{

        server_use("Código inválido ou expirado", {status: 400})
        fill_form("invalid_");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));


        await waitFor(()=>{
            expect(screen.getByText("Código inválido ou expirado")).toBeInTheDocument()
        })

    });


    it("should set AccessToken and User if OTP is valid", async ()=>{


        server_use({access: access_token}, {status: 200})
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));



        await waitFor(()=>{
            expect(mockSetAccessToken).toHaveBeenCalledWith(access_token);
            expect(mockSetUser).toHaveBeenCalled()
        })

    });

    it("should navigate to /dashboard and show an alert if OTP is valid", async ()=>{


        server_use({access: access_token}, {status: 200})
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));


        await waitFor(()=>{
            expect(mockedNavigate).toHaveBeenCalled();
        })

        await waitFor(()=>{
            expect(mockedSendAlert).toHaveBeenCalledWith("Conta criada com sucesso", "success");
        })


    });


    it("should clear localStorage after success", async ()=>{
        localStorage.setItem("otp_timer", "126753");
        localStorage.setItem("is_timer_end", "true");

        server_use({access: access_token}, {status: 200})
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));

        await waitFor(()=>{
            expect(localStorage.getItem("otp_timer")).toBeNull();
            expect(localStorage.getItem("is_timer_end")).toBeNull();
        })

    })



})