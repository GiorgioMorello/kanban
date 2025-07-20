import React from "react"
import {render, screen, cleanup} from "@testing-library/react"
import Dashboard from "../routes/dashboard_page/Dashboard.jsx"
import {describe, it, expect, beforeEach, afterEach, } from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter } from "react-router-dom"
import MockTaskProvider from "../__mocks__/MockTaskProvider.jsx";
import {server} from "../__mocks__/server.jsx";







afterEach(()=>{
    cleanup();
    server.resetHandlers()
    vi.clearAllMocks()

})
describe("Dashboard ", ()=>{


    beforeEach(()=>[
        render(
            <MemoryRouter>
                <MockTaskProvider>
                    <Dashboard />
                </MockTaskProvider>
            </MemoryRouter>
        )
    ])



    it("should render Dashaboard message", ()=>{
        expect(screen.getByText(/dashboard page/i)).toBeInTheDocument()
    });


    it("should render KanbanBoard", ()=>{
        expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    })
})

