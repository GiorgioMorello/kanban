import React from "react"
import {render, screen, cleanup, fireEvent, waitFor} from "@testing-library/react"
import KanbanBoard from "../components/tasks/KanbanBoard.jsx"
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import MockTaskProvider, {mockSetIsTasksChanged} from "../__mocks__/MockTaskProvider.jsx";
import {server} from "../__mocks__/server.jsx";
import {http, HttpResponse} from "msw";



function open_forms() {
    const todo_open_btn = screen.getByTestId("open_todo_task_form");
    const doing_open_btn = screen.getByTestId("open_doing_task_form");
    const done_open_btn = screen.getByTestId("open_done_task_form");

    fireEvent.click(todo_open_btn);
    fireEvent.click(doing_open_btn);
    fireEvent.click(done_open_btn);
}



afterEach(()=>{
    cleanup();
    server.resetHandlers()
    vi.clearAllMocks()

});

describe("TaskForm test ", ()=> {

    beforeEach(() =>{
        render(
            <MockTaskProvider>
                <KanbanBoard/>
            </MockTaskProvider>
        );
        open_forms();
    });

    it("displays task form of each status", ()=>{
        // Testa se os formulários de criação de tarefas aparecem ao clicar nos botões correspondentes em cada coluna
        const forms = screen.getAllByTestId("task_form");

        expect(forms.length).toBe(3);
    });

    it("displays inputs form of each status", ()=>{

        const title = screen.getAllByTestId('task_form_title_input');
        const desc = screen.getAllByTestId('task_form_description_input');
        const deadline = screen.getAllByTestId('task_form_deadline_input');

        expect(title.length).toBe(3)
        expect(desc.length).toBe(3)
        expect(deadline.length).toBe(3)
    })

    it("displays the submit button and close form button", ()=>{
        const submit_btn = screen.getAllByTestId('submit_btn');
        const close_form_btn = screen.getAllByTestId('close_form_btn');

        expect(submit_btn.length).toBe(3)
        expect(close_form_btn.length).toBe(3)
        })

    it("sends correct task data to API when submitting the form", async ()=>{
        let newTaskResponse = {
            id: 4,
            title: "New Task",
            description: "New Desc",
            task_status: "TO",
            creation_date: '2025-07-23',
            end_date: '2026-01-01',
            task_status_display: 'TODO',
            owner: 1, // User id
        }

        let requestBody
        server.use(
            http.post(`${baseURL}api/class/task`, async({request})=>{
                requestBody = await request.json()
                return HttpResponse.json(newTaskResponse, {status: 201})
            })
        );

        const title = screen.getAllByTestId('task_form_title_input')[0];
        const desc = screen.getAllByTestId('task_form_description_input')[0];
        const deadline = screen.getAllByTestId('task_form_deadline_input')[0];


        fireEvent.change(title, { target: { value: "New Task" }})
        fireEvent.change(desc, { target: { value: "New Desc" }})
        fireEvent.change(deadline, { target: { value: "2026-01-01" }});


        fireEvent.click(screen.getAllByTestId('submit_btn')[0])


        await waitFor(()=>{

            expect(requestBody).toEqual({
                title: "New Task",
                description: "New Desc",
                task_status: "TO",
                end_date: "2026-01-01",
            });

            // Confirma que a atualização de tarefas foi disparada
            expect(mockSetIsTasksChanged).toHaveBeenCalled();

        })

    });




})