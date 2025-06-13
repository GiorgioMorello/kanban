import React from "react"
import {render, screen, cleanup, fireEvent, waitFor, within} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, delay, HttpResponse} from 'msw';
import {access_token} from './tests_utils.jsx'
import MockAuthProvider from "../__mocks__/MockAuthProvider.jsx";
import { mockedNavigate } from "../__mocks__/mockRouter"; // Isso já ativa o mock de useNavigate
import "../__mocks__/mockSendAlert.jsx";

import LoginPage from "../routes/login_and_register_form/LoginPage";




import Alert, { __mocked_send_alert as mocked_send_alert } from "../utils/Alert.jsx";





function fill_form(){
    fireEvent.change(screen.getByLabelText(/e-mail/i), {target: {value: "teste@gmail.com"}})
    fireEvent.change(screen.getByLabelText(/^senha$/i),{target: {value: "123456789"}})
}



// 3️⃣ Cleanup
afterEach(() => {
    cleanup(); // Remove os elementos renderizados da tela
    server.resetHandlers();
    vi.clearAllMocks();
});
describe('LoginPage test', ()=> {

    beforeEach(()=>{
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )
    })





    it("renders the page title", () => {
        const title = screen.getByTestId("login_page_title");

        expect(title).toBeInTheDocument();
    });


    it("renders LoginPage form", () => {
        const formElement = screen.getByTestId("login_form");
        expect(formElement).toBeInTheDocument();
    });

    it("renders all input fields from login form", () => {
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });



    it("should send the correct body data to API", async ()=>{
        let requestBody;

        server.use(
            http.post('http://127.0.0.1:8000/user/login/', async ({request})=>{
                requestBody = await request.json();

                return HttpResponse.json({

                }, {status: 200})
            })
        );


        fill_form();

        const submit_btn = screen.getByTestId("login_form_submit_btn");

        fireEvent.click(submit_btn)

        await waitFor(()=>{
            expect(requestBody).toEqual({
                email: "teste@gmail.com",
                password: "123456789"
            })
        });

    });


    it("should show error message if credentials are incorrect", async ()=>{

        server.use (
            http.post('http://127.0.0.1:8000/user/login/', async ({request})=>{

                return HttpResponse.json({
                    "detail": "E-mail ou Senha incorreto",
                }, {status: 401});
            })
        );

        fill_form();

        const submit_btn = screen.getByTestId("login_form_submit_btn");
        fireEvent.click(submit_btn);

        await waitFor(()=>{
            expect(screen.getByText('E-mail ou Senha incorreto')).toBeInTheDocument();
        });


    });



    it("should call send_alert and useNavigate after successful login", async ()=>{
        server.use(
            http.post('http://127.0.0.1:8000/user/login/', async ({request})=>{

                return HttpResponse.json({
                    access: access_token,
                    refresh: 'refresh token',
                }, {status: 200})

            })
        );

        fill_form();

        const submitButton = screen.getByTestId("login_form_submit_btn");

        fireEvent.click(submitButton);



        await waitFor(() => {
            expect(mocked_send_alert).toHaveBeenCalledWith("Login feito com sucesso", "success")
        });


        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
        });


    });


    it("should redirect to /dashboard if user or access token exists", async ()=>{
        render(
            <MemoryRouter>
                <MockAuthProvider user={{name: 'Test', email: 'test@gmail.com'}} /*accessToken={'access token'}*/>
                    <LoginPage />
                </MockAuthProvider>
            </MemoryRouter>
        );

        await waitFor(()=>{
            expect(mockedNavigate).toHaveBeenCalledWith("/dashboard")
        })

    });




});
