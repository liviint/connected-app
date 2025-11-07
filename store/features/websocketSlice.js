import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    socket: null,
    connected: false,
    messages: [],
};

const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        setSocket(state, action) {
            state.socket = action.payload;
        },
        setConnected(state, action) {
            state.connected = action.payload;
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        removeMessage(state, action) {
            const idToRemove = action.payload.id;
            state.messages = state.messages.filter(
                (message) => message.data?.id !== idToRemove
            );
        },
    }
});

export const { setSocket, setConnected, addMessage, removeMessage } = websocketSlice.actions;
export default websocketSlice.reducer;
