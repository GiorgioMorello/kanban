import React from "react"
import {render, screen, cleanup, fireEvent, waitFor} from "@testing-library/react"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import NavBar from '../components/navbar/NavBar.jsx'
import '../__mocks__/mockSendAlert.jsx'
import { MemoryRouter } from "react-router-dom";
import MockAuthProvider from "../__mocks__/MockAuthProvider.jsx";
import Alert, { __mocked_send_alert as mockedSendAlert } from "../utils/Alert.jsx";
import {server} from "../__mocks__/server.jsx";
import {http, HttpResponse} from "msw";
import {mockedNavigate} from "../__mocks__/mockRouter.jsx";
import {access_token} from "./tests_utils.jsx";



function render_component(access_token=null){
    render(
            <MemoryRouter>
                <MockAuthProvider accessToken={access_token}>
                    <NavBar />
                </MockAuthProvider>
            </MemoryRouter>
        )
}

function server_use(body, status){
    server.use(
            http.post(`${baseURL}user/logout/`, async () => {
                return HttpResponse.json(body, status);
            })
        );
}

const logoutMock = vi.fn()
vi.mock('../hooks/useAPICalls.jsx', ()=>{


    return {
        __esModule: true,
        default: ()=> (
            {logout: logoutMock}
        )}
})



afterEach(()=>{
    cleanup();
    vi.clearAllMocks();
    server.resetHandlers();
})

describe("Navbar ", ()=>{




    it("should render nav component", ()=>{
        render_component()
        const navbar = screen.getByTestId('navbar');

        expect(navbar).toBeInTheDocument();
    });


    it('should render public navbar buttons when user is not authenticated', ()=>{
        render_component()
        const loginBtn = screen.getByText(/login/i);
        const createAccBtn = screen.getByText(/criar Conta/i);
        const homeBtn = screen.getByText(/home/i);

        expect(loginBtn).toBeInTheDocument();
        expect(createAccBtn).toBeInTheDocument();
        expect(homeBtn).toBeInTheDocument();

    });


    it('should render private navbar buttons when user is authenticated',  ()=> {
        render_component(access_token)
        const dashboardBtn = screen.getByText(/dashboard/i);
        const logoutBtn = screen.getByText(/sair/i);
        const profileBtb = screen.getByText(/seu perfil/i);

        expect(dashboardBtn).toBeInTheDocument();
        expect(logoutBtn).toBeInTheDocument();
        expect(profileBtb).toBeInTheDocument();


    });

    it('should call logout function by clicking on logout button', ()=> {

        server_use({}, {status: 204});
        render_component(access_token)


        const LogoutBtn = screen.getByTestId('logout_btn');

        fireEvent.click(LogoutBtn);
        expect(logoutMock).toHaveBeenCalled();

    });



    it("should not call send_alert function after logout", ()=>{
        server_use({}, {status: 204});
        render_component(access_token)


        const LogoutBtn = screen.getByTestId('logout_btn');
        fireEvent.click(LogoutBtn);

        expect(mockedSendAlert).not.toHaveBeenCalled();
    });


})

