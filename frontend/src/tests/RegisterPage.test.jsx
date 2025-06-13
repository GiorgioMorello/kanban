import React from "react"
import {render, screen, cleanup, fireEvent, waitFor, within} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, delay, HttpResponse} from 'msw';
import { mockedNavigate } from "../__mocks__/mockRouter"; // Isso já ativa o mock de useNavigate
import "../__mocks__/mockSendAlert.jsx";
import RegisterPage from "../routes/login_and_register_form/RegisterPage.jsx";






function fill_form(){
    fireEvent.change(screen.getByLabelText(/nome de usuário/i), {target: {value: "teste"}})
    fireEvent.change(screen.getByLabelText(/e-mail/i), {target: {value: "teste@gmail.com"}})
    fireEvent.change(screen.getByLabelText(/^senha$/i),{target: {value: "123456789"}})
    fireEvent.change(screen.getByLabelText(/confirme sua senha/i),{target: {value: "123456789"}})
}

import Alert, { __mocked_send_alert as mockedSendAlert } from "../utils/Alert.jsx";

// 3️⃣ Cleanup
afterEach(() => {
    cleanup(); // Remove os elementos renderizados da tela
    server.resetHandlers();
    vi.clearAllMocks();
});


// renderiza a página antes de cada teste. BrowserRouter é necessário se o componente usar navegação.
describe("RegisterPage test", () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <RegisterPage/>
            </MemoryRouter>
        );
    });


    it("renders the page title", () => {
        const title = screen.getByTestId("register_page_title");

        expect(title).toBeInTheDocument();
    })

    it("renders RegisterPage form", () => {
        const formElement = screen.getByTestId("register_form");
        expect(formElement).toBeInTheDocument();
    });

    it("renders all input fields from form", () => {
        expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirme sua senha/i)).toBeInTheDocument();
    });



    it('should send the correct body data to API', async () => {
        let requestBody;

        server.use(
            http.post('http://127.0.0.1:8000/user/register/', async ({request}) => {
                requestBody = await request.json();
                return HttpResponse.json({
                        user: {name: "Name Test"},
                        url_code: "url_code_test"
                    },
                    {status: 201});
            })
        );


        fill_form()

        const submitButton = screen.getByTestId("register_form_submit_btn");


        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(requestBody).toEqual({
                username: 'teste',
                email: 'teste@gmail.com',
                password: '123456789',
                password_2: '123456789'
            });
        });
    });


    it("should show error message if data is incorrect", async ()=>{
        server.use(
            http.post('http://127.0.0.1:8000/user/register/', async ({request}) => {

                return HttpResponse.json({
                    "email": [
                        "Esse e-mail já está em uso"
                    ],
                },
                    {status: 400});

            })
        );


        fill_form()

        const submitButton = screen.getByTestId("register_form_submit_btn");

        fireEvent.click(submitButton);

        await waitFor(()=>{
            expect(screen.getByText("Esse e-mail já está em uso")).toBeInTheDocument()
        })


    })


    it("should disable the submit button during the request", async () => {
        server.use(
            http.post('http://127.0.0.1:8000/user/register/', async ({request}) => {
                await delay(500)

                return HttpResponse.json({
                        user: {name: "Name Test"},
                        url_code: "url_code_test"
                    },
                    {status: 201});

            })

        );


        fill_form();

        const submitButton = screen.getByTestId("register_form_submit_btn");

        fireEvent.click(submitButton);
        expect(submitButton).toBeDisabled();


        // Espera a requisição terminar
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });


    })



    it("should call send_alert and useNavigate after successful registration", async ()=>{
        server.use(
            http.post('http://127.0.0.1:8000/user/register/', async ({request})=>{

                return HttpResponse.json({
                    user: {name: 'Name test'},
                    url_code: 'url_code_test'
                }, {status: 201})

            })
        );

        fill_form();

        const submitButton = screen.getByTestId("register_form_submit_btn");

        fireEvent.click(submitButton);


        await waitFor(()=>{
            expect(mockedNavigate).toHaveBeenCalledWith("/verify-email/url_code_test")
        });


        await waitFor(()=>{
            expect(mockedSendAlert).toHaveBeenCalledWith("Foi enviado um código para seu e-mail", "success");
        })
    })



});
















