import {http, HttpResponse} from 'msw';
export const handlers = [
    http.post('http://127.0.0.1:8000/user/register/', async ({request}) => {
        const body = await request.json()

        return HttpResponse.json({
                user: {name: "Name Test"},
                url_code: "url code test"
            },
            {status: 201})
    }),
];
