import React from "react"
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter } from "react-router-dom";
import { server } from "../__mocks__/server.jsx";
import { http, delay, HttpResponse } from 'msw';
import { mockedNavigate } from "../__mocks__/mockRouter"; // Mock da função de navegação
import "../__mocks__/mockSendAlert.jsx"; // Mock da função de alerta
import KanbanTask from "../components/tasks/KanbanTask.jsx";

// Mock do alert
import Alert, { __mocked_send_alert as mockedSendAlert } from "../utils/Alert.jsx";
import MockTaskProvider from "../__mocks__/MockTaskProvider.jsx";
import KanbanBoard from "../components/tasks/KanbanBoard.jsx";
import MockAuthProvider from "../__mocks__/MockAuthProvider";




function fill_task_edit_form(title="Update task test", desc="Test", end_date="2025-08-16"){
    const task_title = screen.getByPlaceholderText(/digite o titulo da task/i);
    const task_dec = screen.getByPlaceholderText(/descrição da task/i);
    const task_end_date = screen.getByPlaceholderText(/data final/i);

    fireEvent.change(task_title, { target: { value: title }})
    fireEvent.change(task_dec, { target: { value: desc }})
    fireEvent.change(task_end_date, { target: { value: end_date}})

}


function open_task_menu(){
    fireEvent.click(screen.getAllByTestId("open_menu_btn")[0]);
}



afterEach(()=>{
    cleanup();
    server.resetHandlers()
    vi.clearAllMocks()

})

describe("KanbanTask test", ()=> {


    beforeEach(() => [
        render(
            <MockAuthProvider user={{username: "Test", profile_pic: "http://fake.endpoint/media/profile_pic/default.jpg"}}>
                <MockTaskProvider>
                    <KanbanBoard/>
                </MockTaskProvider>
            </MockAuthProvider>

        )
    ]);


    it("renders all tasks", ()=>{
        const tasks = screen.getAllByTestId("task");
        expect(tasks.length).toBe(3);
    });

    it("should display task title", ()=>{
        const tasks_title = screen.getAllByTestId("task_title");

        expect(tasks_title.length).toBe(3)
    });


    it("should render task deadline", ()=>{
        const task_deadline = screen.getAllByTestId("task_deadline");
        expect(task_deadline.length).toBe(1)
    });


    it("should render expired deadline warning if task is overdue and not done", ()=>{
        const warning_span = screen.getAllByTestId("task_expired_warning");
        expect(warning_span.length).toBe(2);
    });


    it("should render owner username and profile picture", ()=>{
        const username = screen.getAllByTestId("username");
        const profile_pic = screen.getAllByTestId("profile_pic");


        expect(username.length).toBe(3);
        username.map((element)=>{
            expect(element).toHaveTextContent("Test")
        });


        expect(profile_pic.length).toBe(3)
        profile_pic.map((picture)=>{
            expect(picture).toBeInTheDocument()
        })


    });

    it("should render task menu when clicking the toggle menu button", ()=>{
        const open_menu_btn = screen.getAllByTestId("open_menu_btn")[0];

        fireEvent.click(open_menu_btn);

        const task_menu = screen.getByTestId("task_menu")
        expect(task_menu).toBeInTheDocument();

    });


    it("should render edit task form when clicking the open edit task form button", ()=>{

        // Abrir o menu
        open_task_menu()

        // Abrir o formulário de editar a task
        const open_edit_task_form_btn = screen.getByTestId("open_edit_task_form_btn");
        fireEvent.click(open_edit_task_form_btn)
        expect(screen.getByTestId("edit_task_form")).toBeInTheDocument();

    });


    it("closes the task edit form when clicking the close button", async ()=>{
        open_task_menu();

        // Abrir o formulário de editar a task
        const open_edit_task_form_btn = screen.getByTestId("open_edit_task_form_btn");
        fireEvent.click(open_edit_task_form_btn);

        //Verificar se o botão está sendo exibido na página
        const close_task_edit_form_btn = screen.getByTestId("close_task_edit_form_btn")
        expect(close_task_edit_form_btn).toBeInTheDocument()

        // Clicar no botão de fechar formulário de edição e verificar se o formulário foi removido do DOM
        fireEvent.click(close_task_edit_form_btn);
        const form = screen.queryByTestId("edit_task_form")
        expect(form).not.toBeInTheDocument()

    })



    it("should render all input fields from task form", ()=>{

        // Abrir o menu
        open_task_menu()

        // Abrir o formulário de editar a task
        const open_edit_task_form_btn = screen.getByTestId("open_edit_task_form_btn");
        fireEvent.click(open_edit_task_form_btn);


        expect(screen.getByPlaceholderText(/digite o titulo da task/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/descrição da task/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/data final/i)).toBeInTheDocument()
    });


    it("sends correct task data to API when submitting the form", async ()=> {
        const updated_task = {
            "id": 1,
            "title": "Update task test",
            "description": "test",
            "task_status": "DO",
            "creation_date": "18-07-2025",
            "end_date": "16-08-2025",
            "task_status_display": "DOING",
            "owner": 1
        }

        let requestBody;
        server.use(
            http.patch(`${baseURL}api/class/task/1`, async ({ request })=>{
                requestBody = await request.json();
                return HttpResponse.json(updated_task, {status: 200})
            })

        );

        open_task_menu();
        fireEvent.click(screen.getByTestId("open_edit_task_form_btn"));

        fill_task_edit_form();
        fireEvent.click(screen.getByTestId("task_edit_form_btn"));


        await waitFor(()=>{
            expect(requestBody).toEqual({
                "title": "Update task test",
                "description": "Test",
                "end_date": "2025-08-16",
            });

        });
    });


    it("displays an error message when the user submits invalid data while editing a task", async () => {
        // server.use(
        //     http.patch(`${baseURL}api/class/task/1`, async ({request}) => {
        //         return HttpResponse.json(resp_error, {status: 400})
        //     })
        // );

        open_task_menu();
        fireEvent.click(screen.getByTestId("open_edit_task_form_btn"));

        // Formulário com dois campos inválidos: title com menos de um caractere e o end_date ser anterior à data atual
        fill_task_edit_form("s", "kjalkf", '2025-02-12');

        fireEvent.click(screen.getByTestId("task_edit_form_btn"));

        // Verificando se no DOM possui dois elementos de exibindo mensagem erro
        expect(screen.getAllByTestId("edit_task_error").length).toBe(2);
    })








})