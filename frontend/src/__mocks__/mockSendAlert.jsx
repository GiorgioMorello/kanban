import {vi} from 'vitest'


vi.mock("../utils/Alert.jsx", () => {
    const mockedSendAlert = vi.fn(); // Simular o envio real

    return {
        __esModule: true,
        default: () => mockedSendAlert,  // Alert() retorna mocked_send_alert
        __mocked_send_alert: mockedSendAlert, // para testarmos
    };
});

