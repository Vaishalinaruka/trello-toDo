import api from "./api";
import API_URL from "./endpoints";

export const getTodosApi = async () => {
  try {
    const path = API_URL.todos + '?limit=20';
    const { data, status } = await api.get(path);
    console.log("res", data);
    return { todos: data.todos, status };
  } catch (error) {
    console.log(error);
  }
};

export const addTodoApi = async (title) => {
  try {
    const path = API_URL.todos + `/add`;
    const { data, status } = await api.post(path, {
      todo: title,
      completed: false,
      userId: 5,
    });
    console.log("res", data);
    if (status === (200 | 201)) return data;
  } catch (error) {
    console.log("error: ", error);
  }
};

export const updateTodoApi = async (todoId) => {
  try {
    const path = API_URL.todos + `/${todoId}`;
    const { data, status } = await api.put(
      path,
      {
        completed: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (status === 200) return { updatedTodo: data };
  } catch (error) {
    console.log("error: ", error);
  }
};

export const deleteTodoApi = async (id) => {
  try {
    const path = API_URL.todos + `/${id}`;
    const { data, status } = await api.delete(path);
    if (status === 200) return { updatedTodo: data };
  } catch (error) {
    console.log("error: ", error);
  }
};
