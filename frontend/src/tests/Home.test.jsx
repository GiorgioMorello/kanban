import React from "react"
import {render, screen, cleanup, within, fireEvent} from "@testing-library/react"
import Home from "../routes/Home.jsx"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {server} from "../__mocks__/server.jsx";
import {userEvent} from "@testing-library/user-event";





function get_homepage_links(){
    const links = screen.getByTestId('homepage-links');
    const create_acc_link = within(links).getByRole('link', {name: /criar conta/i})
    const login_link = within(links).getByRole('link', {name: /fazer login/i})
    return {create_acc_link, login_link}
}


afterEach(() => {
    cleanup()
})




describe('Home Page test', () => {
    let user;
    // Renderiza o componente antes de cada teste
    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>

                    <Route path={'/'} element={<Home />}/>
                    <Route path={'/login'} element={<div>Login Page</div>}/>
                    <Route path={'/register'} element={<div>Register Page</div>}/>

                </Routes>
            </MemoryRouter>
        )
        user = userEvent.setup()
    })


    it("should render background image", ()=>{
          const img = screen.getByTestId('home-bg');

          // aplicando a imagem de fundo
          img.style.backgroundImage = 'url("/home-bg.webp")';

          const style = getComputedStyle(img);
          expect(style.backgroundImage).toContain('/home-bg.webp');

    });

    it("should render home page title and description", ()=>{
        const title = screen.getByTestId('homepage-tile')
        const desc = screen.getByTestId('homepage-desc')

        expect(title).toHaveTextContent(/bem-vindo ao taskflow/i)
        expect(desc).toHaveTextContent(/organize seu dia/i)
    });


    it("should display create account button and login button", ()=>{
        const {create_acc_link, login_link} = get_homepage_links()

        expect(create_acc_link).toHaveAttribute('href', '/register')
        expect(login_link).toHaveAttribute('href', '/login')
    });


    it("should create account link navigate to the correct page", async ()=>{
        const {create_acc_link} = get_homepage_links()

        await user.click(create_acc_link);
        expect(screen.getByText(/register page/i)).toBeInTheDocument()

    })


    it("should login link navigate to the correct page", async ()=>{
        const {login_link} = get_homepage_links()

        await user.click(login_link);
        expect(screen.getByText(/login page/i)).toBeInTheDocument()

    })
})
