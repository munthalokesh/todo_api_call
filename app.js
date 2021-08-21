const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "todoApplication.db");
const { format, isValid } = require("date-fns");
app.use(express.json());

let db = null;

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeServer();

const checkStatus = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
    console.log("hu");
  }
};

const isStatusPresent = (request) => {
  let { status, priority } = request.query;
  console.log(status);
  if (status !== undefined) {
    return true;
  }
};

const checkPriority = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};

const isPriorityPresent = (request) => {
  let { priority, status } = request.query;
  if (priority !== undefined) {
    return true;
  } else {
    return false;
  }
};
const checkCategory = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};
const isStatusPriorityPresent = (request) => {
  let { status, priority } = request.query;
  if (priority !== undefined && status !== undefined) {
    return true;
  } else {
    return false;
  }
};

const isCategoryStatusPresent = (request) => {
  let { category, status } = request.query;
  if (category !== undefined && status !== undefined) {
    return true;
  } else {
    return false;
  }
};

const isCategoryPresent = (request) => {
  let { category } = request.query;
  if (category !== undefined) {
    return true;
  } else {
    return false;
  }
};

const isCategoryPriorityPresent = (request) => {
  let { category, priority } = request.query;
  if (category !== undefined && priority !== undefined) {
    return true;
  } else {
    return false;
  }
};

const convertToObject = (database) => {
  obj = {
    id: database.id,
    todo: database.todo,
    priority: database.priority,
    category: database.category,
    status: database.status,
    dueDate: database.due_date,
  };
  console.log(obj);
  return obj;
};

app.get("/todos/", async (request, response) => {
  let { status, priority, search_q = "", category } = request.query;
  let query, dbResponse;
  switch (true) {
    case isStatusPriorityPresent(request):
      if (checkStatus(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (checkPriority(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        query = `SELECT * FROM todo WHERE status="${status}" AND priority="${priority}" ORDER BY id;`;
        dbResponse = await db.all(query);
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;
    case isCategoryStatusPresent(request):
      if (checkStatus(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (checkCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        query = `SELECT * FROM todo WHERE status="${status}" AND category="${category}" ORDER BY id;`;
        dbResponse = await db.all(query);
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;
    case isCategoryPriorityPresent(request):
      if (checkCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (checkPriority(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        query = `SELECT * FROM todo WHERE category="${category}" AND priority="${priority}" ORDER BY id;`;
        dbResponse = await db.all(query);
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;
    case isCategoryPresent(request):
      if (checkCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        query = `SELECT * FROM todo WHERE category="${category}" ORDER BY id;`;
        dbResponse = await db.all(query);
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;
    case isStatusPresent(request):
      query = `SELECT * FROM todo WHERE status="${status}" ORDER BY id;`;
      dbResponse = await db.all(query);
      if (dbResponse.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;
    case isPriorityPresent(request):
      query = `SELECT * FROM todo WHERE priority="${priority}" ORDER BY id;`;
      dbResponse = await db.all(query);
      if (dbResponse.length === 0) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(dbResponse.map((response) => convertToObject(response)));
      }
      break;

    default:
      query = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" ORDER BY id;`;
      dbResponse = await db.all(query);
      response.send(dbResponse.map((response) => convertToObject(response)));
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodo = `SELECT * FROM todo where id=${todoId} ORDER BY id;`;
  const todo = await db.get(getTodo);
  response.send(convertToObject(todo));
});

const formatDate = (date) => {
  let formatedDate = format(new Date(date), "yyyy-MM-dd");
  return formatedDate;
};

const validateDate = (date) => {
  console.log(isValid(date));
  return isValid(date);
};

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let dateObj = new Date(date);
  let newDate;

  if (validateDate(dateObj) === true) {
    console.log("hi");
    newDate = formatDate(date);
    const dateQuery = `SELECT * FROM todo WHERE due_date="${newDate}" ORDER BY id; `;
    const dbResponse = await db.all(dateQuery);
    response.send(dbResponse.map((response) => convertToObject(response)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, category, status, dueDate } = request.body;
  if (checkStatus(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (checkPriority(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (checkCategory(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (validateDate(new Date(dueDate)) === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const postQuery = `INSERT INTO todo(id,todo,category,priority,status,due_date)
  VALUES (
      ${id},
      "${todo}",
      "${category}",
      "${priority}",
      "${status}",
      "${dueDate}"
  );`;
    await db.run(postQuery);
    response.send("Todo Successfully Added");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, category, todo, dueDate } = request.body;
  let putQuery;
  if (status !== undefined) {
    if (checkStatus(status) === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      putQuery = `UPDATE todo
        SET status="${status}"
        WHERE id=${todoId}; `;
      await db.run(putQuery);
      response.send("Status Updated");
    }
  } else if (priority !== undefined) {
    if (checkPriority(priority) === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      putQuery = `UPDATE todo
        SET priority="${priority}"
        WHERE id=${todoId}; `;
      await db.run(putQuery);
      response.send("Priority Updated");
    }
  } else if (category !== undefined) {
    if (checkCategory(category) === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      putQuery = `UPDATE todo
        SET category="${category}"
        WHERE id=${todoId}; `;
      await db.run(putQuery);
      response.send("Category Updated");
    }
  } else if (todo !== undefined) {
    putQuery = `UPDATE todo
        SET todo="${todo}"
        WHERE id=${todoId}; `;
    await db.run(putQuery);
    response.send("Todo Updated");
  } else {
    if (validateDate(new Date(dueDate)) === false) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      putQuery = `UPDATE todo
        SET due_date="${dueDate}"
        WHERE id=${todoId}; `;
      await db.run(putQuery);
      response.send("Due Date Updated");
    }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
