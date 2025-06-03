import React from "react"
import {render, screen, cleanup, fireEvent, waitFor, within} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, delay, HttpResponse} from 'msw';
import LoginPage from "../routes/login_and_register_form/LoginPage";
import MockAuthProvider from "../__mocks__/MockAuthProvider.jsx";




vi.mock("../utils/Alert.jsx", () => {
  const mocked_send_alert = vi.fn(); // vai simular o envio real

  return {
    __esModule: true,
    default: () => mocked_send_alert,  // Alert() retorna mocked_send_alert
    __mocked_send_alert: mocked_send_alert, // para testarmos
  };
});

import Alert, { __mocked_send_alert as mocked_send_alert } from "../utils/Alert.jsx";


// Cria uma função mock para simular o comportamento do hook useNavigate do react-router-dom
const mockedNavigate = vi.fn();

// Faz o mock do módulo 'react-router-dom'
vi.mock("react-router-dom", async (importOriginal) => {
  // Importa o módulo real para manter o restante das funcionalidades intactas
  const actual = await importOriginal();

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});




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


    it("mocked send_alert deve funcionar isoladamente", () => {
          const send_alert = Alert();
          send_alert("Título Teste", "success");
          expect(mocked_send_alert).toHaveBeenCalledWith("Título Teste", "success");
    });


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
                    access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ4OTE2NjI3LCJpYXQiOjE3NDg5MTI3MjcsImp0aSI6ImE0NTBjYjBiM2MzODQ5NzJhNmQ4N2Y4N2Y4NDhhODE3IiwidXNlcl9pZCI6MSwiZnVsbF9uYW1lIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJiaW8iOiJnamhmaGciLCJwcm9maWxlX3BpYyI6Imh0dHBzOi8vZGphbmdvLWFwaS52cHMta2luZ2hvc3QubmV0L21lZGlhL3Byb2ZpbGVfcGljL2RlZmF1bHQuanBnIiwidmVyaWZpZWQiOmZhbHNlfQ.OtG-zirTym2hkezrIcHwU_I7TIOiE57X7BO3D_WXpBg',
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
