import React, {useState} from "react"
import {render, screen, cleanup, fireEvent, waitFor} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, HttpResponse} from 'msw';
import MockAuthProvider, {mockSetAccessToken, mockSetUser} from "../__mocks__/MockAuthProvider.jsx";
import {access_token} from "./tests_utils.jsx"; // Token simulado para sucesso
import {mockedNavigate} from "../__mocks__/mockRouter";
import "../__mocks__/mockSendAlert.jsx";

import VerifyEmailForm from "../components/VerifyEmailForm.jsx";


// Função auxiliar para preencher o campo do código OTP
function fill_form(otp) {
    fireEvent.change(screen.getByPlaceholderText("Insira o código"), {
        target: {value: otp}
    });
}

// Função auxiliar para configurar o mock do servidor com resposta desejada
function server_use(body = {ok: 'ok'}, status = {status: 200}) {
    server.use(
        http.post(`${baseURL}user/otp-verification/`, async ({request}) => {
            return HttpResponse.json(body, status);
        })
    );
}

// Mock do alert
import {__mocked_send_alert as mockedSendAlert} from "../utils/Alert.jsx";

// Cleanup após cada teste
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    server.resetHandlers();
});

describe('Test component VerifyEmailForm', () => {

    beforeEach(() => {
        function Wrapper() {
            const [errors, setErrors] = useState("");
            return (
                <MemoryRouter>
                    <MockAuthProvider>
                        <VerifyEmailForm set_error={setErrors} errors={errors}/>
                    </MockAuthProvider>
                </MemoryRouter>
            );
        }

        render(<Wrapper/>);
    });

    // Verifica se o formulário foi renderizado
    it("should render the verify email form", () => {
        const form = screen.getByTestId("verify_email_form");
        expect(form).toBeInTheDocument();
    });

    // Verifica se o botão está desabilitado com menos de 8 caracteres
    it("should disable submit button if OTP is less than 8 characters", () => {
        fill_form('1234567');
        const btn = screen.getByTestId("verify_email_submit_btn");
        expect(btn).toBeDisabled();
    });

    // Verifica se o botão é habilitado com 8 ou mais caracteres
    it("should enable submit button if OTP is 8 or more characters", () => {
        fill_form("12345678");
        const btn = screen.getByTestId("verify_email_submit_btn");
        expect(btn).not.toBeDisabled();
    });

    // Verifica se uma mensagem de erro aparece quando o OTP é inválido
    it("should show error if OTP is invalid", async () => {
        server_use("Código inválido ou expirado", {status: 400});
        fill_form("invalid_");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));

        await waitFor(() => {
            expect(screen.getByText("Código inválido ou expirado")).toBeInTheDocument();
        });
    });

    // Verifica se o access token e o usuário são salvos quando o OTP é válido
    it("should set AccessToken and User if OTP is valid", async () => {
        server_use({access: access_token}, {status: 200});
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));

        await waitFor(() => {
            expect(mockSetAccessToken).toHaveBeenCalledWith(access_token);
            expect(mockSetUser).toHaveBeenCalled();
        });
    });

    // Verifica se ocorre navegação e alerta após sucesso
    it("should navigate to /dashboard and show an alert if OTP is valid", async () => {
        server_use({access: access_token}, {status: 200});
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockedSendAlert).toHaveBeenCalledWith("Conta criada com sucesso", "success");
        });
    });

    // Verifica se localStorage é limpo após o sucesso
    it("should clear localStorage after success", async () => {
        localStorage.setItem("otp_timer", "126753");
        localStorage.setItem("is_timer_end", "true");

        server_use({access: access_token}, {status: 200});
        fill_form("12345678");
        fireEvent.click(screen.getByTestId("verify_email_submit_btn"));

        await waitFor(() => {
            expect(localStorage.getItem("otp_timer")).toBeNull();
            expect(localStorage.getItem("is_timer_end")).toBeNull();
        });
    });

});