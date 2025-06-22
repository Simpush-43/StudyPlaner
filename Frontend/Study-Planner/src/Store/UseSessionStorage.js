import { create } from "zustand";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
console.log("BASE_URL:", BASE_URL);  // it should log "http://localhost:8988/api"
const useSessionStorage = create((set) => ({
  // storing the session in array
  sessions: [],
  loading: false,
  error: null,

  // fetching sessions
  fetchSession: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/getSession`);
      set({ sessions: res.data.sessions, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch sessions", loading: false });
      console.error(err);
    }
  },
  //adding sessions
  addSession: async (newSession) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${BASE_URL}/createSession`, newSession);
      set((state) => ({ sessions: [...state.sessions, res.data.session] }));
    } catch (err) {
      console.error("Error in adding session", err);
    }
  },
  // deleting session
  deleteSession: async (id)=>{
    try {
      await axios.delete(`${BASE_URL}/delete/${id}`)
      set((state)=>({
       sessions:state.sessions.filter((session)=>session._id !== id)
      }))
    } catch (err) {
    console.error("Error in deleting session", err);
    }
  },
  // updating session
updateSession: async (id, updatedData)=>{
  try {
    const res = await axios.put(`${BASE_URL}/${id}`,updatedData)
        const updated = res.data?.updatedSession;

    if (!updated || !updated.title) {
      console.error("Invalid updatedSession from backend:", res.data);
      return;
    }

    set((state)=>({
      sessions: state.sessions.map((s)=>(s._id === id? res.data.updatedSession:s))
    }))
  } catch (err) {
  console.error('Error updating session:', err)
  }
},
// togglesession

toggleSession : async(id)=>{
try {
  const res = await axios.patch(`${BASE_URL}/toggle/${id}`)
      set((state)=>({
      sessions: state.sessions.map((s)=>s._id === id? res.data.updatedSession:s)
    }))
} catch (err) {
      console.error('Error toggling session:', err)
}
},

// mark session

markSession : async (id)=>{
try {
  const res = await axios.patch(`${BASE_URL}/mark/${id}`)
  set((state)=>({
sessions: state.sessions.map((s)=>s._id === id? res.data.updatedSession:s)
}))
} catch (err) {
      console.error('Error marking session:', err)
}
}
}));
 export default useSessionStorage