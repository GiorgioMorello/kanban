import React from "react"
import {render, screen, cleanup, fireEvent, waitFor, within} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {http, delay, HttpResponse} from 'msw';
import VerifyEmail from "../routes/verify_email_page/VerifyEmail.jsx";
import MockAuthProvider from "../__mocks__/MockAuthProvider";




function render_component(fakeUrlCode, user=null){
    render(
            <MemoryRouter initialEntries={[`/verify-email/${fakeUrlCode}`]}>
                <MockAuthProvider user={user}>
                    <Routes>
                        <Route path="/verify-email/:url_code" element={<VerifyEmail/>}/>
                    </Routes>
                </MockAuthProvider>

            </MemoryRouter>
        );
}


function server_user(fakeUrlCode, body, status){
    server.use(
            http.get("http://127.0.0.1:8000/user/otp-verification/", async ({request}) => {
                const url = new URL(request.url);
                const url_code = url.searchParams.get("url_code");


                if (url_code === fakeUrlCode) {
                    return HttpResponse.json(
                        body,
                        status
                    );
                }

            })
        );
}

const mockedNavigate = vi.fn();
let mockedUseParams = vi.fn(() => ({url_code: 'fake-url-code'}));

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        // Substitui apenas o hook useNavigate por um mock
        useNavigate: () => mockedNavigate, // Retorna o mock mockedNavigate.
        useParams: () => mockedUseParams() // Retorna o resultado da função mockedUseParams().
    };
});


// 3️⃣ Cleanup
afterEach(() => {
    cleanup(); // Remove os elementos renderizados da tela
    server.resetHandlers();
    vi.clearAllMocks();
});
describe('VerifyEmail test', () => {


    it("should extract url code from URL Param and call API", async () => {
        const fakeUrlCode = "fake-url-code";

        server_user(fakeUrlCode, {detail: "Insira o código de confirmação"}, {status: 200});

        render_component(fakeUrlCode)


        expect(mockedUseParams).toHaveBeenCalled()

    });

    it("should show error message if status code is 404 or 403", async()=>{

        const fakeUrlCode = "fake-url-code";

        server_user(fakeUrlCode, {detail: "Código inválido ou expirado"}, {status: 400});

        render_component(fakeUrlCode);


        expect(mockedUseParams).toHaveBeenCalled();

        await waitFor(()=>{
            expect(screen.getByText(/código inválido ou expirado/i)).toBeInTheDocument();
        })

    });

    it("should redirect to /dashboard if user or access token exists", async ()=>{
        const fakeUrlCode = "fake-url-code";
        server_user(fakeUrlCode, {}, {});

        render_component('fakeUrlCode', {name: 'TESTE'});


        expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");

    })


})
