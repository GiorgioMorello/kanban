
import React from "react"
import { render, screen, cleanup, waitFor } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { server } from "../__mocks__/server.jsx";
import { http, HttpResponse } from 'msw';
import MockAuthProvider from "../__mocks__/MockAuthProvider";
import { mockedNavigate, mockedUseParams } from "../__mocks__/mockRouter"; // Mock da função de navegação e da função useParams
import VerifyEmail from "../routes/verify_email_page/VerifyEmail.jsx";



// Função auxiliar para renderizar o componente com contexto de rota e autenticação
function render_component(fakeUrlCode, user = null) {
    render(
        <MemoryRouter initialEntries={[`/verify-email/${fakeUrlCode}`]}>
            <MockAuthProvider user={user}> {/* Utilizando AuthContextProvider para simular que o usuário está autenticado */}
                <Routes>
                    <Route path="/verify-email/:url_code" element={<VerifyEmail />} />
                </Routes>
            </MockAuthProvider>
        </MemoryRouter>
    );
}

// Função auxiliar para configurar o mock do servidor para o endpoint de verificação
function server_user(fakeUrlCode, body, status) {
    server.use(
        http.get(`${baseURL}user/otp-verification/`, async ({ request }) => {
            const url = new URL(request.url);
            const url_code = url.searchParams.get("url_code");

            if (url_code === fakeUrlCode) {
                return HttpResponse.json(body, status);
            }
        })
    );
}

// Limpeza após cada teste
afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllMocks();
});

describe('VerifyEmail test', () => {

    // Verifica se o parâmetro da URL está sendo lido corretamente e se a API é chamada
    it("should extract url code from URL Param and call API", async () => {
        const fakeUrlCode = "fake-url-code";

        server_user(fakeUrlCode, { detail: "Insira o código de confirmação" }, { status: 200 });

        render_component(fakeUrlCode);

        expect(mockedUseParams).toHaveBeenCalled();
    });

    // Verifica se uma mensagem de erro é exibida quando o código é inválido ou expirado
    it("should show error message if status code is 404 or 403", async () => {
        const fakeUrlCode = "fake-url-code";

        server_user(fakeUrlCode, { detail: "Código inválido ou expirado" }, { status: 400 });

        render_component(fakeUrlCode);

        expect(mockedUseParams).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText(/código inválido ou expirado/i)).toBeInTheDocument();
        });
    });

    // Verifica se o usuário é redirecionado para o dashboard se já estiver autenticado
    it("should redirect to /dashboard if user or access token exists", async () => {
        const fakeUrlCode = "fake-url-code";

        render_component(fakeUrlCode, { name: 'TESTE' });

        server_user(fakeUrlCode, {}, {});

        expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    });

});
