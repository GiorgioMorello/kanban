

import React from "react"
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter } from "react-router-dom";
import { server } from "../__mocks__/server.jsx";
import { http, delay, HttpResponse } from 'msw';
import { mockedNavigate } from "../__mocks__/mockRouter"; // Mock da função de navegação
import "../__mocks__/mockSendAlert.jsx"; // Mock da função de alerta
import RegisterPage from "../routes/login_and_register_form/RegisterPage.jsx";

// Mock do alert
import Alert, { __mocked_send_alert as mockedSendAlert } from "../utils/Alert.jsx";


// Função auxiliar para configurar o mock do servidor para o endpoint de registrar usuário
function server_use(body, status){
    server.use(
            http.post(`${baseURL}user/register/`, async () => {
                return HttpResponse.json(body, status);
            })
        );
}


// Função auxiliar para preencher o formulário
function fill_form() {
    fireEvent.change(screen.getByLabelText(/nome de usuário/i), { target: { value: "teste" } })
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "teste@gmail.com" } })
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: "123456789" } })
    fireEvent.change(screen.getByLabelText(/confirme sua senha/i), { target: { value: "123456789" } })
}

// Limpeza após cada teste
afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllMocks();
});

describe("RegisterPage test", () => {
    // Renderiza o componente antes de cada teste
    beforeEach(() => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
    });

    // Verifica se o título da página é renderizado
    it("renders the page title", () => {
        const title = screen.getByTestId("register_page_title");
        expect(title).toBeInTheDocument();
    });

    // Verifica se o formulário de registro é renderizado
    it("renders RegisterPage form", () => {
        const formElement = screen.getByTestId("register_form");
        expect(formElement).toBeInTheDocument();
    });

    // Verifica se todos os campos de input estão presentes
    it("renders all input fields from form", () => {
        expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirme sua senha/i)).toBeInTheDocument();
    });

    // Verifica se os dados corretos são enviados à API
    it('should send the correct body data to API', async () => {
        let requestBody;

        server.use(
            http.post(`${baseURL}user/register/`, async ({ request }) => {
                requestBody = await request.json();
                return HttpResponse.json({
                    user: { name: "Name Test" },
                    url_code: "url_code_test"
                }, { status: 201 });
            })
        );

        fill_form();
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

    // Verifica se uma mensagem de erro é exibida quando a API retorna erro
    it("should show error message if data is incorrect", async () => {
        server_use({email: ["Esse e-mail já está em uso"]}, {status: 400})

        fill_form();
        const submitButton = screen.getByTestId("register_form_submit_btn");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Esse e-mail já está em uso")).toBeInTheDocument();
        });
    });

    // Verifica se o botão de submit é desabilitado durante a requisição
    it("should disable the submit button during the request", async () => {
        server_use({
            user: { name: "Name Test" },
            url_code: "url_code_test"
        }, { status: 201 });


        fill_form();
        const submitButton = screen.getByTestId("register_form_submit_btn");
        fireEvent.click(submitButton);
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    // Verifica se `useNavigate` e `send_alert` são chamados após sucesso
    it("should call send_alert and useNavigate after successful registration", async () => {
        server_use({
            user: { name: 'Name test' },
            url_code: 'url_code_test'},
            { status: 201 })

        fill_form();
        const submitButton = screen.getByTestId("register_form_submit_btn");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith("/verify-email/url_code_test");
        });

        await waitFor(() => {
            expect(mockedSendAlert).toHaveBeenCalledWith("Foi enviado um código para seu e-mail", "success");
        });
    });
});
