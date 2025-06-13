// Testes para o componente LoginPage
// Este arquivo valida se o componente de login renderiza corretamente seus elementos e interações,
// incluindo requisições à API, tratamento de erros, e redirecionamento após o login.

import React from "react"
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { MemoryRouter } from "react-router-dom"
import { server } from "../__mocks__/server.jsx"
import { http, HttpResponse } from 'msw'
import { access_token } from './tests_utils.jsx' // Token simulado para sucesso
import MockAuthProvider from "../__mocks__/MockAuthProvider.jsx"
import { mockedNavigate } from "../__mocks__/mockRouter" // Mock da função de navegação
import "../__mocks__/mockSendAlert.jsx" // Mock da função de alerta

import LoginPage from "../routes/login_and_register_form/LoginPage"

// Mock do alert
import Alert, { __mocked_send_alert as mocked_send_alert } from "../utils/Alert.jsx"


// Função auxiliar para configurar o mock do servidor para o endpoint de login
function server_use(body, status) {
    server.use(
            http.post('http://127.0.0.1:8000/user/login/', () => {
                return HttpResponse.json(body, status)
            })
        )
}


// Função auxiliar para preencher o formulário de login com dados de teste
function fill_form() {
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "teste@gmail.com" } })
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: "123456789" } })
}

// Reset dos mocks e do servidor após cada teste
afterEach(() => {
    cleanup()
    server.resetHandlers()
    vi.clearAllMocks()
})

describe('LoginPage test', () => {
    // Renderiza o componente antes de cada teste
    beforeEach(() => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )
    })

    // Verifica se o título da página de login é renderizado
    it("renders the page title", () => {
        const title = screen.getByTestId("login_page_title")
        expect(title).toBeInTheDocument()
    })

    // Verifica se o formulário de login está presente
    it("renders LoginPage form", () => {
        const formElement = screen.getByTestId("login_form")
        expect(formElement).toBeInTheDocument()
    })

    // Verifica se os campos de e-mail e senha estão presentes
    it("renders all input fields from login form", () => {
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    // Testa se os dados corretos são enviados para a API no submit
    it("should send the correct body data to API", async () => {
        let requestBody

        server.use(
            http.post('http://127.0.0.1:8000/user/login/', async ({ request }) => {
                requestBody = await request.json()
                return HttpResponse.json({}, { status: 200 })
            })
        )

        fill_form()
        const submit_btn = screen.getByTestId("login_form_submit_btn")
        fireEvent.click(submit_btn)

        await waitFor(() => {
            expect(requestBody).toEqual({
                email: "teste@gmail.com",
                password: "123456789"
            })
        })
    })

    // Simula falha de autenticação e exibe mensagem de erro
    it("should show error message if credentials are incorrect", async () => {
        server_use({detail: 'E-mail ou Senha incorreto'}, {status: 401})

        fill_form()
        const submit_btn = screen.getByTestId("login_form_submit_btn")
        fireEvent.click(submit_btn)

        await waitFor(() => {
            expect(screen.getByText('E-mail ou Senha incorreto')).toBeInTheDocument()
        })
    })

    // Verifica se após login bem-sucedido o alerta e redirecionamento são chamados
    it("should call send_alert and useNavigate after successful login", async () => {
        server_use({access: access_token, refresh: 'refresh token'}, {status: 200})


        fill_form()
        const submitButton = screen.getByTestId("login_form_submit_btn")
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mocked_send_alert).toHaveBeenCalledWith("Login feito com sucesso", "success")
        })

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith("/dashboard")
        })
    })

    // Se já estiver logado, redireciona automaticamente para /dashboard
    it("should redirect to /dashboard if user or access token exists", async () => {
        render(
            <MemoryRouter>
                <MockAuthProvider user={{ name: 'Test', email: 'test@gmail.com' }}>
                    <LoginPage />
                </MockAuthProvider>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith("/dashboard")
        })
    })
})
