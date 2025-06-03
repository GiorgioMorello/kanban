import React from "react"
import {render, screen, cleanup} from "@testing-library/react"
import Home from "../routes/Home.jsx"
import {describe, it, expect, beforeEach, afterEach} from "vitest";
import "@testing-library/jest-dom/vitest"



describe("Home ", ()=>{
    it("renders Homepage message", ()=>{
        render(<Home/>)
        expect(screen.queryByText(/homepage/i)).toBeInTheDocument()
    })
})

