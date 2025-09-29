import { useState, useEffect } from "react";

function TodoApp() {
  // STATE MANAGEMENT
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // SHOW ALERT FUNCTION
  const showAlert = (type, message) => {
    setAlert({ type, message, fadeOut: false });
    setTimeout(() => {
      setAlert((prev) => (prev ? { ...prev, fadeOut: true } : null));
    }, 2700);
    setTimeout(() => setAlert(null), 3000);
  };

  // LOCALSTORAGE PERSISTENCE WITH ERROR HANDLING
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tasks");
      if (saved) {
        const parsedTasks = JSON.parse(saved);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
          showAlert("info", "Tasks loaded successfully!");
        } else {
          throw new Error("Invalid data format");
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      showAlert("error", "Failed to load tasks. Starting fresh.");
      setTasks([]);
    }
  }, []);

  // Simpan data setiap tasks berubah dengan error handling
  useEffect(() => {
    try {
      if (tasks.length >= 0) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    } catch (error) {
      console.error("Error saving tasks:", error);
      showAlert("error", "Failed to save tasks!");
    }
  }, [tasks]);

  // CRUD OPERATIONS WITH ERROR HANDLING

  // CREATE - Add new task
  const addTask = (e) => {
    e.preventDefault();

    try {
      const trimmedInput = input.trim();

      // Validasi input kosong
      if (!trimmedInput) {
        showAlert("warning", "Please enter a task!");
        return;
      }

      // Validasi panjang input
      if (trimmedInput.length > 200) {
        showAlert("warning", "Task is too long! Max 200 characters.");
        return;
      }

      // Cek duplikasi
      const isDuplicate = tasks.some(
        (task) => task.text.toLowerCase() === trimmedInput.toLowerCase()
      );

      if (isDuplicate) {
        showAlert("warning", "This task already exists!");
        return;
      }

      const newTask = {
        id: Date.now(),
        text: trimmedInput,
        completed: false,
      };

      setTasks([...tasks, newTask]);
      setInput("");
      showAlert("success", "Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      showAlert("error", "Failed to add task!");
    }
  };

  // READ - Filter tasks
  const filteredTasks = tasks.filter((task) => {
    try {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    } catch (error) {
      console.error("Error filtering tasks:", error);
      return true;
    }
  });

  // UPDATE - Toggle completion status
  const toggleTask = (id) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        showAlert("error", "Task not found!");
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      const newStatus = !task.completed;
      showAlert(
        "success",
        newStatus ? "Task marked as completed!" : "Task marked as active!"
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      showAlert("error", "Failed to update task status!");
    }
  };

  // UPDATE - Start editing
  const startEdit = (task) => {
    try {
      if (!task || !task.id) {
        showAlert("error", "Invalid task!");
        return;
      }
      setEditingId(task.id);
      setEditText(task.text);
    } catch (error) {
      console.error("Error starting edit:", error);
      showAlert("error", "Failed to edit task!");
    }
  };

  // UPDATE - Save editing
  const saveEdit = (id) => {
    try {
      const trimmedText = editText.trim();

      if (!trimmedText) {
        showAlert("warning", "Task cannot be empty!");
        return;
      }

      if (trimmedText.length > 200) {
        showAlert("warning", "Task is too long! Max 200 characters.");
        return;
      }

      // Cek duplikasi (kecuali task yang sedang diedit)
      const isDuplicate = tasks.some(
        (task) =>
          task.id !== id &&
          task.text.toLowerCase() === trimmedText.toLowerCase()
      );

      if (isDuplicate) {
        showAlert("warning", "This task already exists!");
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, text: trimmedText } : task
        )
      );
      setEditingId(null);
      setEditText("");
      showAlert("success", "Task updated successfully!");
    } catch (error) {
      console.error("Error saving edit:", error);
      showAlert("error", "Failed to save changes!");
    }
  };

  // DELETE - Show confirmation dialog
  const confirmDelete = (id) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        showAlert("error", "Task not found!");
        return;
      }
      setDeleteConfirm({ id, text: task.text });
    } catch (error) {
      console.error("Error showing delete confirmation:", error);
      showAlert("error", "Failed to delete task!");
    }
  };

  // DELETE - Execute deletion
  const executeDelete = () => {
    try {
      if (!deleteConfirm) return;

      setTasks(tasks.filter((task) => task.id !== deleteConfirm.id));
      showAlert("success", "Task deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      showAlert("error", "Failed to delete task!");
      setDeleteConfirm(null);
    }
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    try {
      setEditingId(null);
      setEditText("");
      showAlert("info", "Edit cancelled");
    } catch (error) {
      console.error("Error cancelling edit:", error);
    }
  };

  // UI RENDERING
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Delete Task?
              </h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete this task?
              </p>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-white break-words text-left">
                  "{deleteConfirm.text}"
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-700 cursor-pointer text-white font-semibold rounded-lg hover:bg-gray-600 active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-6 py-3 bg-red-600 cursor-pointer text-white font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT NOTIFICATION */}
      {alert && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 ${
            alert.fadeOut ? "animate-fade-out" : "animate-slide-down"
          }`}
        >
          <div
            className={`rounded-lg p-4 shadow-2xl border-l-4 flex items-start gap-3 ${
              alert.type === "success"
                ? "bg-gray-800 border-green-500 text-green-400"
                : alert.type === "error"
                ? "bg-gray-800 border-red-500 text-red-400"
                : alert.type === "warning"
                ? "bg-gray-800 border-yellow-500 text-yellow-400"
                : "bg-gray-800 border-blue-500 text-blue-400"
            }`}
          >
            <div className="text-2xl">
              {alert.type === "success" && "✓"}
              {alert.type === "error" && "✕"}
              {alert.type === "warning" && "⚠"}
              {alert.type === "info" && "ℹ"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
              </p>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            My Todo App
          </h1>
          <p className="text-gray-400">Organize your tasks efficiently</p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-700">
          {/* ADD TASK FORM */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addTask(e);
                  }
                }}
                placeholder="Add a new task..."
                maxLength={200}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500 transition-all duration-200"
              />
              <button
                onClick={addTask}
                className="px-6 py-3 cursor-pointer bg-white text-black font-semibold rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Add
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1 ml-1">
              {input.length}/200 characters
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setFilter("all");
                showAlert("info", `Showing all tasks`);
              }}
              className={`flex-1 py-2 px-2 sm:px-4 cursor-pointer rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                filter === "all"
                  ? "bg-white text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilter("active");
                showAlert("info", `Showing active tasks`);
              }}
              className={`flex-1 py-2 px-2 sm:px-4 cursor-pointer rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                filter === "active"
                  ? "bg-white text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setFilter("completed");
                showAlert("info", `Showing completed tasks`);
              }}
              className={`flex-1 py-2 px-2 sm:px-4 cursor-pointer rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                filter === "completed"
                  ? "bg-white text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Completed
            </button>
          </div>

          {/* TASKS LIST */}
          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200 animate-slide-in"
              >
                {editingId === task.id ? (
                  // EDIT MODE
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 checked:bg-white checked:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer transition-all duration-200 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={200}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                          autoFocus
                        />
                        <p className="text-gray-500 text-xs mt-1">
                          {editText.length}/200 characters
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-4 py-2 cursor-pointer bg-white text-black text-sm font-medium rounded hover:bg-gray-200 active:scale-95 transition-all duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 cursor-pointer bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-600 active:scale-95 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // DISPLAY MODE
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 checked:bg-white checked:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer transition-all duration-200 flex-shrink-0"
                      />
                      <p
                        className={`flex-1 text-white transition-all duration-200 break-words text-sm sm:text-base leading-relaxed text-justify ${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.text}
                      </p>
                    </div>
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 justify-end pl-8">
                      <button
                        onClick={() => startEdit(task)}
                        className="px-3 py-1.5 cursor-pointer bg-gray-700 text-white text-xs sm:text-sm font-medium rounded hover:bg-gray-600 active:scale-95 transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-3 py-1.5 cursor-pointer bg-gray-700 text-white text-xs sm:text-sm font-medium rounded hover:bg-red-600 active:scale-95 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* EMPTY STATE */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-400 text-lg">No tasks found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter === "all"
                  ? "Add a new task to get started"
                  : `No ${filter} tasks available`}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="mt-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>
            {tasks.length} total tasks •{" "}
            {tasks.filter((t) => t.completed).length} completed •{" "}
            {tasks.filter((t) => !t.completed).length} active
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default TodoApp;
