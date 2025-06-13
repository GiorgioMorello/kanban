

import {vi} from "vitest";

export const mockedNavigate = vi.fn(); // Cria uma função mock para simular o comportamento do hook useNavigate do react-router-dom
export let mockedUseParams = vi.fn(() => ({url_code: 'fake-url-code'}));

vi.mock("react-router-dom", async (importOriginal) => {
      // Importa o módulo real para manter o restante das funcionalidades intactas

    const actual = await importOriginal();

    return {
        ...actual,
        // Substitui apenas o hook useNavigate por um mock
        useNavigate: () => mockedNavigate, // Retorna o mock mockedNavigate.
        useParams: () => mockedUseParams() // Retorna o resultado da função mockedUseParams().
    };
});
