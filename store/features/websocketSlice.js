import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    socket: null,
    connected: false,
    messages: [],
    newDiscussions:[],
    newDiscussionComments:[],
    newDiscussionLikes:[],
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

        addNewDiscussion(state, action) {
            state.newDiscussions.push(action.payload);
        },
        removeUpdatedDiscussions(state){
            state.newDiscussions = []
        },

        addNewDiscussionComment(state, action) {
            state.newDiscussionComments.push(action.payload);
        },
        removeUpdatedDiscussionsComment(state){
            state.newDiscussionComments = []
        },

        addNewDiscussionLike(state, action) {
            state.newDiscussionLikes.push(action.payload);
        },
        removeUpdatedDiscussionLikes(state){
            state.newDiscussionLikes = []
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

export const { 
    setSocket, 
    setConnected, 
    addMessage,
    addNewDiscussion, 
    removeUpdatedDiscussions,
    addNewDiscussionComment,
    removeUpdatedDiscussionsComment,
    addNewDiscussionLike,
    removeUpdatedDiscussionLikes,
} = websocketSlice.actions;
export default websocketSlice.reducer;
