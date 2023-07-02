import React from "react";

interface User {
    id: string
    name: string
}

interface Message {
    autor: string
    text: string
}

interface State { 
    user: User 
    chat: Message[] 
    logged: boolean
    room: string
    roomCount: number 
}
  
type Payload = User | Message | string | number 

interface Action {
    type: string
    payload?: Payload
}

function useChat() {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const { user, chat, logged, room, roomCount } = state;
    const onChat = (autor: string, text: string) => dispatch({ type: actionTypes.chat, payload: { autor, text }});
    const onClearChat  = () => dispatch({ type: actionTypes.clearChat })
    const onUser = (id: string, name: string) => dispatch({ type: actionTypes.user, payload: { id, name }});
    const onLogin = () => dispatch({ type: actionTypes.logged });
    const onRoom = (room: string) => dispatch({ type: actionTypes.room, payload: room });
    const onRoomCount = (count: number) => dispatch({ type: actionTypes.roomCount, payload: count });

    return { user, chat, logged, room, roomCount, onChat, onClearChat, onUser, onLogin, onRoom, onRoomCount }
}

const initialState: State = {
    user: { id: "", name: "" },
    chat: [],
    logged: false,
    room: "",
    roomCount: 0
}

const actionTypes = {
    user: "USER",
    chat: "CHAT",
    clearChat: "CLEARCHAT",
    logged: "LOGGED",
    room: "ROOM",
    roomCount: "ROOMCOUNT",
}

const reducerObject = (state: State, payload?: Payload) => ({
    [actionTypes.user]: {
        ...state,
        user: payload as User
    },
    [actionTypes.chat]: {
        ...state,
        chat: [...state.chat, payload as Message],
    },
    [actionTypes.clearChat]: {
        ...state,
        chat: []
    },
    [actionTypes.logged]: {
        ...state,
        logged: !state.logged
    },
    [actionTypes.room]: {
        ...state,
        room: payload as string
    },
    [actionTypes.roomCount]: {
        ...state,
        roomCount: payload as number
    },
})

const reducer = (state: State, action: Action): State => {
    return reducerObject(state, action.payload)[action.type] || state;
}

export { useChat };

