import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSessionStorage from "../Store/UseSessionStorage";
import {
  FiArrowLeft,
  FiCalendar,
  FiBook,
  FiCheck,
  FiTrash2,
  FiPlus,
  FiClock,
  FiBookmark,
  FiEdit2,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiSun,
  FiMoon,
  FiAward,
  FiHeart,
  FiFlag,
} from "react-icons/fi";

// *Local Storage Helpers*
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return [];
  }
};

// *Inspirational Quotes*
const motivationalQuotes = [
  "Success is the sum of small efforts, repeated daily. — Robert Collier",
  "The secret to getting ahead is getting started. — Mark Twain",
  "Don’t watch the clock; do what it does. Keep going. — Sam Levenson",
  "Believe you can and you’re halfway there. — Theodore Roosevelt",
  "The expert in anything was once a beginner. — Helen Hayes",
  "Your limitation—it’s only your imagination.",
  "Dream big. Start small. Act now.",
  "The harder you work, the luckier you get.",
];

const StudyPlanner = () => {
  // using sessionstorage
  const {
    sessions,
    fetchSession,
    addSession,
    deleteSession,
    updateSession,
    toggleSession,
    markSession,
  } = useSessionStorage();
  const navigate = useNavigate();
  const [studySessions, setStudySessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: "",
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    topics: "",
    priority: "medium",
    status: "planned",
    notes: "",
    bookmarked: false,
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priority: "all",
    status: "all",
    bookmarked: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or prefer-color-scheme for initial value
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  // *Load Data from Zustand

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    setStudySessions(sessions);
    const savedCompleted = getFromLocalStorage("completedSessions");
    if (Array.isArray(savedCompleted)) setCompletedSessions(savedCompleted);

    // *Set a random quote on load*
    const randomQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
  }, [sessions]);

  // *Auto-save to LocalStorage*
  useEffect(() => {
    console.log("Saving test data to localStorage");
    saveToLocalStorage("studySessions", studySessions);
  }, [studySessions]);

  useEffect(() => {
    saveToLocalStorage("completedSessions", completedSessions);
  }, [completedSessions]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // *Calculate Session Duration*
  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // *Format Date (e.g., "Mon, Jan 15")*
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  };

  // *Days Until Session*
  const daysUntilSession = (sessionDate) => {
    if (!sessionDate) return "N/A";
    const today = new Date();
    const session = new Date(sessionDate);
    const diffTime = session - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days ` : days === 0 ? "Today" : "Past due";
  };

  // *Add New Session*
  const addStudySession = async () => {
    if (!newSession.title || !newSession.date) return;

    const session = {
      ...newSession,
      createdAt: new Date().toISOString(),
      duration: calculateDuration(newSession.startTime, newSession.endTime),
    };

    await addSession(session);
    await fetchSession();
    resetNewSessionForm();
  };

  // *Update Session*
  const updateStudySession = async () => {
    if (!selectedSession) return;

    const updatedSessions = {
      ...selectedSession,
      duration: calculateDuration(
        selectedSession.startTime,
        selectedSession.endTime
      ),
    };
    await updateSession(selectedSession._id, updatedSessions);
    await fetchSession();
    setSelectedSession(null);
    setEditMode(false);
  };

  // *Delete Session*
  const deleteStudySession = async (id) => {
  await deleteSession(id);     // remove from DB
  await fetchSession();        // re-fetch zustand state (sessions auto-update)
  
  if (selectedSession?._id === id) {
    setSelectedSession(null);
    setEditMode(false);
  }
  };

  // *Mark as Completed*
  const completeStudySession = async (id) => {
    if (!id) {
      console.warn("completeStudySession called with undefined id");
      return;
    }
    await markSession(id);
    const sessionToComplete = studySessions.find(
      (session) => session._id === id
    );
    if (!sessionToComplete) return;

    const updatedSessions = studySessions.filter(
      (session) => session._id !== id
    );
    setStudySessions(updatedSessions);

    const completed = sessions.find((s) => s._id === id);
    if (completed) {
      const completedSession = {
        ...completed,
        status: "completed",
        completionDate: new Date().toISOString(),
      };
      setCompletedSessions((prev) => [completedSession, ...prev]);
    }
    if (selectedSession?._id === id) {
      setSelectedSession(null);
    }
  };

  // *Toggle Bookmark*
  const toggleBookmark = async (id) => {
    if (!id) {
      console.warn("toggleBookmark called with undefined id");
      return;
    }
    await toggleSession(id);
    await fetchSession();
    const fresh = sessions.find((s) => s._id === id);
    if (fresh) {
      setSelectedSession((prev) => (prev && prev._id === id ? fresh : prev));
    }
  };

  // *Reset Form*
  const resetNewSessionForm = () => {
    setNewSession({
      title: "",
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      topics: "",
      priority: "medium",
      status: "planned",
      notes: "",
      bookmarked: false,
    });
  };

  // *Clear All Data*
  const clearAllData = () => {
    if (window.confirm("Are you sure? This will delete ALL your sessions.")) {
      localStorage.removeItem("studySessions");
      localStorage.removeItem("completedSessions");
      setStudySessions([]);
      setCompletedSessions([]);
    }
  };

  // *Filter Sessions*
  const filteredSessions = studySessions.filter((session) => {
    if (!session) return false;
    if (!session.title) return false;

    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.topics || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      filters.priority === "all" || session.priority === filters.priority;
    const matchesStatus =
      filters.status === "all" || session.status === filters.status;
    const matchesBookmarked = !filters.bookmarked || session.bookmarked;

    return (
      matchesSearch && matchesPriority && matchesStatus && matchesBookmarked
    );
  });

  // *Priority Colors (for UI)*
  const priorityColors = {
    high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
    medium:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
    low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
  };

  const priorityBorderColors = {
    high: "border-red-200 dark:border-red-800",
    medium: "border-yellow-200 dark:border-yellow-800",
    low: "border-green-200 dark:border-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* *Header Section* */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Study Planner
            </h1>
            <p className="text-xs text-center">Powered by CollegeSecracy</p>
          </div>
        </div>
      </header>

      {/* *Main Content* */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* *Inspirational Quote* */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <FiAward className="w-6 h-6 text-yellow-300" />
            <p className="italic">{currentQuote}</p>
          </div>
        </div>

        {/* *Tabs (Planner/History)* */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("planner")}
            className={`px-4 py-2 font-medium ${
              activeTab === "planner"
                ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Planner
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium ${
              activeTab === "history"
                ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            History
          </button>
        </div>

        {/* *Planner Tab* */}
        {activeTab === "planner" ? (
          <div className="space-y-6">
            {/* *Add/Edit Session Form* */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                {editMode ? (
                  <FiEdit2 className="w-5 h-5" />
                ) : (
                  <FiPlus className="w-5 h-5" />
                )}
                <span>{editMode ? "Edit Session" : "Add New Session"}</span>
              </h2>

              {/* *Form Inputs* */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={
                      editMode ? selectedSession?.title || "" : newSession.title
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              title: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              title: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Calculus Chapter 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={
                      editMode
                        ? selectedSession?.subject || ""
                        : newSession.subject
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              subject: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              subject: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={
                      editMode ? selectedSession?.date || "" : newSession.date
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              date: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              date: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={
                        editMode
                          ? selectedSession?.startTime || ""
                          : newSession.startTime
                      }
                      onChange={
                        editMode
                          ? (e) =>
                              setSelectedSession({
                                ...selectedSession,
                                startTime: e.target.value,
                              })
                          : (e) =>
                              setNewSession({
                                ...newSession,
                                startTime: e.target.value,
                              })
                      }
                      className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={
                        editMode
                          ? selectedSession?.endTime || ""
                          : newSession.endTime
                      }
                      onChange={
                        editMode
                          ? (e) =>
                              setSelectedSession({
                                ...selectedSession,
                                endTime: e.target.value,
                              })
                          : (e) =>
                              setNewSession({
                                ...newSession,
                                endTime: e.target.value,
                              })
                      }
                      className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Topics
                  </label>
                  <textarea
                    name="topics"
                    value={
                      editMode
                        ? selectedSession?.topics || ""
                        : newSession.topics
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              topics: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              topics: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Separate topics with commas"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={
                      editMode
                        ? selectedSession?.priority || "medium"
                        : newSession.priority
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              priority: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              priority: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={
                      editMode
                        ? selectedSession?.status || "planned"
                        : newSession.status
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              status: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              status: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={
                      editMode ? selectedSession?.notes || "" : newSession.notes
                    }
                    onChange={
                      editMode
                        ? (e) =>
                            setSelectedSession({
                              ...selectedSession,
                              notes: e.target.value,
                            })
                        : (e) =>
                            setNewSession({
                              ...newSession,
                              notes: e.target.value,
                            })
                    }
                    className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional notes..."
                    rows="2"
                  />
                </div>

                {editMode && (
                  <div className="md:col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="bookmarked"
                      name="bookmarked"
                      checked={selectedSession?.bookmarked || false}
                      onChange={() =>
                        setSelectedSession((prev) => ({
                          ...prev,
                          bookmarked: !prev.bookmarked,
                        }))
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="bookmarked"
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Bookmark this session
                    </label>
                  </div>
                )}
              </div>

              {/* *Form Buttons* */}
              <div className="mt-6 flex justify-end gap-3">
                {editMode && (
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSelectedSession(null);
                    }}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editMode ? updateStudySession : addStudySession}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                >
                  {editMode ? (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      <span>Update</span>
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      <span>Add Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* *Filter & Search* */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiFilter className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>

              {/* *Advanced Filters* */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters({ ...filters, priority: e.target.value })
                      }
                      className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="postponed">Postponed</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bookmarked-filter"
                      checked={filters.bookmarked}
                      onChange={(e) =>
                        setFilters({ ...filters, bookmarked: e.target.checked })
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="bookmarked-filter"
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Bookmarked only
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* *Sessions List* */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <FiBook className="w-5 h-5" />
                  <span>Upcoming Sessions ({filteredSessions.length})</span>
                </h2>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ||
                    filters.priority !== "all" ||
                    filters.status !== "all" ||
                    filters.bookmarked
                      ? "No matching sessions found. Adjust your filters."
                      : "No study sessions planned yet. Add your first session!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-5 rounded-xl border ${
                        priorityBorderColors[session.priority]
                      } shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        session.bookmarked ? "ring-1 ring-green-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedSession(session);
                        setEditMode(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">
                              {session.title}
                            </h3>
                            {session.bookmarked && (
                              <FiBookmark className="text-green-500 w-4 h-4" />
                            )}
                          </div>
                          {session.subject && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {session.subject}
                            </p>
                          )}

                          <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span>
                                {formatDate(session.date)} •{" "}
                                {daysUntilSession(session.date)}
                              </span>
                            </div>

                            {session.startTime && session.endTime && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span>
                                  {session.startTime} - {session.endTime} •{" "}
                                  {session.duration}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(session._id);
                            }}
                            className={`p-1.5 rounded-full ${
                              session.bookmarked
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            title={
                              session.bookmarked
                                ? "Remove bookmark"
                                : "Bookmark"
                            }
                          >
                            <FiBookmark
                              className={`w-4 h-4 ${
                                session.bookmarked ? "fill-current" : ""
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeStudySession(session._id);
                            }}
                            className="p-1.5 bg-green-600 hover:bg-green-700 rounded-full text-white"
                            title="Mark Complete"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStudySession(session._id);
                              console.log('deleting session')
                            }}
                            className="p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white"
                            title="Delete Session"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            priorityColors[session.priority]
                          }`}
                        >
                          {session.priority} priority
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {session.status}
                        </span>
                      </div>

                      {session.topics && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Topics:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {session.topics}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* *History Tab* */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                <FiClock className="w-5 h-5" />
                <span>Completed Sessions ({completedSessions.length})</span>
              </h2>
              {completedSessions.length > 0 && (
                <button
                  onClick={clearAllData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2 transition-colors text-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {completedSessions.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No completed sessions yet. Complete a session to see it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {session.title}
                      {session.bookmarked && (
                        <FiBookmark className="text-green-500 w-4 h-4" />
                      )}
                    </h3>
                    {session.subject && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {session.subject}
                      </p>
                    )}

                    <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiFlag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>
                          Priority:{" "}
                          <span className="capitalize">{session.priority}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>Scheduled: {formatDate(session.date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                        <span>
                          Completed: {formatDate(session.completionDate)}
                        </span>
                      </div>

                      {session.startTime && session.endTime && (
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span>Duration: {session.duration}</span>
                        </div>
                      )}

                      {session.topics && (
                        <div>
                          <p className="font-medium text-gray-500 dark:text-gray-400">
                            Topics covered:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {session.topics}
                          </p>
                        </div>
                      )}

                      {session.notes && (
                        <div>
                          <p className="font-medium text-gray-500 dark:text-gray-400">
                            Notes:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlanner;
