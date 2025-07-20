import React from "react"
import {render, screen, cleanup, fireEvent} from "@testing-library/react"
import KanbanBoard from "../components/tasks/KanbanBoard.jsx"
import {describe, it, expect, beforeEach, afterEach, } from "vitest";
import "@testing-library/jest-dom/vitest"
import MockTaskProvider from "../__mocks__/MockTaskProvider.jsx";
import {server} from "../__mocks__/server.jsx";







afterEach(()=>{
    cleanup();
    server.resetHandlers()
    vi.clearAllMocks()

})
describe("KanbanBoard ", ()=>{


    beforeEach(()=>[
        render(
            <MockTaskProvider>
                <KanbanBoard />
            </MockTaskProvider>
        )
    ])



        // Testa se o componente principal do Kanban foi renderizado corretamente
    it("should render KanbanBoard", () => {
        expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    // Verifica se os títulos de todas as colunas (To Do, Doing, Done) estão na tela
    it("should render all status title", () => {
        expect(screen.getByTestId("status-title-todo")).toBeInTheDocument();
        expect(screen.getByTestId("status-title-doing")).toBeInTheDocument();
        expect(screen.getByTestId("status-title-done")).toBeInTheDocument();
    });

    // Valida que a contagem de tarefas por status está correta (espera 1 para cada)
    it("should display numbers of tasks for each status", () => {
        const todoLength = screen.getByTestId("todo-tasks-length");
        const doingLength = screen.getByTestId("doing-tasks-length");
        const doneLength = screen.getByTestId("done-tasks-length");

        expect(todoLength).toBeInTheDocument();
        expect(doingLength).toBeInTheDocument();
        expect(doneLength).toBeInTheDocument();

        expect(todoLength).toHaveTextContent("1");
        expect(doingLength).toHaveTextContent("1");
        expect(doneLength).toHaveTextContent("1");
    });

    // Testa se os formulários de criação de tarefas aparecem ao clicar nos botões correspondentes em cada coluna
    it("should display task form of each status when clicking the open task form button", () => {
        const todo_open_btn = screen.getByTestId("open_todo_task_form");
        const doing_open_btn = screen.getByTestId("open_doing_task_form");
        const done_open_btn = screen.getByTestId("open_done_task_form");

        fireEvent.click(todo_open_btn);
        fireEvent.click(doing_open_btn);
        fireEvent.click(done_open_btn);

        const input = screen.getAllByPlaceholderText(/digite o titulo da task/i);
        expect(input.length).toBe(3); // Um campo de input por status
    });

    // Verifica se todas as tarefas (para cada status) estão sendo exibidas corretamente na interface
    it("should display all tasks for each status", () => {
        const tasks = screen.getAllByTestId("task");
        expect(tasks.length).toBe(3); // Espera encontrar 3 tarefas no total
    });



})

